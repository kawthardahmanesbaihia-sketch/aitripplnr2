/**
 * Semantic CLIP Scoring Engine — embedding-optimized build
 *
 * Pipeline per image:
 *   computeImageEmbedding(url)          ← one vision-encoder call, no text encoder
 *   allPhraseScores(imageEmb)           ← vectorized batch dot-product (precomputed text matrix)
 *   centroidRanking(imageEmb, TOP_K)    ← stage-1 coarse ranking (99 dot-products)
 *   category-weighted scoring           ← stage-2 full scoring for top-K only
 *   contradiction detection
 *   applyGeographicReasoning()          ← landmark + environment multipliers
 *
 * Multi-image: scores accumulated with recency weighting, then normalised.
 *
 * Key performance properties:
 *   - Text encoder runs ZERO TIMES during requests (precomputed at startup)
 *   - Single vision-encoder call per image
 *   - 5031-phrase similarity via one matrix multiply (~2ms)
 *   - Category scoring only for top-20 candidate destinations
 */

import { type LabelScore } from "./clip-service"
import {
  DEST_CATEGORY_CONCEPTS,
  ALL_CONCEPT_LABELS,
  LABEL_TO_DEST,
  CATEGORY_WEIGHTS,
  CATEGORY_CONTRADICTIONS,
} from "./destination-knowledge-base"
import { EXPLORE_DESTINATIONS, type RankedDestination } from "./explore-destinations"
import {
  applyGeographicReasoning,
  logReasoningDebug,
  type ReasoningResult,
} from "./geo-reasoning-engine"
import {
  precomputeEmbeddings,
  computeImageEmbedding,
  allPhraseScores,
  centroidRanking,
  getPhraseList,
  getPhraseIndex,
  getEmbeddingStats,
  isEmbeddingsReady,
} from "./clip-embeddings"

// Constants
const TOP_CENTROID_CANDIDATES = 20   // stage-1: keep this many destinations for full scoring

// Flat dest-phrase map (built once at module load)
// Used by precomputeEmbeddings to build per-destination phrase lists.

const DEST_PHRASE_MAP: Record<string, string[]> = {}
for (const [destId, categories] of Object.entries(DEST_CATEGORY_CONCEPTS)) {
  const all: string[] = []
  for (const phrases of Object.values(categories)) all.push(...phrases)
  DEST_PHRASE_MAP[destId] = all
}

const ALL_DEST_IDS = Object.keys(DEST_CATEGORY_CONCEPTS)

// Startup: trigger precomputation
let _startupLogged = false

function logStartupDiagnostics(): void {
  if (_startupLogged) return
  _startupLogged = true

  const totalPhrases = ALL_CONCEPT_LABELS.length
  const destCount    = ALL_DEST_IDS.length

  // Detect cross-destination duplicate phrases
  const seen = new Map<string, string>()
  let dupes = 0
  for (const phrase of ALL_CONCEPT_LABELS) {
    if (seen.has(phrase)) dupes++
    else seen.set(phrase, LABEL_TO_DEST[phrase] ?? "?")
  }

  console.log(`\n${"═".repeat(60)}`)
  console.log(`[Performance] Knowledge Base`)
  console.log(`  Destinations   : ${destCount}`)
  console.log(`  Total phrases  : ${totalPhrases}`)
  console.log(`  Duplicate phrs : ${dupes}`)
  console.log(`  Avg / dest     : ${(totalPhrases / Math.max(destCount, 1)).toFixed(1)}`)
  console.log(`  Centroid cands : top-${TOP_CENTROID_CANDIDATES} per image`)
  console.log(`${"═".repeat(60)}\n`)
}

/**
 * Trigger precomputation of all text embeddings + centroids.
 * Called at process startup from route handlers.
 * Safe to call multiple times — runs only once.
 */
export async function prewarmTextEmbeddings(): Promise<void> {
  logStartupDiagnostics()
  await precomputeEmbeddings(ALL_CONCEPT_LABELS, DEST_PHRASE_MAP)
  const stats = getEmbeddingStats()
  console.log(`[Performance] Embedding cache: ${stats.phraseCount} phrases, ${stats.centroidCount} centroids, ${stats.matrixMB.toFixed(1)} MB`)
}

// Squad bonus table
const SQUAD_BONUS: Record<string, Record<string, number>> = {
  solo: {
    japan: 4, vietnam: 4, morocco: 3, thailand: 3, india: 3, bali: 2, greece: 2, spain: 2,
    newzealand: 2, jordan: 2, france: 1, italy: 1, switzerland: 1, iceland: 5, norway: 4,
    southafrica: 4, finland: 5, sweden: 4, canada: 4, kenya: 4, tanzania: 4, australia: 3,
    portugal: 3, turkey: 2, egypt: 2, peru: 4, southkorea: 4, singapore: 2, netherlands: 2,
    croatia: 3, nepal: 5, mexico: 3, cuba: 3, costarica: 4, botswana: 4, namibia: 4,
    mongolia: 5, georgia: 3, armenia: 3, bhutan: 5, alaska: 4, greenland: 4,
  },
  couple: {
    maldives: 8, seychelles: 8, greece: 5, france: 5, italy: 5, bali: 5, switzerland: 3,
    dubai: 3, spain: 3, japan: 2, thailand: 2, borabora: 8, fiji: 5, mauritius: 6,
    norway: 3, southafrica: 2, finland: 3, sweden: 3, canada: 2, kenya: 3, tanzania: 4,
    australia: 3, portugal: 4, turkey: 3, peru: 2, southkorea: 2, singapore: 3,
    netherlands: 3, croatia: 4, mexico: 3, cuba: 3, costarica: 2, botswana: 3,
  },
  friends: {
    spain: 6, thailand: 5, greece: 4, vietnam: 4, bali: 3, morocco: 3, india: 2, japan: 2,
    italy: 2, dubai: 2, france: 1, newzealand: 3, switzerland: 1, iceland: 4, norway: 3,
    southafrica: 5, finland: 3, sweden: 3, canada: 5, kenya: 5, tanzania: 5, australia: 4,
    portugal: 4, turkey: 3, egypt: 3, peru: 3, southkorea: 4, singapore: 4, netherlands: 3,
    croatia: 4, nepal: 3, mexico: 5, cuba: 5, costarica: 4, botswana: 4, namibia: 3,
    hongkong: 4, colombia: 4, jamaica: 4,
  },
  family: {
    italy: 4, japan: 3, france: 3, switzerland: 3, dubai: 2, spain: 2, greece: 2,
    thailand: 2, bali: 1, vietnam: 1, india: 1, newzealand: 2,
    iceland: 3, norway: 3, southafrica: 3, finland: 3, sweden: 3, canada: 5,
    kenya: 3, tanzania: 3, australia: 5, portugal: 3, turkey: 2, egypt: 2,
    peru: 2, southkorea: 3, singapore: 4, netherlands: 3, croatia: 3, mexico: 3,
    costarica: 4, botswana: 3, unitedstates: 4,
  },
}

// Types
interface CategoryScore {
  category:       string
  rawScore:       number
  weighted:       number
  topPhrase:      string
  topPhraseScore: number
}

interface PerImageScores {
  destScores:           Record<string, number>
  destCategoryScores:   Record<string, Record<string, CategoryScore>>
  globalCategoryScores: Record<string, number>
  activatedCategories:  string[]
  topLabels:            Record<string, string>
  rawLabelScores:       LabelScore[]    // top-30 sorted, for geo-reasoning
  imageUrl:             string
}

// Per-image semantic scoring
async function scoreOneImage(imageUrl: string): Promise<PerImageScores> {
  const tTotal = Date.now()

  // Image embedding (ONE vision-encoder call per image)
  const imageEmb = await computeImageEmbedding(imageUrl)

  // Full phrase similarity (vectorized; no text-encoder calls)
  const tSim = Date.now()
  const phraseScores = allPhraseScores(imageEmb)  // Float32Array[N_phrases]
  const phraseList   = getPhraseList()

  // Build top-30 LabelScore[] for geo-reasoning
  // Partial selection avoids allocating + sorting a full 5031-entry array.
  const tGeo = Date.now()
  const TOP_GEO = 30
  const top30: LabelScore[] = []
  // Scan once: maintain a min-score threshold so we collect top-30 efficiently
  let minScore = -Infinity
  for (let i = 0; i < phraseScores.length; i++) {
    const s = phraseScores[i]
    if (top30.length < TOP_GEO) {
      top30.push({ label: phraseList[i], score: s })
      if (top30.length === TOP_GEO) {
        top30.sort((a, b) => a.score - b.score)   // ascending so [0] is min
        minScore = top30[0].score
      }
    } else if (s > minScore) {
      top30[0] = { label: phraseList[i], score: s }
      // Sift up to maintain ascending sort
      let j = 0
      while (j + 1 < TOP_GEO && top30[j].score > top30[j + 1].score) {
        const tmp = top30[j]; top30[j] = top30[j + 1]; top30[j + 1] = tmp
        j++
      }
      minScore = top30[0].score
    }
  }
  top30.sort((a, b) => b.score - a.score)  // descending for geo-reasoning
  console.log(`[Timing] Top-30 extraction: ${Date.now() - tGeo}ms`)

  // Stage 1: Centroid ranking → candidate set
  const tCentroid = Date.now()
  const topCandidates = centroidRanking(imageEmb, TOP_CENTROID_CANDIDATES)
  const candidateSet  = new Set(topCandidates.map(c => c.destId))
  console.log(`[Timing] Centroid ranking: ${Date.now() - tCentroid}ms | candidates: ${candidateSet.size}`)

  // Stage 2: Category-weighted scoring (finalists only)
  const tScore = Date.now()
  const destScores: Record<string, number> = {}
  const destCategoryScores: Record<string, Record<string, CategoryScore>> = {}
  const topLabels: Record<string, string> = {}

  for (const destId of ALL_DEST_IDS) {
    if (!candidateSet.has(destId)) {
      // Non-finalist: assign 0 (their centroid scored too low to matter)
      destScores[destId]         = 0
      destCategoryScores[destId] = {}
      topLabels[destId]          = ""
      continue
    }

    const categories = DEST_CATEGORY_CONCEPTS[destId]
    let totalWeightedScore = 0
    const catScores: Record<string, CategoryScore> = {}
    let bestPhrase = ""
    let bestScore  = 0

    for (const [category, phrases] of Object.entries(categories)) {
      if (phrases.length === 0) continue
      const weight = CATEGORY_WEIGHTS[category] ?? 1.0
      let sum = 0
      let catTop      = phrases[0]
      let catTopScore = 0

      for (const phrase of phrases) {
        // O(1) Float32Array index lookup — faster than HashMap
        const idx = getPhraseIndex(phrase)
        const s   = idx >= 0 ? phraseScores[idx] : 0
        sum += s
        if (s > catTopScore) { catTopScore = s; catTop = phrase }
      }

      const rawScore = sum / phrases.length
      const weighted = rawScore * weight
      catScores[category] = { category, rawScore, weighted, topPhrase: catTop, topPhraseScore: catTopScore }
      totalWeightedScore += weighted
      if (catTopScore > bestScore) { bestScore = catTopScore; bestPhrase = catTop }
    }

    destScores[destId]         = totalWeightedScore
    destCategoryScores[destId] = catScores
    topLabels[destId]          = bestPhrase
  }
  console.log(`[Timing] Category scoring (${candidateSet.size}/${ALL_DEST_IDS.length} dests): ${Date.now() - tScore}ms`)

  // Global category scores (mean across candidate dests)
  const globalCategoryScores: Record<string, number> = {}
  const catAccum: Record<string, { sum: number; count: number }> = {}

  for (const catMap of Object.values(destCategoryScores)) {
    for (const cs of Object.values(catMap)) {
      if (!catAccum[cs.category]) catAccum[cs.category] = { sum: 0, count: 0 }
      catAccum[cs.category].sum   += cs.rawScore
      catAccum[cs.category].count += 1
    }
  }
  for (const [cat, acc] of Object.entries(catAccum)) {
    globalCategoryScores[cat] = acc.count > 0 ? acc.sum / acc.count : 0
  }

  // Detect activated categories
  const catValues = Object.values(globalCategoryScores)
  const catMean   = catValues.reduce((a, b) => a + b, 0) / Math.max(catValues.length, 1)
  const ACTIVATION_THRESHOLD = catMean * 1.8

  const activatedCategories = Object.entries(globalCategoryScores)
    .filter(([, s]) => s >= ACTIVATION_THRESHOLD)
    .sort(([, a], [, b]) => b - a)
    .map(([cat]) => cat)

  // Contradiction suppression
  const catRankMap: Record<string, number> = {}
  activatedCategories.forEach((cat, i) => { catRankMap[cat] = i })

  for (const contradiction of CATEGORY_CONTRADICTIONS) {
    const dominantRank = catRankMap[contradiction.dominant]
    if (dominantRank === undefined) continue
    if (dominantRank >= 3) continue   // only top-3 categories trigger suppression

    for (const incompatDest of contradiction.incompatible) {
      if (destScores[incompatDest] !== undefined) {
        const before = destScores[incompatDest]
        destScores[incompatDest] *= contradiction.penaltyMultiplier
        console.log(
          `[Semantic] Contradiction: ${contradiction.dominant} → penalise ${incompatDest} ` +
          `${before.toFixed(4)} → ${destScores[incompatDest].toFixed(4)}`
        )
      }
    }
  }

  // Structured logs
  const top10 = top30.slice(0, 10).map(ls => `"${ls.label.substring(0, 45)}"(${ls.score.toFixed(4)})`)
  console.log(`[CLIP] Top-10: ${top10.join(" | ")}`)

  if (activatedCategories.length > 0) {
    const catLog = activatedCategories.slice(0, 6)
      .map(cat => `${cat}=${globalCategoryScores[cat].toFixed(5)}`)
    console.log(`[Semantic] Activated: ${catLog.join(" | ")}`)
  }

  const topDests = Object.entries(destScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id, s]) => `${id}(${s.toFixed(4)},"${topLabels[id]?.substring(0, 30)}")`)
  console.log(`[CountryScores] Pre-reasoning top-5: ${topDests.join(" | ")}`)
  console.log(`[Timing] scoreOneImage total: ${Date.now() - tTotal}ms`)

  return {
    destScores,
    destCategoryScores,
    globalCategoryScores,
    activatedCategories,
    topLabels,
    rawLabelScores: top30,
    imageUrl,
  }
}

// Geographic reasoning
function applyReasoningToImage(pi: PerImageScores): ReasoningResult {
  const reasoning = applyGeographicReasoning(pi.destScores, pi.rawLabelScores, ALL_DEST_IDS)

  for (const destId of ALL_DEST_IDS) {
    pi.destScores[destId] = (pi.destScores[destId] ?? 0) * (reasoning.multipliers[destId] ?? 1.0)
  }

  const topAfter = Object.entries(pi.destScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([id, s]) => `${id}(${s.toFixed(4)})`)
  console.log(`[Reasoning] Post-reasoning top-5: ${topAfter.join(" | ")}`)

  return reasoning
}

// Multi-image aggregation
function aggregateScores(perImage: PerImageScores[]): Record<string, number> {
  const totals: Record<string, number> = {}
  let totalWeight = 0

  for (let i = 0; i < perImage.length; i++) {
    const weight = 1 + i * 0.1   // image 1=1.0×, image 2=1.1×, image 5=1.4×
    totalWeight += weight
    for (const [destId, score] of Object.entries(perImage[i].destScores)) {
      totals[destId] = (totals[destId] ?? 0) + score * weight
    }
  }
  for (const id of Object.keys(totals)) totals[id] /= totalWeight
  return totals
}

// Score normalisation
function normaliseScores(raw: Record<string, number>): Record<string, number> {
  const values = Object.values(raw)
  const max    = Math.max(...values)
  const min    = Math.min(...values)
  const range  = max - min
  const out: Record<string, number> = {}
  for (const [k, v] of Object.entries(raw)) {
    out[k] = range > 0 ? ((v - min) / range) * 100 : 50
  }
  return out
}

// Confidence
function computeConfidence(ranked: { score: number }[]): number {
  const top    = ranked[0]?.score ?? 0
  const second = ranked[1]?.score ?? 0
  const gap    = top - second
  return Math.round(Math.min(96, Math.max(55, top * 0.72 + gap * 0.5)))
}

// Explanation bullets
function buildExplanation(
  destId: string,
  perImage: PerImageScores[],
  reasoningResults: ReasoningResult[],
): string[] {
  const dest    = EXPLORE_DESTINATIONS[destId]
  const bullets: string[] = []

  for (const r of reasoningResults) {
    const lmMatch = r.debug.landmarkMatches.find(m => m.toLowerCase().includes(destId))
    if (lmMatch) {
      bullets.push(`Landmark detected: ${lmMatch.split(" (phrase:")[0]}`)
      break
    }
  }

  const bestCatEntries: Array<{ category: string; score: number; phrase: string }> = []
  for (const pi of perImage) {
    const catMap = pi.destCategoryScores[destId]
    if (!catMap) continue
    for (const cs of Object.values(catMap)) {
      if (cs.weighted > 0) bestCatEntries.push({ category: cs.category, score: cs.weighted, phrase: cs.topPhrase })
    }
  }
  bestCatEntries.sort((a, b) => b.score - a.score)

  const topEntry = bestCatEntries[0]
  if (topEntry && bullets.length === 0) {
    bullets.push(`Strong visual match: ${topEntry.category.replace(/_/g, " ")} — "${topEntry.phrase}"`)
  } else if (topEntry) {
    bullets.push(`Also matched: ${topEntry.category.replace(/_/g, " ")}`)
  }

  const secondEntry = bestCatEntries.find(e => e.category !== topEntry?.category)
  if (secondEntry && bullets.length < 3) {
    bullets.push(`Visual signal: ${secondEntry.category.replace(/_/g, " ")}`)
  }

  if (dest) {
    if (dest.scores.nature > 88)   bullets.push(`${dest.name} offers world-class natural scenery`)
    if (dest.scores.cultural > 90) bullets.push(`Rich cultural heritage matches your selections`)
    if (dest.scores.beach > 88)    bullets.push(`Exceptional beaches align with your visual choices`)
    if (dest.environmentTypes.some(e => ["savanna", "wildlife"].includes(e)))
      bullets.push(`Wildlife and safari experiences match your images`)
    if (dest.environmentTypes.some(e => ["aurora", "northern-lights"].includes(e)))
      bullets.push(`Northern Lights and Arctic scenery fit your visual mood`)
  }

  return bullets.slice(0, 4)
}

// Vibes extraction
function extractVibes(perImage: PerImageScores[], topDestId: string): string[] {
  const catCount: Record<string, number> = {}
  for (const pi of perImage) {
    for (const cat of pi.activatedCategories) catCount[cat] = (catCount[cat] ?? 0) + 1
  }

  const CATEGORY_TO_VIBE: Record<string, string> = {
    winter_arctic:        "aurora / arctic adventure",
    wildlife_fauna:       "wildlife safari",
    seasonal_spectacle:   "seasonal natural spectacle",
    coastal_marine:       "tropical beach & ocean",
    tropical_lush:        "tropical jungle & rainforest",
    ancient_ruins:        "ancient civilisations",
    volcanic_geothermal:  "volcanic & geothermal",
    desert_arid:          "desert adventure",
    luxury_premium:       "luxury travel",
    nightlife_urban:      "city nightlife",
    landmarks:            "iconic landmarks",
    spiritual_religious:  "cultural & spiritual",
    adventure_extreme:    "adventure & extreme sports",
    urban_environment:    "modern city life",
    natural_landscapes:   "dramatic natural landscapes",
    water_features:       "waterfalls & glacial lakes",
    cultural_traditional: "vibrant local culture",
  }

  const vibes = Object.entries(catCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([cat]) => CATEGORY_TO_VIBE[cat] ?? cat.replace(/_/g, " "))

  if (vibes.length === 0) {
    const dest = EXPLORE_DESTINATIONS[topDestId]
    return dest?.travelStyles.slice(0, 3) ?? ["adventure", "cultural", "nature"]
  }
  return vibes
}

// Confidence log
function logConfidenceDebug(ranked: RankedDestination[], confidence: number): void {
  console.log(`\n[Confidence]`)
  console.log(`  Final confidence: ${confidence}%`)
  console.log(`  Top-3 scores: ${ranked.slice(0, 3).map(r => `${r.id}(${r.score.toFixed(1)})`).join(" > ")}`)
  const gap = (ranked[0]?.score ?? 0) - (ranked[1]?.score ?? 0)
  console.log(`  Score gap #1–#2: ${gap.toFixed(1)} pts`)
}

// Main export
export interface CLIPRankingResult {
  ranked:       RankedDestination[]
  confidence:   number
  vibes:        string[]
  travelStyle:  string
  imageCount:   number
  processingMs: number
}

export async function rankDestinationsByCLIP(
  imageUrls: string[],
  squad?: "solo" | "couple" | "friends" | "family"
): Promise<CLIPRankingResult> {
  const t0   = Date.now()
  const urls = imageUrls.slice(0, 5).filter(Boolean)
  if (urls.length === 0) throw new Error("No image URLs provided")

  if (!isEmbeddingsReady()) {
    console.warn("[CLIP-scorer] Embeddings not yet ready — triggering precomputation inline…")
    await prewarmTextEmbeddings()
  }

  // Score all images in parallel (vision encoder calls are independent)
  const tEmbed = Date.now()
  const perImageResults = await Promise.all(urls.map(scoreOneImage))
  console.log(`[Timing] All images (parallel): ${Date.now() - tEmbed}ms`)

  // Geographic reasoning
  const tReason = Date.now()
  const reasoningResults: ReasoningResult[] = perImageResults.map(pi => applyReasoningToImage(pi))
  logReasoningDebug(reasoningResults, urls.length)
  console.log(`[Timing] Geographic reasoning total: ${Date.now() - tReason}ms`)

  // Aggregate
  const tAgg = Date.now()
  const aggregated = aggregateScores(perImageResults)
  console.log(`[Timing] Aggregation: ${Date.now() - tAgg}ms`)

  const topAgg = Object.entries(aggregated)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([id, s]) => `${id}=${s.toFixed(5)}`)
  console.log(`[CLIP-scorer] Aggregated top-8: ${topAgg.join(" | ")}`)

  // Normalise
  const normalised = normaliseScores(aggregated)

  // Squad bonus
  if (squad && SQUAD_BONUS[squad]) {
    for (const destId of Object.keys(normalised)) {
      normalised[destId] += SQUAD_BONUS[squad][destId] ?? 0
    }
  }

  // Build final ranking
  const sortedIds = Object.entries(normalised)
    .sort(([, a], [, b]) => b - a)
    .map(([id]) => id)

  const ranked: RankedDestination[] = sortedIds.map(destId => {
    const dest  = EXPLORE_DESTINATIONS[destId]
    const score = normalised[destId]
    if (!dest) return null as unknown as RankedDestination

    const explanation = buildExplanation(destId, perImageResults, reasoningResults)
    return {
      id:        dest.id,
      name:      dest.name,
      flag:      dest.flag,
      heroImage: dest.heroImage,
      score,
      cities:    dest.cities,
      explanation,
      scoreBreakdown: {
        environment:  Math.round(score * 0.30),
        activities:   Math.round(score * 0.20),
        climate:      Math.round(score * 0.15),
        travelStyle:  Math.round(score * 0.10),
        mood:         Math.round(score * 0.10),
        terrain:      Math.round(score * 0.05),
        cityStyle:    Math.round(score * 0.03),
        architecture: Math.round(score * 0.03),
        food:         Math.round(score * 0.02),
        landmark: 0, region: 0, cultural: 0, emotional: 0, numeric: 0, penalty: 0,
      },
    }
  }).filter(Boolean)

  const confidence  = computeConfidence(ranked)
  const topDest     = ranked[0]
  const vibes       = extractVibes(perImageResults, topDest?.id ?? "")
  const travelStyle = EXPLORE_DESTINATIONS[topDest?.id ?? ""]?.travelStyles[0] ?? "adventure"

  logConfidenceDebug(ranked, confidence)

  const processingMs = Date.now() - t0
  console.log(`[Timing] Total analysis: ${processingMs}ms`)
  console.log(
    `[Pipeline] Source=CLIP_EMBED | images=${urls.length} | ${processingMs}ms | conf=${confidence}% | ` +
    `top3: ${ranked.slice(0, 3).map((r, i) => `#${i + 1} ${r.name}(${r.score.toFixed(1)})`).join(" | ")}`
  )

  return { ranked, confidence, vibes, travelStyle, imageCount: urls.length, processingMs }
}
