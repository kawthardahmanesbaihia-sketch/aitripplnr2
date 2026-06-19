/**
 * HotelBeds Unified API Client
 *
 * Covers three products:
 *   • Hotel Content API  — hotel names, stars, location, facilities
 *   • Activities API     — excursions & experiences at a destination
 *   • Transfers API      — airport ↔ hotel transfer options
 *
 * Authentication: HMAC-SHA256
 *   Headers:  Api-key: {key}
 *             X-Signature: hex(SHA256(key + secret + epoch_seconds))
 *
 * Required env vars (per product):
 *   HOTELBEDS_HOTELS_API_KEY     / HOTELBEDS_HOTELS_SECRET
 *   HOTELBEDS_ACTIVITIES_API_KEY / HOTELBEDS_ACTIVITIES_SECRET
 *   HOTELBEDS_TRANSFERS_API_KEY  / HOTELBEDS_TRANSFERS_SECRET
 *
 * If the secret is absent the function logs a clear warning and returns [].
 * It NEVER returns generated or hardcoded placeholder data.
 */

import crypto from "crypto"

// Base URLs
// Using test environment — switch to api.hotelbeds.com once certified

const BASE_HOTELS     = "https://api.test.hotelbeds.com/hotel-content-api/1.0"
const BASE_ACTIVITIES = "https://api.test.hotelbeds.com/activities-api/1.0"
const BASE_TRANSFERS  = "https://api.test.hotelbeds.com/transfer-api/1.0"

// HMAC helper
function makeSignature(apiKey: string, secret: string): string {
  const timestamp = Math.floor(Date.now() / 1000).toString()
  return crypto
    .createHash("sha256")
    .update(apiKey + secret + timestamp)
    .digest("hex")
}

function makeHeaders(apiKey: string, secret: string): Record<string, string> {
  return {
    "Api-key":      apiKey,
    "X-Signature":  makeSignature(apiKey, secret),
    "Accept":       "application/json",
    "Content-Type": "application/json",
  }
}

// Destination code mapping
// HotelBeds uses its own 3-letter codes distinct from IATA.
// Keys are normalised to lowercase for lookup.

const DEST_CODES: Record<string, string> = {
  // Spain
  "barcelona": "BCN",  "madrid": "MAD",  "seville": "SEV",   "valencia": "VLC",
  "ibiza": "IBI",      "granada": "GRA",  "bilbao": "BIO",    "toledo": "TOL",
  "málaga": "AGP",     "malaga": "AGP",
  // France
  "paris": "PAR",      "nice": "NCE",     "lyon": "LYS",      "marseille": "MRS",
  "bordeaux": "BOD",   "cannes": "CEQ",   "chamonix": "GVA",  "strasbourg": "SXB",
  "montpellier": "MPL","nantes": "NTE",
  // Italy
  "rome": "ROM",       "venice": "VCE",   "florence": "FLR",  "milan": "MIL",
  "naples": "NAP",     "amalfi": "SAL",   "bologna": "BLQ",   "turin": "TRN",
  "palermo": "PMO",    "catania": "CTA",  "verona": "VRN",    "genoa": "GOA",
  // Germany
  "berlin": "BER",     "munich": "MUC",   "hamburg": "HAM",   "frankfurt": "FRA",
  "cologne": "CGN",    "düsseldorf": "DUS","dusseldorf": "DUS","dresden": "DRS",
  "stuttgart": "STR",  "nuremberg": "NUE","heidelberg": "MHG",
  // Austria
  "vienna": "VIE",     "salzburg": "SZG", "innsbruck": "INN",
  // Netherlands
  "amsterdam": "AMS",  "rotterdam": "RTM","the hague": "HAG", "utrecht": "UTC",
  // Belgium
  "brussels": "BRU",   "bruges": "OST",   "ghent": "GNE",     "antwerp": "ANR",
  // United Kingdom
  "london": "LON",     "edinburgh": "EDI","manchester": "MAN","glasgow": "GLA",
  "bath": "BRS",       "oxford": "LHR",   "cambridge": "STN", "liverpool": "LPL",
  "birmingham": "BHX", "york": "LBA",
  // Ireland
  "dublin": "DUB",     "galway": "GWY",   "cork": "ORK",
  // Scandinavia
  "copenhagen": "CPH", "stockholm": "STO","oslo": "OSL",       "helsinki": "HEL",
  "reykjavik": "REK",  "bergen": "BGO",   "gothenburg": "GOT", "malmö": "MMX",
  "malmo": "MMX",      "aarhus": "AAR",   "tampere": "TMP",
  // Eastern Europe
  "prague": "PRG",     "budapest": "BUD", "warsaw": "WAW",     "krakow": "KRK",
  "kraków": "KRK",     "bucharest": "OTP","sofia": "SOF",       "riga": "RIX",
  "tallinn": "TLL",    "vilnius": "VNO",  "bratislava": "BTS", "ljubljana": "LJU",
  "zagreb": "ZAG",     "sarajevo": "SJJ", "skopje": "SKP",     "tirana": "TIA",
  // Russia & CIS
  "moscow": "MOW",     "st. petersburg": "LED","saint petersburg": "LED",
  "kyiv": "KBP",       "kiev": "KBP",
  // Japan
  "tokyo": "TYO",      "kyoto": "UKY",    "osaka": "OSA",     "sapporo": "CTS",
  "hiroshima": "HIJ",  "nara": "UKY",     "fukuoka": "FUK",   "nagoya": "NGO",
  "yokohama": "TYO",   "kobe": "ITM",
  // South Korea
  "seoul": "SEL",      "busan": "PUS",    "jeju": "CJU",      "incheon": "ICN",
  // China
  "beijing": "BJS",    "shanghai": "SHA", "guangzhou": "CAN", "shenzhen": "SZX",
  "chengdu": "CTU",    "xi'an": "XIY",    "xian": "XIY",
  // Hong Kong & Macau
  "hong kong": "HKG",
  // Taiwan
  "taipei": "TPE",
  // Greece
  "athens": "ATH",     "santorini": "JTR","mykonos": "JMK",   "crete": "HER",
  "rhodes": "RHO",     "corfu": "CFU",    "thessaloniki": "SKG",
  // Turkey
  "istanbul": "IST",   "cappadocia": "KYA","bodrum": "BJV",   "antalya": "AYT",
  "izmir": "ADB",
  // Middle East
  "cairo": "CAI",      "luxor": "LXR",    "hurghada": "HRG",  "sharm el sheikh": "SSH",
  "amman": "AMM",      "beirut": "BEY",   "tel aviv": "TLV",  "jerusalem": "TLV",
  "muscat": "MCT",     "doha": "DOH",     "kuwait city": "KWI",
  // Thailand
  "bangkok": "BKK",    "phuket": "HKT",   "chiang mai": "CNX","koh samui": "USM",
  "krabi": "KBV",      "pai": "CNX",      "pattaya": "BKK",   "hua hin": "HHQ",
  "patong": "HKT",     // beach sub-region of Phuket island
  // Indonesia
  "bali": "DPS",       "jakarta": "CGK",  "lombok": "LOP",    "ubud": "DPS",
  "seminyak": "DPS",   "kuta": "DPS",     "yogyakarta": "JOG","surabaya": "SUB",
  // Malaysia
  "kuala lumpur": "KUL","penang": "PEN",  "langkawi": "LGK",  "kota kinabalu": "BKI",
  // Philippines
  "manila": "MNL",     "cebu": "CEB",     "boracay": "MPH",   "palawan": "PPS",
  // Vietnam
  "hanoi": "HAN",      "ho chi minh city": "SGN","da nang": "DAD","hội an": "DAD",
  "hoi an": "DAD",     "ha long bay": "HAN","nha trang": "CXR",
  // Cambodia & Myanmar
  "phnom penh": "PNH", "siem reap": "REP","yangon": "RGN",    "bagan": "NYU",
  // Morocco
  "marrakech": "RAK",  "casablanca": "CMN","fes": "FEZ",      "agadir": "AGA",
  "fez": "FEZ",        "essaouira": "ESU","tangier": "TNG",   "meknes": "MEK",
  // Portugal
  "lisbon": "LIS",     "porto": "OPO",    "algarve": "FAO",   "sintra": "LIS",
  "madeira": "FNC",    "azores": "PDL",   "faro": "FAO",
  // UAE
  "dubai": "DXB",      "abu dhabi": "AUH","sharjah": "SHJ",
  // India
  "goa": "GOI",        "mumbai": "BOM",   "delhi": "DEL",     "jaipur": "JAI",
  "varanasi": "VNS",   "kerala": "COK",   "bangalore": "BLR", "bengaluru": "BLR",
  "chennai": "MAA",    "hyderabad": "HYD","kolkata": "CCU",   "agra": "AGR",
  "udaipur": "UDR",    "jodhpur": "JDH",  "darjeeling": "IXB","rishikesh": "DED",
  // Sri Lanka
  "colombo": "CMB",    "kandy": "KDY",
  // Nepal
  "kathmandu": "KTM",  "pokhara": "PKR",
  // USA
  "new york": "NYC",   "los angeles": "LAX","miami": "MIA",   "chicago": "CHI",
  "las vegas": "LAS",  "san francisco": "SFO","new orleans": "MSY","honolulu": "HNL",
  "seattle": "SEA",    "boston": "BOS",   "washington dc": "DCA","washington d.c.": "DCA",
  "nashville": "BNA",  "austin": "AUS",   "portland": "PDX",  "denver": "DEN",
  "san diego": "SAN",  "orlando": "MCO",  "atlanta": "ATL",   "dallas": "DFW",
  "houston": "IAH",    "phoenix": "PHX",  "minneapolis": "MSP",
  // Canada
  "toronto": "YTO",    "vancouver": "YVR","montreal": "YMQ",  "calgary": "YYC",
  "quebec city": "YQB","ottawa": "YOW",   "victoria": "YYJ",  "banff": "YYC",
  // Australia
  "sydney": "SYD",     "melbourne": "MEL","cairns": "CNS",   "brisbane": "BNE",
  "gold coast": "OOL", "perth": "PER",    "adelaide": "ADL",  "darwin": "DRW",
  "hobart": "HBA",     "uluru": "AYQ",
  // New Zealand
  "auckland": "AKL",   "queenstown": "ZQN","rotorua": "ROT",  "wellington": "WLG",
  "christchurch": "CHC",
  // South Africa
  "cape town": "CPT",  "johannesburg": "JNB","kruger": "MQP", "durban": "DUR",
  "pretoria": "PRY",   "garden route": "GRJ",
  // East Africa
  "nairobi": "NBO",    "zanzibar": "ZNZ", "kilimanjaro": "JRO","serengeti": "SEU",
  "addis ababa": "ADD","dar es salaam": "DAR",
  // West Africa
  "accra": "ACC",      "lagos": "LOS",    "dakar": "DSS",
  // Singapore & sub-regions
  "singapore": "SIN",  "marina bay": "SIN",  "sentosa": "SIN",
  // Switzerland
  "zurich": "ZRH",     "geneva": "GVA",   "interlaken": "BRN","zermatt": "ZRH",
  "lausanne": "GVA",   "bern": "BRN",     "lucerne": "ZRH",   "basel": "BSL",
  "lugano": "LUG",     "st. moritz": "SMV",
  // Croatia
  "dubrovnik": "DBV",  "split": "SPU",    "hvar": "SPU",
  // Serbia & Balkans
  "belgrade": "BEG",   "novi sad": "BEG",
  // Brazil
  "rio de janeiro": "RIO","são paulo": "SAO","salvador": "SSA","fortaleza": "FOR",
  "florianopolis": "FLN","manaus": "MAO", "iguazu": "IGU",
  // Mexico
  "mexico city": "MEX","cancún": "CUN",   "cancun": "CUN",   "tulum": "CUN",
  "oaxaca": "OAX",     "guadalajara": "GDL","monterrey": "MTY","san cristobal": "SZT",
  "playa del carmen": "CUN","puerto vallarta": "PVR","cabo san lucas": "SJD",
  // Central America & Caribbean
  "havana": "HAV",     "san jose": "SJO", "guatemala city": "GUA",
  "santo domingo": "SDQ","san juan": "SJU","nassau": "NAS",   "kingston": "KIN",
  // Argentina & Chile
  "buenos aires": "BUE","santiago": "SCL","mendoza": "MDZ",   "patagonia": "PMQ",
  "bariloche": "BRC",  "ushuaia": "USH",
  // Colombia & Ecuador & Peru
  "bogota": "BOG",     "medellín": "MDE","medellin": "MDE",  "cartagena": "CTG",
  "quito": "UIO",      "galapagos": "GPS",
  "lima": "LIM",       "cusco": "CUZ",    "machu picchu": "CUZ",
  // Iceland & Nordic islands
  "akureyri": "AEY",
  // Pacific
  "fiji": "NAN",       "bora bora": "BOB","tahiti": "PPT",    "papeete": "PPT",
  "maldives": "MLE",   "male": "MLE",
}

export function getDestinationCode(cityOrCountry: string): string | null {
  const key = cityOrCountry.toLowerCase().trim()
  return DEST_CODES[key] ?? null
}

// Destination resolution with Google Geocoding fallback
// Simple in-process cache so repeated requests for the same unknown city don't
// keep hitting the Geocoding API.

const _geocodeCache = new Map<string, string | null>()

async function resolveDestinationCode(cityOrCountry: string): Promise<string | null> {
  // 1 — static dictionary fast path
  const direct = getDestinationCode(cityOrCountry)
  if (direct) return direct

  // 2 — check in-process cache
  const cacheKey = cityOrCountry.toLowerCase().trim()
  if (_geocodeCache.has(cacheKey)) return _geocodeCache.get(cacheKey) ?? null

  // 3 — Google Geocoding to resolve nearest known city
  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!mapsKey) {
    console.warn(`[HotelBeds] No destination code for "${cityOrCountry}" and no Maps key for geocoding`)
    _geocodeCache.set(cacheKey, null)
    return null
  }

  console.log(`[HotelBeds] Unknown destination "${cityOrCountry}" — trying Google Geocoding...`)

  try {
    const url  = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(cityOrCountry)}&key=${mapsKey}`
    const res  = await fetch(url, { cache: "no-store" })
    if (!res.ok) {
      _geocodeCache.set(cacheKey, null)
      return null
    }
    const data = await res.json()
    if (data.status !== "OK" || !data.results?.length) {
      console.warn(`[HotelBeds] Geocoding status "${data.status}" for "${cityOrCountry}"`)
      _geocodeCache.set(cacheKey, null)
      return null
    }

    const components: Array<{ long_name: string; short_name: string; types: string[] }>
      = data.results[0].address_components ?? []

    // Walk from most specific to broadest: locality → admin_area_1 → country
    const candidates = [
      components.find(c => c.types.includes("locality"))?.long_name,
      components.find(c => c.types.includes("administrative_area_level_2"))?.long_name,
      components.find(c => c.types.includes("administrative_area_level_1"))?.long_name,
      components.find(c => c.types.includes("country"))?.long_name,
    ].filter(Boolean) as string[]

    for (const candidate of candidates) {
      const code = getDestinationCode(candidate)
      if (code) {
        console.log(`[HotelBeds] Resolved "${cityOrCountry}" → "${candidate}" → code=${code}`)
        _geocodeCache.set(cacheKey, code)
        return code
      }
    }

    console.warn(`[HotelBeds] Geocoding found [${candidates.join(", ")}] but none mapped to a dest code`)
    _geocodeCache.set(cacheKey, null)
    return null
  } catch (err) {
    console.error(`[HotelBeds] Geocoding error for "${cityOrCountry}":`, err)
    _geocodeCache.set(cacheKey, null)
    return null
  }
}

// Public interfaces
export interface HotelbedsHotel {
  code:        string
  name:        string
  categoryCode: string          // star rating code e.g. "5EST"
  stars:       number           // derived 1-5
  address:     string
  description: string
  location:    { lat: number; lng: number }
  phone:       string
  web:         string
  image:       string
  amenities:   string[]
}

export interface HotelbedsActivity {
  code:        string
  name:        string
  description: string
  duration:    string
  price:       string
  currency:    string
  image:       string
  category:    string
}

export interface HotelbedsTransfer {
  code:        string
  name:        string
  vehicle:     string
  capacity:    number
  price:       string
  currency:    string
  duration:    string
}

// Hotels
export async function fetchHotelbedsHotels(
  cityOrCountry: string,
  budget: string = "mid-range"
): Promise<HotelbedsHotel[]> {
  const apiKey = process.env.HOTELBEDS_HOTELS_API_KEY
  const secret = process.env.HOTELBEDS_HOTELS_SECRET

  if (!apiKey) {
    console.warn("[HotelBeds Hotels] HOTELBEDS_HOTELS_API_KEY not set — skipping")
    return []
  }
  if (!secret) {
    console.warn("[HotelBeds Hotels] HOTELBEDS_HOTELS_SECRET not set — skipping (key present but HMAC auth incomplete)")
    return []
  }

  const destCode = await resolveDestinationCode(cityOrCountry)
  if (!destCode) {
    console.warn(`[HotelBeds Hotels] No destination code for "${cityOrCountry}" (after geocoding) — skipping`)
    return []
  }

  const categoryFilter = budget === "budget" || budget === "low"
    ? "1EST,2EST"
    : budget === "luxury" || budget === "high"
    ? "4EST,5EST"
    : "3EST,4EST"

  const url = [
    `${BASE_HOTELS}/hotels`,
    `?destinationCode=${destCode}`,
    `&fields=name,categoryCode,coordinates,address,phones,web,images,facilities,description`,
    `&language=ENG`,
    `&from=1&to=20`,
    `&categoryCodes=${categoryFilter}`,
    `&useSecondaryLanguage=false`,
  ].join("")

  console.log(`[HotelBeds Hotels] dest=${destCode} budget=${budget} categoryFilter=${categoryFilter}`)
  console.log("HotelBeds URL:", url)

  try {
    const res = await fetch(url, {
      headers: makeHeaders(apiKey, secret),
      cache:   "no-store",
    })

    console.log("HotelBeds Status:", res.status)
    console.log(`[HotelBeds Hotels] Response status: ${res.status}`)

    if (!res.ok) {
      const errText = await res.text()
      console.error(`[HotelBeds Hotels] HTTP ${res.status}: ${errText.slice(0, 300)}`)
      return []
    }

    const text = await res.text()
    let data: any
    try { data = JSON.parse(text) } catch {
      console.error("[HotelBeds Hotels] Non-JSON response")
      return []
    }

    const raw: any[] = data?.hotels ?? []
    console.log(`[HotelBeds Hotels] hotels count: ${raw.length}`)
    console.log(`[HotelBeds Hotels] first hotel: ${raw[0]?.name?.content ?? raw[0]?.name ?? "(none)"}`)

    return raw.slice(0, 8).map((h: any) => {
      const stars = parseStars(h.categoryCode)
      return {
        code:         String(h.code ?? ""),
        name:         String(h.name?.content ?? h.name ?? ""),
        categoryCode: String(h.categoryCode ?? ""),
        stars,
        address:      formatAddress(h.address),
        description:  String(h.description?.content ?? h.description ?? ""),
        location: {
          lat: parseFloat(h.coordinates?.latitude  ?? 0),
          lng: parseFloat(h.coordinates?.longitude ?? 0),
        },
        phone:      h.phones?.[0]?.phoneNumber ?? "",
        web:        h.web ?? "",
        image:      h.images?.[0]?.path
          ? `http://photos.hotelbeds.com/giata/bigger/${h.images[0].path}`
          : "",
        amenities:  extractAmenities(h.facilities ?? []),
      }
    })
  } catch (err) {
    console.error("[HotelBeds Hotels] Fetch error:", err)
    return []
  }
}

// Activities
export async function fetchHotelbedsActivities(
  cityOrCountry: string,
  fromDate?: string,
  toDate?: string
): Promise<HotelbedsActivity[]> {
  const apiKey = process.env.HOTELBEDS_ACTIVITIES_API_KEY
  const secret = process.env.HOTELBEDS_ACTIVITIES_SECRET

  if (!apiKey) {
    console.warn("[HotelBeds Activities] HOTELBEDS_ACTIVITIES_API_KEY not set — skipping")
    return []
  }
  if (!secret) {
    console.warn("[HotelBeds Activities] HOTELBEDS_ACTIVITIES_SECRET not set — skipping (key present but HMAC auth incomplete)")
    return []
  }

  const destCode = await resolveDestinationCode(cityOrCountry)
  if (!destCode) {
    console.warn(`[HotelBeds Activities] No destination code for "${cityOrCountry}" (after geocoding) — skipping`)
    return []
  }

  // Default to a 14-day window from today when no dates provided
  const today    = new Date()
  const from     = fromDate ?? today.toISOString().split("T")[0]
  const twoWeeks = new Date(today.getTime() + 14 * 86400000)
  const to       = toDate ?? twoWeeks.toISOString().split("T")[0]

  // Activities API v3 — POST with JSON body (NOT the old GET query-string format)
  // Correct path: activity-api/3.0  (not activities-api/1.0)
  const url = "https://api.test.hotelbeds.com/activity-api/3.0/activities"

  const requestBody = {
    filters: [{ searchFilterItems: [{ type: "destination", value: destCode }] }],
    from,
    to,
    language: "en",
    pagination: { itemsPerPage: 20, page: 1 },
    order: "DEFAULT",
  }

  console.log(`[HotelBeds Activities] dest=${destCode} from=${from} to=${to}`)
  console.log("HotelBeds URL:", url)
  console.log("[HotelBeds Activities] body:", JSON.stringify(requestBody))

  try {
    const res = await fetch(url, {
      method:  "POST",
      headers: makeHeaders(apiKey, secret),
      body:    JSON.stringify(requestBody),
      cache:   "no-store",
    })

    console.log("HotelBeds Status:", res.status)
    console.log(`[HotelBeds Activities] Response status: ${res.status}`)

    if (!res.ok) {
      const errText = await res.text()
      console.error(`[HotelBeds Activities] HTTP ${res.status}: ${errText.slice(0, 300)}`)
      return []
    }

    const text = await res.text()
    let data: any
    try { data = JSON.parse(text) } catch {
      console.error("[HotelBeds Activities] Non-JSON response")
      return []
    }

    // v3 API response: { activities: [...] }  or  { activitiesContent: [...] }
    const raw: any[] = data?.activities ?? data?.activitiesContent ?? []
    console.log(`[HotelBeds Activities] activities count: ${raw.length}`)
    console.log(`[HotelBeds Activities] first activity: ${raw[0]?.name ?? "(none)"}`)
    if (raw.length === 0) {
      console.warn("[HotelBeds Activities] Zero results — response keys:", Object.keys(data ?? {}))
    }

    return raw.slice(0, 10).map((a: any) => {
      // v3 modalities live under a.modalities[] or a.amountsFrom[]
      const modality  = a.modalities?.[0]
      const priceFrom = a.amountsFrom?.[0]
      const price     = modality?.prices?.[0] ?? priceFrom
      return {
        code:        String(a.serviceCode ?? a.code ?? ""),
        name:        String(a.name ?? ""),
        description: String(
          a.description?.substring(0, 300) ??
          a.content?.description?.substring(0, 300) ??
          ""
        ),
        duration:    formatDuration(modality?.duration ?? a.operationDays),
        price:       price
          ? `${price.amount ?? price.totalAmount ?? ""} ${price.currency ?? price.currencyIsoCode ?? ""}`.trim()
          : "",
        currency:    String(price?.currency ?? price?.currencyIsoCode ?? ""),
        image:       a.images?.[0]?.url ?? a.coverImage ?? "",
        category:    a.activityFactsheetType ?? a.categories?.[0]?.name ?? "Activity",
      }
    })
  } catch (err) {
    console.error("[HotelBeds Activities] Fetch error:", err)
    return []
  }
}

// Transfers
export async function fetchHotelbedsTransfers(
  originAirportIATA: string,
  destinationCode:   string,
  date:              string,
  adults:            number = 2
): Promise<HotelbedsTransfer[]> {
  const apiKey = process.env.HOTELBEDS_TRANSFERS_API_KEY
  const secret = process.env.HOTELBEDS_TRANSFERS_SECRET

  if (!apiKey) {
    console.warn("[HotelBeds Transfers] HOTELBEDS_TRANSFERS_API_KEY not set — skipping")
    return []
  }
  if (!secret) {
    console.warn("[HotelBeds Transfers] HOTELBEDS_TRANSFERS_SECRET not set — skipping (key present but HMAC auth incomplete)")
    return []
  }

  // Transfers Booking API uses GET with path parameters (not POST with body).
  // Format: /availability/{lang}/from/{fromType}/{fromCode}/to/{toType}/{toCode}/{datetime}/{adults}/{children}/{infants}
  // NOTE: If this returns 403 "Access to this API has been disallowed", the Transfers
  // product is not activated on the account. Contact HotelBeds support to enable it.
  const outboundDateTime = `${date}T12:00:00`
  const url = [
    `${BASE_TRANSFERS}/availability`,
    `/en`,
    `/from/IATA/${originAirportIATA}`,
    `/to/ATLAS/${destinationCode}`,
    `/${outboundDateTime}`,
    `/${adults}/0/0`,
  ].join("")

  console.log(`[HotelBeds Transfers] origin=${originAirportIATA} dest=${destinationCode} date=${date}`)
  console.log("HotelBeds URL:", url)

  try {
    const res = await fetch(url, {
      method:  "GET",
      headers: makeHeaders(apiKey, secret),
      cache:   "no-store",
    })

    console.log("HotelBeds Status:", res.status)
    console.log(`[HotelBeds Transfers] Response status: ${res.status}`)

    if (!res.ok) {
      const errText = await res.text()
      console.error(`[HotelBeds Transfers] HTTP ${res.status}: ${errText.slice(0, 300)}`)
      return []
    }

    const text = await res.text()
    let data: any
    try { data = JSON.parse(text) } catch {
      console.error("[HotelBeds Transfers] Non-JSON response")
      return []
    }

    // v1 response shape: { transfers: [...] } — each has id, category, vehicle, price
    const raw: any[] = data?.transfers ?? data?.services ?? []
    console.log(`[HotelBeds Transfers] transfers count: ${raw.length}`)
    console.log(`[HotelBeds Transfers] first transfer: ${raw[0]?.category?.name ?? raw[0]?.vehicle?.code ?? "(none)"}`)
    if (raw.length === 0) {
      console.warn("[HotelBeds Transfers] Zero results — response keys:", Object.keys(data ?? {}))
    }

    return raw.slice(0, 5).map((t: any) => ({
      code:     String(t.id ?? t.code ?? ""),
      name:     String(t.category?.name ?? t.name ?? "Transfer"),
      vehicle:  String(t.vehicle?.code ?? t.vehicleType ?? ""),
      capacity: parseInt(String(t.vehicle?.capacity ?? t.maxPax ?? "4"), 10),
      price:    t.price
        ? `${t.price.net ?? t.price.total ?? ""} ${t.price.currency ?? t.price.currencyId ?? ""}`.trim()
        : "",
      currency: String(t.price?.currency ?? t.price?.currencyId ?? ""),
      duration: formatDuration(t.transferTime ?? t.duration),
    }))
  } catch (err) {
    console.error("[HotelBeds Transfers] Fetch error:", err)
    return []
  }
}

// Helpers
function parseStars(categoryCode: string): number {
  const m = (categoryCode ?? "").match(/^(\d)/)
  return m ? parseInt(m[1], 10) : 3
}

function formatAddress(address: any): string {
  if (typeof address === "string") return address
  if (!address) return ""
  const parts = [address.content, address.street, address.city].filter(Boolean)
  return parts.join(", ")
}

function formatDuration(raw: any): string {
  if (!raw) return ""
  if (typeof raw === "string") return raw
  // HotelBeds duration is sometimes an object { hours, minutes }
  if (typeof raw === "object") {
    const h = raw.hours ?? 0
    const m = raw.minutes ?? 0
    if (h && m) return `${h}h ${m}m`
    if (h)      return `${h}h`
    if (m)      return `${m}m`
  }
  return String(raw)
}

function extractAmenities(facilities: any[]): string[] {
  return facilities
    .slice(0, 6)
    .map((f: any) => f.facilityName?.content ?? f.name ?? "")
    .filter(Boolean)
}

// IATA airport lookup (used by Transfers)
// Maps HotelBeds destination codes to their nearest major airport IATA code.

export const DEST_TO_AIRPORT: Record<string, string> = {
  // Spain
  BCN: "BCN", MAD: "MAD", SEV: "SVQ", VLC: "VLC", IBI: "IBZ", GRA: "GRX",
  BIO: "BIO", AGP: "AGP",
  // France
  PAR: "CDG", NCE: "NCE", LYS: "LYS", MRS: "MRS", BOD: "BOD", CEQ: "CEQ",
  SXB: "SXB", MPL: "MPL", NTE: "NTE",
  // Italy
  ROM: "FCO", VCE: "VCE", FLR: "FLR", MIL: "MXP", NAP: "NAP", SAL: "QSR",
  BLQ: "BLQ", TRN: "TRN", PMO: "PMO", CTA: "CTA", VRN: "VRN",
  // Germany
  BER: "BER", MUC: "MUC", HAM: "HAM", FRA: "FRA", CGN: "CGN", DUS: "DUS",
  DRS: "DRS", STR: "STR", NUE: "NUE",
  // Austria
  VIE: "VIE", SZG: "SZG", INN: "INN",
  // Netherlands
  AMS: "AMS", RTM: "RTM",
  // Belgium
  BRU: "BRU", ANR: "ANR",
  // UK
  LON: "LHR", EDI: "EDI", MAN: "MAN", GLA: "GLA", BRS: "BRS", LPL: "LPL",
  BHX: "BHX", LBA: "LBA",
  // Ireland
  DUB: "DUB", ORK: "ORK",
  // Scandinavia
  CPH: "CPH", STO: "ARN", OSL: "OSL", HEL: "HEL", REK: "KEF", BGO: "BGO",
  GOT: "GOT", MMX: "MMX", AAR: "AAR",
  // Eastern Europe
  PRG: "PRG", BUD: "BUD", WAW: "WAW", KRK: "KRK", OTP: "OTP", SOF: "SOF",
  RIX: "RIX", TLL: "TLL", VNO: "VNO", BTS: "BTS", LJU: "LJU", ZAG: "ZAG",
  SJJ: "SJJ", BEG: "BEG",
  // Russia & CIS
  MOW: "SVO", LED: "LED", KBP: "KBP",
  // Japan
  TYO: "NRT", UKY: "ITM", OSA: "KIX", CTS: "CTS", HIJ: "HIJ", FUK: "FUK",
  NGO: "NGO",
  // Korea
  SEL: "ICN", PUS: "PUS", CJU: "CJU", ICN: "ICN",
  // China
  BJS: "PEK", SHA: "PVG", CAN: "CAN", SZX: "SZX", CTU: "CTU", XIY: "XIY",
  // Hong Kong
  HKG: "HKG",
  // Taiwan
  TPE: "TPE",
  // Greece
  ATH: "ATH", JTR: "JTR", JMK: "JMK", HER: "HER", RHO: "RHO", CFU: "CFU",
  SKG: "SKG",
  // Turkey
  IST: "IST", KYA: "KYA", BJV: "BJV", AYT: "AYT", ADB: "ADB",
  // Middle East
  CAI: "CAI", LXR: "LXR", HRG: "HRG", SSH: "SSH", AMM: "AMM", BEY: "BEY",
  TLV: "TLV", MCT: "MCT", DOH: "DOH",
  // South & SE Asia
  BKK: "BKK", HKT: "HKT", CNX: "CNX", USM: "USM", KBV: "KBV", HHQ: "HHQ",
  DPS: "DPS", CGK: "CGK", JOG: "JOG", SUB: "SUB",
  KUL: "KUL", PEN: "PEN", LGK: "LGK", BKI: "BKI",
  MNL: "MNL", CEB: "CEB",
  HAN: "HAN", SGN: "SGN", DAD: "DAD", CXR: "CXR",
  PNH: "PNH", REP: "REP", RGN: "RGN",
  // Morocco
  RAK: "RAK", CMN: "CMN", FEZ: "FEZ", AGA: "AGA", ESU: "ESU", TNG: "TNG",
  // Portugal
  LIS: "LIS", OPO: "OPO", FAO: "FAO", FNC: "FNC", PDL: "PDL",
  // UAE
  DXB: "DXB", AUH: "AUH", SHJ: "SHJ",
  // India
  BOM: "BOM", DEL: "DEL", GOI: "GOI", JAI: "JAI", VNS: "VNS", COK: "COK",
  BLR: "BLR", MAA: "MAA", HYD: "HYD", CCU: "CCU", UDR: "UDR", JDH: "JDH",
  // Sri Lanka & Nepal
  CMB: "CMB", KTM: "KTM", PKR: "PKR",
  // USA
  NYC: "JFK", LAX: "LAX", MIA: "MIA", CHI: "ORD", LAS: "LAS", SFO: "SFO",
  MSY: "MSY", HNL: "HNL", SEA: "SEA", BOS: "BOS", DCA: "DCA", BNA: "BNA",
  AUS: "AUS", PDX: "PDX", DEN: "DEN", SAN: "SAN", MCO: "MCO", ATL: "ATL",
  DFW: "DFW", IAH: "IAH", PHX: "PHX", MSP: "MSP",
  // Canada
  YTO: "YYZ", YVR: "YVR", YMQ: "YUL", YYC: "YYC", YQB: "YQB", YOW: "YOW",
  // Australia
  SYD: "SYD", MEL: "MEL", CNS: "CNS", BNE: "BNE", OOL: "OOL", PER: "PER",
  ADL: "ADL", DRW: "DRW",
  // New Zealand
  AKL: "AKL", ZQN: "ZQN", WLG: "WLG", CHC: "CHC",
  // South Africa
  CPT: "CPT", JNB: "JNB", DUR: "DUR",
  // East Africa
  NBO: "NBO", ZNZ: "ZNZ", JRO: "JRO", ADD: "ADD", DAR: "DAR",
  // West Africa
  ACC: "ACC", LOS: "LOS", DSS: "DSS",
  // Singapore
  SIN: "SIN",
  // Switzerland
  ZRH: "ZRH", GVA: "GVA", BRN: "BRN", BSL: "BSL", LUG: "LUG",
  // Croatia
  DBV: "DBV", SPU: "SPU",
  // Brazil
  RIO: "GIG", SAO: "GRU", SSA: "SSA", FOR: "FOR", FLN: "FLN", MAO: "MAO",
  IGU: "IGU",
  // Mexico
  MEX: "MEX", CUN: "CUN", OAX: "OAX", GDL: "GDL", MTY: "MTY",
  PVR: "PVR", SJD: "SJD",
  // Caribbean
  HAV: "HAV", SDQ: "SDQ", SJU: "SJU", NAS: "NAS", KIN: "KIN",
  // South America
  BUE: "EZE", SCL: "SCL", MDZ: "MDZ", BRC: "BRC", USH: "USH",
  BOG: "BOG", MDE: "MDE", CTG: "CTG",
  UIO: "UIO",
  LIM: "LIM", CUZ: "CUZ",
  // Pacific
  NAN: "NAN", BOB: "BOB", PPT: "PPT", MLE: "MLE",
}
