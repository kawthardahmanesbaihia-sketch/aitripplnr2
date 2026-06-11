"use client"

import { useEffect, useState, Suspense } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import Link from "next/link"
import { useParams, useSearchParams } from "next/navigation"
import type { SquadType } from "@/lib/travel-data"
import { EventsSection } from "@/components/events-section"
import { WeatherSection } from "@/components/weather-section"
import { HolidayWarning } from "@/components/holiday-warning"
import { DestinationMap } from "@/components/destination-map"
import { getCountryCode } from "@/lib/destination-image-generator"
import { generateCategoryImage } from "@/lib/category-image-generator"
import { fetchCountryImage } from "@/lib/country-image-generator"
import { ItineraryGenerator } from "@/components/ItineraryGenerator"
import { DestinationDashboard } from "@/components/destination/DestinationDashboard"

interface DestinationData {
  name: string
  matchPercentage: number
  image: string
  positives: string[]
  negatives: string[]
  hotels: Array<{
    name:        string
    rating:      number
    description: string
    price:       string
    priceLevel:  "budget" | "mid-range" | "luxury"
    address:     string
    amenities:   string[]
    image?:      string
  }>
  restaurants: Array<{
    name:            string
    rating:          number
    userRatingsTotal?: number
    cuisine:         string
    description:     string
    price:           string
    priceLevel:      "budget" | "mid-range" | "luxury"
    address:         string
    image?:          string
    openNow?:        boolean
    mapsUrl?:        string
  }>
  activities: Array<{
    name:        string
    duration:    string
    description: string
    rating?:     number
    image?:      string
    price?:      string
    category?:   string
  }>
  transfers?: Array<{
    name:     string
    vehicle:  string
    capacity: number
    price:    string
    duration: string
  }>
  mapMarkers?: Array<{
    id:       string
    name:     string
    type:     "hotel" | "restaurant" | "attraction"
    location: { lat: number; lng: number }
    info:     { rating?: number; price?: string; cuisine?: string }
  }>
}

const SQUAD_CONFIG: Record<SquadType, { label: string; emoji: string; tagline: string }> = {
  solo:    { label: "Solo",    emoji: "👤", tagline: "Your personal adventure awaits" },
  couple:  { label: "Couple",  emoji: "💑", tagline: "A romantic escape for two" },
  friends: { label: "Friends", emoji: "👥", tagline: "Epic memories with your crew" },
  family:  { label: "Family",  emoji: "👨‍👩‍👧",  tagline: "Fun for every generation" },
}

// ── AI explanation helpers ────────────────────────────────────────────────────

const CATEGORY_READABLE: Record<string, string> = {
  "winter arctic":        "arctic and winter scenery",
  "wildlife fauna":       "wildlife and fauna",
  "seasonal spectacle":   "seasonal natural spectacles",
  "coastal marine":       "coastal and ocean environments",
  "tropical lush":        "tropical jungle and rainforest landscapes",
  "ancient ruins":        "ancient ruins and historical sites",
  "volcanic geothermal":  "volcanic and geothermal landscapes",
  "desert arid":          "desert and arid environments",
  "luxury premium":       "luxury and premium travel",
  "nightlife urban":      "vibrant urban nightlife",
  "landmarks":            "iconic landmarks and monuments",
  "spiritual religious":  "spiritual and cultural sites",
  "adventure extreme":    "adventure and extreme outdoor activities",
  "urban environment":    "modern city environments",
  "natural landscapes":   "dramatic natural landscapes",
  "water features":       "waterfalls, glacial lakes and rivers",
  "cultural traditional": "traditional local culture",
}

function readableCategory(raw: string): string {
  const key = raw.toLowerCase().replace(/_/g, " ").trim()
  return CATEGORY_READABLE[key] ?? raw.replace(/_/g, " ")
}

const STYLE_DESC: Record<string, string> = {
  adventure:    "adventure seekers looking for thrilling outdoor experiences",
  cultural:     "travellers passionate about history, culture and local traditions",
  nature:       "nature lovers seeking scenic landscapes and outdoor escapes",
  beach:        "those seeking sun, sea and coastal relaxation",
  urban:        "city explorers drawn to vibrant urban life and modern architecture",
  luxury:       "travellers seeking premium experiences and refined hospitality",
  spiritual:    "those seeking spiritual enrichment and cultural immersion",
  "eco-travel": "eco-conscious travellers interested in sustainable experiences",
}

function buildSmartPositives(
  vibes: string[],
  travelStyle: string,
  rawPositives: string[],
  destinationName: string,
  _climate: string,
  _activities: string[],
): string[] {
  const bullets: string[] = []

  // Transform CLIP explanation bullets into natural language
  for (const raw of rawPositives.slice(0, 2)) {
    if (raw.includes("Landmark detected")) {
      bullets.push(
        `A landmark associated with ${destinationName} was identified in your image selections — a very strong AI recommendation signal.`
      )
    } else if (raw.includes("Strong visual match: ")) {
      const catRaw = raw.split("Strong visual match: ")[1]?.split(" —")[0]?.trim() ?? ""
      if (catRaw) {
        bullets.push(
          `Your image selections showed a strong visual alignment with ${readableCategory(catRaw)}, which is a defining characteristic of ${destinationName}.`
        )
      }
    } else if (raw.includes("Also matched: ")) {
      const catRaw = raw.split("Also matched: ")[1]?.trim() ?? ""
      if (catRaw) {
        bullets.push(
          `Your selections also aligned with ${readableCategory(catRaw)}, which ${destinationName} offers in abundance.`
        )
      }
    } else if (raw.includes("Visual signal: ")) {
      const catRaw = raw.split("Visual signal: ")[1]?.trim() ?? ""
      if (catRaw) {
        bullets.push(
          `Your images featured ${readableCategory(catRaw)}, a key experience available in ${destinationName}.`
        )
      }
    } else if (raw.trim()) {
      bullets.push(raw)
    }
  }

  // Vibe-based bullet from detected image themes
  if (vibes.length > 0 && bullets.length < 3) {
    const top = vibes.slice(0, 2)
    if (top.length === 1) {
      bullets.push(
        `Your visual selections highlighted a clear preference for ${top[0]}, which is a defining aspect of this destination.`
      )
    } else {
      bullets.push(
        `Your image selections showed a strong preference for ${top[0]} and ${top[1]}.`
      )
    }
  }

  // Travel style match
  if (travelStyle && bullets.length < 4) {
    const desc = STYLE_DESC[travelStyle] ?? `${travelStyle} travellers`
    bullets.push(`${destinationName} is well-suited for ${desc}.`)
  }

  // Fallback if we still have nothing
  if (bullets.length === 0) {
    bullets.push(`${destinationName} closely matches the visual themes detected across your selected images.`)
    if (travelStyle) bullets.push(`The destination is particularly well-suited for ${travelStyle} travel.`)
    bullets.push("Strong alignment detected between your preferences and this destination's character.")
  }

  return bullets.slice(0, 4)
}

function buildSmartNegatives(
  vibes: string[],
  _travelStyle: string,
  travelMonth: number | null,
  destinationName: string,
  climate: string,
  activities: string[],
  rawNegatives: string[],
): string[] {
  const warnings: string[] = []
  const vibesLower = vibes.map((v) => v.toLowerCase())
  const activitiesLower = activities.map((a) => a.toLowerCase())

  // ── Season mismatch ───────────────────────────────────────────────────────
  if (travelMonth !== null) {
    const summerMonths = [4, 5, 6, 7, 8]   // May–Sep
    const winterMonths = [11, 0, 1, 2]      // Dec–Mar

    const wantsWinter = vibesLower.some((v) =>
      v.includes("arctic") || v.includes("aurora") || v.includes("snow") || v.includes("winter")
    )
    const wantsWarmCoast = vibesLower.some((v) =>
      v.includes("beach") || v.includes("tropical") || v.includes("ocean") || v.includes("coastal")
    )

    if (wantsWinter && summerMonths.includes(travelMonth)) {
      warnings.push(
        `Your selected images suggest a preference for snow and winter scenery, but your travel dates fall in the warmer months — winter conditions will not be available during this period.`
      )
    }

    if (
      wantsWarmCoast &&
      winterMonths.includes(travelMonth) &&
      !["tropical", "subtropical", "desert-hot"].includes(climate)
    ) {
      warnings.push(
        `Your selections showed beach and tropical preferences, but your travel dates fall in the cooler season at this destination — temperatures may not match a typical warm coastal experience.`
      )
    }
  }

  // ── Environment mismatch ──────────────────────────────────────────────────
  const wantsBeach = vibesLower.some((v) =>
    v.includes("beach") || v.includes("ocean") || v.includes("coastal") || v.includes("tropical beach")
  )
  const wantsNature = vibesLower.some((v) =>
    v.includes("nature") || v.includes("landscape") || v.includes("wildlife") ||
    v.includes("forest") || v.includes("safari")
  )

  const isMountainDest = activitiesLower.some((a) =>
    a.includes("ski") || a.includes("mountain") || a.includes("hiking") ||
    a.includes("trekking") || a.includes("alpine")
  )
  const isUrbanDest = activitiesLower.some((a) =>
    a.includes("shopping") || a.includes("museum") || a.includes("nightclub") ||
    a.includes("theatre") || a.includes("gallery")
  )
  const hasCoastal = activitiesLower.some((a) =>
    a.includes("beach") || a.includes("swim") || a.includes("snorkel") || a.includes("surf")
  )

  if (wantsBeach && isMountainDest && !hasCoastal && warnings.length < 3) {
    warnings.push(
      `Your image selections frequently featured coastal and beach environments. ${destinationName} is primarily known for mountain and inland experiences rather than seaside destinations.`
    )
  }

  if (wantsNature && isUrbanDest && !isMountainDest && warnings.length < 3) {
    warnings.push(
      `Your visual preferences leaned toward natural landscapes and remote scenery. ${destinationName} is primarily an urban destination with limited wilderness areas nearby.`
    )
  }

  // ── Include CLIP-generated negatives ─────────────────────────────────────
  for (const neg of rawNegatives.slice(0, 2)) {
    if (warnings.length < 4 && !warnings.includes(neg)) warnings.push(neg)
  }

  // ── Fallback ──────────────────────────────────────────────────────────────
  if (warnings.length === 0) {
    warnings.push(
      "Popular areas can become crowded during peak tourist season — early booking is recommended."
    )
    if (rawNegatives.length === 0) {
      warnings.push(
        "Research local visa requirements, entry restrictions and cultural customs before your visit."
      )
    }
  }

  return warnings.slice(0, 4)
}

// ─────────────────────────────────────────────────────────────────────────────

function DestinationPageInner() {
  const params = useParams()
  const searchParams = useSearchParams()
  const squad = ((searchParams.get("squad") as SquadType) || "solo")
  const squadConfig = SQUAD_CONFIG[squad] ?? SQUAD_CONFIG.solo
  const cityFromUrl = searchParams.get("city") || ""

  const [destination, setDestination] = useState<DestinationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [travelDates, setTravelDates] = useState<{ start: string; end: string } | null>(null)
  const [summary, setSummary] = useState<string | undefined>()
  const [resolvedCity, setResolvedCity] = useState<string>("")
  const [aiContext, setAiContext] = useState<{ vibes: string[]; travelStyle: string } | null>(null)

  const getBudgetFromStorage = (): string => {
    try {
      const direct = sessionStorage.getItem("selectedBudget")
      if (direct) return direct
      const prefs = localStorage.getItem("single_mode_preferences")
      if (prefs) {
        const parsed = JSON.parse(prefs)
        return parsed.budget || "medium"
      }
    } catch {}
    return "medium"
  }

  useEffect(() => {
    const loadDestination = async () => {
      const countryNameFromUrl = decodeURIComponent(params.id as string)
      const isNumericIndex = !isNaN(parseInt(countryNameFromUrl, 10))

      const results = sessionStorage.getItem("analysisResults")
      const selectedCountryData = sessionStorage.getItem("selectedCountry")
      const dates = sessionStorage.getItem("travelDates")
      const budget = getBudgetFromStorage()

      let country: any = null

      if (selectedCountryData) {
        try {
          const selected = JSON.parse(selectedCountryData)
          const nameMatches = selected.name?.toLowerCase() === countryNameFromUrl.toLowerCase()
          if (nameMatches && selected.name) country = selected
        } catch {}
      }

      if (!country && results) {
        try {
          const parsed = JSON.parse(results)
          const countries = parsed.countries || []
          if (isNumericIndex) {
            const index = parseInt(countryNameFromUrl, 10)
            country = countries[index]
          } else {
            const foundIndex = countries.findIndex(
              (c: any) => c.name.toLowerCase() === countryNameFromUrl.toLowerCase()
            )
            if (foundIndex >= 0) country = countries[foundIndex]
          }
          if (parsed.summary) setSummary(parsed.summary)
        } catch {}
      }

      if (!country) {
        country = { name: countryNameFromUrl, matchPercentage: 0, image: "", tags: [], climate: "temperate" }
      }

      // Resolve the city: URL param first, then stored analysis city field
      const cityResolved = cityFromUrl || country.city || ""
      setResolvedCity(cityResolved)

      // Extract AI context from analysis data
      const rawVibes: string[] = country.tags || []
      const travelStyle: string = country.vibe || ""
      if (rawVibes.length > 0 || travelStyle) {
        setAiContext({ vibes: rawVibes, travelStyle })
      }

      let parsedDates: { start: string; end: string } | null = null
      if (dates) {
        try {
          parsedDates = JSON.parse(dates)
          setTravelDates(parsedDates)
        } catch {}
      }

      const travelMonth = parsedDates ? new Date(parsedDates.start).getMonth() : null

      try {
        const squadPreference = squad === "solo" ? "solo travel" : `${squad} travel`
        const detailsResponse = await fetch("/api/destination", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            countryCode:     country.code || getCountryCode(country.name) || "US",
            countryName:     country.name,
            city:            cityResolved || undefined,
            climate:         country.climate || "temperate",
            activities:      country.activities || [],
            userPreferences: [squadPreference, ...(country.tags || [])],
            budget,
            squad,
            travelDates:     parsedDates ?? undefined,
          }),
          cache: "no-store",
        })

        let details: any = {}
        if (detailsResponse.ok) {
          const detailsText = await detailsResponse.text()
          try { details = JSON.parse(detailsText) } catch {}
        }

        const [countryImg, hotelImg, restaurantImg, activityImg] = await Promise.all([
          cityResolved
            ? fetchCountryImage(cityResolved).catch(() => fetchCountryImage(country.name))
            : fetchCountryImage(country.name),
          generateCategoryImage(country.name, "hotels"),
          generateCategoryImage(country.name, "restaurants"),
          generateCategoryImage(country.name, "activities"),
        ])

        const rawPositives: string[] = country.positives || []
        const rawNegatives: string[] = country.negatives || []

        // Prefer Gemini-generated positives/negatives from the server when available
        const finalPositives: string[] = details.positives?.length > 0
          ? details.positives
          : buildSmartPositives(
              rawVibes,
              travelStyle,
              rawPositives,
              country.name,
              country.climate || "temperate",
              country.activities || [],
            )

        const finalNegatives: string[] = details.negatives?.length > 0
          ? details.negatives
          : buildSmartNegatives(
              rawVibes,
              travelStyle,
              travelMonth,
              country.name,
              country.climate || "temperate",
              country.activities || [],
              rawNegatives,
            )

        setDestination({
          name: country.name,
          matchPercentage: Math.round(country.matchPercentage || 0),
          image: details.destinationImage || countryImg || country.image,
          positives: finalPositives,
          negatives: finalNegatives,
          hotels: (details.hotels || []).slice(0, 6).map((h: any, idx: number) => ({
            name:        h.name,
            rating:      h.rating      || 4.5,
            description: h.description || "Great accommodation",
            price:       h.price       || "$$$",
            priceLevel:  h.priceLevel  || "luxury",
            address:     h.address     || "Unknown Address",
            amenities:   h.amenities   || [],
            image:       h.image       || (idx === 0 ? hotelImg : undefined),
          })),
          restaurants: (details.restaurants || []).slice(0, 6).map((r: any, idx: number) => ({
            name:            r.name,
            rating:          r.rating          || 4.5,
            userRatingsTotal: r.userRatingsTotal,
            cuisine:         r.cuisine         || "International",
            description:     r.description     || "Great dining experience",
            price:           r.price           || "$$",
            priceLevel:      r.priceLevel      || "mid-range",
            address:         r.address         || "Unknown Address",
            image:           r.image           || (idx === 0 ? restaurantImg : undefined),
            openNow:         r.openNow,
            mapsUrl:         r.mapsUrl,
          })),
          activities: (details.activities || []).slice(0, 6).map((a: any, idx: number) => ({
            name:        a.title       || a.name,
            duration:    a.duration    || "Half day",
            description: a.description || "Exciting activity",
            rating:      a.rating,
            image:       idx === 0 ? activityImg : undefined,
            price:       a.price       || undefined,
            category:    a.category    || undefined,
          })),
          transfers: (details.transfers || []).map((t: any) => ({
            name:     t.name     || "Transfer",
            vehicle:  t.vehicle  || "",
            capacity: t.capacity || 0,
            price:    t.price    || "",
            duration: t.duration || "",
          })),
          mapMarkers: details.mapMarkers || generateMapMarkersFromData(
            details.hotels      || [],
            details.restaurants || [],
            details.activities  || [],
            country.name,
          ),
        })
      } catch {
        const rawPositives: string[] = country.positives || []
        const rawNegatives: string[] = country.negatives || []

        setDestination({
          name:           country.name,
          matchPercentage: Math.round(country.matchPercentage || 0),
          image:          country.image,
          positives:      buildSmartPositives(rawVibes, travelStyle, rawPositives, country.name, country.climate || "temperate", country.activities || []),
          negatives:      buildSmartNegatives(rawVibes, travelStyle, travelMonth, country.name, country.climate || "temperate", country.activities || [], rawNegatives),
          hotels:         [{ name: "Hotel", rating: 4.5, description: "Great accommodation", price: "$$$", priceLevel: "luxury", address: "City Center, " + country.name, amenities: ["WiFi", "Restaurant", "Gym"], image: undefined }],
          restaurants:    [{ name: "Restaurant", rating: 4.5, cuisine: "Local", description: "Great dining", price: "$$", priceLevel: "mid-range", address: "City Center, " + country.name, image: undefined }],
          activities:     [{ name: "Activity", duration: "Full day", description: "Exciting experience", image: undefined }],
          transfers:      [],
        })
      }

      setLoading(false)
    }

    loadDestination()
  }, [params])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mx-auto mb-4"
          >
            <Sparkles className="h-10 w-10 text-green-500" />
          </motion.div>
          <p className="text-sm text-muted-foreground font-medium">Loading destination…</p>
        </div>
      </div>
    )
  }

  if (!destination) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">Destination not found</p>
          <Button asChild>
            <Link href="/results">Back to Results</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <DestinationDashboard
      destination={destination}
      city={resolvedCity || undefined}
      summary={summary}
      squadLabel={squadConfig.label}
      squadEmoji={squadConfig.emoji}
      squadTagline={squadConfig.tagline}
      backHref="/results"
      backLabel="Back to Results"
      aiContext={aiContext ?? undefined}
      holidayWarning={
        travelDates ? (
          <HolidayWarning
            countryCode={getCountryCode(destination.name)}
            countryName={destination.name}
            startDate={new Date(travelDates.start)}
            endDate={new Date(travelDates.end)}
          />
        ) : undefined
      }
      weatherContent={
        travelDates ? (
          <WeatherSection
            country={destination.name}
            startDate={travelDates.start}
            endDate={travelDates.end}
          />
        ) : undefined
      }
      eventsContent={
        travelDates ? (
          <EventsSection
            country={destination.name}
            startDate={travelDates.start}
            endDate={travelDates.end}
            userPreferences={["culture", "food", "adventure"]}
          />
        ) : undefined
      }
      mapContent={
        destination.mapMarkers ? (
          <DestinationMap markers={destination.mapMarkers} countryName={destination.name} />
        ) : undefined
      }
      itineraryContent={
        <ItineraryGenerator
          destinationName={destination.name}
          hotels={destination.hotels}
          restaurants={destination.restaurants}
          activities={destination.activities}
          initialBudget={getBudgetFromStorage()}
          initialDates={travelDates ?? undefined}
        />
      }
    />
  )
}

export default function DestinationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mx-auto mb-4"
            >
              <Sparkles className="h-10 w-10 text-green-500" />
            </motion.div>
            <p className="text-sm text-muted-foreground font-medium">Loading destination…</p>
          </div>
        </div>
      }
    >
      <DestinationPageInner />
    </Suspense>
  )
}

function generateMapMarkersFromData(
  hotels: any[],
  restaurants: any[],
  activities: any[],
  countryName: string,
): Array<{
  id: string
  name: string
  type: "hotel" | "restaurant" | "attraction"
  location: { lat: number; lng: number }
  info: { rating?: number; price?: string; cuisine?: string }
}> {
  const markers: Array<{
    id: string
    name: string
    type: "hotel" | "restaurant" | "attraction"
    location: { lat: number; lng: number }
    info: { rating?: number; price?: string; cuisine?: string }
  }> = []

  const hash = countryName.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const baseLat = 20 + (hash % 40)
  const baseLng = -20 + (hash % 80)

  hotels.slice(0, 3).forEach((hotel, index) => {
    markers.push({
      id: `hotel-${index}`,
      name: hotel.name || `Hotel ${index + 1}`,
      type: "hotel",
      location: { lat: baseLat + index * 0.01, lng: baseLng + index * 0.01 },
      info: { rating: hotel.rating || 4.5, price: hotel.price || "$$$" },
    })
  })

  restaurants.slice(0, 3).forEach((restaurant, index) => {
    markers.push({
      id: `restaurant-${index}`,
      name: restaurant.name || `Restaurant ${index + 1}`,
      type: "restaurant",
      location: { lat: baseLat + 0.02 + index * 0.01, lng: baseLng - 0.01 + index * 0.01 },
      info: { rating: restaurant.rating || 4.5, price: restaurant.price || "$$", cuisine: restaurant.cuisine || "Local" },
    })
  })

  activities.slice(0, 3).forEach((activity, index) => {
    markers.push({
      id: `activity-${index}`,
      name: activity.name || activity.title || `Activity ${index + 1}`,
      type: "attraction",
      location: { lat: baseLat - 0.01 + index * 0.02, lng: baseLng + 0.02 + index * 0.01 },
      info: { rating: activity.rating || 4.5 },
    })
  })

  return markers
}
