/**
 * Destination City Guard
 *
 * Redirects known landmarks, national parks, deserts, and geographic regions
 * to their nearest supported tourism hub before downstream API calls.
 *
 * This runs as a safety net in /api/destination — it does NOT change what is
 * displayed to the user (the destination name and highlights remain unchanged),
 * it only redirects the city used for hotel/restaurant/activity searches.
 */

// Maps lowercase landmark/region name → nearest tourism hub city
const LANDMARK_TO_CITY: Record<string, string> = {
  // Jordan
  "wadi rum":                   "Aqaba",
  "petra":                      "Wadi Musa",
  "dead sea":                   "Madaba",

  // Namibia
  "sossusvlei":                 "Swakopmund",
  "etosha":                     "Windhoek",
  "skeleton coast":             "Swakopmund",
  "fish river canyon":          "Springbok",
  "namib desert":               "Swakopmund",

  // United States
  "grand canyon":               "Las Vegas",
  "yellowstone":                "Jackson",
  "national parks":             "Las Vegas",
  "alaska":                     "Anchorage",
  "hawaii":                     "Honolulu",
  "yosemite":                   "Fresno",
  "great smoky mountains":      "Gatlinburg",
  "zion":                       "Springdale",

  // Brazil / Peru
  "amazon basin":               "Manaus",
  "amazon":                     "Manaus",
  "machu picchu":               "Cusco",
  "inca trail":                 "Cusco",
  "lake titicaca":              "Puno",

  // Vietnam
  "ha long bay":                "Ha Long City",
  "halong bay":                 "Ha Long City",

  // Australia
  "great barrier reef":         "Cairns",
  "uluru":                      "Alice Springs",
  "uluru & outback":            "Alice Springs",
  "outback":                    "Alice Springs",
  "whitsundays":                "Airlie Beach",
  "kimberley":                  "Broome",

  // Morocco
  "sahara desert":              "Marrakech",
  "sahara":                     "Merzouga",
  "erg chebbi":                 "Merzouga",

  // South Africa
  "kruger national park":       "Hoedspruit",
  "kruger":                     "Hoedspruit",
  "garden route":               "George",
  "drakensberg":                "Bergville",

  // New Zealand
  "fiordland":                  "Queenstown",
  "milford sound":              "Te Anau",
  "fiordland / milford sound":  "Queenstown",
  "abel tasman":                "Nelson",
  "franz josef":                "Franz Josef",

  // Tanzania
  "serengeti":                  "Arusha",
  "ngorongoro":                 "Arusha",
  "kilimanjaro":                "Moshi",
  "selous":                     "Dar es Salaam",

  // Kenya
  "maasai mara":                "Nairobi",
  "masai mara":                 "Nairobi",
  "amboseli":                   "Nairobi",

  // Indonesia
  "raja ampat":                 "Sorong",
  "komodo":                     "Labuan Bajo",

  // India
  "rajasthan":                  "Jaipur",
  "kerala":                     "Kochi",
  "goa":                        "Panaji",

  // Norway
  "lofoten":                    "Svolvær",
  "fjords":                     "Bergen",

  // Algeria
  "tassili n'ajjer":            "Djanet",
  "m'zab valley":               "Ghardaia",
  "timgad":                     "Batna",

  // Italy
  "dolomites":                  "Bolzano",
  "amalfi coast":               "Amalfi",
  "cinque terre":               "La Spezia",

  // Japan
  "hokkaido":                   "Sapporo",

  // South America
  "patagonia":                  "Punta Arenas",
  "torres del paine":           "Puerto Natales",
  "atacama desert":             "San Pedro de Atacama",
  "iguazu falls":               "Puerto Iguazú",

  // Caribbean / Pacific
  "amazon manaus":              "Manaus",
}

/**
 * Returns the nearest tourism hub city for the given input.
 * If the input is a real city (not a landmark), returns it unchanged.
 * Returns undefined if input is falsy.
 */
export function sanitizeCityForSearch(
  city: string | undefined,
  countryName: string
): string | undefined {
  if (!city) return undefined

  const key = city.toLowerCase().trim()
  const redirect = LANDMARK_TO_CITY[key]

  if (redirect) {
    console.log(
      `[city-guard] Landmark redirect: "${city}" (${countryName}) → "${redirect}"`
    )
    return redirect
  }

  return city
}
