/**
 * Gemini Vision — travel preference extraction from images.
 *
 * ROOT CAUSE OF 404 BUG: "gemini-1.5-flash" was sunset 2025-05-14.
 * Google's REST endpoint returns HTTP 404 for that model name.
 * Fixed by: switching to "gemini-2.0-flash" via the @google/generative-ai SDK
 * instead of raw fetch (the SDK was already installed but unused).
 */

import { GoogleGenerativeAI } from "@google/generative-ai"

// Model
// gemini-1.5-flash sunset date: 2025-05-14 → HTTP 404 for any call after that.
// gemini-2.0-flash is GA, supports multimodal + JSON mode, and is significantly
// more capable than 1.5-flash for travel psychology extraction.
const GEMINI_MODEL = "gemini-2.0-flash"

// Landmark detection result
export interface LandmarkDetection {
  detected: boolean
  name: string | null       // e.g. "Petra Treasury" — landmark name when recognised
  countryHint: string | null  // e.g. "Jordan" — country associated with landmark
  regionHint: string | null   // e.g. "Middle East" — broad region
  confidence: number          // 0.0 – 1.0
}

// Legacy shape (used by /api/analyze route)
export interface GeminiImageAnalysis {
  travelStyle: "adventure" | "luxury" | "cultural" | "relaxed" | "budget"
  preferredClimate: "tropical" | "temperate" | "cold" | "desert" | "mediterranean"
  activities: string[]
  environment: string[]
  vibe: string[]
  mood: string
  tags: string[]
}

// Travel Psychology shape (used by /api/explore-analyze route)
export interface TravelPreferenceAnalysis {
  travelStyles: string[]
  activities: string[]
  budgetLevel: "low" | "medium" | "high" | "ultra"
  climatePreference: string[]
  travelType: "solo" | "couple" | "friends" | "family"
  possibleRegions: string[]
  atmosphere: string[]
  emotionalVibe: string[]
  architectureStyle: string[]
  culturalContext: string[]
  explorationStyle: string[]
  environmentTypes: string[]   // physical environments visible in the image
  luxuryLevel: number
  natureLevel: number
  cityLevel: number
  relaxationLevel: number
  adventureLevel: number
  socialLevel: number
  nightlifeInterest: number
  culturalInterest: number
  romanticAffinity: number
  foodExplorationAffinity: number
  familyFriendly: boolean
  confidenceLevel: number

  // New dimensions (Step 2 of deep-analysis redesign)
  terrain?: string[]      // terrain character: mountainous, coastal, rocky, desert, forested, island, volcanic, polar, flat
  cityStyle?: string[]    // urban aesthetic: futuristic, modern, historic, traditional, old-town, skyscraper, mixed
  foodSignals?: string[]  // food culture: seafood, street-food, fine-dining, local-cuisine, asian-cuisine, mediterranean, spiced, grilled, tropical-fruits
  mood?: string[]         // atmosphere alias for scoring: peaceful, vibrant, energetic, romantic, luxurious, spiritual, wild, remote, dramatic
  landmark?: LandmarkDetection | null  // detected famous landmark — null when nothing recognised
}

// Extended destination-analysis shape (kept for backward compat)
export interface DestinationPreferenceAnalysis {
  possible_locations: string[]
  landmarks: string[]
  architecture_style: string[]
  culture_signals: string[]
  location_confidence: number
  scores: {
    luxury: number; adventure: number; family: number; romantic: number
    nightlife: number; culture: number; food: number; nature: number
    shopping: number; wellness: number; relaxation: number
    soloTravel: number; groupTravel: number
  }
  confidence: number
  travelStyle: GeminiImageAnalysis["travelStyle"]
  preferredClimate: GeminiImageAnalysis["preferredClimate"]
  activities: string[]
  environment: string[]
  vibe: string[]
  tags: string[]
}

// SDK helper
function buildModel(apiKey: string, maxOutputTokens: number, temperature: number) {
  const genAI = new GoogleGenerativeAI(apiKey)
  return genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: {
      temperature,
      maxOutputTokens,
      responseMimeType: "application/json",
    },
  })
}

// Image fetching
async function fetchImageAsBase64(
  url: string
): Promise<{ base64: string; mimeType: string } | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) {
      console.warn(`[Gemini] Remote image fetch failed: ${res.status} ${url.slice(0, 80)}`)
      return null
    }
    const buffer = await res.arrayBuffer()
    const base64   = Buffer.from(buffer).toString("base64")
    const mimeType = res.headers.get("content-type")?.split(";")[0] || "image/jpeg"
    return { base64, mimeType }
  } catch (err) {
    console.warn(`[Gemini] Remote image fetch error: ${err}`)
    return null
  }
}

// Shared image preparation
async function prepareImage(
  imageUrl: string
): Promise<{ base64: string; mimeType: string; source: string } | null> {
  if (imageUrl.startsWith("data:")) {
    const commaIdx = imageUrl.indexOf(",")
    if (commaIdx < 0) { console.warn("[Gemini] Malformed data URL"); return null }
    const base64   = imageUrl.slice(commaIdx + 1)
    const mimeMatch = imageUrl.slice(0, commaIdx).match(/data:([^;]+);/)
    const mimeType = mimeMatch?.[1] ?? "image/jpeg"
    return { base64, mimeType, source: "upload" }
  }
  const fetched = await fetchImageAsBase64(imageUrl)
  if (!fetched) return null
  return { ...fetched, source: imageUrl.slice(0, 60) }
}

// JSON parsing helper
// Gemini 2.0 with responseMimeType:"application/json" returns clean JSON, but
// we keep a markdown-strip fallback just in case.

function parseGeminiJson<T>(text: string): T | null {
  const clean = text.trim()
  try { return JSON.parse(clean) as T } catch {}
  const match = clean.match(/\{[\s\S]*\}/)
  if (!match) return null
  try { return JSON.parse(match[0]) as T } catch { return null }
}

// ---
// 1. Legacy vision analysis (used by /api/analyze)
const ANALYSIS_PROMPT = `Analyze this travel image. Return ONLY a valid JSON object — no markdown, no explanation, no code block. Exact schema:
{
  "travelStyle": "adventure|luxury|cultural|relaxed|budget",
  "preferredClimate": "tropical|temperate|cold|desert|mediterranean",
  "activities": ["up to 4 activities from: beach, hiking, nightlife, diving, shopping, museums, skiing, surfing, food, wellness, adventure, cycling"],
  "environment": ["up to 3 from: ocean, mountain, city, forest, desert, countryside, lake, island, village"],
  "vibe": ["up to 3 from: relaxing, romantic, exciting, peaceful, adventurous, cultural, luxurious, energetic, spiritual"],
  "mood": "calm|adventurous|cultural|luxury|relaxed",
  "tags": ["up to 8 specific travel keywords visible in the image"]
}`

export async function analyzeImageWithGemini(
  imageUrl: string
): Promise<GeminiImageAnalysis | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.warn("[Gemini] GEMINI_API_KEY not set — skipping vision analysis")
    return null
  }

  const img = await prepareImage(imageUrl)
  if (!img) return null

  console.log(`[Gemini] analyzeImageWithGemini | model=${GEMINI_MODEL} | src=${img.source} | mime=${img.mimeType} | b64len=${img.base64.length}`)

  try {
    const model = buildModel(apiKey, 400, 0.1)
    const result = await model.generateContent([
      { inlineData: { data: img.base64, mimeType: img.mimeType } },
      { text: ANALYSIS_PROMPT },
    ])
    const text = result.response.text()
    console.log(`[Gemini] analyzeImageWithGemini raw response (first 200): ${text.slice(0, 200)}`)
    const parsed = parseGeminiJson<GeminiImageAnalysis>(text)
    if (!parsed) console.warn("[Gemini] analyzeImageWithGemini: could not parse JSON")
    return parsed
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error(`[Gemini] analyzeImageWithGemini FAILED | model=${GEMINI_MODEL} | error: ${msg}`)
    if (error instanceof Error && error.stack) console.error(error.stack)
    return null
  }
}

export async function analyzeImagesWithGemini(
  imageUrls: string[]
): Promise<Array<GeminiImageAnalysis | null>> {
  const limited = imageUrls.slice(0, 5)
  console.log(`[Gemini] analyzeImagesWithGemini: ${limited.length} image(s)`)
  return Promise.all(limited.map((url) => analyzeImageWithGemini(url)))
}

// ---
// 2. Travel psychology analysis (used by /api/explore-analyze)
const TRAVEL_PSYCHOLOGY_PROMPT = `You are a Travel Intelligence AI. Analyze this image across two passes simultaneously.
━━━ PASS 1 — LANDMARK & LOCATION DETECTION ━━━
Scan the image for any world-famous landmark, natural wonder, or iconic recognisable place.
Known examples (non-exhaustive — detect others confidently too):
  Eiffel Tower → France | Petra Treasury / Al-Khazneh → Jordan | Taj Mahal → India
  Burj Khalifa / Dubai skyline → UAE | Santorini caldera / blue domes → Greece
  Mount Fuji → Japan | Matterhorn / Swiss Alps → Switzerland | Sagrada Família → Spain
  Colosseum / Rome ruins → Italy | Ha Long Bay limestone karsts → Vietnam
  Northern Lights / Aurora Borealis → Nordic (Iceland/Norway/Finland/Sweden)
  Maasai Mara savanna with wildlife → Kenya | Serengeti plains → Tanzania
  Table Mountain Cape Town → South Africa | Lofoten Islands red cabins → Norway
  Ngorongoro Crater → Tanzania | Milford Sound fjords → New Zealand
  Wadi Rum red canyon desert → Jordan | Dead Sea salt flats → Jordan
  Moroccan medina / Jemaa el-Fna → Morocco | Blue City Chefchaouen → Morocco
  Golden Temple Amritsar → India | Kerala backwaters → India | Varanasi Ghats → India
  Bali rice terraces (Tegallalang) → Indonesia/Bali | Tanah Lot / Uluwatu → Bali
  Wat Phra Kaew / Grand Palace → Thailand | Ayutthaya temples → Thailand
  Jokulsarlon glacier lagoon → Iceland | Blue Lagoon Iceland → Iceland
  Banff / Lake Louise / Moraine Lake → Canada | Trolltunga / Preikestolen → Norway
  Sydney Opera House → Australia | Machu Picchu → Peru | Angkor Wat → Cambodia

RULES:
- If a famous landmark is CLEARLY visible: set detected=true, name it precisely, give countryHint.
- If uncertain or no landmark is visible: set detected=false, all other fields=null, confidence=0.
- Do NOT invent landmark detections from generic scenery (mountains, beaches, forests).
- Generic safaris without specific wildlife count markers = detected=false.
- Confidence must reflect your certainty: a blurry Eiffel Tower = 0.7, crisp Petra = 0.98.

━━━ PASS 2 — DEEP TRAVEL PREFERENCE EXTRACTION ━━━
Extract the full travel preference signal this image conveys, independent of location.
Analyze: physical environments, terrain, climate, activities, city character, architecture,
food culture, mood, budget indicators, cultural aesthetic, and exploration style.

Return ONLY valid JSON — no markdown, no explanation, no code block:
{
  "landmark": {
    "detected": <true|false>,
    "name": <"landmark name" | null>,
    "countryHint": <"country name" | null>,
    "regionHint": <"broad region" | null>,
    "confidence": <0.0-1.0>
  },
  "environmentTypes": ["0-6 physical environments VISUALLY PRESENT in the image: desert, dunes, sandy, beach, ocean, coastal, tropical-island, mountain, alpine, forest, jungle, lake, river, urban, city, countryside, volcanic, tundra, savanna, wildlife, grassland, bush, plains, rocky, canyon, glacier, valley, aurora, northern-lights, arctic, ice, hot-spring, fjord, highland, coral-reef, waterfall, steppe — describe ONLY what is physically visible"],
  "terrain": ["1-3 from: flat, coastal, mountainous, rocky, desert, forested, island, volcanic, polar"],
  "climatePreference": ["1-3 from: tropical, warm, hot, dry, humid, mediterranean, temperate, cold, snowy, arctic"],
  "activities": ["2-5 from: food, history, shopping, hiking, beach, diving, skiing, nightlife, museums, wellness, photography, cycling, water-sports, festivals, cooking, yoga, sailing, trekking, camping, off-road, safari, wildlife-viewing, game-drive, surfing, snorkeling, road-trip"],
  "travelStyles": ["2-4 from: urban, cultural, luxury, adventure, nature, relaxed, romantic, social, spiritual, wellness, family, budget, backpacker, road-trip, coastal, foodie, wildlife, safari, photography"],
  "cityStyle": ["0-3 from: futuristic, modern, historic, traditional, old-town, skyscraper, mixed — EMPTY ARRAY if no significant urban area visible"],
  "architectureStyle": ["0-3 from: islamic, moorish, gothic, baroque, classical, roman, renaissance, modernist, futurist, traditional, mediterranean, japanese, east-asian, south-asian, mughal, colonial, nordic, vernacular, tropical, cycladic, art-nouveau, nabataean, indo-islamic — EMPTY ARRAY if no architecture visible"],
  "foodSignals": ["0-3 from: seafood, street-food, fine-dining, local-cuisine, asian-cuisine, mediterranean, spiced, grilled, tropical-fruits — EMPTY ARRAY if no food signals visible"],
  "mood": ["2-4 from: peaceful, vibrant, energetic, romantic, luxurious, spiritual, wild, remote, dramatic, ancient, mystical, modern, cozy, sun-drenched, ethereal, rugged"],
  "atmosphere": ["2-4 from: historical, monumental, ancient, sun-drenched, tropical, cozy, vibrant, serene, mystical, wild, glamorous, raw, modern, warm, cool, lively, peaceful, rugged, ethereal, dramatic"],
  "emotionalVibe": ["1-3 from: inspired, curious, adventurous, peaceful, romantic, energized, contemplative, excited, nostalgic, awestruck, free, grounded, exhilarated"],
  "culturalContext": ["0-2 from: north-african, east-asian, south-asian, middle-eastern, western-european, mediterranean-coastal, tropical-asian, latin-american, nordic, sub-saharan, island-tropical — EMPTY if not clearly evident"],
  "explorationStyle": ["1-2 from: deep-dive, wandering, guided-tour, spontaneous, structured, slow-travel, immersive, off-beaten-path"],
  "possibleRegions": ["0-2 from: Mediterranean, Western Europe, Eastern Europe, North Africa, Middle East, East Asia, Southeast Asia, South Asia, Caribbean, South America, Nordic, Oceania, Sub-Saharan Africa, East Africa — EMPTY if no clear geographic context"],
  "travelType": "solo|couple|friends|family",
  "budgetLevel": "low|medium|high|ultra",
  "luxuryLevel": <integer 0-100>,
  "natureLevel": <integer 0-100>,
  "cityLevel": <integer 0-100>,
  "relaxationLevel": <integer 0-100>,
  "adventureLevel": <integer 0-100>,
  "socialLevel": <integer 0-100>,
  "nightlifeInterest": <integer 0-100>,
  "culturalInterest": <integer 0-100>,
  "romanticAffinity": <integer 0-100>,
  "foodExplorationAffinity": <integer 0-100>,
  "familyFriendly": <true|false>,
  "confidenceLevel": <float 0.0-1.0: overall analysis confidence>
}`

async function analyzeImageForTravel(
  imageUrl: string,
  index: number = 0
): Promise<TravelPreferenceAnalysis | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.warn("[Gemini] GEMINI_API_KEY not set")
    return null
  }

  const img = await prepareImage(imageUrl)
  if (!img) {
    console.warn(`[Gemini Travel] Image ${index + 1}: could not prepare image`)
    return null
  }

  console.log(
    `[Gemini Travel] Image ${index + 1} | model=${GEMINI_MODEL} | ` +
    `src=${img.source} | mime=${img.mimeType} | b64len=${img.base64.length}`
  )

  try {
    const model = buildModel(apiKey, 900, 0.15)
    const t0 = Date.now()
    const result = await model.generateContent([
      { inlineData: { data: img.base64, mimeType: img.mimeType } },
      { text: TRAVEL_PSYCHOLOGY_PROMPT },
    ])
    const ms = Date.now() - t0
    const text = result.response.text()

    console.log(
      `[Vision] Image ${index + 1} responded in ${ms}ms | raw (first 300): ${text.slice(0, 300)}`
    )

    const parsed = parseGeminiJson<TravelPreferenceAnalysis>(text)
    if (!parsed) {
      console.error(`[Vision] Image ${index + 1} Analysis Failed — JSON parse error | full: ${text.slice(0, 500)}`)
      console.log(`[Vision] Fallback Activated for image ${index + 1}`)
      return null
    }

    const lm = parsed.landmark
    const landmarkLog = lm?.detected
      ? `LANDMARK=${lm.name} (${lm.countryHint}, conf=${lm.confidence?.toFixed(2)})`
      : "landmark=none"

    console.log(
      `[Vision] Image ${index + 1} Analysis Success | ${landmarkLog} | ` +
      `env=${JSON.stringify(parsed.environmentTypes)} | ` +
      `terrain=${JSON.stringify(parsed.terrain ?? [])} | ` +
      `cityStyle=${JSON.stringify(parsed.cityStyle ?? [])} | ` +
      `styles=${JSON.stringify(parsed.travelStyles)} | ` +
      `activities=${JSON.stringify(parsed.activities)} | ` +
      `arch=${JSON.stringify(parsed.architectureStyle)} | ` +
      `culture=${JSON.stringify(parsed.culturalContext)} | ` +
      `regions=${JSON.stringify(parsed.possibleRegions)} | ` +
      `budget=${parsed.budgetLevel} | luxury=${parsed.luxuryLevel} | confidence=${parsed.confidenceLevel}`
    )

    return parsed
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error(`[Vision] Image ${index + 1} Analysis Failed | model=${GEMINI_MODEL} | error: ${msg}`)
    console.log(`[Vision] Fallback Activated for image ${index + 1}`)
    if (error instanceof Error && error.stack) console.error(error.stack)
    return null
  }
}

export async function analyzeImagesForTravel(
  imageUrls: string[]
): Promise<Array<TravelPreferenceAnalysis | null>> {
  const limited = imageUrls.slice(0, 5)
  console.log(`[Vision] analyzeImagesForTravel: ${limited.length} image(s) | model=${GEMINI_MODEL}`)
  return Promise.all(limited.map((url, i) => analyzeImageForTravel(url, i)))
}

// ---
// 3. Profile text analysis (used by /api/analyze — template path)
export async function analyzeProfileWithGemini(profileSummary: string): Promise<{
  recommendationReason: string
  travelPersonality: string
  topExperiences: string[]
  avoidances: string[]
  geminiInsight: string
} | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null

  const PROFILE_PROMPT = `You are an expert travel consultant. Based on the travel profile below, generate personalized travel insights. Return ONLY valid JSON — no markdown, no code block.

${profileSummary}

Return exactly this JSON schema:
{
  "recommendationReason": "2-3 sentence explanation of why specific destinations match this traveler",
  "travelPersonality": "short label like 'The Adventure Seeker' or 'The Luxury Explorer'",
  "topExperiences": ["up to 4 experience types this traveler would love"],
  "avoidances": ["up to 2 things this traveler would NOT enjoy"],
  "geminiInsight": "one unique, personalized insight about this traveler's style"
}`

  console.log(`[Gemini Profile] analyzeProfileWithGemini | model=${GEMINI_MODEL}`)

  try {
    const model = buildModel(apiKey, 500, 0.4)
    const result = await model.generateContent(PROFILE_PROMPT)
    const text = result.response.text()
    const parsed = parseGeminiJson<{
      recommendationReason: string; travelPersonality: string
      topExperiences: string[]; avoidances: string[]; geminiInsight: string
    }>(text)
    if (!parsed) console.warn("[Gemini Profile] Could not parse JSON from profile analysis")
    return parsed
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error(`[Gemini Profile] FAILED | model=${GEMINI_MODEL} | error: ${msg}`)
    return null
  }
}

// ---
// 4. Destination analysis (backward compat — not used in current routes)
const DESTINATION_ANALYSIS_PROMPT = `You are a travel intelligence system. Analyze this image in two steps.
STEP 1 — GEOGRAPHIC & CULTURAL DETECTION (do this first):
- Identify any recognizable landmark, monument, or famous place. Name it precisely if you recognize it.
- Identify the architectural style (e.g. "Islamic", "Japanese traditional", "French Haussmann", "North African brutalist").
- Infer the most likely country, region, or continent based on visual evidence.
- List cultural signals (e.g. "North African culture", "Buddhist temple", "Scandinavian design").
- Set location_confidence based on how certain you are (0 = no idea, 1 = certain landmark recognized).

STEP 2 — TRAVEL SIGNAL EXTRACTION:
- Base travel style and preference scores on what you detected in Step 1, not generic guesses.
- A cultural monument in North Africa should produce high culture score and cultural travelStyle, NOT luxury Western European signals.
- Avoid recommending unrelated destinations — if you detect Arabic/North African context, reflect that in location/culture tags.

Return ONLY a valid JSON object — no markdown, no explanation, no code block:
{
  "possible_locations": ["specific countries, regions, or continents you detected"],
  "landmarks": ["any recognizable landmark — empty array if uncertain"],
  "architecture_style": ["architectural styles visible"],
  "culture_signals": ["cultural context clues"],
  "location_confidence": <float 0.0-1.0>,
  "scores": {
    "luxury": <0-10>, "adventure": <0-10>, "family": <0-10>, "romantic": <0-10>,
    "nightlife": <0-10>, "culture": <0-10>, "food": <0-10>, "nature": <0-10>,
    "shopping": <0-10>, "wellness": <0-10>, "relaxation": <0-10>,
    "soloTravel": <0-10>, "groupTravel": <0-10>
  },
  "confidence": <float 0.0-1.0>,
  "travelStyle": "adventure|luxury|cultural|relaxed|budget",
  "preferredClimate": "tropical|temperate|cold|desert|mediterranean",
  "activities": ["up to 4 from: beach, hiking, nightlife, diving, shopping, museums, skiing, surfing, food, wellness, adventure, cycling"],
  "environment": ["up to 3 from: ocean, mountain, city, forest, desert, countryside, lake, island, village"],
  "vibe": ["up to 3 from: relaxing, romantic, exciting, peaceful, adventurous, cultural, luxurious, energetic, spiritual"],
  "tags": ["up to 8 travel keywords"]
}`

async function analyzeImageForDestination(
  imageUrl: string
): Promise<DestinationPreferenceAnalysis | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null

  const img = await prepareImage(imageUrl)
  if (!img) return null

  try {
    const model = buildModel(apiKey, 800, 0.1)
    const result = await model.generateContent([
      { inlineData: { data: img.base64, mimeType: img.mimeType } },
      { text: DESTINATION_ANALYSIS_PROMPT },
    ])
    return parseGeminiJson<DestinationPreferenceAnalysis>(result.response.text())
  } catch (error) {
    console.error(`[Gemini Destination] FAILED: ${error instanceof Error ? error.message : error}`)
    return null
  }
}

export async function analyzeImagesForDestination(
  imageUrls: string[]
): Promise<Array<DestinationPreferenceAnalysis | null>> {
  const limited = imageUrls.slice(0, 5)
  return Promise.all(limited.map((url) => analyzeImageForDestination(url)))
}

// ---
// 5. Mapping helper (used by /api/analyze)
export function geminiToImageMetadata(analysis: GeminiImageAnalysis): {
  tags: string[]
  mood: string
  climate: string
  environment: string
  activity_level: "low" | "medium" | "high"
  food_style: string
} {
  const highActivity = ["hiking", "skiing", "surfing", "adventure", "diving", "cycling"]
  const lowActivity  = ["beach", "wellness", "relaxing", "spa"]

  const activityWords = [...analysis.activities, ...analysis.vibe, ...analysis.tags]
  let activity_level: "low" | "medium" | "high" = "medium"
  if (activityWords.some((a) => highActivity.includes(a.toLowerCase()))) activity_level = "high"
  else if (activityWords.some((a) => lowActivity.includes(a.toLowerCase()))) activity_level = "low"

  const tags = [...analysis.tags, ...analysis.activities]
  let food_style = "local"
  if (tags.some((t) => ["fine dining", "gourmet", "michelin", "luxury"].includes(t.toLowerCase()))) food_style = "fine_dining"
  else if (tags.some((t) => ["street food", "market", "street", "vendor"].includes(t.toLowerCase()))) food_style = "street_food"
  else if (tags.some((t) => ["seafood", "fish", "ocean", "harbour"].includes(t.toLowerCase()))) food_style = "seafood"
  else if (tags.some((t) => ["cafe", "coffee", "bakery", "brunch"].includes(t.toLowerCase()))) food_style = "cafe"
  else if (tags.some((t) => ["vegetarian", "vegan", "healthy"].includes(t.toLowerCase()))) food_style = "vegetarian"

  const allTags = Array.from(new Set([
    ...analysis.tags, ...analysis.activities,
    ...analysis.environment, ...analysis.vibe,
    analysis.travelStyle, analysis.mood,
  ]))

  return {
    tags: allTags,
    mood: analysis.mood,
    climate: analysis.preferredClimate,
    environment: analysis.environment[0] || "nature",
    activity_level,
    food_style,
  }
}
