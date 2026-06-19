/**
 * OpenTripMap API client — server-side only.
 *
 * Provides attraction / activity search by city using:
 *   1. Geoname lookup  → resolve city name to lat/lon
 *   2. Radius search   → fetch top attractions within 10 km
 *   3. XID detail      → enrich top-5 results with descriptions & preview images
 *
 * Required env var: OPENTRIPMAP_API_KEY
 * Docs: https://dev.opentripmap.org/docs
 */

import type { GooglePlaceActivity } from "@/lib/google-places"

const OTM_BASE = "https://api.opentripmap.com/0.1/en/places"

// Attraction kinds to request (comma-separated)
const ATTRACTION_KINDS = [
  "cultural",
  "historic",
  "museums",
  "architecture",
  "natural",
  "tourist_facilities",
  "religion",
].join(",")

// Raw shapes from OpenTripMap
interface OtmGeoname {
  name?:    string
  country?: string
  lat:      number
  lon:      number
  status?:  string
}

interface OtmRadiusPlace {
  xid:   string
  name:  string
  rate:  number
  kinds: string
  dist?: number
  point: { lon: number; lat: number }
}

interface OtmDetail {
  xid:                  string
  name?:                string
  kinds?:               string
  point?:               { lon: number; lat: number }
  wikipedia_extracts?:  { title?: string; text?: string }
  preview?:             { source: string; height?: number; width?: number }
  image?:               string
}

// Step 1: resolve city to coordinates
async function fetchGeoname(
  city:   string,
  apiKey: string,
): Promise<{ lat: number; lon: number } | null> {
  const url = `${OTM_BASE}/geoname?name=${encodeURIComponent(city)}&apikey=${apiKey}`
  console.log(`[OpenTripMap] Geoname GET ${url.slice(0, 120)}`)

  try {
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) {
      console.error(`[OpenTripMap] Geoname HTTP ${res.status}`)
      return null
    }
    const data: OtmGeoname = await res.json()
    if (data.status === "NOT_FOUND" || !data.lat || !data.lon) {
      console.warn(`[OpenTripMap] Geoname not found for "${city}"`)
      return null
    }
    return { lat: data.lat, lon: data.lon }
  } catch (err) {
    console.error("[OpenTripMap] Geoname error:", err)
    return null
  }
}

// Step 3: fetch detail for a single XID
async function fetchXidDetail(
  xid:    string,
  apiKey: string,
): Promise<OtmDetail | null> {
  try {
    const res = await fetch(`${OTM_BASE}/xid/${xid}?apikey=${apiKey}`, { cache: "no-store" })
    if (!res.ok) return null
    return (await res.json()) as OtmDetail
  } catch {
    return null
  }
}

// Map OTM 1–7 rate scale → 0–5 for display
function normaliseRate(rate: number): number {
  return +(Math.min((rate / 7) * 5, 5)).toFixed(1)
}

function formatKind(raw: string): string {
  return raw
    .split(",")[0]
    .trim()
    .replace(/_/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase())
}

export async function fetchOpenTripMapActivities(
  city:         string,
  countryName?: string,
): Promise<GooglePlaceActivity[]> {
  const apiKey = process.env.OPENTRIPMAP_API_KEY
  if (!apiKey) {
    console.warn("[OpenTripMap] OPENTRIPMAP_API_KEY not set — skipping")
    return []
  }

  try {
    // Step 1: geoname
    const coords = await fetchGeoname(city, apiKey)
    if (!coords) return []

    // Step 2: radius search
    const params = new URLSearchParams({
      radius:  "10000",
      lon:     String(coords.lon),
      lat:     String(coords.lat),
      kinds:   ATTRACTION_KINDS,
      rate:    "3",     // minimum importance (1–7 OTM scale)
      format:  "json",
      limit:   "15",
      apikey:  apiKey,
    })

    const url = `${OTM_BASE}/radius?${params}`
    console.log(`[OpenTripMap] Radius GET ${url.slice(0, 120)}...`)

    const res = await fetch(url, { cache: "no-store" })
    console.log(`[OpenTripMap] Radius status: ${res.status}`)

    if (!res.ok) {
      console.error(`[OpenTripMap] Radius HTTP ${res.status}`)
      return []
    }

    const places: unknown = await res.json()
    if (!Array.isArray(places)) {
      console.error("[OpenTripMap] Unexpected radius response shape")
      return []
    }

    const typed = places as OtmRadiusPlace[]
    const named = typed.filter(p => p.name?.trim())
    console.log(`[OpenTripMap] "${city}" → ${named.length} named attractions`)

    // Sort by importance descending; take top 10
    const top = named
      .sort((a, b) => (b.rate ?? 0) - (a.rate ?? 0))
      .slice(0, 10)

    // Step 3: enrich top 5 with descriptions + preview images
    const detailSlice  = top.slice(0, 5)
    const detailResults = await Promise.allSettled(
      detailSlice.map(p => fetchXidDetail(p.xid, apiKey))
    )
    const detailMap = new Map<string, OtmDetail>()
    detailResults.forEach((r, i) => {
      if (r.status === "fulfilled" && r.value) {
        detailMap.set(detailSlice[i].xid, r.value)
      }
    })

    const locationLabel = countryName ? `${city}, ${countryName}` : city

    return top.map(p => {
      const detail      = detailMap.get(p.xid)
      const description = detail?.wikipedia_extracts?.text?.slice(0, 200) ?? ""
      const image       = detail?.preview?.source ?? detail?.image ?? ""

      return {
        name:             p.name,
        rating:           normaliseRate(p.rate ?? 3),
        userRatingsTotal: undefined,
        address:          locationLabel,
        description,
        image,
        location:         { lat: p.point.lat, lng: p.point.lon },
        duration:         "2–3 hours",
        category:         formatKind(p.kinds),
        mapsUrl:          undefined,
      } satisfies GooglePlaceActivity
    })
  } catch (err) {
    console.error("[OpenTripMap] Error:", err)
    return []
  }
}
