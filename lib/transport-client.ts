/**
 * Transport & Mobility data client — server-side only.
 *
 * Priority chain:
 *   1. Transitland  → routes, stops, operators  (TRANSITLAND_API_KEY)
 *   2. Overpass API → transit infrastructure     (OVERPASS_API_URL / OVERPASS_API_URL_BACKUP)
 *   3. OpenRouteService → transport POIs         (OPENROUTESERVICE_API_KEY)
 *   4. Static fallback  → always produces data
 *
 * Geocoding: Nominatim (NOMINATIM_BASE_URL / NOMINATIM_USER_AGENT)
 */

// ─── Exported Types ───────────────────────────────────────────────────────────

export interface TransitRoute {
  id:        string
  name:      string
  shortName?: string
  mode:      "bus" | "metro" | "rail" | "tram" | "ferry" | "cable_car" | "funicular" | "trolleybus" | "other"
  operator?: string
  color?:    string
  headsign?: string
}

export interface TransitStation {
  id:        string
  name:      string
  type:      "airport" | "train_station" | "bus_station" | "metro" | "tram" | "ferry" | "transit"
  lat:       number
  lon:       number
  address?:  string
  openHours?: string
  mapsUrl?:  string
}

export interface TransitOperator {
  id:       string
  name:     string
  website?: string
  modes:    string[]
}

export interface TransportMode {
  mode:         string
  label:        string
  available:    boolean
  description:  string
  ticketPrice?: string
}

export interface TransitLine {
  id:          string
  name:        string
  mode:        string
  color?:      string
  coordinates: { lat: number; lng: number }[]
}

export interface TransportationInfo {
  stations:   TransitStation[]
  routes:     TransitRoute[]
  operators:  TransitOperator[]
  modes:      TransportMode[]
  lines:      TransitLine[]
  dataSource: "transitland" | "overpass" | "ors" | "static"
  summary: {
    airport:     string
    rail:        string
    bus:         string
    metro:       string
    tram:        string
    taxi:        string
    rideSharing: string
    ferry:       string
  }
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

const GTFS_MODE: Record<number, TransitRoute["mode"]> = {
  0: "tram", 1: "metro", 2: "rail", 3: "bus", 4: "ferry",
  5: "cable_car", 6: "cable_car", 7: "funicular",
  11: "trolleybus", 12: "other",
}

function inferStationType(name: string): TransitStation["type"] {
  const n = name.toLowerCase()
  if (n.match(/airport|aerodrome|aeroport|international/)) return "airport"
  if (n.match(/railway|train station|gare|bahnhof|stazione|estación|central station|hauptbahnhof|penn station|grand central/)) return "train_station"
  if (n.match(/bus terminal|bus station|coach|autocarro|autobus/)) return "bus_station"
  if (n.match(/metro|subway|underground|tube|u-bahn|métro|地下鉄|지하철/)) return "metro"
  if (n.match(/tram|streetcar|lrt/)) return "tram"
  if (n.match(/ferry|port|harbour|pier|quay/)) return "ferry"
  return "transit"
}

function inferOverpassType(tags: Record<string, string>): TransitStation["type"] {
  if (tags.aeroway === "aerodrome") return "airport"
  if (tags.railway === "station" || tags.railway === "halt") return "train_station"
  if (tags.amenity === "bus_station") return "bus_station"
  if (tags.railway === "subway_entrance" || tags.station === "subway") return "metro"
  if (tags.railway === "tram_stop") return "tram"
  if (tags.amenity === "ferry_terminal") return "ferry"
  if (tags.public_transport === "station") return "transit"
  return "transit"
}

// ─── Step 0: Geocode city via Nominatim ───────────────────────────────────────

async function geocodeCity(
  city: string,
  country: string,
): Promise<{ lat: number; lon: number } | null> {
  const base  = (process.env.NOMINATIM_BASE_URL  || "https://nominatim.openstreetmap.org").replace(/\/$/, "")
  const agent = process.env.NOMINATIM_USER_AGENT || "iadriven-transport/1.0 (contact@iadriven.com)"
  const q     = `${city}, ${country}`
  const url   = `${base}/search?q=${encodeURIComponent(q)}&format=json&limit=1&addressdetails=0`

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": agent, "Accept-Language": "en" },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    })
    if (!res.ok) {
      console.warn(`[TRANSPORT] Nominatim HTTP ${res.status} for "${q}"`)
      return null
    }
    const data = await res.json()
    const first = data?.[0]
    if (!first) { console.warn(`[TRANSPORT] Nominatim: no result for "${q}"`); return null }
    return { lat: parseFloat(first.lat), lon: parseFloat(first.lon) }
  } catch (err) {
    console.warn("[TRANSPORT] Nominatim error:", err)
    return null
  }
}

// ─── Step 1: Transitland ──────────────────────────────────────────────────────

interface TlResult {
  routes:    TransitRoute[]
  stations:  TransitStation[]
  operators: TransitOperator[]
  lines:     TransitLine[]
  hasData:   boolean
}

async function fetchTransitland(lat: number, lon: number, apiKey: string): Promise<TlResult> {
  const BASE   = "https://transit.land/api/v2/rest"
  const radius = 12_000

  const get = async (path: string) => {
    const url = `${BASE}/${path}&apikey=${encodeURIComponent(apiKey)}`
    const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(12_000) })
    if (!res.ok) throw new Error(`Transitland ${res.status}: ${path}`)
    return res.json()
  }

  // GraphQL query requests the geometry field — returns actual GTFS shapes
  // when the agency's feed includes shapes.txt (null otherwise)
  const gqlQuery = `{
    routes(where: {near: {lat: ${lat}, lon: ${lon}, radius: ${radius}}}, limit: 20) {
      onestop_id
      route_long_name
      route_short_name
      route_type
      route_color
      geometry
      operator { onestop_id name website }
    }
  }`

  const [stopsRes, routesGqlRes, opsRes] = await Promise.allSettled([
    get(`stops?lat=${lat}&lon=${lon}&radius=${radius}&limit=20&per_page=20`),
    fetch(`https://transit.land/api/v2/query?apikey=${encodeURIComponent(apiKey)}`, {
      method:  "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body:    JSON.stringify({ query: gqlQuery }),
      cache:   "no-store",
      signal:  AbortSignal.timeout(15_000),
    }).then(r => { if (!r.ok) throw new Error(`Transitland GraphQL HTTP ${r.status}`); return r.json() }),
    get(`operators?lat=${lat}&lon=${lon}&radius=${radius}&limit=10&per_page=10`),
  ])

  const rawStops = stopsRes.status === "fulfilled" ? (stopsRes.value?.stops     ?? []) : []
  const rawOps   = opsRes.status   === "fulfilled" ? (opsRes.value?.operators   ?? []) : []

  let rawRoutes: any[] = []
  if (routesGqlRes.status === "fulfilled") {
    const gqlData = routesGqlRes.value
    if (gqlData?.errors?.length) {
      console.warn("[TRANSPORT] Transitland GraphQL errors:", gqlData.errors.map((e: any) => e.message).join("; "))
    }
    rawRoutes = gqlData?.data?.routes ?? []
  } else if (routesGqlRes.status === "rejected") {
    console.warn("[TRANSPORT] Transitland GraphQL failed:", routesGqlRes.reason)
  }

  const withGeom = rawRoutes.filter((r: any) => r.geometry != null).length
  console.log(`[TRANSPORT] Transitland GraphQL: ${rawRoutes.length} routes, ${withGeom} with geometry | stops: ${rawStops.length} | operators: ${rawOps.length}`)

  // Geometry type sample for first 3 routes
  for (const r of rawRoutes.slice(0, 3)) {
    const g = r.geometry
    console.log(`[TRANSPORT]   route ${r.onestop_id}: geom type=${g?.type ?? "null"} coord_len=${g?.coordinates?.length ?? 0}`)
  }

  const routes: TransitRoute[] = rawRoutes.slice(0, 15).map((r: any) => ({
    id:        r.onestop_id ?? "",
    name:      r.route_long_name || r.route_short_name || "Route",
    shortName: r.route_short_name || undefined,
    mode:      GTFS_MODE[r.route_type as number] ?? "bus",
    operator:  r.operator?.name ?? undefined,
    color:     r.route_color ? `#${r.route_color.replace(/^#/, "")}` : undefined,
    headsign:  undefined,
  }))

  const stations: TransitStation[] = rawStops.slice(0, 20).map((s: any) => ({
    id:   s.onestop_id ?? String(s.id ?? ""),
    name: s.name ?? "Stop",
    type: inferStationType(s.name ?? ""),
    lat:  s.geometry?.coordinates?.[1] ?? lat,
    lon:  s.geometry?.coordinates?.[0] ?? lon,
  }))

  const operators: TransitOperator[] = rawOps.slice(0, 8).map((o: any) => ({
    id:      o.onestop_id ?? String(o.id ?? ""),
    name:    o.name ?? "Operator",
    website: o.website || undefined,
    modes:   [],
  }))

  // Build TransitLine objects from real GTFS shapes returned by the GraphQL geometry field
  const lines: TransitLine[] = []
  for (const r of rawRoutes.slice(0, 20)) {
    const coords = extractGeoJSONCoords(r.geometry)
    if (coords.length < 2) continue
    lines.push({
      id:          r.onestop_id ?? String(lines.length),
      name:        r.route_long_name || r.route_short_name || "Route",
      mode:        GTFS_MODE[r.route_type as number] ?? "bus",
      color:       r.route_color ? `#${r.route_color.replace(/^#/, "")}` : undefined,
      coordinates: sampleCoords(coords, 300),
    })
  }
  console.log(`[TRANSPORT] Transitland GraphQL lines: ${lines.length}/${rawRoutes.length} routes had valid GTFS shapes`)

  return { routes, stations, operators, lines, hasData: routes.length > 0 || stations.length > 0 }
}

// ─── Shared Overpass mirror client ─────────────────────────────────────────────

async function postToOverpass(query: string): Promise<any> {
  const envPrimary = (process.env.OVERPASS_API_URL        || "").replace(/\/$/, "")
  const envBackup  = (process.env.OVERPASS_API_URL_BACKUP || "").replace(/\/$/, "")

  // Four public mirrors + env overrides; deduplicated and empty-filtered
  const candidates = [
    envPrimary,
    "https://overpass-api.de/api/interpreter",
    "https://lz4.overpass-api.de/api/interpreter",
    "https://z.overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    envBackup,
  ]
  const mirrors = candidates.filter((u, i, arr) => u !== "" && arr.indexOf(u) === i)

  let delay = 300  // ms before trying next mirror after 429

  for (let i = 0; i < mirrors.length; i++) {
    const mirror = mirrors[i]
    const label  = `mirror ${i + 1}/${mirrors.length}`
    try {
      const res = await fetch(mirror, {
        method:  "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent":   "AITripPlanner/1.0 (transit-data-lookup)",
          "Accept":       "application/json",
        },
        body:    `data=${encodeURIComponent(query)}`,
        cache:   "no-store",
        signal:  AbortSignal.timeout(40_000),
      })

      if (res.status === 429) {
        console.warn(`[TRANSPORT] Overpass ${label} failed: HTTP 429 — rate limited, waiting ${delay}ms`)
        if (i < mirrors.length - 1) {
          await new Promise<void>(r => setTimeout(r, delay))
          delay = Math.min(delay * 2, 3_000)
        }
        continue
      }

      if (!res.ok) {
        console.warn(`[TRANSPORT] Overpass ${label} failed: HTTP ${res.status}`)
        continue
      }

      const data = await res.json()
      console.log(`[TRANSPORT] Overpass ${label} succeeded`)
      return data

    } catch (err) {
      console.warn(`[TRANSPORT] Overpass ${label} failed: ${(err as Error).message}`)
    }
  }

  throw new Error("All Overpass mirrors exhausted")
}

// ─── Step 3: OpenRouteService POIs ────────────────────────────────────────────

async function fetchORS(lat: number, lon: number, apiKey: string): Promise<TransitStation[]> {
  try {
    const body = {
      request: "pois",
      geometry: {
        bbox: [[lon - 0.1, lat - 0.1], [lon + 0.1, lat + 0.1]],
        geojson: { type: "Point", coordinates: [lon, lat] },
        buffer: 8000,
      },
      filters: { category_group_ids: [588] }, // Transport POI group
      limit: 20,
    }

    const res = await fetch("https://api.openrouteservice.org/pois", {
      method:  "POST",
      headers: {
        "Authorization": apiKey,
        "Content-Type":  "application/json",
        "Accept":        "application/json",
      },
      body:   JSON.stringify(body),
      cache:  "no-store",
      signal: AbortSignal.timeout(10_000),
    })

    if (!res.ok) {
      console.warn(`[TRANSPORT] ORS routes (POIs) HTTP ${res.status}`)
      return []
    }

    const data     = await res.json()
    const features = data.features ?? []
    console.log(`[TRANSPORT] ORS routes: ${features.length} transport POIs`)

    return features.slice(0, 15).map((f: any, i: number) => ({
      id:   `ors-${i}`,
      name: f.properties?.name || "Transport Hub",
      type: "transit" as const,
      lat:  f.geometry?.coordinates?.[1] ?? lat,
      lon:  f.geometry?.coordinates?.[0] ?? lon,
    }))
  } catch (err) {
    console.warn("[TRANSPORT] ORS error:", err)
    return []
  }
}

// ─── Step 4: Static fallback ──────────────────────────────────────────────────

interface CityProfile {
  metro:     boolean
  tram:      boolean
  rail:      boolean
  ferry:     boolean
  cable:     boolean
  airport:   string
  rail_desc: string
  bus_desc:  string
  metro_desc: string
  tram_desc: string
  taxi:      string
  rideshare: string
  ferry_desc: string
  ticket?:   string
}

const CITY_PROFILES: Record<string, CityProfile> = {
  paris: {
    metro: true, tram: true, rail: true, ferry: true, cable: false,
    airport:    "Charles de Gaulle (CDG) — 30 min by RER B; Orly (ORY) — 35 min by Orlyval",
    rail_desc:  "RER lines A–E connect inner Paris to suburbs and airports",
    bus_desc:   "RATP bus network — 300+ lines; Noctilien night buses",
    metro_desc: "16 metro lines covering all arrondissements; runs 05:30–01:15",
    tram_desc:  "9 tram lines on Paris ring roads and suburbs",
    taxi:       "G7, Taxi Bleu — metered, regulated fares",
    rideshare:  "Uber, Bolt, Kapten, Heetch",
    ferry_desc: "Batobus Seine river bus — 8 stops, €5 one-way",
    ticket:     "t+ ticket €2.15 | Navigo Day €8.65 | Navigo Month €86.40",
  },
  london: {
    metro: true, tram: true, rail: true, ferry: true, cable: true,
    airport:    "Heathrow (LHR) — 50 min by Tube (Piccadilly); Gatwick (LGW) — 30 min by Gatwick Express",
    rail_desc:  "National Rail + Elizabeth line + Overground — extensive suburban coverage",
    bus_desc:   "TfL bus network — 700+ routes; 24-hour Night Bus service",
    metro_desc: "London Underground — 11 lines, 272 stations; runs ~05:00–00:30",
    tram_desc:  "Croydon Tramlink — 3 lines in south London",
    taxi:       "Black Cabs — metered, highly regulated; hail or book via apps",
    rideshare:  "Uber, Bolt, FREE NOW, Gett",
    ferry_desc: "Thames Clipper river buses — Embankment to Woolwich",
    ticket:     "Oyster/contactless — Zone 1-2 cap £8.10/day; 7-day £40.70",
  },
  tokyo: {
    metro: true, tram: false, rail: true, ferry: false, cable: false,
    airport:    "Narita (NRT) — 60 min by Narita Express; Haneda (HND) — 30 min by Keikyu/Monorail",
    rail_desc:  "JR East extensive rail network including Yamanote and Chuo lines",
    bus_desc:   "Tokyo Bus Association network — complementing rail in outer areas",
    metro_desc: "Tokyo Metro + Toei Subway — 13 lines, 285 stations; runs ~05:00–00:30",
    tram_desc:  "Tram not widely available; Toei Arakawa line limited coverage",
    taxi:       "Japan Taxi, Nihon Kotsu — metered; relatively expensive",
    rideshare:  "Uber (limited), GO taxi app, DiDi",
    ferry_desc: "Ferry services not primary — use rail",
    ticket:     "IC card (Suica/Pasmo) recommended — tap in/out; from ¥140/ride",
  },
  dubai: {
    metro: true, tram: true, rail: false, ferry: true, cable: false,
    airport:    "Dubai International (DXB) — 15 min by Metro (Red Line Terminal 1/3)",
    rail_desc:  "No intercity rail — use Metro or taxi for city travel",
    bus_desc:   "RTA bus network — 100+ routes; less common than Metro/taxi",
    metro_desc: "Dubai Metro — Red & Green lines; 47 stations; runs 05:00–00:00 (Fri until 01:00)",
    tram_desc:  "Dubai Tram — 11 stops linking Marina to Al Sufouh",
    taxi:       "RTA Taxis — metered, affordable; easily available",
    rideshare:  "Careem, Uber — widely used",
    ferry_desc: "Abra water taxis on Dubai Creek — AED 1; Dubai Ferry routes",
    ticket:     "Nol card — Silver card AED 25; Metro Red Line Day Pass AED 22",
  },
  rome: {
    metro: true, tram: true, rail: true, ferry: false, cable: false,
    airport:    "Fiumicino (FCO) — 30 min by Leonardo Express (€14); Ciampino (CIA) — bus transfer",
    rail_desc:  "Trenitalia regional trains from Termini — connections to Naples, Florence",
    bus_desc:   "ATAC bus network — 300+ routes; night buses (n-lines) until 05:00",
    metro_desc: "2 Metro lines (A & B) — 73 stations; runs 05:30–23:30 (Fri/Sat until 01:30)",
    tram_desc:  "5 tram lines — useful for Trastevere, Gianicolo, and eastern Rome",
    taxi:       "Radio Taxi 3570 — metered; licensed white taxis only",
    rideshare:  "Uber (limited), FREE NOW, itTaxi",
    ferry_desc: "Ferry not applicable for city — use bus or metro",
    ticket:     "Single ticket €1.50 (valid 100 min) | 24h pass €7 | 48h pass €12.50",
  },
  barcelona: {
    metro: true, tram: true, rail: true, ferry: true, cable: false,
    airport:    "El Prat (BCN) — 35 min by Aerobus or 30 min by Metro L9 Sud",
    rail_desc:  "FGC + Renfe Rodalies suburban rail connecting greater Barcelona",
    bus_desc:   "TMB bus network — extensive; Bus Turístic for tourists",
    metro_desc: "8 Metro lines — 159 stations; runs Mon-Thu 05:00–00:00, Fri until 02:00, Sat 24h",
    tram_desc:  "Trambaix & Trambesòs — 6 lines on the city's east and west corridors",
    taxi:       "Fono Taxi, Radio Taxi — metered; abundant at taxi ranks",
    rideshare:  "Uber, Bolt, Cabify, FREE NOW",
    ferry_desc: "Golondrinas harbour tours; ferry to Mallorca from Barcelona Port",
    ticket:     "T-Casual (10 trips) €11.35 | T-Day €10.80 | Single €2.40",
  },
  "new york": {
    metro: true, tram: false, rail: true, ferry: true, cable: false,
    airport:    "JFK — 45 min by AirTrain+Subway; LaGuardia (LGA) — M60 bus; Newark (EWR) — NJ Transit",
    rail_desc:  "Metro-North, LIRR, NJ Transit suburban rail from Grand Central / Penn Station",
    bus_desc:   "MTA bus — extensive network covering all 5 boroughs; Select Bus Service (SBS)",
    metro_desc: "NYC Subway — 36 lines, 472 stations; 24/7 operation",
    tram_desc:  "Roosevelt Island Tramway — aerial tram connecting Manhattan to Roosevelt Island",
    taxi:       "Yellow Cabs — metered; hail on the street or use apps",
    rideshare:  "Uber, Lyft, Via",
    ferry_desc: "NYC Ferry — 7 routes; East River, Brooklyn, Rockaway; $2.90/ride",
    ticket:     "OMNY contactless — $2.90/ride; 7-Day Unlimited MetroCard $34",
  },
  amsterdam: {
    metro: true, tram: true, rail: true, ferry: true, cable: false,
    airport:    "Schiphol (AMS) — 15 min by direct train to Amsterdam Centraal",
    rail_desc:  "NS intercity and sprinter trains from Amsterdam Centraal",
    bus_desc:   "GVB bus network complementing tram and metro",
    metro_desc: "GVB Metro — 4 lines including North-South line; runs ~06:00–00:30",
    tram_desc:  "GVB Tram — 15 lines; primary city transport alongside cycling",
    taxi:       "TCA Taxicentrale — metered; Schiphol Taxi regulated",
    rideshare:  "Uber, Bolt, Snappcar",
    ferry_desc: "GVB free ferries across IJ waterway — Central Station to Noord",
    ticket:     "GVB single €4.00 | 1-day pass €9.00 | OV-chipkaart recommended",
  },
  istanbul: {
    metro: true, tram: true, rail: true, ferry: true, cable: false,
    airport:    "Istanbul Airport (IST) — 30 min by Havaist bus; Sabiha Gökçen (SAW) — 60 min by bus",
    rail_desc:  "Marmaray commuter rail under the Bosphorus — connects Europe to Asia",
    bus_desc:   "IETT bus network — 500+ routes; metrobüs BRT on E-5 highway",
    metro_desc: "Istanbul Metro — 11 lines, 100+ stations; also includes Tünel funicular",
    tram_desc:  "T1 Tram (Kabataş-Bağcılar) — historic route through Sultanahmet and Beyoğlu",
    taxi:       "iTaksi app recommended; metered yellow taxis widely available",
    rideshare:  "Uber, BiTaksi, Volt",
    ferry_desc: "IDO ferries — Bosphorus crossings, Princes' Islands, Asian shore",
    ticket:     "Istanbulkart recommended — ₺17/ride discounted; ₺25 regular",
  },
  singapore: {
    metro: true, tram: false, rail: true, ferry: true, cable: false,
    airport:    "Changi Airport (SIN) — 30 min by MRT (East-West Line)",
    rail_desc:  "MRT heavy rail + LRT feeder lines — 6 MRT lines",
    bus_desc:   "SBS Transit & SMRT Buses — 300+ routes; comprehensive coverage",
    metro_desc: "MRT — 6 lines, 130 stations; runs 05:30–00:30",
    tram_desc:  "Tram not available — LRT feeders at Bukit Panjang, Sengkang, Punggol",
    taxi:       "Comfort DelGro, SMRT Taxis — metered; abundant",
    rideshare:  "Grab, Gojek, Ryde",
    ferry_desc: "Ferry to Sentosa, Batam, Bintan from HarbourFront",
    ticket:     "EZ-Link or NETS FlashPay card — from S$0.83/ride; fare by distance",
  },
  bangkok: {
    metro: true, tram: false, rail: true, ferry: true, cable: false,
    airport:    "Suvarnabhumi (BKK) — 30 min by Airport Rail Link; Don Mueang (DMK) — bus transfer",
    rail_desc:  "SRT rail and Airport Rail Link; regional trains from Hua Lamphong",
    bus_desc:   "BMTA bus — 200+ routes; AC and non-AC options; affordable",
    metro_desc: "BTS Skytrain (2 lines) + MRT Blue/Purple Lines + Gold Line — 90+ stations",
    tram_desc:  "Tram not available in Bangkok",
    taxi:       "Licensed metered taxis — reasonable; insist on meter use",
    rideshare:  "Grab — dominant; also Bolt",
    ferry_desc: "Chao Phraya Express Boat — river ferries; Khlong Saen Saep canal boats",
    ticket:     "BTS Rabbit Card; MRT stored-value card; day passes available for tourists",
  },
  berlin: {
    metro: true, tram: true, rail: true, ferry: true, cable: false,
    airport:    "Berlin Brandenburg (BER) — 30 min by S-Bahn S9/S45 or FEX Express",
    rail_desc:  "S-Bahn rapid transit + Deutsche Bahn regional — 15 S-Bahn lines",
    bus_desc:   "BVG bus — 150+ regular lines; 60+ night bus lines (N-lines)",
    metro_desc: "U-Bahn — 10 lines, 175 stations; runs daily until midnight (24h Fri/Sat)",
    tram_desc:  "Tram — primarily in east Berlin; 22 lines",
    taxi:       "Taxi Berlin — metered; €1.90/km within city",
    rideshare:  "Uber, Bolt, FREE NOW, BVG Jelbi (multimodal)",
    ferry_desc: "BVG ferry F10 on Lake Wannsee and Müggelsee",
    ticket:     "AB zone single €3.20 | 24h ticket €9.90 | 7-day €36.00",
  },
}

function getProfile(city: string): CityProfile | null {
  const key = city.toLowerCase().trim()
  return CITY_PROFILES[key] ?? null
}

function buildStaticModes(profile: CityProfile | null, city: string): TransportMode[] {
  const p = profile
  return [
    {
      mode: "bus", label: "City Bus", available: true,
      description: p?.bus_desc ?? `City bus network serving ${city}. Covers main urban routes.`,
      ticketPrice: p?.ticket ?? undefined,
    },
    {
      mode: "metro", label: "Metro / Subway", available: p?.metro ?? false,
      description: p?.metro_desc ?? (p ? `Metro not available in ${city}.` : `Check local transport apps for metro availability.`),
    },
    {
      mode: "rail", label: "Regional Rail", available: p?.rail ?? false,
      description: p?.rail_desc ?? `Regional rail connections from the main city station.`,
    },
    {
      mode: "tram", label: "Tram", available: p?.tram ?? false,
      description: p?.tram_desc ?? (p?.tram ? `Tram network serving urban corridors.` : `Tram not available.`),
    },
    {
      mode: "ferry", label: "Ferry", available: p?.ferry ?? false,
      description: p?.ferry_desc ?? `Waterborne transport — check local operators.`,
    },
    {
      mode: "taxi", label: "Taxi", available: true,
      description: p?.taxi ?? `Licensed taxis available throughout the city.`,
    },
    {
      mode: "rideshare", label: "Ride Sharing", available: true,
      description: p?.rideshare ?? `Uber, Bolt, or local ride-hailing apps available.`,
    },
  ]
}

export function buildStaticTransportSummary(city: string, country: string): TransportationInfo {
  const profile = getProfile(city)
  const modes   = buildStaticModes(profile, city)

  console.log(`[TRANSPORT] Final transportation dataset: static fallback for "${city}, ${country}" | profile: ${profile ? "matched" : "generic"} | routes=0 lines=0 stations=0`)

  return {
    stations:   [],
    routes:     [],
    operators:  [],
    modes,
    lines:      [],
    dataSource: "static",
    summary: {
      airport:     profile?.airport     ?? `Nearest international airport — check local listings`,
      rail:        profile?.rail_desc   ?? `Regional rail from main city station`,
      bus:         profile?.bus_desc    ?? `City bus network covering main routes`,
      metro:       profile?.metro_desc  ?? (profile?.metro ? "Metro available" : "Metro not available"),
      tram:        profile?.tram_desc   ?? (profile?.tram  ? "Tram available"  : "Tram not available"),
      taxi:        profile?.taxi        ?? `Licensed taxis available throughout the city`,
      rideSharing: profile?.rideshare   ?? `Uber, Bolt, or local ride-hailing apps`,
      ferry:       profile?.ferry_desc  ?? (profile?.ferry ? "Ferry services available" : "Ferry not applicable"),
    },
  }
}

// ─── GeoJSON coordinate helpers ───────────────────────────────────────────────

function extractGeoJSONCoords(
  geom: { type: string; coordinates?: any; geometries?: any[] } | null | undefined,
): { lat: number; lng: number }[] {
  if (!geom) return []
  const out: { lat: number; lng: number }[] = []

  if (geom.type === "LineString") {
    for (const [lon, lat] of geom.coordinates ?? []) {
      if (typeof lat === "number" && typeof lon === "number") out.push({ lat, lng: lon })
    }
  } else if (geom.type === "MultiLineString") {
    for (const segment of geom.coordinates ?? []) {
      for (const [lon, lat] of segment) {
        if (typeof lat === "number" && typeof lon === "number") out.push({ lat, lng: lon })
      }
    }
  } else if (geom.type === "GeometryCollection") {
    for (const sub of geom.geometries ?? []) {
      out.push(...extractGeoJSONCoords(sub))
    }
  }
  return out
}

function sampleCoords(
  coords: { lat: number; lng: number }[],
  max: number,
): { lat: number; lng: number }[] {
  if (coords.length <= max) return coords
  const step = Math.ceil(coords.length / max)
  return coords.filter((_, i) => i % step === 0)
}

// Removes coordinates outside radiusM of (lat, lon) and splits the remaining
// points into contiguous segments.  Preserves all line metadata (name, mode, color).
// Overpass returns full route-relation geometry which can extend dozens of km outside
// the destination — this clips each line to only the portion near the city.
function clipLinesToRadius(
  lines:   TransitLine[],
  lat:     number,
  lon:     number,
  radiusM: number,
): TransitLine[] {
  const cosLat  = Math.cos((lat * Math.PI) / 180)
  const r2      = radiusM * radiusM

  const inRange = (p: { lat: number; lng: number }) => {
    const dy = (p.lat - lat) * 111_320
    const dx = (p.lng - lon) * 111_320 * cosLat
    return dy * dy + dx * dx <= r2
  }

  const out: TransitLine[] = []

  for (const line of lines) {
    const segments: { lat: number; lng: number }[][] = []
    let seg: { lat: number; lng: number }[] = []

    for (const pt of line.coordinates) {
      if (inRange(pt)) {
        seg.push(pt)
      } else {
        if (seg.length >= 2) segments.push(seg)
        seg = []
      }
    }
    if (seg.length >= 2) segments.push(seg)

    if (segments.length === 0) continue

    for (let i = 0; i < segments.length; i++) {
      out.push({
        id:          segments.length > 1 ? `${line.id}-clip${i}` : line.id,
        name:        line.name,
        mode:        line.mode,
        color:       line.color,
        coordinates: segments[i],
      })
    }
  }

  return out
}

const OVERPASS_MODE_COLOR: Record<string, string> = {
  bus:    "#16A34A",
  tram:   "#EA580C",
  subway: "#2563EB",
  train:  "#9333EA",
  ferry:  "#0891B2",
}

// ─── Step 2b: Overpass route relations ─────────────────────────────────────────

function overpassMode(routeType: string): string {
  if (routeType === "subway") return "metro"
  if (routeType === "light_rail" || routeType === "monorail" || routeType === "rail") return "rail"
  if (routeType === "trolleybus") return "bus"
  return routeType
}

// Assembles OSM way segments into continuous chains.
// Each way may be stored in either direction relative to the route; this function
// reverses ways as needed and breaks into separate chains on genuine gaps.
function stitchWaySegments(
  wayGeoms: { lat: number; lng: number }[][],
): { lat: number; lng: number }[][] {
  // ~22 m — OSM junction nodes are identical lat/lon; small threshold handles float noise
  const SNAP = 0.0002
  const near = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) =>
    Math.abs(a.lat - b.lat) < SNAP && Math.abs(a.lng - b.lng) < SNAP

  const chains: { lat: number; lng: number }[][] = []
  let chain: { lat: number; lng: number }[] = []

  for (const pts of wayGeoms) {
    if (pts.length < 2) continue

    if (chain.length === 0) {
      chain = [...pts]
      continue
    }

    const tail  = chain[chain.length - 1]
    const wHead = pts[0]
    const wTail = pts[pts.length - 1]

    if (near(tail, wHead)) {
      chain.push(...pts.slice(1))                      // forward — skip shared junction
    } else if (near(tail, wTail)) {
      chain.push(...[...pts].reverse().slice(1))       // reversed — skip shared junction
    } else {
      chains.push(chain)                               // genuine gap — new chain
      chain = [...pts]
    }
  }

  if (chain.length >= 2) chains.push(chain)
  return chains
}

function buildLinesFromInlineGeom(relations: any[]): TransitLine[] {
  const lines: TransitLine[] = []
  const seen  = new Set<string>()

  for (const el of relations.slice(0, 15)) {
    const routeType = el.tags?.route ?? "bus"
    const name      = el.tags?.name || el.tags?.ref || `${routeType}-${el.id}`
    if (seen.has(name)) continue
    seen.add(name)

    const rawColor = el.tags?.colour || el.tags?.color || OVERPASS_MODE_COLOR[routeType] || "#6B7280"
    const color    = rawColor.startsWith("#") ? rawColor : `#${rawColor}`
    const mode     = overpassMode(routeType)

    // Collect each OSM way as its own segment — do NOT concatenate yet
    const wayGeoms: { lat: number; lng: number }[][] = []
    for (const member of (el.members ?? []).slice(0, 500)) {
      if (member.type !== "way" || !Array.isArray(member.geometry)) continue
      const pts: { lat: number; lng: number }[] = []
      for (const pt of member.geometry) {
        if (typeof pt.lat === "number" && typeof pt.lon === "number") pts.push({ lat: pt.lat, lng: pt.lon })
      }
      if (pts.length >= 2) wayGeoms.push(pts)
    }
    if (wayGeoms.length === 0) continue

    const chains = stitchWaySegments(wayGeoms)
    for (let idx = 0; idx < chains.length; idx++) {
      const chain = chains[idx]
      if (chain.length < 2) continue
      lines.push({
        id:          `osm-${el.id}${chains.length > 1 ? `-seg${idx}` : ""}`,
        name,
        mode,
        color,
        coordinates: sampleCoords(chain, 300),
      })
    }
  }
  return lines
}

function buildLinesFromRecursive(elements: any[]): TransitLine[] {
  const nodeMap = new Map<number, { lat: number; lng: number }>()
  const wayMap  = new Map<number, number[]>()

  for (const el of elements) {
    if (el.type === "node" && typeof el.lat === "number") {
      nodeMap.set(el.id, { lat: el.lat, lng: el.lon })
    } else if (el.type === "way" && Array.isArray(el.nodes)) {
      wayMap.set(el.id, el.nodes)
    }
  }

  const relations = elements.filter((e: any) => e.type === "relation")
  console.log(`[TRANSPORT] Overpass recursive parsed: ${relations.length} rels / ${wayMap.size} ways / ${nodeMap.size} nodes`)

  const lines: TransitLine[] = []
  const seen  = new Set<string>()

  for (const el of relations.slice(0, 10)) {
    const routeType = el.tags?.route ?? "bus"
    const name      = el.tags?.name || el.tags?.ref || `${routeType}-${el.id}`
    if (seen.has(name)) continue
    seen.add(name)

    const rawColor = el.tags?.colour || el.tags?.color || OVERPASS_MODE_COLOR[routeType] || "#6B7280"
    const color    = rawColor.startsWith("#") ? rawColor : `#${rawColor}`
    const mode     = overpassMode(routeType)

    // Collect each OSM way as its own segment — do NOT concatenate yet
    const wayGeoms: { lat: number; lng: number }[][] = []
    for (const member of (el.members ?? []).slice(0, 300)) {
      if (member.type !== "way") continue
      const nodeIds = wayMap.get(member.ref) ?? []
      const pts: { lat: number; lng: number }[] = []
      for (const nid of nodeIds) {
        const pt = nodeMap.get(nid)
        if (pt) pts.push(pt)
      }
      if (pts.length >= 2) wayGeoms.push(pts)
    }
    if (wayGeoms.length === 0) continue

    const chains = stitchWaySegments(wayGeoms)
    for (let idx = 0; idx < chains.length; idx++) {
      const chain = chains[idx]
      if (chain.length < 2) continue
      lines.push({
        id:          `osm-${el.id}${chains.length > 1 ? `-seg${idx}` : ""}`,
        name,
        mode,
        color,
        coordinates: sampleCoords(chain, 300),
      })
    }
  }

  console.log(`[TRANSPORT] Overpass recursive polylines: ${lines.length}`)
  return lines
}

async function fetchOverpassRouteLines(lat: number, lon: number): Promise<TransitLine[]> {
  const d    = 0.12
  const bbox = `${lat - d},${lon - d},${lat + d},${lon + d}`

  // ── Attempt 1: out geom — embeds way-member geometry inline ──────────────────
  const inlineQuery = `[out:json][timeout:40];
(
  relation["type"="route"]["route"~"^(bus|tram|subway|train|ferry|light_rail|rail|monorail|trolleybus)$"](${bbox});
);
out geom 15;`

  let raw1: any = null
  try { raw1 = await postToOverpass(inlineQuery) }
  catch (e) { console.warn("[TRANSPORT] Overpass inline all mirrors failed:", (e as Error).message) }

  const allElems1: any[] = raw1?.elements ?? []
  if (raw1?.remark) console.warn("[TRANSPORT] Overpass inline remark:", raw1.remark)
  console.log(`[TRANSPORT] Overpass inline: ${allElems1.length} elements (reachable=${!!raw1})`)

  const rels1: any[] = allElems1.filter((e: any) => e.type === "relation")
  console.log(`[TRANSPORT] Overpass inline relations: ${rels1.length}`)

  if (rels1.length > 0) {
    const fr       = rels1[0]
    const wayMems  = (fr.members ?? []).filter((m: any) => m.type === "way")
    const withGeom = wayMems.filter((m: any) => Array.isArray(m.geometry) && m.geometry.length > 0)
    console.log(`[TRANSPORT] First relation "${fr.tags?.name ?? fr.tags?.ref ?? fr.id}": ${wayMems.length} way-members, ${withGeom.length} with inline geometry`)
  }

  const lines1 = clipLinesToRadius(buildLinesFromInlineGeom(rels1), lat, lon, 14_000)
  console.log(`[TRANSPORT] Overpass inline polylines: ${lines1.length} (after clip)`)
  if (lines1.length > 0) return lines1

  // ── Attempt 2: recursive — resolve ways→nodes→coords ─────────────────────────
  const d2    = 0.06
  const bbox2 = `${lat - d2},${lon - d2},${lat + d2},${lon + d2}`
  const recursiveQuery = `[out:json][timeout:50];
(
  relation["type"="route"]["route"~"^(bus|tram|subway|train|ferry|light_rail|rail|monorail|trolleybus)$"](${bbox2});
);
out body 10;
>;
out skel qt;`

  let raw2: any = null
  try { raw2 = await postToOverpass(recursiveQuery) }
  catch (e) {
    console.warn("[TRANSPORT] Overpass recursive all mirrors failed:", (e as Error).message)
    return []
  }
  if (raw2?.remark) console.warn("[TRANSPORT] Overpass recursive remark:", raw2.remark)

  const elems2: any[] = raw2?.elements ?? []
  console.log(`[TRANSPORT] Overpass recursive: ${elems2.length} total elements`)

  return clipLinesToRadius(buildLinesFromRecursive(elems2), lat, lon, 14_000)
}

// ─── Combined station + route query (one Overpass call, no duplicates) ────────

async function fetchOverpassFull(lat: number, lon: number): Promise<{
  stations: TransitStation[]
  lines:    TransitLine[]
}> {
  const d1    = 0.20   // ~22 km — airports
  const d2    = 0.12   // ~13 km — stations
  const dLine = 0.10   // ~11 km — route relations (tighter keeps query fast)
  const bb1   = `${lat - d1},${lon - d1},${lat + d1},${lon + d1}`
  const bb2   = `${lat - d2},${lon - d2},${lat + d2},${lon + d2}`
  const bbL   = `${lat - dLine},${lon - dLine},${lat + dLine},${lon + dLine}`

  const query = `[out:json][timeout:50];
(
  relation["type"="route"]["route"~"^(bus|tram|subway|train|ferry|light_rail|rail|monorail|trolleybus)$"](${bbL});
  node["aeroway"="aerodrome"](${bb1});
  way["aeroway"="aerodrome"](${bb1});
  node["railway"="station"](${bb2});
  node["railway"="halt"](${bb2});
  node["amenity"="bus_station"](${bb2});
  node["railway"="subway_entrance"](${bb2});
  node["railway"="tram_stop"](${bb2});
  node["amenity"="ferry_terminal"](${bb2});
  node["public_transport"="station"](${bb2});
);
out geom 80;`

  let raw: any
  try { raw = await postToOverpass(query) }
  catch (e) {
    console.warn("[TRANSPORT] Overpass combined all mirrors failed:", (e as Error).message)
    return { stations: [], lines: [] }
  }
  if (raw?.remark) console.warn("[TRANSPORT] Overpass combined remark:", raw.remark)

  const elements: any[] = raw?.elements ?? []
  const relations = elements.filter((e: any) => e.type === "relation")
  const nodeElems = elements.filter((e: any) => e.type === "node" || e.type === "way")

  const rawLines = buildLinesFromInlineGeom(relations)
  const lines    = clipLinesToRadius(rawLines, lat, lon, 14_000)

  const seen: Set<string> = new Set()
  const stations: TransitStation[] = []
  for (const el of nodeElems) {
    const name = el.tags?.name || el.tags?.["name:en"] || ""
    if (!name || seen.has(name.toLowerCase())) continue
    seen.add(name.toLowerCase())
    stations.push({
      id:      `osm-${el.id}`,
      name,
      type:    inferOverpassType(el.tags ?? {}),
      lat:     el.lat ?? el.center?.lat ?? lat,
      lon:     el.lon ?? el.center?.lon ?? lon,
      address: [el.tags?.["addr:street"], el.tags?.["addr:city"]].filter(Boolean).join(", ") || undefined,
    })
  }

  console.log(`[TRANSPORT] Overpass combined: ${relations.length} relations → ${rawLines.length} lines → ${lines.length} after clip, ${stations.length} stations`)
  return { stations, lines }
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────

export async function fetchTransportData(
  city:    string,
  country: string,
): Promise<TransportationInfo> {
  // Always build static base (guaranteed non-empty)
  const staticBase = buildStaticTransportSummary(city, country)

  // Geocode
  const coords = await geocodeCity(city, country)
  if (!coords) {
    console.log("[TRANSPORT] Nominatim failed — using static fallback")
    return staticBase
  }

  const { lat, lon } = coords
  const tlKey  = process.env.TRANSITLAND_API_KEY
  const orsKey = process.env.OPENROUTESERVICE_API_KEY

  // ── Priority 1: Transitland ──────────────────────────────────────────────
  if (tlKey) {
    try {
      const tl = await fetchTransitland(lat, lon, tlKey)
      if (tl.hasData) {
        const modes  = buildStaticModes(getProfile(city), city)

        // Geometry from GraphQL; fall back to Overpass if Transitland returned no shapes
        let lines = tl.lines
        if (lines.length === 0) {
          lines = await fetchOverpassRouteLines(lat, lon).catch(() => [] as TransitLine[])
        }

        const linesFromOverpass = tl.lines.length === 0 && lines.length > 0
        const validLines = lines.filter(l => l.coordinates.length >= 2)
        console.log(
          `[TRANSPORT] Final: meta=transitland lines_source=${linesFromOverpass ? "overpass" : "transitland"} ` +
          `routes=${tl.routes.length} lines=${lines.length} validLines=${validLines.length} stations=${tl.stations.length}`
        )
        for (const l of lines.slice(0, 3)) {
          console.log(`[TRANSPORT]   line "${l.name}" mode=${l.mode} coords=${l.coordinates.length} firstCoord=${JSON.stringify(l.coordinates[0])}`)
        }
        return {
          stations:   tl.stations,
          routes:     tl.routes,
          operators:  tl.operators,
          modes,
          lines,
          dataSource: linesFromOverpass ? "overpass" : "transitland",
          summary:    staticBase.summary,
        }
      }
    } catch (err) {
      console.warn("[TRANSPORT] Transitland error:", err)
    }
  } else {
    console.log("[TRANSPORT] TRANSITLAND_API_KEY not set — skipping")
  }

  // ── Priority 2: Overpass (single combined call — no duplicate mirror hits) ──
  try {
    const { stations, lines } = await fetchOverpassFull(lat, lon)
    if (stations.length > 0 || lines.length > 0) {
      const modes = buildStaticModes(getProfile(city), city)
      console.log(`[TRANSPORT] Final: source=overpass lines=${lines.length} stations=${stations.length}`)
      return {
        stations,
        routes:     [],
        operators:  [],
        modes,
        lines,
        dataSource: "overpass",
        summary:    staticBase.summary,
      }
    }
  } catch (err) {
    console.warn("[TRANSPORT] Overpass error:", err)
  }

  // ── Priority 3: ORS ─────────────────────────────────────────────────────
  if (orsKey) {
    try {
      const stations = await fetchORS(lat, lon, orsKey)
      if (stations.length > 0) {
        const modes = buildStaticModes(getProfile(city), city)
        console.log(
          `[TRANSPORT] Final transportation dataset: source=ors | ` +
          `routes=0 lines=0 stations=${stations.length}`
        )
        return {
          stations,
          routes:     [],
          operators:  [],
          modes,
          lines:      [],
          dataSource: "ors",
          summary:    staticBase.summary,
        }
      }
    } catch (err) {
      console.warn("[TRANSPORT] ORS error:", err)
    }
  } else {
    console.log("[TRANSPORT] OPENROUTESERVICE_API_KEY not set — skipping")
  }

  // ── Priority 4: Static ──────────────────────────────────────────────────
  return staticBase
}
