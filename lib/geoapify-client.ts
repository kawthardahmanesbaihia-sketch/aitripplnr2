/**
 * Geoapify Places API client — server-side only.
 *
 * Provides hotel and restaurant search by city using:
 *   1. Geoapify Geocoding API  → resolve city to lat/lon
 *   2. Geoapify Places API v2  → fetch places within 5 km
 *
 * Required env var: GEOAPIFY_API_KEY
 * Docs: https://apidocs.geoapify.com/docs/places/
 */

import type { GooglePlaceHotel, GooglePlaceRestaurant } from "@/lib/google-places"

const GEO_GEOCODE = "https://api.geoapify.com/v1/geocode/search"
const GEO_PLACES  = "https://api.geoapify.com/v2/places"
const RADIUS_M    = 5000  // 5 km around city centre

// Raw shapes from Geoapify
interface GeoGeocoderResult {
  lat: number
  lon: number
  formatted?: string
}
interface GeoGeocodingResponse {
  results?: GeoGeocoderResult[]
}

interface GeoPlaceProperties {
  name?:          string
  formatted?:     string
  address_line1?: string
  address_line2?: string
  categories?:    string[]
  cuisine?:       string
  phone?:         string
  opening_hours?: string
  lat:            number
  lon:            number
}
interface GeoPlaceFeature {
  properties: GeoPlaceProperties
}
interface GeoPlacesResponse {
  features?: GeoPlaceFeature[]
}

// Geocode a city string to { lat, lon }
async function geocodeCity(
  city: string,
  countryName: string | undefined,
  apiKey: string,
): Promise<{ lat: number; lon: number } | null> {
  const text = countryName ? `${city}, ${countryName}` : city
  const url   = `${GEO_GEOCODE}?text=${encodeURIComponent(text)}&format=json&apiKey=${apiKey}`

  try {
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) {
      console.error(`[Geoapify] Geocode HTTP ${res.status} for "${text}"`)
      return null
    }
    const data: GeoGeocodingResponse = await res.json()
    const first = data.results?.[0]
    if (!first) {
      console.warn(`[Geoapify] No geocode result for "${text}"`)
      return null
    }
    return { lat: first.lat, lon: first.lon }
  } catch (err) {
    console.error("[Geoapify] Geocode error:", err)
    return null
  }
}

// Pick restaurant categories based on budget
function restaurantCategories(budget: string): string {
  if (budget === "budget" || budget === "low") {
    return "catering.restaurant,catering.cafe,catering.fast_food"
  }
  return "catering.restaurant,catering.cafe"
}

function priceDisplay(budget: string): string {
  if (budget === "luxury" || budget === "high") return "$$$"
  if (budget === "budget" || budget === "low")  return "$"
  return "$$"
}

function priceTier(budget: string): "budget" | "mid-range" | "luxury" {
  if (budget === "luxury" || budget === "high") return "luxury"
  if (budget === "budget" || budget === "low")  return "budget"
  return "mid-range"
}

function formatCuisine(raw: string): string {
  return raw
    .split(/[,_]/)
    .map(w => w.trim())
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(", ")
}

// Derive a human-readable cuisine label from Geoapify categories / cuisine field
function deriveCuisine(p: GeoPlaceProperties): string {
  if (p.cuisine) return formatCuisine(p.cuisine)
  const sub = p.categories?.find(c => c.startsWith("catering.") && c !== "catering")
  if (sub) return formatCuisine(sub.replace("catering.", ""))
  return "Restaurant"
}

// Accommodation categories based on budget
function hotelCategories(budget: string): string {
  if (budget === "budget" || budget === "low") {
    return "accommodation.hotel,accommodation.hostel,accommodation.guest_house"
  }
  return "accommodation.hotel"
}

export async function fetchGeoapifyHotels(
  city:         string,
  budget:       string = "mid-range",
  countryName?: string,
): Promise<GooglePlaceHotel[]> {
  const apiKey = process.env.GEOAPIFY_API_KEY
  if (!apiKey) {
    console.warn("[Geoapify Hotels] GEOAPIFY_API_KEY not set — skipping")
    return []
  }

  try {
    const coords = await geocodeCity(city, countryName, apiKey)
    if (!coords) return []

    const params = new URLSearchParams({
      categories: hotelCategories(budget),
      filter:     `circle:${coords.lon},${coords.lat},${RADIUS_M}`,
      bias:       `proximity:${coords.lon},${coords.lat}`,
      limit:      "10",
      apiKey,
    })

    const url = `${GEO_PLACES}?${params}`
    console.log(`[Geoapify Hotels] GET ${url.slice(0, 120)}...`)

    const res = await fetch(url, { cache: "no-store" })
    console.log(`[Geoapify Hotels] status: ${res.status}`)

    if (!res.ok) {
      const errText = await res.text().catch(() => "")
      console.error(`[Geoapify Hotels] HTTP ${res.status}: ${errText.slice(0, 200)}`)
      return []
    }

    const data: GeoPlacesResponse = await res.json()
    const features = data.features ?? []
    console.log(`[Geoapify Hotels] "${city}" → ${features.length} hotels`)

    const price = priceDisplay(budget)
    const tier  = priceTier(budget)

    return features
      .filter(f => f.properties.name)
      .map(f => {
        const p = f.properties
        return {
          name:             p.name!,
          rating:           0,
          userRatingsTotal: undefined,
          price,
          priceLevel:       tier,
          address:          p.formatted ?? p.address_line1 ?? "",
          description:      `Hotel in ${city}`,
          image:            "",
          location:         { lat: p.lat, lng: p.lon },
          amenities:        [],
          phone:            p.phone,
        } satisfies GooglePlaceHotel
      })
  } catch (err) {
    console.error("[Geoapify Hotels] error:", err)
    return []
  }
}

export async function fetchGeoapifyRestaurants(
  city:         string,
  budget:       string = "mid-range",
  countryName?: string,
): Promise<GooglePlaceRestaurant[]> {
  const apiKey = process.env.GEOAPIFY_API_KEY
  if (!apiKey) {
    console.warn("[Geoapify] GEOAPIFY_API_KEY not set — skipping")
    return []
  }

  try {
    const coords = await geocodeCity(city, countryName, apiKey)
    if (!coords) return []

    const params = new URLSearchParams({
      categories: restaurantCategories(budget),
      filter:     `circle:${coords.lon},${coords.lat},${RADIUS_M}`,
      bias:       `proximity:${coords.lon},${coords.lat}`,
      limit:      "12",
      apiKey,
    })

    const url = `${GEO_PLACES}?${params}`
    console.log(`[Geoapify] Restaurants GET ${url.slice(0, 120)}...`)

    const res = await fetch(url, { cache: "no-store" })
    console.log(`[Geoapify] Restaurants status: ${res.status}`)

    if (!res.ok) {
      const errText = await res.text().catch(() => "")
      console.error(`[Geoapify] HTTP ${res.status}: ${errText.slice(0, 200)}`)
      return []
    }

    const data: GeoPlacesResponse = await res.json()
    const features = data.features ?? []
    console.log(`[Geoapify] "${city}" → ${features.length} restaurants`)

    const price    = priceDisplay(budget)
    const tier     = priceTier(budget)

    return features
      .filter(f => f.properties.name)
      .map(f => {
        const p = f.properties
        return {
          name:            p.name!,
          rating:          0,
          userRatingsTotal: undefined,
          cuisine:         deriveCuisine(p),
          price,
          priceLevel:      tier,
          address:         p.formatted ?? p.address_line1 ?? "",
          description:     `${deriveCuisine(p)} in ${city}`,
          image:           "",
          location:        { lat: p.lat, lng: p.lon },
          openNow:         undefined,
          mapsUrl:         undefined,
        } satisfies GooglePlaceRestaurant
      })
  } catch (err) {
    console.error("[Geoapify] Restaurants error:", err)
    return []
  }
}
