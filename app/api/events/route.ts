import { NextRequest, NextResponse } from "next/server"
import { getCountryCoordinates } from "@/lib/country-coordinates"
import { eventCache, generateCacheKey } from "@/lib/cache"

export const dynamic    = "force-dynamic"
export const revalidate = 0

interface EventRequest {
  location?:        string
  countryCode?:     string
  startDate:        string
  endDate:          string
  userMood?:        string
  activityLevel?:   string
  userPreferences?: string[]
}

// Country name → ISO 2-letter code (all 24 destination countries + extras)
const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  "Japan":                 "JP",
  "France":                "FR",
  "Italy":                 "IT",
  "Spain":                 "ES",
  "Greece":                "GR",
  "Portugal":              "PT",
  "Turkey":                "TR",
  "Morocco":               "MA",
  "Thailand":              "TH",
  "Indonesia":             "ID",
  "India":                 "IN",
  "Vietnam":               "VN",
  "Singapore":             "SG",
  "United Arab Emirates":  "AE",
  "Australia":             "AU",
  "New Zealand":           "NZ",
  "Brazil":                "BR",
  "Mexico":                "MX",
  "United States":         "US",
  "Peru":                  "PE",
  "Croatia":               "HR",
  "Switzerland":           "CH",
  "South Africa":          "ZA",
  "Algeria":               "DZ",
  // extras
  "Costa Rica":   "CR",
  "Canada":       "CA",
  "Germany":      "DE",
  "United Kingdom":"GB",
  "South Korea":  "KR",
  "China":        "CN",
  "Argentina":    "AR",
  "Chile":        "CL",
  "Colombia":     "CO",
  "Egypt":        "EG",
  "Kenya":        "KE",
  "Iceland":      "IS",
  "Norway":       "NO",
  "Sweden":       "SE",
  "Denmark":      "DK",
  "Finland":      "FI",
  "Poland":       "PL",
  "Czech Republic":"CZ",
  "Hungary":      "HU",
  "Romania":      "RO",
  "Bulgaria":     "BG",
  "Ireland":      "IE",
  "Netherlands":  "NL",
  "Cuba":         "CU",
  "Jordan":       "JO",
  "Cambodia":     "KH",
  "Malaysia":     "MY",
  "Philippines":  "PH",
  "Sri Lanka":    "LK",
  "Nepal":        "NP",
  "Taiwan":       "TW",
  // additional destinations
  "Namibia":      "NA",
  "Tanzania":     "TZ",
  "Rwanda":       "RW",
  "Uganda":       "UG",
  "Ghana":        "GH",
  "Ethiopia":     "ET",
  "Zambia":       "ZM",
  "Zimbabwe":     "ZW",
  "Mozambique":   "MZ",
  "Senegal":      "SN",
  "Nigeria":      "NG",
  "Pakistan":     "PK",
  "Bangladesh":   "BD",
  "Bolivia":      "BO",
  "Paraguay":     "PY",
  "Uruguay":      "UY",
  "Panama":       "PA",
  "Ecuador":      "EC",
  "Venezuela":    "VE",
  "Saudi Arabia": "SA",
  "Qatar":        "QA",
  "Kuwait":       "KW",
  "Oman":         "OM",
  "Bahrain":      "BH",
  "Lebanon":      "LB",
  "Israel":       "IL",
  "Iraq":         "IQ",
  "Iran":         "IR",
  "Kazakhstan":   "KZ",
  "Uzbekistan":   "UZ",
  "Mongolia":     "MN",
  "Myanmar":      "MM",
  "Laos":         "LA",
  "Maldives":     "MV",
  "Fiji":         "FJ",
  "Malta":        "MT",
  "Cyprus":       "CY",
  "Slovakia":     "SK",
  "Slovenia":     "SI",
  "Serbia":       "RS",
  "North Macedonia": "MK",
  "Moldova":      "MD",
  "Ukraine":      "UA",
  "Latvia":       "LV",
  "Lithuania":    "LT",
  "Estonia":      "EE",
  "Luxembourg":   "LU",
  "Belgium":      "BE",
  "Austria":      "AT",
}

// Maps country code to a searchable location string for Eventbrite
const CODE_TO_LOCATION: Record<string, string> = {
  JP: "Japan",           FR: "France",        IT: "Italy",
  ES: "Spain",           GR: "Greece",        PT: "Portugal",
  TR: "Turkey",          MA: "Morocco",       TH: "Thailand",
  ID: "Indonesia",       IN: "India",         VN: "Vietnam",
  SG: "Singapore",       AE: "United Arab Emirates", AU: "Australia",
  NZ: "New Zealand",     BR: "Brazil",        MX: "Mexico",
  US: "United States",   PE: "Peru",          HR: "Croatia",
  CH: "Switzerland",     ZA: "South Africa",  DZ: "Algeria",
  DE: "Germany",         GB: "United Kingdom",KR: "South Korea",
  CN: "China",           AR: "Argentina",     CL: "Chile",
  CO: "Colombia",        EG: "Egypt",         KE: "Kenya",
  IS: "Iceland",         NO: "Norway",        SE: "Sweden",
  DK: "Denmark",         FI: "Finland",       PL: "Poland",
  CZ: "Czech Republic",  HU: "Hungary",       RO: "Romania",
  BG: "Bulgaria",        IE: "Ireland",       NL: "Netherlands",
  CU: "Cuba",            JO: "Jordan",        KH: "Cambodia",
  MY: "Malaysia",        PH: "Philippines",   LK: "Sri Lanka",
  NP: "Nepal",           TW: "Taiwan",
  NA: "Namibia",         TZ: "Tanzania",      RW: "Rwanda",
  UG: "Uganda",          GH: "Ghana",         ET: "Ethiopia",
  ZM: "Zambia",          ZW: "Zimbabwe",      MZ: "Mozambique",
  SN: "Senegal",         NG: "Nigeria",       PK: "Pakistan",
  BD: "Bangladesh",      BO: "Bolivia",       PY: "Paraguay",
  UY: "Uruguay",         PA: "Panama",        EC: "Ecuador",
  VE: "Venezuela",       SA: "Saudi Arabia",  QA: "Qatar",
  KW: "Kuwait",          OM: "Oman",          BH: "Bahrain",
  LB: "Lebanon",         IL: "Israel",        IQ: "Iraq",
  IR: "Iran",            KZ: "Kazakhstan",    UZ: "Uzbekistan",
  MN: "Mongolia",        MM: "Myanmar",       LA: "Laos",
  MV: "Maldives",        FJ: "Fiji",          MT: "Malta",
  CY: "Cyprus",          SK: "Slovakia",      SI: "Slovenia",
  RS: "Serbia",          MK: "North Macedonia", MD: "Moldova",
  UA: "Ukraine",         LV: "Latvia",        LT: "Lithuania",
  EE: "Estonia",         LU: "Luxembourg",    BE: "Belgium",
  AT: "Austria",
}

async function callEventbriteAPI(
  countryCode: string,
  startDate:   string,
  endDate:     string
): Promise<any[]> {
  const apiKey = process.env.EVENTBRITE_API_KEY
  if (!apiKey) {
    console.warn("[events] EVENTBRITE_API_KEY not set — returning no events")
    return []
  }

  const locationName = CODE_TO_LOCATION[countryCode] ?? countryCode
  const start = new Date(startDate).toISOString()
  const end   = new Date(endDate).toISOString()

  const url = new URL("https://www.eventbriteapi.com/v3/events/search/")
  url.searchParams.set("start_date.range_start", start)
  url.searchParams.set("start_date.range_end",   end)
  url.searchParams.set("sort_by",                "best")
  url.searchParams.set("expand",                 "category,logo,venue")
  url.searchParams.set("location.address",       locationName)

  console.log(`[events] GET ${url.toString().split("?")[0]} — location="${locationName}" from=${startDate} to=${endDate}`)

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  })

  console.log(`[events] Eventbrite response status: ${res.status}`)

  if (!res.ok) {
    const errText = await res.text()
    console.error(`[events] Eventbrite HTTP ${res.status}: ${errText.slice(0, 300)}`)
    return []
  }

  const data = await res.json()
  const raw: any[] = data.events ?? []
  console.log(`[events] Eventbrite returned ${raw.length} events`)
  return raw
}

function normaliseEvents(raw: any[]): object[] {
  return raw.slice(0, 12).map((e: any) => ({
    id:             String(e.id ?? ""),
    name:           String(e.name?.text ?? e.name ?? ""),
    date:           e.start?.utc
      ? new Date(e.start.utc).toISOString().split("T")[0]
      : "",
    location:       e.venue?.address?.localized_address_display
                    ?? e.venue?.address?.city
                    ?? "",
    description:    (e.description?.text ?? "").substring(0, 200),
    url:            String(e.url ?? ""),
    category:       e.category?.name ?? "Event",
    image:          e.logo?.url ?? undefined,
    relevanceScore: 0.7 + Math.random() * 0.3,
  }))
}

export async function POST(request: NextRequest) {
  try {
    const body: EventRequest = await request.json()
    const { location, countryCode, startDate, endDate } = body

    console.log("[events] Request:", { location, countryCode, startDate, endDate })

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "startDate and endDate are required" },
        { status: 400 }
      )
    }

    // Resolve country code
    let code: string | undefined = countryCode
    if (!code && location) {
      code = COUNTRY_NAME_TO_CODE[location]
        ?? Object.entries(COUNTRY_NAME_TO_CODE).find(
             ([name]) => name.toLowerCase() === location.toLowerCase()
           )?.[1]
    }

    if (!code) {
      console.warn(`[events] Cannot resolve country code for location="${location}" — no events`)
      return NextResponse.json({ events: [], cached: false, count: 0 })
    }

    // Cache check
    const cacheKey = generateCacheKey("events_v2", code, startDate, endDate)
    const cached   = eventCache.get(cacheKey)
    if (cached) {
      console.log("[events] Returning cached events")
      return NextResponse.json({ events: cached, cached: true, count: (cached as any[]).length })
    }

    const raw      = await callEventbriteAPI(code, startDate, endDate)
    const events   = normaliseEvents(raw)

    // Never return fake data — if Eventbrite returned nothing, surface that clearly
    if (events.length === 0) {
      console.log("[events] No live events found for this destination and date range")
      return NextResponse.json({
        events:  [],
        cached:  false,
        count:   0,
        message: "No live events found for this destination and date range",
      })
    }

    eventCache.set(cacheKey, events)

    return NextResponse.json({
      events,
      cached: false,
      count:  events.length,
    })
  } catch (error) {
    console.error("[events] Unhandled error:", error)
    return NextResponse.json({ events: [], cached: false, error: "Events service unavailable" })
  }
}
