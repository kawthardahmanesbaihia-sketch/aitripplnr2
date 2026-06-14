/**
 * Season Compatibility Engine
 *
 * Scores how well a destination's travel season matches the user's travel dates.
 * Used as one of three factors in the final recommendation score.
 *
 * score = visualMatch × 0.4 + budgetMatch × 0.3 + seasonMatch × 0.3
 *
 * This module is pure code — no AI involved.
 */

interface DestinationSeason {
  /** Months with ideal weather (1 = Jan … 12 = Dec) */
  bestMonths: number[]
  /** Acceptable but not perfect months */
  shoulderMonths: number[]
  /** Months to avoid (monsoon, extreme heat, off-season) */
  avoidMonths: number[]
  /** Special highlights tied to specific months */
  highlights: Partial<Record<number, string>>
}

// Season database
// 24 countries, all used in destination-matcher.ts

const DESTINATION_SEASONS: Record<string, DestinationSeason> = {
  // United States — varies by region; spring/fall are safest across the board
  US: {
    bestMonths:     [4, 5, 9, 10],
    shoulderMonths: [3, 6, 11],
    avoidMonths:    [7, 8], // extreme summer heat in south/midwest
    highlights: {
      3: "Cherry blossoms in Washington D.C.",
      10: "Fall foliage across New England",
      12: "Festive holiday season in New York",
    },
  },
  // Japan — spring sakura & autumn foliage are iconic
  JP: {
    bestMonths:     [3, 4, 10, 11],
    shoulderMonths: [5, 9],
    avoidMonths:    [6, 7, 8], // rainy season + typhoons
    highlights: {
      3:  "Cherry blossom (sakura) season — mid-March to early April",
      4:  "Peak sakura bloom across Tokyo, Kyoto, Osaka",
      10: "Autumn koyo (leaf turning) begins",
      11: "Peak autumn foliage — temples glow red & gold",
      12: "Winter illuminations and onsen season",
    },
  },
  // Thailand — cool & dry season is Nov–Feb; avoid monsoon
  TH: {
    bestMonths:     [11, 12, 1, 2, 3],
    shoulderMonths: [4, 10],
    avoidMonths:    [5, 6, 7, 8, 9], // heavy monsoon
    highlights: {
      11: "Loi Krathong festival of lights",
      4:  "Songkran water festival (Thai New Year)",
      1:  "Perfect beach weather — Phuket & Koh Samui",
    },
  },
  // France — spring & early autumn ideal; avoid August crowds
  FR: {
    bestMonths:     [4, 5, 6, 9, 10],
    shoulderMonths: [3, 11],
    avoidMonths:    [7, 8], // Paris empties but tourists flood in
    highlights: {
      5:  "Cannes Film Festival",
      6:  "Lavender fields bloom in Provence",
      9:  "Wine harvest season in Bordeaux & Burgundy",
      12: "Christmas markets in Alsace",
    },
  },
  // Australia — seasons inverted; their spring/autumn = Sept–Nov & March–May
  AU: {
    bestMonths:     [9, 10, 11, 3, 4, 5],
    shoulderMonths: [6, 8],
    avoidMonths:    [12, 1, 2], // extreme summer heat + bush fire risk
    highlights: {
      9:  "Wildflower season in Western Australia",
      10: "Great Barrier Reef visibility peaks",
      6:  "Whale watching season begins",
    },
  },
  // Spain — spring & autumn ideal; summer is very hot inland
  ES: {
    bestMonths:     [4, 5, 9, 10],
    shoulderMonths: [3, 6, 11],
    avoidMonths:    [7, 8], // scorching heat, packed beaches
    highlights: {
      4:  "Semana Santa (Holy Week) processions",
      7:  "San Fermín Running of the Bulls — Pamplona",
      9:  "La Tomatina tomato festival",
      3:  "Fallas festival in Valencia",
    },
  },
  // Italy — spring & autumn; avoid August crowds and winter rains
  IT: {
    bestMonths:     [4, 5, 9, 10],
    shoulderMonths: [3, 6, 11],
    avoidMonths:    [7, 8, 12, 1, 2],
    highlights: {
      4:  "Easter celebrations in Rome",
      5:  "Wildflower bloom in Tuscany",
      9:  "Venice Film Festival",
      10: "Truffle season in Umbria & Piedmont",
    },
  },
  // Brazil — diverse; avoid heavy rains in Amazon; Rio is best Jun–Sep
  BR: {
    bestMonths:     [6, 7, 8, 9],
    shoulderMonths: [5, 10],
    avoidMonths:    [11, 12, 1, 2, 3], // rainy & humid
    highlights: {
      2:  "Rio Carnival (February/March) — world's biggest party",
      6:  "Festa Junina — traditional June festivals",
      7:  "Dry season — ideal for Amazon & Pantanal",
    },
  },
  // Mexico — dry season Nov–Apr; avoid hurricane season on coasts
  MX: {
    bestMonths:     [11, 12, 1, 2, 3, 4],
    shoulderMonths: [5, 10],
    avoidMonths:    [6, 7, 8, 9], // hurricane season on both coasts
    highlights: {
      11: "Día de los Muertos (Day of the Dead) — early November",
      12: "Christmas & New Year festivities",
      3:  "Whale shark season in Holbox",
      4:  "Semana Santa beach season",
    },
  },
  // India — highly seasonal; Nov–Feb is universally safe
  IN: {
    bestMonths:     [10, 11, 12, 1, 2, 3],
    shoulderMonths: [4, 9],
    avoidMonths:    [5, 6, 7, 8], // monsoon + extreme heat
    highlights: {
      10: "Diwali (festival of lights) — October/November",
      3:  "Holi festival of colours",
      1:  "Jaipur Literature Festival",
      12: "Ideal weather across Rajasthan & Kerala",
    },
  },
  // Greece — May/Jun & Sep/Oct are perfect; summer is peak & expensive
  GR: {
    bestMonths:     [5, 6, 9, 10],
    shoulderMonths: [4, 11],
    avoidMonths:    [7, 8], // extreme heat 35°C+, overcrowded Santorini
    highlights: {
      5:  "Wildflowers on Crete, fewer crowds",
      9:  "Best sea temperature, harvest festivals",
      6:  "Long sunny days — ideal island hopping",
      10: "Autumn light on Santorini & Mykonos",
    },
  },
  // Turkey — spring & autumn ideal; avoid midsummer heat in Istanbul
  TR: {
    bestMonths:     [4, 5, 9, 10],
    shoulderMonths: [3, 6, 11],
    avoidMonths:    [7, 8],
    highlights: {
      4:  "Tulip Festival in Istanbul",
      5:  "Cappadocia balloon season in full swing",
      9:  "Harvest season in Turkish wine country",
      12: "Christmas markets + fewer tourists",
    },
  },
  // Indonesia / Bali — dry season May–Sep; avoid monsoon
  ID: {
    bestMonths:     [5, 6, 7, 8, 9],
    shoulderMonths: [4, 10],
    avoidMonths:    [11, 12, 1, 2, 3], // heavy monsoon in Bali
    highlights: {
      6:  "Bali Arts Festival",
      8:  "Best surf conditions on Kuta & Seminyak",
      9:  "Clear skies for volcano trekking — Mount Rinjani",
      3:  "Nyepi (Balinese Day of Silence) — unique experience",
    },
  },
  // Morocco — spring & autumn; avoid desert midsummer heat
  MA: {
    bestMonths:     [3, 4, 10, 11],
    shoulderMonths: [2, 5, 9, 12],
    avoidMonths:    [6, 7, 8], // 40°C+ in desert
    highlights: {
      3:  "Almond blossom in the Atlas Mountains",
      4:  "Marrakech desert roses season",
      10: "Perfect Sahara trekking weather",
      12: "Festive atmosphere in the medinas",
    },
  },
  // UAE / Dubai — winter months only; avoid brutal summer
  AE: {
    bestMonths:     [11, 12, 1, 2, 3],
    shoulderMonths: [4, 10],
    avoidMonths:    [5, 6, 7, 8, 9], // 45°C+ outdoors
    highlights: {
      12: "Dubai Shopping Festival",
      2:  "Dubai Food Festival",
      11: "Comfortable desert safaris & beach weather",
      3:  "Last ideal month before heat arrives",
    },
  },
  // Switzerland — summer hiking & winter skiing; both have strong seasons
  CH: {
    bestMonths:     [6, 7, 8, 12, 1, 2],
    shoulderMonths: [5, 9, 11],
    avoidMonths:    [3, 4, 10], // mud season — neither snow nor summer
    highlights: {
      7:  "Montreux Jazz Festival",
      8:  "Swiss National Day — fireworks over lakes",
      12: "Christmas markets in Zurich & Basel",
      1:  "Davos & Verbier powder skiing at peak",
      6:  "Wildflower Alpine meadows",
    },
  },
  // Portugal — spring & autumn ideal; summer is hot but manageable
  PT: {
    bestMonths:     [4, 5, 9, 10],
    shoulderMonths: [3, 6, 11],
    avoidMonths:    [7, 8], // Algarve overcrowded, Lisbon hot
    highlights: {
      5:  "Festival of Santo António in Lisbon",
      9:  "Harvest season in Douro Valley",
      6:  "Longest days — perfect for Algarve beaches",
      12: "Warm winters compared to rest of Europe",
    },
  },
  // Vietnam — complex; north/south differ; Oct–Apr is broadly good
  VN: {
    bestMonths:     [10, 11, 12, 1, 2, 3],
    shoulderMonths: [4, 9],
    avoidMonths:    [5, 6, 7, 8], // monsoon & typhoons
    highlights: {
      1:  "Tết (Lunar New Year) — February; cities quiet but temples lively",
      3:  "Cherry blossoms in Da Lat",
      9:  "Hội An lantern festival at end of month",
      11: "Best weather in both north and south simultaneously",
    },
  },
  // Peru — dry season May–Oct is best for Machu Picchu trek
  PE: {
    bestMonths:     [5, 6, 7, 8, 9],
    shoulderMonths: [4, 10],
    avoidMonths:    [11, 12, 1, 2, 3], // rainy — Inca Trail often closes
    highlights: {
      6:  "Inti Raymi (Sun Festival) in Cusco",
      7:  "Clearest skies for Machu Picchu photography",
      8:  "Dry season peak — best trekking conditions",
      5:  "Wildflowers along the Inca Trail",
    },
  },
  // Croatia — May/Jun & Sept are ideal; July/August packed and expensive
  HR: {
    bestMonths:     [5, 6, 9],
    shoulderMonths: [4, 10],
    avoidMonths:    [7, 8], // Dubrovnik at 50% capacity cap exceeded
    highlights: {
      5:  "Plitvice Lakes waterfalls at peak flow",
      6:  "Game of Thrones filming locations — beat the crowds",
      9:  "Sea still warm, tourists gone, prices drop",
    },
  },
  // New Zealand — seasons inverted; Dec–Feb = NZ summer
  NZ: {
    bestMonths:     [12, 1, 2, 3],
    shoulderMonths: [10, 11, 4],
    avoidMonths:    [6, 7, 8], // winter — cold south island
    highlights: {
      12: "Hobbiton in summer — Lord of the Rings trail",
      1:  "Best Queenstown adventure activities",
      2:  "Marlborough wine harvest",
      6:  "Skiing season begins — Queenstown resort",
    },
  },
  // Singapore — year-round but avoid hottest months; festivals vary
  SG: {
    bestMonths:     [2, 3, 7, 8],
    shoulderMonths: [1, 4, 5, 6, 9, 10, 11, 12],
    avoidMonths:    [], // no truly bad month — just wetter periods
    highlights: {
      2:  "Chinese New Year celebrations — lanterns & firecrackers",
      7:  "Singapore Food Festival",
      8:  "Singapore National Day (9 Aug) — airshow + fireworks",
      12: "Christmas on Orchard Road",
    },
  },
  // South Africa — Oct–Apr is summer; safari best May–Oct (dry season)
  ZA: {
    bestMonths:     [5, 6, 7, 8, 9, 10],
    shoulderMonths: [4, 11],
    avoidMonths:    [12, 1, 2, 3], // summer rains obscure safari views
    highlights: {
      6:  "Whale watching in Hermanus begins",
      8:  "Best game viewing — animals gather at waterholes",
      9:  "Whale festival in Hermanus + spring flowers",
      10: "Cape Winelands harvest & wildflower season",
    },
  },
  // Kenya — two dry seasons; avoid long rains April–June
  KE: {
    bestMonths:     [1, 2, 7, 8, 9, 10],
    shoulderMonths: [11, 12, 3],
    avoidMonths:    [4, 5, 6], // long rains — poor safari visibility
    highlights: {
      7:  "Great Wildebeest Migration peaks — Masai Mara",
      8:  "Peak river crossing season — best ever safari moments",
      2:  "Dry season — easy game viewing",
      12: "Short rains end — landscapes turn lush green",
    },
  },
}

// Scoring function
/**
 * Score season compatibility between a destination and user's travel dates.
 * Returns 0–100.
 */
export function scoreSeasonCompatibility(
  countryCode: string,
  travelDates?: { start: string; end: string }
): number {
  if (!travelDates?.start) return 65 // neutral when no dates provided

  const season = DESTINATION_SEASONS[countryCode]
  if (!season) return 65

  const startDate = new Date(travelDates.start)
  const endDate   = travelDates.end ? new Date(travelDates.end) : startDate

  // Collect all months covered by the travel window
  const months = new Set<number>()
  const cursor = new Date(startDate)
  while (cursor <= endDate) {
    months.add(cursor.getMonth() + 1) // 1-based
    cursor.setDate(cursor.getDate() + 14) // sample every 2 weeks
  }
  months.add(endDate.getMonth() + 1)

  if (months.size === 0) return 65

  // Score each travel month individually
  let totalScore = 0
  for (const month of months) {
    if (season.bestMonths.includes(month))     totalScore += 100
    else if (season.shoulderMonths.includes(month)) totalScore += 72
    else if (season.avoidMonths.includes(month))    totalScore += 25
    else                                            totalScore += 55 // unclassified
  }

  return Math.round(totalScore / months.size)
}

/**
 * Return the most relevant season highlight for a destination during a given month.
 * Returns null if none exists.
 */
export function getSeasonHighlight(
  countryCode: string,
  month: number
): string | null {
  return DESTINATION_SEASONS[countryCode]?.highlights[month] ?? null
}

/**
 * Human-readable label for when to visit.
 */
export function getBestTimeToVisit(countryCode: string): string {
  const season = DESTINATION_SEASONS[countryCode]
  if (!season) return "Year-round"

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ]

  const best = season.bestMonths.map((m) => monthNames[m - 1])
  if (best.length === 0) return "Year-round"

  // Compress consecutive months: [4,5,6] → "Apr–Jun"
  const ranges: string[] = []
  let start = season.bestMonths[0]
  let prev  = season.bestMonths[0]
  for (let i = 1; i <= season.bestMonths.length; i++) {
    const cur = season.bestMonths[i]
    if (cur !== prev + 1) {
      ranges.push(start === prev ? monthNames[start - 1] : `${monthNames[start - 1]}–${monthNames[prev - 1]}`)
      start = cur
    }
    prev = cur
  }
  return ranges.join(", ")
}
