/**
 * POST /api/destination
 *
 * Unified real-data destination pipeline.
 * Every data source is a live API call.  If a call fails or returns nothing
 * the corresponding field is an empty array / null — never fake data.
 *
 * Provider priority (resolved after all parallel fetches settle):
 *   hotels      → HotelBeds                              → static fallback
 *   restaurants → Geoapify → Google Places               → static fallback
 *   activities  → HotelBeds → OpenTripMap → Google Places
 *   transit     → Google Places
 *
 * Other data sources
 *   transfers   → HotelBeds Transfers API      (HOTELBEDS_TRANSFERS_API_KEY + SECRET)
 *   weather     → OpenWeatherMap               (OPENWEATHER_API_KEY)     [if travelDates]
 *   events      → Eventbrite                   (EVENTBRITE_API_KEY)      [if travelDates]
 *   summary     → Google Gemini                (GEMINI_API_KEY)
 *   image       → Unsplash                     (UNSPLASH_ACCESS_KEY)
 *   mapMarkers  → derived from real coordinates returned by hotels/restaurants/activities
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
  fetchGoogleTransitHubs,
  fetchGoogleRestaurants,
  fetchGoogleActivities,
  type GooglePlaceHotel,
  type GooglePlaceRestaurant,
  type GooglePlaceActivity,
  type GoogleTransitHub,
} from "@/lib/google-places"

import { fetchGeoapifyHotels, fetchGeoapifyRestaurants } from "@/lib/geoapify-client"
import { fetchOpenTripMapActivities }  from "@/lib/opentripmap-client"

import {
  generateDestinationSummary,
} from "@/lib/gemini-client"

import { getDestinationImage, getCountryFlagUrl } from "@/lib/destination-image-generator"
import { generateSeed } from "@/lib/seed-randomizer"
import { getWeatherForTravel }  from "@/lib/weather-service"
import { sanitizeCityForSearch } from "@/lib/destination-city-guard"
import {
  NEARBY_CITY,
  COUNTRY_MAIN_CITY,
  getCountryFestivalsForMonth,
  getGlobalHotelFallback,
  getGlobalRestaurantFallback,
  getGlobalActivityFallback,
} from "@/lib/smart-fallback"
import { fetchTransportData, buildStaticTransportSummary, type TransportationInfo } from "@/lib/transport-client"

export const dynamic    = "force-dynamic"
export const revalidate = 0

// Request / Response types
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

// Map-marker builder (only from real coordinate data)
function buildMapMarkers(
  hotels:       HotelbedsHotel[],
  staticHotels: GooglePlaceHotel[],
  restaurants:  GooglePlaceRestaurant[],
  activities:   GooglePlaceActivity[],
): MapMarker[] {
  const markers: MapMarker[] = []

  const hotelSource = hotels.length > 0 ? hotels : staticHotels

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

// Shape adapters (normalise for the DestinationData interface in the page)
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

// Cuisine hint for Google Places restaurant queries
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

// Route handler
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

    const squadContext        = squad !== "solo" ? `${squad} travel` : "solo travel"
    const enhancedPreferences = [squadContext, ...userPreferences]
    const cuisineHint         = cuisineHintFromPreferences(userPreferences, countryName)

    // Fire all real-data fetches in parallel.
    // Provider priority is resolved after all settle:
    //   Hotels:      HotelBeds → static fallback
    //   Restaurants: Geoapify → Google Places → static fallback
    //   Activities:  HotelBeds → OpenTripMap → Google Places
    //   Transit:     Google Places
    const [
      hotelbedsHotelsResult,
      geoapifyRestaurantsResult,
      openTripMapResult,
      hotelbedsActivitiesResult,
      googleRestaurantsResult,
      googleActivitiesResult,
      geminiSummary,
      destinationImg,
      transitHubsResult,
      geoapifyHotelsResult,
    ] = await Promise.allSettled([

      // 1 — HotelBeds Hotels (primary hotels provider)
      fetchHotelbedsHotels(targetCity, budget).catch((e) => {
        console.error("[destination] HotelBeds Hotels error:", e); return []
      }),

      // 2 — Geoapify Restaurants (primary restaurants provider)
      fetchGeoapifyRestaurants(targetCity, budget, countryName).catch((e) => {
        console.error("[destination] Geoapify Restaurants error:", e); return []
      }),

      // 3 — OpenTripMap Activities (primary activities provider)
      fetchOpenTripMapActivities(targetCity, countryName).catch((e) => {
        console.error("[destination] OpenTripMap Activities error:", e); return []
      }),

      // 4 — HotelBeds Activities (last-resort activities provider)
      fetchHotelbedsActivities(
        targetCity,
        travelDates?.start,
        travelDates?.end,
      ).catch((e) => {
        console.error("[destination] HotelBeds Activities error:", e); return []
      }),

      // 5 — Google Places Restaurants (fallback when Geoapify returns nothing)
      fetchGoogleRestaurants(targetCity, budget, cuisineHint, countryName).catch((e) => {
        console.error("[destination] Google Restaurants error:", e); return []
      }),

      // 6 — Google Places Activities (fallback when OpenTripMap returns nothing;
      //      also the coordinate source for attraction map markers)
      fetchGoogleActivities(targetCity, countryName).catch((e) => {
        console.error("[destination] Google Activities error:", e); return []
      }),

      // 7 — Gemini destination summary (pros/cons/why)
      generateDestinationSummary(countryName, enhancedPreferences, climate, preferredActivities)
        .catch((e) => { console.error("[destination] Gemini summary error:", e); return null }),

      // 8 — Destination cover image
      getDestinationImage(countryName)
        .catch(() => null),

      // 9 — Google Transit Hubs (Transport section only)
      fetchGoogleTransitHubs(targetCity, countryName).catch((e) => {
        console.error("[destination] Google Transit Hubs error:", e); return []
      }),

      // 10 — Geoapify Hotels (hotel fallback when HotelBeds returns nothing)
      fetchGeoapifyHotels(targetCity, budget, countryName).catch((e) => {
        console.error("[destination] Geoapify Hotels error:", e); return []
      }),
    ])

    // Transfers (only when travelDates are provided)
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

    // Weather (only when travelDates are provided)
    let weatherData: object | null = null
    if (travelDates?.start) {
      const month = new Date(travelDates.start).toLocaleString("en-US", { month: "long" })
      weatherData = await getWeatherForTravel(countryName, targetCity, travelDates.start, month)
        .catch((e) => { console.error("[destination] Weather error:", e); return null })
    }

    // Events (only when travelDates are provided)
    let eventsData: object[] = []
    let eventsFromEventbrite = false
    if (travelDates?.start && travelDates?.end) {
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
            eventsFromEventbrite = eventsData.length > 0
          }
        } catch (evErr) {
          console.error("[destination] Eventbrite inline error:", evErr)
        }
      }
    }

    // Unwrap settled results
    const hotels              = (hotelbedsHotelsResult.status       === "fulfilled" ? hotelbedsHotelsResult.value       : []) as HotelbedsHotel[]
    const geoapifyRestList    = (geoapifyRestaurantsResult.status    === "fulfilled" ? geoapifyRestaurantsResult.value    : []) as GooglePlaceRestaurant[]
    const openTripMapList     = (openTripMapResult.status            === "fulfilled" ? openTripMapResult.value            : []) as GooglePlaceActivity[]
    const rawActivities       = (hotelbedsActivitiesResult.status    === "fulfilled" ? hotelbedsActivitiesResult.value    : []) as HotelbedsActivity[]
    const googleRestList      = (googleRestaurantsResult.status      === "fulfilled" ? googleRestaurantsResult.value      : []) as GooglePlaceRestaurant[]
    const googleActList       = (googleActivitiesResult.status       === "fulfilled" ? googleActivitiesResult.value       : []) as GooglePlaceActivity[]
    const summaryData         = (geminiSummary.status                === "fulfilled" ? geminiSummary.value                : null)
    const destImgUrl          = (destinationImg.status               === "fulfilled" ? destinationImg.value               : null) ?? ""
    const transitHubs         = (transitHubsResult.status            === "fulfilled" ? transitHubsResult.value            : []) as GoogleTransitHub[]
    const geoapifyHotelsList  = (geoapifyHotelsResult.status         === "fulfilled" ? geoapifyHotelsResult.value         : []) as GooglePlaceHotel[]

    console.log(
      `[destination] Parallel fetch complete — ` +
      `hb_hotels=${hotels.length} geo_hotels=${geoapifyHotelsList.length} ` +
      `geoapify_restaurants=${geoapifyRestList.length} g_restaurants=${googleRestList.length} ` +
      `otm_activities=${openTripMapList.length} g_activities=${googleActList.length} hb_activities=${rawActivities.length}`
    )

    // ── [DEBUG] Activity provider samples ──────────────────────────────────
    console.log("[DEBUG:activities] Provider counts:", {
      hotelbeds:   rawActivities.length,
      opentripmap: openTripMapList.length,
      google:      googleActList.length,
    })
    if (rawActivities.length > 0) {
      const s = rawActivities[0]
      console.log("[DEBUG:activities] HotelBeds sample:", JSON.stringify({
        name: s.name, description: s.description?.slice(0, 60),
        duration: s.duration, price: s.price, category: s.category,
        hasLocation: false,
      }))
    } else {
      console.log("[DEBUG:activities] HotelBeds → 0 results (key missing, API error, or 0 inventory)")
    }
    if (openTripMapList.length > 0) {
      const s = openTripMapList[0]
      console.log("[DEBUG:activities] OpenTripMap sample:", JSON.stringify({
        name: s.name, description: s.description?.slice(0, 60),
        location: s.location, hasLat: !!s.location?.lat, hasLng: !!s.location?.lng,
      }))
    } else {
      console.log("[DEBUG:activities] OpenTripMap → 0 results (likely 401 invalid key)")
    }
    if (googleActList.length > 0) {
      const s = googleActList[0]
      console.log("[DEBUG:activities] Google sample:", JSON.stringify({
        name: s.name, description: s.description?.slice(0, 60),
        location: s.location, hasLat: !!s.location?.lat, hasLng: !!s.location?.lng,
      }))
    } else {
      console.log("[DEBUG:activities] Google → 0 results (likely 429 quota exhausted)")
    }
    // ── end DEBUG ───────────────────────────────────────────────────────────

    // ── Provider priority resolution ────────────────────────────────────────
    //   Hotels:      HotelBeds → Geoapify Hotels           (→ static fallback below)
    //   Restaurants: Geoapify → Google Places               (→ static fallback below)
    //   Activities:  HotelBeds → OpenTripMap → Google Places
    const restaurants: GooglePlaceRestaurant[] =
      geoapifyRestList.length  > 0 ? geoapifyRestList :
      googleRestList.length    > 0 ? googleRestList   :
      []

    let activitiesList =
      rawActivities.length    > 0 ? rawActivities.map(adaptActivity)         :
      openTripMapList.length  > 0 ? openTripMapList.map(adaptGoogleActivity) :
      googleActList.length    > 0 ? googleActList.map(adaptGoogleActivity)   :
      []

    const _actWinner =
      rawActivities.length   > 0 ? "hotelbeds" :
      openTripMapList.length > 0 ? "opentripmap" :
      googleActList.length   > 0 ? "google" :
      "none"
    console.log(`[DEBUG:activities] Priority winner="${_actWinner}" activitiesList.length=${activitiesList.length}`)
    if (activitiesList.length > 0) {
      const s = activitiesList[0] as any
      console.log("[DEBUG:activities] First adapted activity:", JSON.stringify({
        name: s.name, title: s.title,
        hasLocation: !!s.location, lat: s.location?.lat, lng: s.location?.lng,
      }))
    } else {
      console.log("[DEBUG:activities] activitiesList=[] — all three providers returned 0. Smart fallback will run if fallbackCity is available.")
    }

    // ── Smart Fallback Layer ────────────────────────────────────────────────
    // Only fires when ALL primary+secondary providers for a section returned empty.
    // Hotels:      no API retry  → straight to static curated data
    // Restaurants: Geoapify(fallback city) → Google(fallback city) → static
    // Activities:  OTM(fallback city) → Google(fallback city)
    let effectiveStaticHotels: GooglePlaceHotel[]     = []
    let effectiveRestaurants:  GooglePlaceRestaurant[] = restaurants

    const needHotels      = hotels.length === 0
    const needRestaurants = restaurants.length === 0           // geoapify + google both empty
    const needActivities  = activitiesList.length === 0        // otm + google + hb all empty
    const fallbackCity    = NEARBY_CITY[targetCity] ?? COUNTRY_MAIN_CITY[countryName]

    if (needHotels) {
      if (geoapifyHotelsList.length > 0) {
        effectiveStaticHotels = geoapifyHotelsList
        console.log(`[destination] Geoapify Hotels fallback: ${geoapifyHotelsList.length} hotels`)
      } else {
        effectiveStaticHotels = getGlobalHotelFallback(climate, targetCity) as unknown as GooglePlaceHotel[]
        console.log(`[destination] Hotel static fallback: ${effectiveStaticHotels.length} entries`)
      }
    }

    if (needRestaurants || needActivities) {
      let fbRestaurants: GooglePlaceRestaurant[] = []
      let fbActivities:  GooglePlaceActivity[]   = []

      if (fallbackCity && fallbackCity !== targetCity) {
        console.log(`[destination] Smart fallback: querying "${fallbackCity}" for empty sections`)

        // Try Geoapify then Google for restaurants; OTM then Google for activities
        const [fbGeoRest, fbOtmAct] = await Promise.all([
          needRestaurants
            ? fetchGeoapifyRestaurants(fallbackCity, budget, countryName).catch(() => [] as GooglePlaceRestaurant[])
            : Promise.resolve([] as GooglePlaceRestaurant[]),
          needActivities
            ? fetchOpenTripMapActivities(fallbackCity, countryName).catch(() => [] as GooglePlaceActivity[])
            : Promise.resolve([] as GooglePlaceActivity[]),
        ])

        // If Geoapify fallback-city also returned nothing, try Google for that city
        if (needRestaurants && fbGeoRest.length === 0) {
          fbRestaurants = await fetchGoogleRestaurants(fallbackCity, budget, cuisineHint, countryName)
            .catch(() => [] as GooglePlaceRestaurant[])
        } else {
          fbRestaurants = fbGeoRest
        }

        // If OTM fallback-city also returned nothing, try Google for that city
        if (needActivities && fbOtmAct.length === 0) {
          fbActivities = await fetchGoogleActivities(fallbackCity, countryName)
            .catch(() => [] as GooglePlaceActivity[])
        } else {
          fbActivities = fbOtmAct
        }

        console.log(
          `[destination] Smart fallback result — ` +
          `restaurants=${fbRestaurants.length} activities=${fbActivities.length}`
        )
      }

      // Level 3: static curated data when every API attempt returned nothing
      if (needRestaurants && fbRestaurants.length === 0) {
        fbRestaurants = getGlobalRestaurantFallback(countryName) as unknown as GooglePlaceRestaurant[]
        console.log(`[destination] Restaurant static fallback: ${fbRestaurants.length} entries`)
      }

      if (needActivities && fbActivities.length > 0) {
        activitiesList = fbActivities.map(adaptGoogleActivity)
      }

      if (needRestaurants) {
        effectiveRestaurants = fbRestaurants.length > 0 ? fbRestaurants : restaurants
      }
    }

    // Level 4: static curated activity fallback — fires when all live providers
    // (HotelBeds, OpenTripMap, Google, smart fallback city) returned 0 activities.
    // Guarantees activities is never empty for any destination.
    let activitiesStaticFallback = false
    console.log("[RUNTIME:route] Before static fallback — activitiesList.length:", activitiesList.length)
    if (activitiesList.length === 0) {
      const staticActs = getGlobalActivityFallback(countryName)
      if (staticActs.length > 0) {
        activitiesList = staticActs as unknown as typeof activitiesList
        activitiesStaticFallback = true
        console.log(`[destination] Activity static fallback: ${staticActs.length} activities for "${countryName}"`)
      }
    }

    console.log("[RUNTIME:route] After static fallback — activitiesList.length:", activitiesList.length, "activitiesStaticFallback:", activitiesStaticFallback)

    // Events: use country festivals when Eventbrite returned nothing for the dates
    if (travelDates?.start && eventsData.length === 0) {
      const festivals = getCountryFestivalsForMonth(countryName, travelDates.start)
      if (festivals.length > 0) {
        eventsData = festivals
        console.log(`[destination] Festival fallback: ${festivals.length} events for ${countryName}`)
      }
    }

    const adaptedHotels      = hotels.length > 0
      ? hotels.map((h) => adaptHotel(h, budget))
      : effectiveStaticHotels.map(adaptGoogleHotel)
    const adaptedRestaurants = effectiveRestaurants.map(adaptRestaurant)
    const adaptedTransfers   = transfersList.map(adaptTransfer)

    // Activity coord source for map markers:
    // HotelBeds activities have no lat/lng, so prefer OTM → Google for the marker layer
    // regardless of which provider won the display list.
    const activityCoordSource: GooglePlaceActivity[] =
      openTripMapList.length > 0 ? openTripMapList : googleActList
    console.log(
      `[DEBUG:markers] activityCoordSource.length=${activityCoordSource.length}` +
      ` (otm=${openTripMapList.length} google=${googleActList.length})` +
      (activityCoordSource.length === 0 ? " ← NO activity markers will be generated" : "")
    )
    if (activityCoordSource.length > 0) {
      const coordCheck = activityCoordSource.slice(0, 4).map(a => ({
        name: a.name, lat: a.location?.lat, lng: a.location?.lng,
        validCoords: !!(a.location?.lat && a.location?.lng),
      }))
      console.log("[DEBUG:markers] activityCoordSource sample:", JSON.stringify(coordCheck))
    }
    const mapMarkers = buildMapMarkers(hotels, effectiveStaticHotels, effectiveRestaurants, activityCoordSource)
    const _hotelMarkers      = mapMarkers.filter(m => m.type === "hotel").length
    const _restaurantMarkers = mapMarkers.filter(m => m.type === "restaurant").length
    const _attractionMarkers = mapMarkers.filter(m => m.type === "attraction").length
    console.log(
      `[DEBUG:markers] Total markers=${mapMarkers.length}` +
      ` hotels=${_hotelMarkers} restaurants=${_restaurantMarkers} attractions=${_attractionMarkers}`
    )

    // Positives / Negatives from Gemini (not hardcoded)
    const positives: string[] = summaryData?.pros ?? []
    const negatives: string[] = summaryData?.cons ?? []

    // Determine actual data sources for transparency
    const dataSources = {
      hotels:      hotels.length                    > 0 ? "hotelbeds"
                   : geoapifyHotelsList.length      > 0 ? "geoapify"
                   : effectiveStaticHotels.length   > 0 ? "static"
                   : "empty",
      restaurants: geoapifyRestList.length          > 0 ? "geoapify"
                   : googleRestList.length          > 0 ? "google_places"
                   : effectiveRestaurants.length    > 0 ? "static"
                   : "empty",
      activities:  rawActivities.length             > 0 ? "hotelbeds"
                   : openTripMapList.length         > 0 ? "opentripmap"
                   : googleActList.length           > 0 ? "google_places"
                   : activitiesStaticFallback        ? "static_fallback"
                   : activitiesList.length          > 0 ? "static"
                   : "empty",
      transfers:   transfersList.length             > 0 ? "hotelbeds"      : "empty",
      weather:     weatherData
        ? ((weatherData as any).type === "real" ? "openweather" : "climate_estimate")
        : "empty",
      events:      eventsFromEventbrite             ? "eventbrite"
                   : eventsData.length > 0          ? "curated"
                   : "empty",
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
          destination:       `${targetCity}, ${countryName}`,
          country:           countryName,
          originalCity,
          sanitizedCity:     targetCity,
          hotels:            adaptedHotels.length,
          hotelSource:       dataSources.hotels,
          restaurants:       adaptedRestaurants.length,
          restaurantSource:  dataSources.restaurants,
          activities:        activitiesList.length,
          activitySource:    dataSources.activities,
          transfers:         adaptedTransfers.length,
          events:            eventsData.length,
          cityWasRedirected: originalCity !== targetCity && originalCity !== "(none)",
        },
        null,
        2
      )
    )

    // Transportation & Mobility — independent fetch, never blocks existing pipeline
    let transportationData: TransportationInfo
    try {
      transportationData = await fetchTransportData(targetCity, countryName)
    } catch {
      transportationData = buildStaticTransportSummary(targetCity, countryName)
    }
    // Merge Google transit hubs into transportation stations when Transitland/Overpass returned none
    if (transitHubs.length > 0 && transportationData.stations.length === 0) {
      transportationData = {
        ...transportationData,
        stations: transitHubs.map(h => ({
          id:       h.name.toLowerCase().replace(/\W+/g, "-"),
          name:     h.name,
          type:     (
            h.type === "airport"         ? "airport"       :
            h.type === "train_station"   ? "train_station" :
            h.type === "bus_station"     ? "bus_station"   :
            h.type === "transit_station" ? "metro"         : "transit"
          ) as "airport" | "train_station" | "bus_station" | "metro" | "tram" | "ferry" | "transit",
          lat:      h.location.lat,
          lon:      h.location.lng,
          address:  h.address   || undefined,
          openHours: h.openHours || undefined,
          mapsUrl:  h.mapsUrl   || undefined,
        })),
      }
    }

    const result = {
      seed:             requestSeed,
      countryCode,
      countryName,
      hotels:           adaptedHotels,
      restaurants:      adaptedRestaurants,
      activities:       activitiesList,
      transfers:        adaptedTransfers,
      transitHubs,
      transportation:   transportationData,
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

    console.log("[RUNTIME:route] Before NextResponse.json — activitiesList.length:", activitiesList.length, "| activitiesStaticFallback:", activitiesStaticFallback, "| dataSources.activities:", dataSources.activities)
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
