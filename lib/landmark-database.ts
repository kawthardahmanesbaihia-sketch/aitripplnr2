/**
 * Landmark & Cultural Signal Database
 *
 * Maps recognized landmarks, architecture styles, geographic regions, and
 * culture signals to destination boost scores. Used by the explore-analyze
 * route to correct for Gemini's tendency to confuse culturally specific images
 * with unrelated destinations.
 *
 * Boost values (0–15):
 *   15 = definitive match (exact landmark name)
 *   10-14 = strong match (city, country name, iconic landmark)
 *   6-9  = moderate match (architecture style, regional culture)
 *   3-5  = weak match (continent, climate zone, general style)
 */

export interface CulturalMatch {
  destinations: string[]  // destination IDs to boost (from DESTINATION_PROFILES)
  boost: number           // raw boost amount before confidence weighting
  region: string          // human-readable label for logging
}

// Normalization helper
export function normalizeSignal(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

// Primary signal database
const SIGNAL_DB: Record<string, CulturalMatch> = {

  // Algeria (maps to Morocco — closest available destination)
  "maqam echahid":              { destinations: ["morocco"], boost: 15, region: "Algeria" },
  "monument of the martyrs":    { destinations: ["morocco"], boost: 14, region: "Algeria" },
  "algiers":                    { destinations: ["morocco"], boost: 13, region: "Algeria" },
  "alger":                      { destinations: ["morocco"], boost: 13, region: "Algeria" },
  "algeria":                    { destinations: ["morocco"], boost: 13, region: "Algeria" },
  "algerian":                   { destinations: ["morocco"], boost: 11, region: "Algeria" },
  "oran":                       { destinations: ["morocco"], boost: 12, region: "Algeria" },
  "constantine":                { destinations: ["morocco"], boost: 12, region: "Algeria" },
  "kasbah of algiers":          { destinations: ["morocco"], boost: 13, region: "Algeria" },
  "notre dame d afrique":       { destinations: ["morocco"], boost: 12, region: "Algeria" },
  "basilica of notre dame":     { destinations: ["morocco"], boost: 6,  region: "Algeria / France" },

  // Maghreb / North Africa
  "north africa":               { destinations: ["morocco"], boost: 9,  region: "North Africa" },
  "north african":              { destinations: ["morocco"], boost: 8,  region: "North Africa" },
  "maghreb":                    { destinations: ["morocco"], boost: 10, region: "Maghreb" },
  "berber":                     { destinations: ["morocco"], boost: 8,  region: "Berber Culture" },
  "amazigh":                    { destinations: ["morocco"], boost: 9,  region: "Amazigh Culture" },
  "sahara":                     { destinations: ["morocco"], boost: 8,  region: "Sahara" },
  "saharan":                    { destinations: ["morocco"], boost: 7,  region: "Sahara" },

  // Tunisia (maps to Morocco)
  "tunisia":                    { destinations: ["morocco"], boost: 10, region: "Tunisia" },
  "tunisian":                   { destinations: ["morocco"], boost: 8,  region: "Tunisia" },
  "carthage":                   { destinations: ["morocco"], boost: 9,  region: "Tunisia" },
  "tunis":                      { destinations: ["morocco"], boost: 10, region: "Tunisia" },
  "sidi bou said":              { destinations: ["morocco"], boost: 11, region: "Tunisia" },

  // Libya (maps to Morocco)
  "libya":                      { destinations: ["morocco"], boost: 9,  region: "Libya → North Africa" },
  "leptis magna":               { destinations: ["morocco"], boost: 11, region: "Libya → North Africa" },

  // Morocco
  "morocco":                    { destinations: ["morocco"], boost: 15, region: "Morocco" },
  "moroccan":                   { destinations: ["morocco"], boost: 13, region: "Morocco" },
  "marrakech":                  { destinations: ["morocco"], boost: 14, region: "Morocco" },
  "marrakesh":                  { destinations: ["morocco"], boost: 14, region: "Morocco" },
  "fes":                        { destinations: ["morocco"], boost: 13, region: "Morocco" },
  "fez":                        { destinations: ["morocco"], boost: 13, region: "Morocco" },
  "casablanca":                 { destinations: ["morocco"], boost: 13, region: "Morocco" },
  "chefchaouen":                { destinations: ["morocco"], boost: 14, region: "Morocco" },
  "essaouira":                  { destinations: ["morocco"], boost: 12, region: "Morocco" },
  "medina":                     { destinations: ["morocco"], boost: 9,  region: "Moroccan Medina" },
  "kasbah":                     { destinations: ["morocco"], boost: 9,  region: "Moroccan Kasbah" },
  "riad":                       { destinations: ["morocco"], boost: 10, region: "Moroccan Riad" },
  "souk":                       { destinations: ["morocco"], boost: 9,  region: "Moroccan Souk" },
  "djemaa el fna":              { destinations: ["morocco"], boost: 14, region: "Morocco" },
  "jemaa el fnaa":              { destinations: ["morocco"], boost: 14, region: "Morocco" },
  "atlas mountains":            { destinations: ["morocco"], boost: 11, region: "Morocco" },
  "tagine":                     { destinations: ["morocco"], boost: 9,  region: "Moroccan Cuisine" },
  "hammam":                     { destinations: ["morocco"], boost: 8,  region: "Moroccan Culture" },
  "hassan ii mosque":           { destinations: ["morocco"], boost: 14, region: "Morocco" },
  "koutoubia mosque":           { destinations: ["morocco"], boost: 13, region: "Morocco" },

  // Islamic / Arab World
  "islamic architecture":       { destinations: ["morocco"], boost: 8,  region: "Islamic Architecture" },
  "arabic architecture":        { destinations: ["morocco"], boost: 8,  region: "Arabic Architecture" },
  "arab culture":               { destinations: ["morocco"], boost: 7,  region: "Arab Culture" },
  "arabesque":                  { destinations: ["morocco"], boost: 8,  region: "Islamic Art" },
  "minaret":                    { destinations: ["morocco"], boost: 8,  region: "Islamic Architecture" },
  "zellige":                    { destinations: ["morocco"], boost: 9,  region: "Moroccan Tilework" },
  "zellij":                     { destinations: ["morocco"], boost: 9,  region: "Moroccan Tilework" },
  "moorish":                    { destinations: ["morocco"], boost: 9,  region: "Moorish Architecture" },
  "mudejar":                    { destinations: ["morocco"], boost: 7,  region: "Moorish Architecture" },

  // Japan
  "japan":                      { destinations: ["japan"], boost: 15, region: "Japan" },
  "japanese":                   { destinations: ["japan"], boost: 12, region: "Japan" },
  "tokyo":                      { destinations: ["japan"], boost: 14, region: "Japan" },
  "kyoto":                      { destinations: ["japan"], boost: 14, region: "Japan" },
  "osaka":                      { destinations: ["japan"], boost: 13, region: "Japan" },
  "mount fuji":                 { destinations: ["japan"], boost: 15, region: "Japan" },
  "fuji":                       { destinations: ["japan"], boost: 12, region: "Japan" },
  "torii gate":                 { destinations: ["japan"], boost: 14, region: "Japan" },
  "fushimi inari":              { destinations: ["japan"], boost: 14, region: "Japan" },
  "senso-ji":                   { destinations: ["japan"], boost: 14, region: "Japan" },
  "sensoji":                    { destinations: ["japan"], boost: 14, region: "Japan" },
  "shinto shrine":              { destinations: ["japan"], boost: 12, region: "Japan" },
  "cherry blossom":             { destinations: ["japan"], boost: 12, region: "Japan" },
  "sakura":                     { destinations: ["japan"], boost: 12, region: "Japan" },
  "geisha":                     { destinations: ["japan"], boost: 11, region: "Japan" },
  "samurai":                    { destinations: ["japan"], boost: 10, region: "Japan" },
  "ramen":                      { destinations: ["japan"], boost: 9,  region: "Japan" },
  "sushi":                      { destinations: ["japan"], boost: 9,  region: "Japan" },
  "zen garden":                 { destinations: ["japan"], boost: 11, region: "Japan" },
  "pagoda":                     { destinations: ["japan"], boost: 10, region: "Japan" },
  "shibuya":                    { destinations: ["japan"], boost: 13, region: "Japan" },
  "akihabara":                  { destinations: ["japan"], boost: 12, region: "Japan" },
  "japanese architecture":      { destinations: ["japan"], boost: 9,  region: "Japan" },

  // France
  "france":                     { destinations: ["france"], boost: 15, region: "France" },
  "french":                     { destinations: ["france"], boost: 11, region: "France" },
  "paris":                      { destinations: ["france"], boost: 15, region: "France" },
  "eiffel tower":               { destinations: ["france"], boost: 15, region: "France" },
  "louvre":                     { destinations: ["france"], boost: 14, region: "France" },
  "notre dame paris":           { destinations: ["france"], boost: 13, region: "France" },
  "versailles":                 { destinations: ["france"], boost: 13, region: "France" },
  "arc de triomphe":            { destinations: ["france"], boost: 14, region: "France" },
  "champs elysees":             { destinations: ["france"], boost: 13, region: "France" },
  "french riviera":             { destinations: ["france"], boost: 12, region: "France" },
  "nice":                       { destinations: ["france"], boost: 11, region: "France" },
  "provence":                   { destinations: ["france"], boost: 11, region: "France" },
  "bordeaux":                   { destinations: ["france"], boost: 11, region: "France" },
  "lyon":                       { destinations: ["france"], boost: 11, region: "France" },
  "mont saint michel":          { destinations: ["france"], boost: 13, region: "France" },
  "croissant":                  { destinations: ["france"], boost: 8,  region: "French Culture" },
  "baguette":                   { destinations: ["france"], boost: 7,  region: "French Culture" },
  "haussmann":                  { destinations: ["france"], boost: 10, region: "French Architecture" },

  // Italy
  "italy":                      { destinations: ["italy"], boost: 15, region: "Italy" },
  "italian":                    { destinations: ["italy"], boost: 11, region: "Italy" },
  "rome":                       { destinations: ["italy"], boost: 14, region: "Italy" },
  "colosseum":                  { destinations: ["italy"], boost: 15, region: "Italy" },
  "venice":                     { destinations: ["italy"], boost: 14, region: "Italy" },
  "florence":                   { destinations: ["italy"], boost: 14, region: "Italy" },
  "tuscany":                    { destinations: ["italy"], boost: 12, region: "Italy" },
  "amalfi":                     { destinations: ["italy"], boost: 12, region: "Italy" },
  "trevi fountain":             { destinations: ["italy"], boost: 13, region: "Italy" },
  "pantheon rome":              { destinations: ["italy"], boost: 14, region: "Italy" },
  "pompeii":                    { destinations: ["italy"], boost: 12, region: "Italy" },
  "vatican":                    { destinations: ["italy"], boost: 13, region: "Italy" },
  "gondola":                    { destinations: ["italy"], boost: 12, region: "Italy" },
  "milan":                      { destinations: ["italy"], boost: 11, region: "Italy" },
  "sicily":                     { destinations: ["italy"], boost: 11, region: "Italy" },
  "cinque terre":               { destinations: ["italy"], boost: 13, region: "Italy" },
  "pizza":                      { destinations: ["italy"], boost: 7,  region: "Italian Cuisine" },
  "pasta":                      { destinations: ["italy"], boost: 7,  region: "Italian Cuisine" },
  "gelato":                     { destinations: ["italy"], boost: 7,  region: "Italian Cuisine" },

  // Greece (maps to Italy — closest Mediterranean destination)
  "greece":                     { destinations: ["italy"], boost: 10, region: "Greece → Mediterranean" },
  "greek":                      { destinations: ["italy"], boost: 8,  region: "Greece → Mediterranean" },
  "santorini":                  { destinations: ["italy"], boost: 12, region: "Greece → Mediterranean" },
  "athens":                     { destinations: ["italy"], boost: 10, region: "Greece → Mediterranean" },
  "acropolis":                  { destinations: ["italy"], boost: 12, region: "Greece → Mediterranean" },
  "mykonos":                    { destinations: ["italy"], boost: 11, region: "Greece → Mediterranean" },
  "cycladic":                   { destinations: ["italy"], boost: 10, region: "Greece → Mediterranean" },
  "white blue architecture":    { destinations: ["italy"], boost: 9,  region: "Greece → Mediterranean" },
  "greek ruins":                { destinations: ["italy"], boost: 9,  region: "Greece → Mediterranean" },

  // Spain (maps to France/Morocco)
  "spain":                      { destinations: ["france", "morocco"], boost: 8,  region: "Spain → Mediterranean" },
  "spanish":                    { destinations: ["france", "morocco"], boost: 6,  region: "Spain → Mediterranean" },
  "barcelona":                  { destinations: ["france"], boost: 9,  region: "Spain → France" },
  "sagrada familia":            { destinations: ["france"], boost: 10, region: "Spain → France" },
  "alhambra":                   { destinations: ["morocco"], boost: 11, region: "Spain → Moorish" },
  "seville":                    { destinations: ["morocco"], boost: 9,  region: "Spain → Moorish" },
  "andalusia":                  { destinations: ["morocco"], boost: 9,  region: "Spain → Moorish" },

  // Thailand
  "thailand":                   { destinations: ["thailand"], boost: 15, region: "Thailand" },
  "thai":                       { destinations: ["thailand"], boost: 12, region: "Thailand" },
  "bangkok":                    { destinations: ["thailand"], boost: 14, region: "Thailand" },
  "chiang mai":                 { destinations: ["thailand"], boost: 13, region: "Thailand" },
  "phuket":                     { destinations: ["thailand"], boost: 13, region: "Thailand" },
  "wat pho":                    { destinations: ["thailand"], boost: 14, region: "Thailand" },
  "wat arun":                   { destinations: ["thailand"], boost: 14, region: "Thailand" },
  "grand palace bangkok":       { destinations: ["thailand"], boost: 14, region: "Thailand" },
  "floating market":            { destinations: ["thailand"], boost: 12, region: "Thailand" },
  "tuk tuk":                    { destinations: ["thailand"], boost: 11, region: "Thailand" },
  "thai temple":                { destinations: ["thailand"], boost: 12, region: "Thailand" },
  "thai food":                  { destinations: ["thailand"], boost: 10, region: "Thailand" },
  "pad thai":                   { destinations: ["thailand"], boost: 10, region: "Thailand" },
  "southeast asia":             { destinations: ["thailand", "bali"], boost: 5, region: "Southeast Asia" },
  "southeast asian":            { destinations: ["thailand", "bali"], boost: 5, region: "Southeast Asia" },

  // Bali / Indonesia
  "bali":                       { destinations: ["bali"], boost: 15, region: "Bali" },
  "balinese":                   { destinations: ["bali"], boost: 13, region: "Bali" },
  "indonesia":                  { destinations: ["bali"], boost: 11, region: "Indonesia" },
  "ubud":                       { destinations: ["bali"], boost: 14, region: "Bali" },
  "rice terrace":               { destinations: ["bali"], boost: 13, region: "Bali" },
  "rice terraces":              { destinations: ["bali"], boost: 13, region: "Bali" },
  "tegallalang":                { destinations: ["bali"], boost: 13, region: "Bali" },
  "tanah lot":                  { destinations: ["bali"], boost: 13, region: "Bali" },
  "uluwatu":                    { destinations: ["bali"], boost: 12, region: "Bali" },
  "kuta":                       { destinations: ["bali"], boost: 11, region: "Bali" },
  "seminyak":                   { destinations: ["bali"], boost: 11, region: "Bali" },
  "canggu":                     { destinations: ["bali"], boost: 11, region: "Bali" },
  "bali temple":                { destinations: ["bali"], boost: 12, region: "Bali" },
  "pura besakih":               { destinations: ["bali"], boost: 13, region: "Bali" },
  "hindu temple bali":          { destinations: ["bali"], boost: 12, region: "Bali" },

  // Generic cultural styles (lower boost)
  "tropical":                   { destinations: ["thailand", "bali"], boost: 3, region: "Tropical" },
  "tropical resort":            { destinations: ["bali", "thailand"], boost: 5, region: "Tropical Resort" },
  "mediterranean":              { destinations: ["france", "italy", "morocco"], boost: 3, region: "Mediterranean" },
  "eastern europe":             { destinations: ["france", "italy"], boost: 4, region: "Eastern Europe" },
  "western europe":             { destinations: ["france", "italy"], boost: 4, region: "Western Europe" },
  "european architecture":      { destinations: ["france", "italy"], boost: 4, region: "European Architecture" },
  "renaissance architecture":   { destinations: ["italy"], boost: 6, region: "Renaissance" },
  "roman architecture":         { destinations: ["italy"], boost: 8, region: "Roman Architecture" },
  "gothic architecture":        { destinations: ["france", "italy"], boost: 4, region: "Gothic" },
  "baroque architecture":       { destinations: ["italy", "france"], boost: 4, region: "Baroque" },
  "colonial":                   { destinations: ["france", "morocco"], boost: 3, region: "Colonial" },
  "desert landscape":           { destinations: ["morocco"], boost: 5, region: "Desert" },
  "alpine":                     { destinations: ["france"], boost: 5, region: "Alpine" },
  "fjord":                      { destinations: ["france"], boost: 3, region: "Scandinavian → France" },
  "buddhist temple":            { destinations: ["thailand", "japan", "bali"], boost: 5, region: "Buddhist" },
  "hindu temple":               { destinations: ["bali"], boost: 7, region: "Hindu Temple" },
}

// Public matching function
export interface CulturalMatchResult {
  boosts: Record<string, number>     // destination ID → total raw boost
  matchedSignals: string[]           // human-readable log of what matched
  detectedRegion: string | null      // top detected region label
  highestBoost: number               // for confidence weighting in the caller
}

/**
 * Match an analysis's geographic/cultural fields against the landmark database.
 * Returns per-destination boost totals and log data.
 */
export function matchCulturalSignals(analysis: {
  possible_locations?: string[]
  landmarks?: string[]
  architecture_style?: string[]
  culture_signals?: string[]
  tags?: string[]
}): CulturalMatchResult {
  const boosts: Record<string, number> = {}
  const matchedSignals: string[] = []
  let topRegion: string | null = null
  let highestBoost = 0

  const allSignals: string[] = [
    ...(analysis.landmarks ?? []),
    ...(analysis.possible_locations ?? []),
    ...(analysis.culture_signals ?? []),
    ...(analysis.architecture_style ?? []),
    ...(analysis.tags ?? []),
  ]

  for (const raw of allSignals) {
    const key = normalizeSignal(raw)
    if (!key) continue

    // 1. Exact key match
    const exact = SIGNAL_DB[key]
    if (exact) {
      applyBoost(boosts, exact, 1.0)
      matchedSignals.push(`"${raw}" → ${exact.region} (+${exact.boost})`)
      if (exact.boost > highestBoost) { highestBoost = exact.boost; topRegion = exact.region }
      continue
    }

    // 2. Substring match: key contains a DB entry or vice versa
    let partialFound = false
    for (const [dbKey, match] of Object.entries(SIGNAL_DB)) {
      if (key.includes(dbKey) || dbKey.includes(key)) {
        const partialBoost = Math.round(match.boost * 0.65)
        if (partialBoost < 2) continue
        applyBoost(boosts, { ...match, boost: partialBoost }, 1.0)
        matchedSignals.push(`"${raw}" ~> ${match.region} (+${partialBoost})`)
        if (partialBoost > highestBoost) { highestBoost = partialBoost; topRegion = match.region }
        partialFound = true
        break
      }
    }

    if (!partialFound) {
      // 3. Word-level overlap — any word in the signal matches any word in a DB key
      const words = key.split(" ").filter(w => w.length > 3)
      for (const word of words) {
        for (const [dbKey, match] of Object.entries(SIGNAL_DB)) {
          if (dbKey.split(" ").includes(word)) {
            const wordBoost = Math.round(match.boost * 0.4)
            if (wordBoost < 2) continue
            applyBoost(boosts, { ...match, boost: wordBoost }, 1.0)
            matchedSignals.push(`"${raw}" word:"${word}" → ${match.region} (+${wordBoost})`)
            if (wordBoost > highestBoost) { highestBoost = wordBoost; topRegion = match.region }
            break
          }
        }
      }
    }
  }

  return { boosts, matchedSignals, detectedRegion: topRegion, highestBoost }
}

function applyBoost(
  boosts: Record<string, number>,
  match: CulturalMatch,
  multiplier: number
): void {
  for (const dest of match.destinations) {
    boosts[dest] = (boosts[dest] ?? 0) + match.boost * multiplier
  }
}
