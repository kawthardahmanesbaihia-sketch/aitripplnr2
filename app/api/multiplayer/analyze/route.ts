import { type NextRequest, NextResponse } from "next/server"
import { generateSeed } from "@/lib/seed-randomizer"
import type { SharedPreferences } from "@/lib/firebase-utils"
import { applySquadAdjustments, type MergedTravelProfile } from "@/lib/travel-profile-merger"
import {
  rankDestinations,
  EXPLORE_DESTINATIONS,
  type ExploreDestination,
} from "@/lib/explore-destinations"
import { rankDestinationsByCLIP } from "@/lib/clip-scorer"
import { prewarm } from "@/lib/clip-service"
import { prewarmTextEmbeddings } from "@/lib/clip-scorer"
import { DESTINATIONS } from "@/lib/travel-data"
import {
  parseBody,
  checkRateLimit,
  getClientIp,
  rateLimitResponse,
  MultiplayerBodySchema,
} from "@/lib/request-validation"

prewarm()
prewarmTextEmbeddings().catch(() => {})

export const dynamic = "force-dynamic"
export const revalidate = 0

// ISO mapping for flag emoji
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

// Squad bonuses — complete 39-destination table, mirrors clip-scorer.ts
const SQUAD_BONUS: Record<string, Record<string, number>> = {
  solo: {
    japan: 4, vietnam: 4, morocco: 3, thailand: 3, india: 3, bali: 2, greece: 2, spain: 2,
    newzealand: 2, jordan: 2, france: 1, italy: 1, dubai: 0, maldives: 0, switzerland: 1,
    iceland: 5, norway: 4, southafrica: 4, finland: 5, sweden: 4, canada: 4, kenya: 4,
    tanzania: 4, seychelles: 1, australia: 3, portugal: 3, turkey: 2, egypt: 2, peru: 4,
    southkorea: 4, singapore: 2, netherlands: 2, croatia: 3, nepal: 5, mexico: 3, cuba: 3,
    costarica: 4, botswana: 4, namibia: 4,
  },
  couple: {
    maldives: 8, seychelles: 8, greece: 5, france: 5, italy: 5, bali: 5, switzerland: 3,
    dubai: 3, spain: 3, japan: 2, thailand: 2, morocco: 1, vietnam: 1, india: 1,
    newzealand: 2, jordan: 0, iceland: 3, norway: 3, southafrica: 2, finland: 3, sweden: 3,
    canada: 2, kenya: 3, tanzania: 4, australia: 3, portugal: 4, turkey: 3, egypt: 1,
    peru: 2, southkorea: 2, singapore: 3, netherlands: 3, croatia: 4, nepal: 1, mexico: 3,
    cuba: 3, costarica: 2, botswana: 3, namibia: 2,
  },
  friends: {
    spain: 6, thailand: 5, greece: 4, vietnam: 4, bali: 3, morocco: 3, india: 2, japan: 2,
    italy: 2, dubai: 2, france: 1, newzealand: 3, jordan: 2, switzerland: 1, maldives: 0,
    iceland: 4, norway: 3, southafrica: 5, finland: 3, sweden: 3, canada: 5, kenya: 5,
    tanzania: 5, seychelles: 1, australia: 4, portugal: 4, turkey: 3, egypt: 3, peru: 3,
    southkorea: 4, singapore: 4, netherlands: 3, croatia: 4, nepal: 3, mexico: 5, cuba: 5,
    costarica: 4, botswana: 4, namibia: 3,
  },
  family: {
    italy: 4, japan: 3, france: 3, switzerland: 3, dubai: 2, spain: 2, greece: 2,
    thailand: 2, bali: 1, vietnam: 1, india: 1, newzealand: 2, morocco: 0, maldives: 0,
    jordan: 1, iceland: 3, norway: 3, southafrica: 3, finland: 3, sweden: 3, canada: 5,
    kenya: 3, tanzania: 3, seychelles: 1, australia: 5, portugal: 3, turkey: 2, egypt: 2,
    peru: 2, southkorea: 3, singapore: 4, netherlands: 3, croatia: 3, nepal: 1, mexico: 3,
    cuba: 2, costarica: 4, botswana: 3, namibia: 2,
  },
}

// Score → percentage
function scoreToPercent(score: number, rank: number): number {
  return Math.max(60, Math.min(95, Math.round((score / 250) * 100) - rank * 2))
}

// Positives / negatives — simplified (profile no longer available for CLIP path)
function generatePositives(dest: ExploreDestination, _profile: MergedTravelProfile | null): string[] {
  const p: string[] = []
  if (dest.scores.nature > 88)   p.push("Breathtaking natural landscapes")
  if (dest.scores.romance > 88)  p.push("Exceptional romantic atmosphere")
  if (dest.scores.adventure > 88)p.push("World-class adventure experiences")
  if (dest.scores.cultural > 90) p.push("Rich cultural heritage and history")
  if (dest.scores.beach > 88)    p.push("Stunning beaches and coastline")
  if (dest.scores.food > 92)     p.push("Outstanding culinary scene")
  if (dest.environmentTypes.some(e => ["savanna","wildlife"].includes(e)))
    p.push("Incredible wildlife and safari experiences")
  if (dest.environmentTypes.some(e => ["aurora","northern-lights"].includes(e)))
    p.push("Spectacular Northern Lights viewing")
  if (p.length === 0) p.push(`Great destination for ${dest.travelStyles[0] ?? "adventure"} travellers`)
  return p.slice(0, 3)
}

function generateNegatives(dest: ExploreDestination, _profile: MergedTravelProfile | null): string[] {
  const n: string[] = []
  if (dest.scores.budget < 28) n.push("Can be expensive for budget travellers")
  if (dest.scores.nightlife < 35) n.push("Quiet nightlife scene")
  return n.slice(0, 2)
}

// Build a minimal MergedTravelProfile from shared session preferences
// Used when no image analysis is available (text-only shared preferences).
function sharedPrefsToProfile(prefs: SharedPreferences): MergedTravelProfile {
  const budgetMap: Record<string, "low" | "medium" | "high" | "ultra"> = {
    low: "low", budget: "low", medium: "medium", high: "high", luxury: "ultra",
  }
  const interests = Array.isArray(prefs.interests) ? prefs.interests : []
  const isAdventure = interests.some(i => ["adventure","hiking","safari","trekking","skiing"].includes(i))
  const isBeach     = interests.some(i => ["beach","ocean","island","diving"].includes(i))
  const isCultural  = interests.some(i => ["culture","history","museums","art","temples"].includes(i))

  const envTypes: Record<string,number> = {}
  if (isBeach)      { envTypes["beach"] = 2; envTypes["ocean"] = 1 }
  if (isAdventure)  { envTypes["mountain"] = 2 }
  if (!isBeach && !isAdventure) { envTypes["countryside"] = 2 }

  return {
    luxuryLevel:             prefs.budget === "luxury" ? 85 : prefs.budget === "medium" ? 55 : 30,
    natureLevel:             isAdventure ? 78 : isBeach ? 55 : 40,
    cityLevel:               40,
    relaxationLevel:         isBeach ? 75 : 50,
    adventureLevel:          isAdventure ? 78 : 45,
    socialLevel:             70,
    nightlifeInterest:       30,
    culturalInterest:        isCultural ? 78 : 52,
    romanticAffinity:        40,
    foodExplorationAffinity: 55,
    travelStyles:            interests.reduce((a,i) => ({ ...a, [i]: 1 }), {}),
    activities:              interests.reduce((a,i) => ({ ...a, [i]: 1 }), {}),
    climatePreference:       isBeach ? { tropical: 2, warm: 1 } : { temperate: 2 },
    possibleRegions:         {},
    atmosphere:              {},
    emotionalVibe:           {},
    architectureStyle:       {},
    culturalContext:         {},
    explorationStyle:        {},
    environmentTypes:        envTypes,
    terrain:              {},
    cityStyle:            {},
    foodSignals:          {},
    mood:                 {},
    dominantEnvironment:  isBeach ? "beach" : isAdventure ? "mountain" : "countryside",
    detectedLandmark:     null,
    budgetLevel:             budgetMap[prefs.budget ?? "medium"] ?? "medium",
    travelType:              "friends",
    familyFriendly:          false,
    avgConfidence:           0.5,
    imageCount:              0,
  }
}

// Multiplayer summary
function generateSummary(destinations: Array<{ name: string }>, playerCount: number, interests: string[]): string {
  const top = destinations[0]
  const interestStr = interests.length > 0 ? `including ${interests.slice(0, 3).join(", ")}, ` : ""
  return `Based on ${playerCount} ${playerCount === 1 ? "player" : "players"} collaborative preferences ${interestStr}${top?.name ?? "your chosen destination"} is perfectly matched for your group.`
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = getClientIp(request)
  if (!checkRateLimit(ip).allowed) return rateLimitResponse()

  try {
    const raw = await request.json()
    const parsed = parseBody(MultiplayerBodySchema, raw)
    if (!parsed.ok) return parsed.response

    const { preferences, playerCount = 1 } = parsed.data

    console.log("[multiplayer-analyze] Request", {
      playerCount,
      hasInterests: Array.isArray(preferences.interests),
      interestCount: (preferences.interests ?? []).length,
      imageCount: (preferences.imageMetadata ?? []).length,
    })

    const imageMetadata = preferences.imageMetadata ?? []
    const imageUrls: string[] = imageMetadata.map((img) => img.url).filter(Boolean)

    const squadType = (preferences.squad ?? "friends") as "solo" | "couple" | "friends" | "family"

    let ranked: Awaited<ReturnType<typeof rankDestinations>>
    let vibes: string[] = []
    let travelStyle: string = "adventure"

    if (imageUrls.length > 0) {
      // CLIP semantic engine on all players' images
      console.log("[multiplayer-analyze] CLIP vision on", imageUrls.length, "image(s) from", playerCount, "player(s)")
      try {
        const clipResult = await rankDestinationsByCLIP(imageUrls.slice(0, 5), squadType)
        ranked = clipResult.ranked
        vibes = clipResult.vibes
        travelStyle = clipResult.travelStyle
      } catch (clipErr) {
        // CLIP failed — fall back to text-only profile scoring (no Gemini)
        console.warn("[multiplayer-analyze] CLIP failed — falling back to text-only profile scoring:", clipErr)
        let fallbackProfile = sharedPrefsToProfile(preferences as SharedPreferences)
        if (Array.isArray(preferences.interests) && preferences.interests.length > 0) {
          for (const interest of preferences.interests) {
            fallbackProfile.activities[interest] = (fallbackProfile.activities[interest] ?? 0) + 2
            fallbackProfile.travelStyles[interest] = (fallbackProfile.travelStyles[interest] ?? 0) + 1
          }
        }
        const adjusted = applySquadAdjustments(fallbackProfile, squadType)
        ranked = rankDestinations(adjusted)
        if (SQUAD_BONUS[squadType]) {
          for (const r of ranked) r.score += SQUAD_BONUS[squadType][r.id] ?? 0
          ranked.sort((a, b) => b.score - a.score)
        }
      }
    } else {
      // Text-only path: build from shared session preferences
      console.log("[multiplayer-analyze] Text-only profile from shared preferences")
      let mergedProfile = sharedPrefsToProfile(preferences as SharedPreferences)
      if (Array.isArray(preferences.interests) && preferences.interests.length > 0) {
        for (const interest of preferences.interests) {
          mergedProfile.activities[interest] = (mergedProfile.activities[interest] ?? 0) + 2
          mergedProfile.travelStyles[interest] = (mergedProfile.travelStyles[interest] ?? 0) + 1
        }
      }
      const adjusted = applySquadAdjustments(mergedProfile, squadType)
      ranked = rankDestinations(adjusted)
      if (SQUAD_BONUS[squadType]) {
        for (const r of ranked) r.score += SQUAD_BONUS[squadType][r.id] ?? 0
        ranked.sort((a, b) => b.score - a.score)
      }
    }

    const requestSeed = generateSeed()
    const topDestinations = ranked.slice(0, 3)

    console.log(
      "[multiplayer-analyze] Top 3: " +
      topDestinations.map(r => `${r.id}=${r.score.toFixed(1)}`).join(", ")
    )

    // Build response — shape matches /api/analyze so /results page can be used directly
    const countries = topDestinations.map((dest, index) => {
      const exploreDest = EXPLORE_DESTINATIONS[dest.id]
      const travelEntry = DESTINATIONS.find(d => d.id === dest.id)
      const matchPct    = scoreToPercent(dest.score, index)
      const topCity     = exploreDest?.cities[0]
      const s           = dest.score

      const hotels = (travelEntry?.hotels ?? []).slice(0, 3).map(h => ({
        name:           h.name,
        style:          h.priceLevel,
        activity_level: "mixed",
      }))

      // Use ranked destination's explanation if available, else fall back to generated positives
      const positives = (dest as typeof dest & { explanation?: string[] }).explanation?.length
        ? (dest as typeof dest & { explanation: string[] }).explanation.slice(0, 3)
        : generatePositives(exploreDest!, null as any)
      const negatives = generateNegatives(exploreDest!, null as any)

      return {
        name:            dest.name,
        code:            DEST_TO_ISO[dest.id] ?? "XX",
        city:            topCity?.name ?? null,
        matchPercentage: matchPct,
        reason:          positives[0] ?? null,
        image:           dest.heroImage ?? null,
        tags:            vibes,
        shortSummary:    topCity?.tagline ?? exploreDest?.atmosphereTags.slice(0, 3).join(" · ") ?? "",
        climate:         exploreDest?.climates[0] ?? "temperate",
        vibe:            travelStyle,
        confidenceBreakdown: {
          activity: Math.round(60 + (s / 100) * 35),
          climate:  Math.round(60 + (s / 100) * 32),
          mood:     Math.round(60 + (s / 100) * 33),
          food:     Math.round(60 + (s / 100) * 28),
        },
        positives,
        negatives,
        activities:      exploreDest?.activities ?? [],
        foodHighlights:  (travelEntry?.restaurants ?? []).slice(0, 4).map(r => r.name),
        hotels,
      }
    })

    return NextResponse.json({
      requestSeed,
      travelCompanion: squadType,
      userProfile: {
        dominantMood:         ranked[0] ? EXPLORE_DESTINATIONS[ranked[0].id]?.travelStyles[0] ?? "adventure" : "adventure",
        preferredClimate:     ranked[0] ? EXPLORE_DESTINATIONS[ranked[0].id]?.climates[0] ?? "temperate" : "temperate",
        preferredEnvironment: ranked[0] ? EXPLORE_DESTINATIONS[ranked[0].id]?.environmentTypes[0] ?? "nature" : "nature",
        activityLevel:        "high",
        foodPreferences:      ranked[0] ? EXPLORE_DESTINATIONS[ranked[0].id]?.activities.slice(0, 2) ?? [] : [],
        collaborative:        true,
        playerCount,
      },
      countries,
      summary: generateSummary(countries, playerCount, Array.isArray(preferences.interests) ? preferences.interests : []),
    }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" },
    })

  } catch (error) {
    console.error("[multiplayer-analyze] Error:", error)
    return NextResponse.json({ error: "Failed to analyze collaborative preferences" }, { status: 500 })
  }
}
