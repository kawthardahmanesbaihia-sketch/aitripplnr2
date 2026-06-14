/**
 * POST /api/destination
 *
 * Unified real-data destination pipeline.
 * Every data source is a live API call.  If a call fails or returns nothing
 * the corresponding field is an empty array / null — never fake data.
 *
 * Data sources
 *   hotels      → HotelBeds Hotel Content API  (HOTELBEDS_HOTELS_API_KEY + SECRET)
 *   restaurants → Google Places Text Search    (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
 *   activities  → HotelBeds Activities API     (HOTELBEDS_ACTIVITIES_API_KEY + SECRET)
 *   transfers   → HotelBeds Transfers API      (HOTELBEDS_TRANSFERS_API_KEY + SECRET)
 *   weather     → OpenWeatherMap               (OPENWEATHER_API_KEY)     [if travelDates]
 *   events      → Eventbrite                   (EVENTBRITE_API_KEY)      [if travelDates]
 *   summary     → Google Gemini                (GEMINI_API_KEY)
 *   image       → Unsplash                     (UNSPLASH_ACCESS_KEY)
 *   mapMarkers  → derived from real coordinates returned by hotels/restaurants
 */

import { type NextRequest, NextResponse } from "next/server"

import {
  fetchHotelbedsHotels,
  fetchHotelbedsActivities,
  fetchHotelbedsTransfers,
  getDestinationCode,
  DEST_TO_AIRPORT,
  type HotelbedsHotel,
  type HotelbedsActivity,
  type HotelbedsTransfer,
} from "@/lib/hotelbeds-client"

import {
  fetchGoogleRestaurants,
  fetchGoogleHotels,
  fetchGoogleActivities,
  fetchGoogleTransitHubs,
  type GooglePlaceRestaurant,
  type GooglePlaceHotel,
  type GooglePlaceActivity,
  type GoogleTransitHub,
} from "@/lib/google-places"

import {
  generateDestinationSummary,
} from "@/lib/gemini-client"

import { getDestinationImage, getCountryFlagUrl } from "@/lib/destination-image-generator"
import { generateSeed } from "@/lib/seed-randomizer"
import { getWeatherForTravel }  from "@/lib/weather-service"
import { sanitizeCityForSearch } from "@/lib/destination-city-guard"

export const dynamic    = "force-dynamic"
export const revalidate = 0

// ─── Request / Response types ─────────────────────────────────────────────────

interface DestinationRequest {
  countryCode:      string
  countryName:      string
  city?:            string
  climate:          string
  activities:       string[]
  userPreferences:  string[]
  budget?:          string
  squad?:           string
  seed?:            number
  travelDates?:     { start: string; end: string }
}

interface MapMarker {
  id:       string
  name:     string
  type:     "hotel" | "restaurant" | "attraction"
  location: { lat: number; lng: number }
  info:     { rating?: number; price?: string; cuisine?: string }
}

// ─── Map-marker builder (only from real coordinate data) ──────────────────────

function buildMapMarkers(
  hotels:      HotelbedsHotel[],
  googleHotels: GooglePlaceHotel[],
  restaurants: GooglePlaceRestaurant[],
  activities:  GooglePlaceActivity[],
): MapMarker[] {
  const markers: MapMarker[] = []

  const hotelSource = hotels.length > 0 ? hotels : googleHotels

  hotelSource.slice(0, 5).forEach((h, i) => {
    const loc = (h as HotelbedsHotel).location ?? (h as GooglePlaceHotel).location
    if (!loc?.lat || !loc?.lng) return
    markers.push({
      id:       `hotel-${i}`,
      name:     h.name,
      type:     "hotel",
      location: loc,
      info:     {
        price: (h as HotelbedsHotel).stars
          ? `${(h as HotelbedsHotel).stars}★`
          : (h as GooglePlaceHotel).price,
      },
    })
  })

  restaurants.slice(0, 5).forEach((r, i) => {
    if (!r.location?.lat || !r.location?.lng) return
    markers.push({
      id:       `restaurant-${i}`,
      name:     r.name,
      type:     "restaurant",
      location: r.location,
      info:     { rating: r.rating, price: r.price, cuisine: r.cuisine },
    })
  })

  activities.slice(0, 4).forEach((a, i) => {
    if (!a.location?.lat || !a.location?.lng) return
    markers.push({
      id:       `attraction-${i}`,
      name:     a.name,
      type:     "attraction",
      location: a.location,
      info:     { rating: a.rating },
    })
  })

  return markers
}

// ─── Shape adapters (normalise for the DestinationData interface in the page) ─

function adaptHotel(h: HotelbedsHotel, _budget: string) {
  const priceLevel =
    h.stars >= 4 ? "luxury"
    : h.stars >= 3 ? "mid-range"
    : "budget"
  return {
    name:       h.name,
    rating:     h.stars,
    description:h.description || `${h.stars}-star hotel in ${h.address}`,
    price:      "$$".padEnd(Math.max(h.stars, 1), "$"),
    priceLevel,
    address:    h.address,
    amenities:  h.amenities,
    image:      h.image || undefined,
    phone:      h.phone,
    web:        h.web,
    location:   h.location,
  }
}

function adaptRestaurant(r: GooglePlaceRestaurant) {
  return {
    name:            r.name,
    rating:          r.rating,
    userRatingsTotal: r.userRatingsTotal,
    cuisine:         r.cuisine,
    description:     r.description,
    price:           r.price,
    priceLevel:      r.priceLevel,
    address:         r.address,
    image:           r.image || undefined,
    location:        r.location,
    openNow:         r.openNow,
    mapsUrl:         r.mapsUrl,
  }
}

function adaptGoogleHotel(h: GooglePlaceHotel) {
  return {
    name:            h.name,
    rating:          h.rating,
    userRatingsTotal: h.userRatingsTotal,
    description:     h.description,
    price:           h.price,
    priceLevel:      h.priceLevel,
    address:         h.address,
    amenities:       h.amenities,
    image:           h.image || undefined,
    location:        h.location,
  }
}

function adaptGoogleActivity(a: GooglePlaceActivity) {
  return {
    title:       a.name,
    name:        a.name,
    description: a.description,
    duration:    a.duration,
    rating:      a.rating,
    price:       "",
    category:    a.category,
    image:       a.image || undefined,
    location:    a.location,
  }
}

function adaptActivity(a: HotelbedsActivity) {
  return {
    title:       a.name,
    name:        a.name,
    description: a.description,
    duration:    a.duration,
    rating:      undefined as number | undefined,
    price:       a.price,
    category:    a.category,
    image:       a.image || undefined,
  }
}

function adaptTransfer(t: HotelbedsTransfer) {
  return {
    name:     t.name,
    vehicle:  t.vehicle,
    capacity: t.capacity,
    price:    t.price,
    duration: t.duration,
  }
}

// ─── Cuisine hint from user preferences ──────────────────────────────────────

function cuisineHintFromPreferences(_prefs: string[], countryName: string): string | undefined {
  const CUISINE_MAP: Record<string, string> = {
    italy: "italian", france: "french", japan: "japanese", spain: "spanish tapas",
    greece: "greek", thailand: "thai", india: "indian", mexico: "mexican",
    morocco: "moroccan", vietnam: "vietnamese", indonesia: "indonesian",
    turkey: "turkish", portugal: "portuguese", "south korea": "korean",
    brazil: "brazilian", peru: "peruvian", singapore: "singaporean hawker",
    "united states": "american", australia: "australian modern",
  }
  return CUISINE_MAP[countryName.toLowerCase()] ?? undefined
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body: DestinationRequest & { seed?: number } = await request.json()

    const {
      countryCode,
      countryName,
      city,
      climate,
      activities: preferredActivities,
      userPreferences,
      budget = "mid-range",
      squad  = "solo",
      seed,
      travelDates,
    } = body

    const requestSeed  = seed ?? generateSeed()
    const originalCity = city ?? "(none)"
    const targetCity   = sanitizeCityForSearch(city, countryName) || countryName

    console.log(
      `[destination] Request — country="${countryName}" city="${targetCity}" ` +
      `budget="${budget}" squad="${squad}" seed=${requestSeed}`
    )

    // ── Fire all real-data fetches in parallel ────────────────────────────────

    const squadContext         = squad !== "solo" ? `${squad} travel` : "solo travel"
    const enhancedPreferences  = [squadContext, ...userPreferences]

    const [
      googleHotelsResult,
      googleRestaurants,
      hotelbedsActivities,
      geminiSummary,
      destinationImg,
      transitHubsResult,
      googleActivitiesResult,
    ] = await Promise.allSettled([

      // 1 — Google Hotels (New Places API) — primary source
      fetchGoogleHotels(targetCity, budget, countryName).catch((e) => {
        console.error("[destination] Google Hotels error:", e); return []
      }),

      // 2 — Google Places Restaurants (Places API New)
      fetchGoogleRestaurants(
        targetCity,
        budget,
        cuisineHintFromPreferences(userPreferences, countryName),
        countryName,
      ).catch((e) => {
        console.error("[destination] Google Places Restaurants error:", e); return []
      }),

      // 3 — HotelBeds Activities
      fetchHotelbedsActivities(
        targetCity,
        travelDates?.start,
        travelDates?.end
      ).catch((e) => {
        console.error("[destination] HotelBeds Activities error:", e); return []
      }),

      // 4 — Gemini destination summary (pros/cons/why)
      generateDestinationSummary(countryName, enhancedPreferences, climate, preferredActivities)
        .catch((e) => { console.error("[destination] Gemini summary error:", e); return null }),

      // 5 — Destination cover image
      getDestinationImage(countryName)
        .catch(() => null),

      // 6 — Google Transit Hubs (for Transport section)
      fetchGoogleTransitHubs(targetCity, countryName).catch((e) => {
        console.error("[destination] Google Transit Hubs error:", e); return []
      }),

      // 7 — Google Activities — always fetched in parallel for map-marker coordinates.
      //     HotelbedsActivity has no lat/lng, so Google is the only coordinate source
      //     for attraction markers regardless of which source wins the display list.
      fetchGoogleActivities(targetCity, countryName).catch((e) => {
        console.error("[destination] Google Activities (markers) error:", e); return []
      }),
    ])

    // ── Transfers (only when travelDates are provided) ────────────────────────
    let transfersList: HotelbedsTransfer[] = []
    if (travelDates?.start) {
      const destCode    = getDestinationCode(targetCity)
      const airportIATA = destCode ? (DEST_TO_AIRPORT[destCode] ?? destCode) : null
      if (airportIATA && destCode) {
        transfersList = await fetchHotelbedsTransfers(
          airportIATA,
          destCode,
          travelDates.start
        ).catch((e) => { console.error("[destination] HotelBeds Transfers error:", e); return [] })
      }
    }

    // ── Weather (only when travelDates are provided) ──────────────────────────
    let weatherData: object | null = null
    if (travelDates?.start) {
      const month = new Date(travelDates.start).toLocaleString("en-US", { month: "long" })
      weatherData = await getWeatherForTravel(countryName, targetCity, travelDates.start, month)
        .catch((e) => { console.error("[destination] Weather error:", e); return null })
    }

    // ── Events (only when travelDates are provided) ───────────────────────────
    let eventsData: object[] = []
    if (travelDates?.start && travelDates?.end) {
      // Call the events route handler logic inline to avoid HTTP round-trip
      const evApiKey = process.env.EVENTBRITE_API_KEY
      if (evApiKey) {
        try {
          const start = new Date(travelDates.start).toISOString()
          const end   = new Date(travelDates.end).toISOString()
          const evUrl = new URL("https://www.eventbriteapi.com/v3/events/search/")
          evUrl.searchParams.set("start_date.range_start", start)
          evUrl.searchParams.set("start_date.range_end",   end)
          evUrl.searchParams.set("sort_by",                "best")
          evUrl.searchParams.set("expand",                 "category,logo,venue")
          evUrl.searchParams.set("location.address",       `${targetCity}, ${countryName}`)

          console.log(`[destination] Eventbrite GET for "${targetCity}" ${travelDates.start}→${travelDates.end}`)
          const evRes = await fetch(evUrl.toString(), {
            headers: {
              Authorization: `Bearer ${evApiKey}`,
              "Content-Type": "application/json",
            },
            cache: "no-store",
          })
          console.log(`[destination] Eventbrite status: ${evRes.status}`)
          if (evRes.ok) {
            const evData = await evRes.json()
            eventsData = (evData.events ?? []).slice(0, 8).map((e: any) => ({
              id:          String(e.id ?? ""),
              name:        String(e.name?.text ?? ""),
              date:        e.start?.utc ? new Date(e.start.utc).toISOString().split("T")[0] : "",
              location:    e.venue?.address?.localized_address_display ?? "",
              description: (e.description?.text ?? "").substring(0, 200),
              url:         String(e.url ?? ""),
              category:    e.category?.name ?? "Event",
              image:       e.logo?.url ?? undefined,
            }))
            console.log(`[destination] Eventbrite returned ${eventsData.length} events`)
          }
        } catch (evErr) {
          console.error("[destination] Eventbrite inline error:", evErr)
        }
      }
    }

    // ── Unwrap settled results ────────────────────────────────────────────────

    const googleHotelsList     = (googleHotelsResult.status     === "fulfilled" ? googleHotelsResult.value     : []) as GooglePlaceHotel[]
    const restaurants          = (googleRestaurants.status      === "fulfilled" ? googleRestaurants.value      : []) as GooglePlaceRestaurant[]
    const rawActivities        = (hotelbedsActivities.status    === "fulfilled" ? hotelbedsActivities.value    : []) as HotelbedsActivity[]
    const summaryData          = (geminiSummary.status          === "fulfilled" ? geminiSummary.value          : null)
    const destImgUrl           = (destinationImg.status         === "fulfilled" ? destinationImg.value         : null) ?? ""
    const transitHubs          = (transitHubsResult.status      === "fulfilled" ? transitHubsResult.value      : []) as GoogleTransitHub[]
    const googleActivitiesList = (googleActivitiesResult.status === "fulfilled" ? googleActivitiesResult.value : []) as GooglePlaceActivity[]

    console.log(`[destination] Google Hotels: ${googleHotelsList.length} hotels`)
    console.log(`[destination] Google Activities (map markers): ${googleActivitiesList.length} activities`)

    // HotelBeds Hotels fallback — only fetched when Google returned nothing
    let hotels: HotelbedsHotel[] = []
    if (googleHotelsList.length === 0) {
      hotels = await fetchHotelbedsHotels(targetCity, budget).catch((e) => {
        console.error("[destination] HotelBeds Hotels fallback error:", e); return []
      })
      console.log(`[destination] HotelBeds Hotels fallback: ${hotels.length} hotels`)
    }

    // Resolve final data sets — HotelBeds first, Google fallback second
    const activitiesList = rawActivities.length > 0
      ? rawActivities.map(adaptActivity)
      : googleActivitiesList.map(adaptGoogleActivity)

    const adaptedHotels      = hotels.length > 0
      ? hotels.map((h) => adaptHotel(h, budget))
      : googleHotelsList.map(adaptGoogleHotel)
    const adaptedRestaurants = restaurants.map(adaptRestaurant)
    const adaptedTransfers   = transfersList.map(adaptTransfer)
    const mapMarkers         = buildMapMarkers(hotels, googleHotelsList, restaurants, googleActivitiesList)

    // ── Positives / Negatives from Gemini (not hardcoded) ──────────────────────
    const positives: string[] = summaryData?.pros ?? []
    const negatives: string[] = summaryData?.cons ?? []

    // Determine actual data sources for transparency
    const dataSources = {
      hotels:      googleHotelsList.length > 0 ? "google_places"
                   : hotels.length          > 0 ? "hotelbeds"
                   : "empty",
      restaurants: restaurants.length      > 0 ? "google_places"  : "empty",
      activities:  rawActivities.length    > 0 ? "hotelbeds"
                   : googleActivitiesList.length > 0 ? "google_places"
                   : "empty",
      transfers: transfersList.length      > 0 ? "hotelbeds"      : "empty",
      weather:   weatherData
        ? ((weatherData as any).type === "real" ? "openweather" : "climate_estimate")
        : "empty",
      events:    eventsData.length         > 0 ? "eventbrite"     : "empty",
    }

    console.log(
      `[destination] Summary — hotels=${adaptedHotels.length}(${dataSources.hotels}) ` +
      `restaurants=${adaptedRestaurants.length}(${dataSources.restaurants}) ` +
      `activities=${activitiesList.length}(${dataSources.activities}) ` +
      `transfers=${adaptedTransfers.length}(${dataSources.transfers}) ` +
      `weather=${dataSources.weather} events=${eventsData.length}(${dataSources.events})`
    )

    console.log(
      "[Destination Debug]\n" +
      JSON.stringify(
        {
          destination:   `${targetCity}, ${countryName}`,
          country:       countryName,
          originalCity,
          sanitizedCity: targetCity,
          hotels:        adaptedHotels.length,
          hotelSource:   dataSources.hotels,
          restaurants:   adaptedRestaurants.length,
          activities:    activitiesList.length,
          activitySource: dataSources.activities,
          transfers:     adaptedTransfers.length,
          events:        eventsData.length,
          cityWasRedirected: originalCity !== targetCity && originalCity !== "(none)",
        },
        null,
        2
      )
    )

    const result = {
      seed:             requestSeed,
      countryCode,
      countryName,
      hotels:           adaptedHotels,
      restaurants:      adaptedRestaurants,
      activities:       activitiesList,
      transfers:        adaptedTransfers,
      transitHubs,
      weather:          weatherData,
      events:           eventsData,
      mapMarkers,
      positives,
      negatives,
      destinationImage: destImgUrl,
      summary:          summaryData,
      flagUrl:          getCountryFlagUrl(countryName),
      dataSources,
    }

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      },
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error("[destination] Unhandled error:", msg)
    return NextResponse.json(
      { error: "Failed to fetch destination details", detail: msg },
      { status: 500 }
    )
  }
}
