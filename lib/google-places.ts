/**
 * Google Places client — server-side only.
 *
 * All hotel, activity, and transit queries now use Places API (New).
 * Restaurants continue to use Places API (New) — unchanged from before.
 * Legacy Places Text Search is kept as a last-resort fallback for activities only.
 */

// ── Endpoints ─────────────────────────────────────────────────────────────────

const LEGACY_TEXT_SEARCH  = "https://maps.googleapis.com/maps/api/place/textsearch/json"
const LEGACY_PHOTO_BASE   = "https://maps.googleapis.com/maps/api/place/photo"
const GEOCODING_API       = "https://maps.googleapis.com/maps/api/geocode/json"
const NEW_SEARCH_ENDPOINT = "https://places.googleapis.com/v1/places:searchText"
const NEW_PHOTO_BASE      = "https://places.googleapis.com/v1"

// ── Startup diagnostic (runs once on first module import) ─────────────────────

let _startupDiagnosticPrinted = false
function printStartupDiagnostic() {
  if (_startupDiagnosticPrinted) return
  _startupDiagnosticPrinted = true

  const placesKey  = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const mapsKey    = process.env.GOOGLE_MAPS_API_KEY
  const geocodeKey = process.env.GOOGLE_GEOCODING_API_KEY

  const fmt = (k: string | undefined) =>
    k ? `${k.slice(0, 12)}… (len=${k.length})` : "(not set)"

  console.log(
    "\n╔══════════════════════════════════════════════════════════╗\n" +
    "║           [google-places] STARTUP DIAGNOSTIC             ║\n" +
    "╚══════════════════════════════════════════════════════════╝\n" +
    `  GOOGLE_PLACES_API_KEY   (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) : ${fmt(placesKey)}\n` +
    `  GOOGLE_MAPS_API_KEY                                        : ${fmt(mapsKey)}\n` +
    `  GOOGLE_GEOCODING_API_KEY                                   : ${fmt(geocodeKey)}\n` +
    "\n" +
    `  Places API (New) endpoint : ${NEW_SEARCH_ENDPOINT}\n` +
    `  Geocoding API endpoint    : ${GEOCODING_API}\n` +
    "\n" +
    `  Places key === Maps key   : ${placesKey === mapsKey}\n` +
    `  Geocoding key defined     : ${!!geocodeKey}\n` +
    `  Places key === Geocode key: ${!!geocodeKey && placesKey === geocodeKey}\n`
  )
}

printStartupDiagnostic()

// ── Field masks ───────────────────────────────────────────────────────────────

const RESTAURANT_FIELD_MASK = [
  "places.displayName",
  "places.rating",
  "places.userRatingCount",
  "places.priceLevel",
  "places.formattedAddress",
  "places.location",
  "places.photos",
  "places.editorialSummary",
  "places.types",
  "places.businessStatus",
  "places.currentOpeningHours",
  "places.googleMapsUri",
].join(",")

const HOTEL_FIELD_MASK = [
  "places.displayName",
  "places.rating",
  "places.userRatingCount",
  "places.priceLevel",
  "places.formattedAddress",
  "places.location",
  "places.photos",
  "places.editorialSummary",
  "places.websiteUri",
  "places.nationalPhoneNumber",
  "places.googleMapsUri",
  "places.businessStatus",
].join(",")

const ACTIVITY_FIELD_MASK = [
  "places.displayName",
  "places.rating",
  "places.userRatingCount",
  "places.formattedAddress",
  "places.location",
  "places.photos",
  "places.editorialSummary",
  "places.types",
  "places.googleMapsUri",
  "places.businessStatus",
].join(",")

const TRANSIT_FIELD_MASK = [
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.types",
  "places.googleMapsUri",
  "places.regularOpeningHours",
].join(",")

// ── Budget → price levels ─────────────────────────────────────────────────────

const BUDGET_PRICE_LEVELS: Record<string, string[]> = {
  standard: ["PRICE_LEVEL_INEXPENSIVE", "PRICE_LEVEL_MODERATE"],
  premium:  ["PRICE_LEVEL_MODERATE",    "PRICE_LEVEL_EXPENSIVE"],
  luxury:   ["PRICE_LEVEL_EXPENSIVE",   "PRICE_LEVEL_VERY_EXPENSIVE"],
}

const BUDGET_QUERY_QUALIFIER: Record<string, string> = {
  standard: "popular affordable local",
  premium:  "highly rated upscale",
  luxury:   "fine dining Michelin star luxury",
}

const HOTEL_BUDGET_QUALIFIER: Record<string, string> = {
  standard: "budget hostel guesthouse affordable",
  premium:  "hotel mid-range",
  luxury:   "5-star luxury hotel resort",
}

// ── Price-level normalisation ─────────────────────────────────────────────────

function newPriceToTier(level: string | undefined): "budget" | "mid-range" | "luxury" {
  switch (level) {
    case "PRICE_LEVEL_FREE":
    case "PRICE_LEVEL_INEXPENSIVE":     return "budget"
    case "PRICE_LEVEL_MODERATE":        return "mid-range"
    case "PRICE_LEVEL_EXPENSIVE":
    case "PRICE_LEVEL_VERY_EXPENSIVE":  return "luxury"
    default:                             return "mid-range"
  }
}

function newPriceToDisplay(level: string | undefined): string {
  switch (level) {
    case "PRICE_LEVEL_FREE":            return "Free"
    case "PRICE_LEVEL_INEXPENSIVE":     return "$"
    case "PRICE_LEVEL_MODERATE":        return "$$"
    case "PRICE_LEVEL_EXPENSIVE":       return "$$$"
    case "PRICE_LEVEL_VERY_EXPENSIVE":  return "$$$$"
    default:                             return "$$"
  }
}

// ── Photo URL helpers ─────────────────────────────────────────────────────────

function newPhotoUrl(photoName: string, key: string): string {
  return `${NEW_PHOTO_BASE}/${photoName}/media?maxWidthPx=400&key=${encodeURIComponent(key)}`
}

function legacyPhotoUrl(ref: string, key: string): string {
  return `${LEGACY_PHOTO_BASE}?maxwidth=400&photoreference=${encodeURIComponent(ref)}&key=${key}`
}

// ── Raw response types ────────────────────────────────────────────────────────

interface NewPlace {
  name?:                string
  displayName?:         { text: string; languageCode?: string }
  rating?:              number
  userRatingCount?:     number
  priceLevel?:          string
  formattedAddress?:    string
  location?:            { latitude: number; longitude: number }
  photos?:              Array<{ name: string; widthPx?: number; heightPx?: number }>
  editorialSummary?:    { text: string; languageCode?: string }
  types?:               string[]
  businessStatus?:      string
  currentOpeningHours?: { openNow?: boolean }
  regularOpeningHours?: { openNow?: boolean; weekdayDescriptions?: string[] }
  googleMapsUri?:       string
  websiteUri?:          string
  nationalPhoneNumber?: string
}

interface NewSearchResponse {
  places?: NewPlace[]
}

interface RawLegacyPlace {
  name:               string
  rating?:            number
  user_ratings_total?: number
  formatted_address:  string
  geometry:           { location: { lat: number; lng: number } }
  photos?:            Array<{ photo_reference: string }>
  price_level?:       number
  types?:             string[]
}

// ── Normalised output types ───────────────────────────────────────────────────

export interface GooglePlaceHotel {
  name:             string
  rating:           number
  userRatingsTotal?: number
  price:            string
  priceLevel:       "budget" | "mid-range" | "luxury"
  address:          string
  description:      string
  image:            string
  location:         { lat: number; lng: number }
  amenities:        string[]
  phone?:           string
  website?:         string
  mapsUrl?:         string
}

export interface GooglePlaceRestaurant {
  name:             string
  rating:           number
  userRatingsTotal?: number
  cuisine:          string
  price:            string
  priceLevel:       "budget" | "mid-range" | "luxury"
  address:          string
  description:      string
  image:            string
  location:         { lat: number; lng: number }
  openNow?:         boolean
  mapsUrl?:         string
}

export interface GooglePlaceActivity {
  name:             string
  rating:           number
  userRatingsTotal?: number
  address:          string
  description:      string
  image:            string
  location:         { lat: number; lng: number }
  duration:         string
  category:         string
  mapsUrl?:         string
}

export interface GoogleTransitHub {
  name:     string
  type:     string
  address:  string
  location: { lat: number; lng: number }
  mapsUrl?: string
  openHours?: string
}

// ── Core New Places API fetch ─────────────────────────────────────────────────

async function newSearchPlaces(
  textQuery:    string,
  fieldMask:    string,
  key:          string,
  options:      { includedType?: string; maxResultCount?: number; priceLevels?: string[] } = {}
): Promise<NewPlace[]> {
  try {
    const body: Record<string, unknown> = {
      textQuery,
      maxResultCount: options.maxResultCount ?? 12,
      languageCode:   "en",
    }
    if (options.includedType) body.includedType = options.includedType
    if (options.priceLevels?.length) body.priceLevels = options.priceLevels

    const res = await fetch(NEW_SEARCH_ENDPOINT, {
      method:  "POST",
      headers: {
        "Content-Type":     "application/json",
        "X-Goog-Api-Key":   key,
        "X-Goog-FieldMask": fieldMask,
      },
      body:  JSON.stringify(body),
      cache: "no-store",
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => "(unreadable)")
      console.error(
        `[google-places] New API HTTP ${res.status}\n` +
        `  endpoint : ${NEW_SEARCH_ENDPOINT}\n` +
        `  key used : ${key.slice(0, 12)}… (env=NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)\n` +
        `  query    : ${textQuery}\n` +
        `  response : ${errText}`
      )
      return []
    }

    const data: NewSearchResponse = await res.json()
    return data.places ?? []
  } catch (err) {
    console.error("[google-places] New API fetch error:", err)
    return []
  }
}

// ── Legacy fallback fetch ─────────────────────────────────────────────────────

async function legacySearchPlaces(query: string, key: string): Promise<RawLegacyPlace[]> {
  try {
    const url = `${LEGACY_TEXT_SEARCH}?query=${encodeURIComponent(query)}&key=${key}`
    const res  = await fetch(url, { cache: "no-store" })
    if (!res.ok) return []
    const data = await res.json()
    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.warn("[google-places] Legacy status:", data.status, data.error_message ?? "")
    }
    return Array.isArray(data.results) ? data.results : []
  } catch (err) {
    console.error("[google-places] Legacy fetch error:", err)
    return []
  }
}

// ── Geocoding helper ─────────────────────────────────────────────────────────

export async function geocodeCity(address: string, key: string): Promise<{ city: string; country: string } | null> {
  try {
    const maskedKey = key ? `${key.slice(0, 12)}…` : "(empty)"
    const url = `${GEOCODING_API}?address=${encodeURIComponent(address)}&key=${key}`
    const maskedUrl = `${GEOCODING_API}?address=${encodeURIComponent(address)}&key=${maskedKey}`
    console.log(`[google-places:geocode] Request URL: ${maskedUrl}`)

    const res = await fetch(url, { cache: "no-store" })
    const rawBody = await res.text()
    console.log(`[google-places:geocode] Response status=${res.status} body=${rawBody}`)

    if (!res.ok) return null
    const data = JSON.parse(rawBody)
    if (data.status !== "OK" || !data.results?.length) return null

    const components: Array<{ long_name: string; types: string[] }> = data.results[0].address_components ?? []
    const locality    = components.find(c => c.types.includes("locality"))?.long_name ?? ""
    const admin1      = components.find(c => c.types.includes("administrative_area_level_1"))?.long_name ?? ""
    const country     = components.find(c => c.types.includes("country"))?.long_name ?? ""
    const resolvedCity = locality || admin1 || address

    console.log(`[google-places:geocode] "${address}" → city="${resolvedCity}" country="${country}"`)
    return { city: resolvedCity, country }
  } catch (err) {
    console.error("[google-places:geocode] Error:", err)
    return null
  }
}

// ── Budget normalisation ──────────────────────────────────────────────────────

function normalizeBudget(budget: string): "standard" | "premium" | "luxury" {
  if (budget === "budget" || budget === "low" || budget === "standard") return "standard"
  if (budget === "luxury") return "luxury"
  return "premium"
}

// ── Cuisine / Activity / Transit type extractors ──────────────────────────────

function extractCuisine(types?: string[]): string {
  if (!types?.length) return "Local"
  const MAP: Record<string, string> = {
    japanese_restaurant:       "Japanese",
    chinese_restaurant:        "Chinese",
    french_restaurant:         "French",
    italian_restaurant:        "Italian",
    thai_restaurant:           "Thai",
    indian_restaurant:         "Indian",
    mexican_restaurant:        "Mexican",
    american_restaurant:       "American",
    mediterranean_restaurant:  "Mediterranean",
    seafood_restaurant:        "Seafood",
    vegetarian_restaurant:     "Vegetarian",
    korean_restaurant:         "Korean",
    vietnamese_restaurant:     "Vietnamese",
    greek_restaurant:          "Greek",
    spanish_restaurant:        "Spanish",
    turkish_restaurant:        "Turkish",
    middle_eastern_restaurant: "Middle Eastern",
    sushi_restaurant:          "Sushi",
    steak_house:               "Steakhouse",
    fine_dining_restaurant:    "Fine Dining",
    ramen_restaurant:          "Ramen",
    pizza_restaurant:          "Pizza",
  }
  for (const t of types) { if (MAP[t]) return MAP[t] }
  return "Local"
}

function extractActivityCategory(types?: string[]): string {
  if (!types?.length) return "Attraction"
  const MAP: Record<string, string> = {
    museum:              "Museum",         art_gallery:      "Art Gallery",
    tourist_attraction:  "Tourist Attraction", amusement_park: "Amusement Park",
    aquarium:            "Aquarium",       zoo:              "Zoo",
    park:                "Park",           natural_feature:  "Nature",
    point_of_interest:   "Point of Interest", church:         "Religious Site",
    mosque:              "Religious Site", temple:           "Religious Site",
    stadium:             "Stadium",        spa:              "Spa & Wellness",
    night_club:          "Nightlife",      shopping_mall:    "Shopping",
    historical_landmark: "Historic Site",  landmark:         "Landmark",
    hiking_area:         "Hiking",         beach:            "Beach",
    cultural_center:     "Cultural Centre",
  }
  for (const t of types) { if (MAP[t]) return MAP[t] }
  return "Attraction"
}

function extractTransitType(types?: string[]): string {
  if (!types?.length) return "Transit Hub"
  const MAP: Record<string, string> = {
    airport:          "Airport",
    train_station:    "Train Station",
    subway_station:   "Metro / Subway",
    bus_station:      "Bus Station",
    transit_station:  "Transit Station",
    ferry_terminal:   "Ferry Terminal",
    light_rail_station: "Light Rail",
  }
  for (const t of types) { if (MAP[t]) return MAP[t] }
  return "Transit Hub"
}

// ── Public: fetchGoogleRestaurants (Places API New) — UNCHANGED ───────────────

export async function fetchGoogleRestaurants(
  city:         string,
  budget:       string,
  cuisineHint?: string,
  country?:     string,
): Promise<GooglePlaceRestaurant[]> {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!key) {
    console.warn("[google-places:restaurants] NEXT_PUBLIC_GOOGLE_MAPS_API_KEY not set")
    return []
  }

  const tier         = normalizeBudget(budget)
  const priceLevels  = BUDGET_PRICE_LEVELS[tier]
  const qualifier    = BUDGET_QUERY_QUALIFIER[tier] ?? ""
  const cuisinePart  = cuisineHint ? `${cuisineHint} ` : ""
  const location     = country ? `${city}, ${country}` : city
  const primaryQuery = `${qualifier} ${cuisinePart}restaurants in ${location}`.replace(/\s+/g, " ").trim()

  console.log(`[google-places:restaurants] query="${primaryQuery}" tier="${tier}"`)

  let raw = await newSearchPlaces(primaryQuery, RESTAURANT_FIELD_MASK, key, { includedType: "restaurant", priceLevels })

  if (raw.length === 0) {
    const fallbackQuery = `${cuisinePart}restaurants in ${location}`.replace(/\s+/g, " ").trim()
    console.warn("[google-places:restaurants] 0 results — retrying without price filter")
    raw = await newSearchPlaces(fallbackQuery, RESTAURANT_FIELD_MASK, key, { includedType: "restaurant" })
  }

  const filtered = raw
    .filter(p => p.displayName?.text && p.businessStatus !== "CLOSED_PERMANENTLY")
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 8)

  console.log(`[google-places:restaurants] Final: ${filtered.length} results`)

  return filtered.map(p => ({
    name:            p.displayName?.text ?? "Restaurant",
    rating:          p.rating ?? 4.0,
    userRatingsTotal: p.userRatingCount,
    cuisine:         cuisineHint ?? extractCuisine(p.types),
    price:           newPriceToDisplay(p.priceLevel),
    priceLevel:      newPriceToTier(p.priceLevel),
    address:         p.formattedAddress ?? "",
    description:     p.editorialSummary?.text
      ?? `${p.displayName?.text ?? "Restaurant"} — ${cuisineHint ?? extractCuisine(p.types)} cuisine in ${city}`,
    image:           p.photos?.[0]?.name ? newPhotoUrl(p.photos[0].name, key) : "",
    location:        { lat: p.location?.latitude ?? 0, lng: p.location?.longitude ?? 0 },
    openNow:         p.currentOpeningHours?.openNow,
    mapsUrl:         p.googleMapsUri,
  }))
}

// ── Public: fetchGoogleHotels (Places API NEW — was legacy) ───────────────────

export async function fetchGoogleHotels(
  city:   string,
  budget: string,
  country?: string,
): Promise<GooglePlaceHotel[]> {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!key) {
    console.warn("[google-places:hotels] NEXT_PUBLIC_GOOGLE_MAPS_API_KEY not set")
    return []
  }

  const tier       = normalizeBudget(budget)
  const qualifier  = HOTEL_BUDGET_QUALIFIER[tier]
  const location   = country ? `${city}, ${country}` : city
  const priceLevels = BUDGET_PRICE_LEVELS[tier]

  const primaryQuery = `${qualifier} in ${location}`
  console.log(`[google-places:hotels] query="${primaryQuery}" tier="${tier}" priceLevels=[${priceLevels.join(",")}]`)

  let raw = await newSearchPlaces(primaryQuery, HOTEL_FIELD_MASK, key, {
    includedType:   "lodging",
    priceLevels,
    maxResultCount: 12,
  })

  if (raw.length === 0) {
    console.warn("[google-places:hotels] 0 results with price filter — retrying without")
    raw = await newSearchPlaces(`hotel in ${location}`, HOTEL_FIELD_MASK, key, {
      includedType:   "lodging",
      maxResultCount: 12,
    })
  }

  const filtered = raw
    .filter(p => p.displayName?.text && p.businessStatus !== "CLOSED_PERMANENTLY")
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 8)

  console.log(`[google-places:hotels] Final: ${filtered.length} hotels`)

  return filtered.map(p => ({
    name:            p.displayName?.text ?? "Hotel",
    rating:          p.rating ?? 4.0,
    userRatingsTotal: p.userRatingCount,
    price:           newPriceToDisplay(p.priceLevel),
    priceLevel:      newPriceToTier(p.priceLevel),
    address:         p.formattedAddress ?? "",
    description:     p.editorialSummary?.text
      ?? `${p.displayName?.text ?? "Hotel"} — accommodation in ${city}`,
    image:           p.photos?.[0]?.name ? newPhotoUrl(p.photos[0].name, key) : "",
    location:        { lat: p.location?.latitude ?? 0, lng: p.location?.longitude ?? 0 },
    amenities:       [],
    phone:           p.nationalPhoneNumber,
    website:         p.websiteUri,
    mapsUrl:         p.googleMapsUri,
  }))
}

// ── Public: fetchGoogleActivities (Places API New + multi-level fallback) ─────

export async function fetchGoogleActivities(
  city:    string,
  country?: string,
): Promise<GooglePlaceActivity[]> {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!key) {
    console.warn("[google-places:activities] NEXT_PUBLIC_GOOGLE_MAPS_API_KEY not set")
    return []
  }

  const location = country ? `${city}, ${country}` : city

  // Level 1 — New Places API, city-level, with type filtering
  const activityTypes = ["tourist_attraction", "museum", "park", "amusement_park", "zoo", "aquarium", "cultural_center"]
  for (const type of activityTypes) {
    const results = await newSearchPlaces(
      `top ${type.replace(/_/g, " ")} in ${location}`,
      ACTIVITY_FIELD_MASK,
      key,
      { includedType: type, maxResultCount: 8 }
    )
    if (results.length >= 4) {
      console.log(`[google-places:activities] Level 1 (type=${type}): ${results.length} results for "${location}"`)
      return mapActivities(results, city, key)
    }
  }

  // Level 2 — New Places API, text search without type filter
  const level2Queries = [
    `top tourist attractions sightseeing in ${location}`,
    `things to do visit in ${location}`,
  ]
  for (const q of level2Queries) {
    const results = await newSearchPlaces(q, ACTIVITY_FIELD_MASK, key, { maxResultCount: 10 })
    if (results.length > 0) {
      console.log(`[google-places:activities] Level 2 (text): ${results.length} results for "${q}"`)
      return mapActivities(results.slice(0, 8), city, key)
    }
  }

  // Level 3 — Country-level broadened search (for remote areas like Sossusvlei)
  if (country) {
    const countryQueries = [
      `top tourist attractions in ${country}`,
      `best places to visit in ${country}`,
    ]
    for (const q of countryQueries) {
      const results = await newSearchPlaces(q, ACTIVITY_FIELD_MASK, key, { maxResultCount: 10 })
      if (results.length > 0) {
        console.log(`[google-places:activities] Level 3 (country): ${results.length} results for "${q}"`)
        return mapActivities(results.slice(0, 8), city, key)
      }
    }
  }

  // Level 4 — Legacy text search as absolute last resort
  const legacyQueries = [
    `tourist attractions near ${location}`,
    `things to do in ${country || city}`,
  ]
  for (const q of legacyQueries) {
    const places = await legacySearchPlaces(q, key)
    if (places.length > 0) {
      console.log(`[google-places:activities] Level 4 (legacy): ${places.length} results for "${q}"`)
      return places.slice(0, 8).map(p => ({
        name:            p.name,
        rating:          p.rating ?? 4.0,
        userRatingsTotal: p.user_ratings_total,
        address:         p.formatted_address,
        description:     `${p.name} — a popular attraction in ${city}`,
        image:           p.photos?.[0] ? legacyPhotoUrl(p.photos[0].photo_reference, key) : "",
        location:        p.geometry.location,
        duration:        "2–3 hours",
        category:        extractActivityCategory(p.types),
      }))
    }
  }

  console.warn(`[google-places:activities] All levels exhausted — 0 results for "${location}"`)
  return []
}

function mapActivities(places: NewPlace[], city: string, key: string): GooglePlaceActivity[] {
  return places
    .filter(p => p.displayName?.text && p.businessStatus !== "CLOSED_PERMANENTLY")
    .map(p => ({
      name:            p.displayName?.text ?? "Attraction",
      rating:          p.rating ?? 4.0,
      userRatingsTotal: p.userRatingCount,
      address:         p.formattedAddress ?? "",
      description:     p.editorialSummary?.text
        ?? `${p.displayName?.text ?? "Attraction"} — a popular destination in ${city}`,
      image:           p.photos?.[0]?.name ? newPhotoUrl(p.photos[0].name, key) : "",
      location:        { lat: p.location?.latitude ?? 0, lng: p.location?.longitude ?? 0 },
      duration:        "2–3 hours",
      category:        extractActivityCategory(p.types),
      mapsUrl:         p.googleMapsUri,
    }))
}

// ── Public: fetchGoogleTransitHubs (Places API New) ──────────────────────────

export async function fetchGoogleTransitHubs(
  city:    string,
  country?: string,
): Promise<GoogleTransitHub[]> {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!key) {
    console.warn("[google-places:transit] NEXT_PUBLIC_GOOGLE_MAPS_API_KEY not set")
    return []
  }

  const location = country ? `${city}, ${country}` : city
  const results: NewPlace[] = []

  // Fetch transit hubs by type
  const transitSearches: Array<{ type: string; query: string }> = [
    { type: "airport",        query: `airport in ${location}` },
    { type: "train_station",  query: `train station railway in ${location}` },
    { type: "bus_station",    query: `bus station terminal in ${location}` },
    { type: "transit_station", query: `metro subway station in ${location}` },
  ]

  const seen = new Set<string>()
  for (const { type, query } of transitSearches) {
    const places = await newSearchPlaces(query, TRANSIT_FIELD_MASK, key, {
      includedType:   type,
      maxResultCount: 3,
    })
    for (const p of places) {
      const k = p.displayName?.text ?? ""
      if (k && !seen.has(k)) {
        seen.add(k)
        results.push(p)
      }
    }
    if (results.length >= 8) break
  }

  // Fallback — generic search if nothing found
  if (results.length === 0) {
    const generic = await newSearchPlaces(
      `public transport stations in ${location}`,
      TRANSIT_FIELD_MASK,
      key,
      { maxResultCount: 6 }
    )
    results.push(...generic)
  }

  console.log(`[google-places:transit] ${results.length} transit hubs for "${location}"`)

  return results.slice(0, 8).map(p => ({
    name:     p.displayName?.text ?? "Transit Hub",
    type:     extractTransitType(p.types),
    address:  p.formattedAddress ?? "",
    location: { lat: p.location?.latitude ?? 0, lng: p.location?.longitude ?? 0 },
    mapsUrl:  p.googleMapsUri,
    openHours: p.regularOpeningHours?.weekdayDescriptions?.[0],
  }))
}
