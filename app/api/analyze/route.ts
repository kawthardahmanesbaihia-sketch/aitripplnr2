/**
 * /api/analyze — Single-mode destination recommendation
 *
 * Pipeline (CLIP-ONLY — no fallbacks, no template tags, no Gemini):
 *   Image URLs
 *     → CLIP (Xenova/clip-vit-base-patch32) zero-shot classification
 *     → Geographic Reasoning Engine (landmark detection + environment elimination)
 *     → Destination ranking + squad bonus
 *     → Top 3 destinations
 *
 * templateTags and other image metadata are IGNORED — the image itself is
 * the sole input to the recommendation engine.
 */

import { type NextRequest, NextResponse } from "next/server"
import { generateSeed } from "@/lib/seed-randomizer"
import {
  EXPLORE_DESTINATIONS,
} from "@/lib/explore-destinations"
import { DESTINATIONS } from "@/lib/travel-data"
import { rankDestinationsByCLIP } from "@/lib/clip-scorer"
import { prewarm } from "@/lib/clip-service"
import { prewarmTextEmbeddings } from "@/lib/clip-scorer"
import {
  parseBody,
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
  AnalyzeBodySchema,
} from "@/lib/request-validation"

// Pre-warm CLIP and text embeddings before the first request
prewarm()
prewarmTextEmbeddings().catch(() => {})

// Destination ID → ISO 2-letter code (for flag emoji in UI)
const DEST_TO_ISO: Record<string, string> = {
  japan: "JP", france: "FR", thailand: "TH", italy: "IT",
  morocco: "MA", greece: "GR", spain: "ES", dubai: "AE",
  vietnam: "VN", india: "IN", bali: "ID", maldives: "MV",
  switzerland: "CH", newzealand: "NZ", jordan: "JO", iceland: "IS",
  norway: "NO", southafrica: "ZA", finland: "FI", sweden: "SE",
  canada: "CA", kenya: "KE", tanzania: "TZ", seychelles: "SC",
  australia: "AU", portugal: "PT", turkey: "TR", egypt: "EG",
  peru: "PE", southkorea: "KR", singapore: "SG", netherlands: "NL",
  croatia: "HR", nepal: "NP", mexico: "MX", cuba: "CU",
  costarica: "CR", botswana: "BW", namibia: "NA",
  cambodia: "KH", czechrepublic: "CZ", brazil: "BR", colombia: "CO",
  srilanka: "LK", philippines: "PH", georgia: "GE", malaysia: "MY",
  austria: "AT", ireland: "IE",
  // Second expansion batch
  denmark: "DK", belgium: "BE", germany: "DE", hungary: "HU", poland: "PL",
  unitedkingdom: "GB", scotland: "GB", saudiarabia: "SA", qatar: "QA", oman: "OM",
  lebanon: "LB", madagascar: "MG", mauritius: "MU", china: "CN", bhutan: "BT",
  unitedstates: "US", alaska: "US", argentina: "AR", chile: "CL",
  dominicanrepublic: "DO", jamaica: "JM", bahamas: "BS", borabora: "PF",
  fiji: "FJ", hawaii: "US", greenland: "GL", antarctica: "AQ", mongolia: "MN",
  armenia: "AM", uzbekistan: "UZ", romania: "RO", bulgaria: "BG",
  slovenia: "SI", slovakia: "SK", estonia: "EE", latvia: "LV", lithuania: "LT",
  tunisia: "TN", algeria: "DZ", rwanda: "RW", ethiopia: "ET",
  zimbabwe: "ZW", zambia: "ZM", panama: "PA", ecuador: "EC",
  bolivia: "BO", guatemala: "GT", nicaragua: "NI", laos: "LA", hongkong: "HK",
}

// Response helpers
function priceToStyle(priceLevel: string): "budget" | "mid-range" | "luxury" {
  if (priceLevel === "luxury") return "luxury"
  if (priceLevel === "mid-range") return "mid-range"
  return "budget"
}

function buildSummary(destinations: Array<{ name: string }>, language: string): string {
  const top = destinations[0]
  if (!top) return "No destinations found"
  if (language === "fr") return `Basé sur vos préférences visuelles, ${top.name} est votre destination idéale.`
  if (language === "ar") return `بناءً على تفضيلاتك المرئية، ${top.name} هي الوجهة المناسبة لك.`
  return `Based on your visual preferences, ${top.name} is a perfect match for you.`
}

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = getClientIp(request)
  const rateCheck = checkRateLimit(ip)
  if (!rateCheck.allowed) return rateLimitResponse()

  try {
    const raw = await request.json()
    const parsed = parseBody(AnalyzeBodySchema, raw)
    if (!parsed.ok) return parsed.response

    const { imageMetadata, language, seed, travelCompanion } = parsed.data
    const requestSeed = seed ?? generateSeed()

    // Extract image URLs only — templateTags and other static metadata are
    // intentionally discarded. The raw image is the sole input to CLIP.
    const imageUrls: string[] = imageMetadata.map((img) => img.url).filter(Boolean)

    if (imageUrls.length === 0) {
      return NextResponse.json({ error: "No image URLs found in metadata" }, { status: 400 })
    }

    const squadType = (travelCompanion as "solo" | "couple" | "friends" | "family" | null) ?? undefined

    console.log(
      `[Pipeline] Source=CLIP_ONLY | images=${imageUrls.length} | squad=${squadType ?? "none"} | seed=${requestSeed}`
    )

    // CLIP is the SOLE recommendation engine — no template tags, no Gemini
    let clipResult: Awaited<ReturnType<typeof rankDestinationsByCLIP>>
    try {
      clipResult = await rankDestinationsByCLIP(imageUrls.slice(0, 5), squadType)
    } catch (clipErr) {
      console.error("[Pipeline] CLIP analysis failed:", clipErr)
      return NextResponse.json(
        { error: "Image analysis failed — please try again" },
        { status: 503 }
      )
    }

    // Phase 6: Final ranking log
    console.log(
      `[Ranking] Final scores: ` +
      clipResult.ranked.slice(0, 8).map(r => `${r.id}=${r.score.toFixed(1)}`).join(" > ")
    )
    console.log(
      `[Pipeline] Source=CLIP_ONLY complete | conf=${clipResult.confidence}% | ` +
      `top3: ${clipResult.ranked.slice(0, 3).map((r, i) => `#${i + 1} ${r.name}(${r.score.toFixed(1)}%)`).join(" | ")}`
    )

    const topDestinations = clipResult.ranked.slice(0, 3)

    const countries = topDestinations.map((dest, index) => {
      const exploreDest = EXPLORE_DESTINATIONS[dest.id]!
      const travelEntry = DESTINATIONS.find(d => d.id === dest.id)
      const matchPct    = Math.max(60, Math.min(97, Math.round(dest.score) - index * 2))
      const topCity     = exploreDest.cities[0]
      const hotels      = (travelEntry?.hotels ?? []).slice(0, 3).map(h => ({
        name:           h.name,
        style:          priceToStyle(h.priceLevel),
        activity_level: "mixed",
      }))

      // Explanation bullets come from the CLIP + reasoning engine
      const positives = (dest as typeof dest & { explanation?: string[] }).explanation?.slice(0, 3) ?? []
      if (positives.length === 0) {
        positives.push(`Top AI-matched destination for ${clipResult.travelStyle} travel`)
      }

      const negatives: string[] = []
      if (exploreDest.scores.budget < 28)   negatives.push("Can be expensive for budget travellers")
      if (exploreDest.scores.nightlife < 35) negatives.push("Quiet nightlife scene")

      // Confidence breakdown derived from actual CLIP score — NOT random
      const s = dest.score
      const confidenceBreakdown = {
        activity: Math.round(60 + (s / 100) * 35),
        climate:  Math.round(60 + (s / 100) * 32),
        mood:     Math.round(60 + (s / 100) * 33),
        food:     Math.round(60 + (s / 100) * 28),
      }

      return {
        name:            dest.name,
        code:            DEST_TO_ISO[dest.id] ?? "XX",
        city:            topCity?.name ?? null,
        matchPercentage: matchPct,
        reason:          positives[0],
        image:           dest.heroImage ?? null,
        tags:            clipResult.vibes,
        shortSummary:    topCity?.tagline ?? exploreDest.atmosphereTags.slice(0, 3).join(" · ") ?? "",
        climate:         exploreDest.climates[0] ?? "temperate",
        vibe:            clipResult.travelStyle,
        confidenceBreakdown,
        positives,
        negatives,
        activities:      exploreDest.activities ?? [],
        foodHighlights:  (travelEntry?.restaurants ?? []).slice(0, 4).map(r => r.name),
        hotels,
      }
    })

    console.log(
      `[Pipeline] FINAL destinations: ` +
      countries.map((c, i) => `#${i + 1} ${c.name}(${c.matchPercentage}%)`).join(" | ")
    )

    return NextResponse.json({
      requestSeed,
      travelCompanion,
      userProfile: {
        dominantMood:         clipResult.travelStyle,
        preferredClimate:     EXPLORE_DESTINATIONS[topDestinations[0]?.id]?.climates[0] ?? "temperate",
        preferredEnvironment: EXPLORE_DESTINATIONS[topDestinations[0]?.id]?.environmentTypes[0] ?? "nature",
        activityLevel:        "high",
        foodPreferences:      EXPLORE_DESTINATIONS[topDestinations[0]?.id]?.activities.slice(0, 2) ?? [],
      },
      geminiAnalysis:             null,
      geminiProfileInsight:       null,
      selectedDestinationDetails: null,
      countries,
      summary: buildSummary(countries, language ?? "en"),
      engine: "clip",
    }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" },
    })

  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("[Pipeline] Unhandled error:", message, error)
    return NextResponse.json({ error: "Failed to analyze preferences", detail: message }, { status: 500 })
  }
}
