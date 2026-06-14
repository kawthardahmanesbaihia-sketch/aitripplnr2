/**
 * /api/explore-analyze — Upload-based destination recommendation
 *
 * Identical pipeline to /api/analyze (CLIP → geo reasoning → destination KB).
 * Only difference: input is base64 data URIs from file upload, not Unsplash URLs.
 *
 * Response shape is IDENTICAL to /api/analyze so the /results page can be
 * shared between both entry points without any adapter layer.
 */

import { NextRequest, NextResponse } from "next/server"
import { rankDestinationsByCLIP } from "@/lib/clip-scorer"
import { prewarm } from "@/lib/clip-service"
import { prewarmTextEmbeddings } from "@/lib/clip-scorer"
import { EXPLORE_DESTINATIONS } from "@/lib/explore-destinations"
import { DESTINATIONS } from "@/lib/travel-data"
import {
  parseBody,
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
  ExploreBodySchema,
} from "@/lib/request-validation"

export const runtime = "nodejs"

prewarm()
prewarmTextEmbeddings().catch(() => {})

// Destination ID → ISO 2-letter code
// Must stay in sync with the same map in /api/analyze/route.ts
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

function priceToStyle(priceLevel: string): "budget" | "mid-range" | "luxury" {
  if (priceLevel === "luxury") return "luxury"
  if (priceLevel === "mid-range") return "mid-range"
  return "budget"
}

// Route handler
export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  if (!checkRateLimit(ip).allowed) return rateLimitResponse()

  try {
    const raw    = await req.json()
    const parsed = parseBody(ExploreBodySchema, raw)
    if (!parsed.ok) return parsed.response

    const { images, squad } = parsed.data
    const clampedImages = images.slice(0, 5)
    console.log(`[explore-analyze] ${clampedImages.length} image(s) | squad="${squad ?? "none"}" | engine=CLIP`)

    let result: Awaited<ReturnType<typeof rankDestinationsByCLIP>>
    try {
      result = await rankDestinationsByCLIP(clampedImages, squad ?? undefined)
    } catch (clipErr) {
      console.error("[explore-analyze] CLIP error:", clipErr)
      return NextResponse.json(
        { error: "Image analysis failed — please try again" },
        { status: 503 }
      )
    }

    const { ranked, confidence, vibes, travelStyle, processingMs } = result

    console.log(
      `[explore-analyze] CLIP OK — ${processingMs}ms | conf=${confidence}% | winner=${ranked[0]?.id}`
    )
    console.log(
      `[explore-analyze] Final scores: ` +
      ranked.slice(0, 8).map(r => `${r.id}=${r.score.toFixed(1)}`).join(" > ")
    )

    const topDestinations = ranked.slice(0, 3)

    // Build countries[] — identical structure to /api/analyze
    const countries = topDestinations.map((dest, index) => {
      const exploreDest = EXPLORE_DESTINATIONS[dest.id]
      const travelEntry = DESTINATIONS.find(d => d.id === dest.id)

      if (!exploreDest) {
        // Destination KB gap — build a minimal but valid country object
        return {
          name:            dest.name,
          code:            DEST_TO_ISO[dest.id] ?? "XX",
          city:            null,
          matchPercentage: Math.max(60, Math.min(97, Math.round(dest.score) - index * 2)),
          reason:          `Top AI-matched destination for ${travelStyle} travel`,
          image:           dest.heroImage ?? null,
          tags:            vibes,
          shortSummary:    "",
          climate:         "temperate",
          vibe:            travelStyle,
          confidenceBreakdown: { activity: 70, climate: 70, mood: 70, food: 70 },
          positives:       [`Top AI-matched destination for ${travelStyle} travel`],
          negatives:       [] as string[],
          activities:      [] as string[],
          foodHighlights:  [] as string[],
          hotels:          [] as Array<{ name: string; style: string; activity_level: string }>,
        }
      }

      const matchPct = Math.max(60, Math.min(97, Math.round(dest.score) - index * 2))
      const topCity  = exploreDest.cities[0]
      const hotels   = (travelEntry?.hotels ?? []).slice(0, 3).map(h => ({
        name:           h.name,
        style:          priceToStyle(h.priceLevel),
        activity_level: "mixed",
      }))

      const positives = (dest as typeof dest & { explanation?: string[] }).explanation?.slice(0, 3) ?? []
      if (positives.length === 0) {
        positives.push(`Top AI-matched destination for ${travelStyle} travel`)
      }

      const negatives: string[] = []
      if (exploreDest.scores.budget < 28)   negatives.push("Can be expensive for budget travellers")
      if (exploreDest.scores.nightlife < 35) negatives.push("Quiet nightlife scene")

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
        tags:            vibes,
        shortSummary:    topCity?.tagline ?? exploreDest.atmosphereTags.slice(0, 3).join(" · ") ?? "",
        climate:         exploreDest.climates[0] ?? "temperate",
        vibe:            travelStyle,
        confidenceBreakdown,
        positives,
        negatives,
        activities:      exploreDest.activities ?? [],
        foodHighlights:  (travelEntry?.restaurants ?? []).slice(0, 4).map(r => r.name),
        hotels,
      }
    })

    console.log(
      `[explore-analyze] FINAL destinations: ` +
      countries.map((c, i) => `#${i + 1} ${c.name}/${c.city ?? "—"}(${c.matchPercentage}%)`).join(" | ")
    )

    const topDest = EXPLORE_DESTINATIONS[topDestinations[0]?.id]

    return NextResponse.json({
      requestSeed:      Date.now(),
      travelCompanion:  squad ?? null,
      userProfile: {
        dominantMood:         travelStyle,
        preferredClimate:     topDest?.climates[0]         ?? "temperate",
        preferredEnvironment: topDest?.environmentTypes[0] ?? "nature",
        activityLevel:        "high",
        foodPreferences:      topDest?.activities.slice(0, 2) ?? [],
      },
      geminiAnalysis:             null,
      geminiProfileInsight:       null,
      selectedDestinationDetails: null,
      countries,
      summary: `Based on your visual preferences, ${countries[0]?.name ?? "this destination"} is a perfect match for you.`,
      engine: "clip",
    }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" },
    })

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[explore-analyze] Unhandled error:", message)
    return NextResponse.json(
      { error: "Image analysis failed — please try again" },
      { status: 503 }
    )
  }
}
