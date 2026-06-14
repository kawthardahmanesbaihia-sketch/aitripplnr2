"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { EventsSection } from "@/components/events-section"
import { WeatherSection } from "@/components/weather-section"
import { HolidayWarning } from "@/components/holiday-warning"
import { DestinationMap } from "@/components/destination-map"
import { useMultiplayer } from "@/contexts/multiplayer-context"
import { getCountryCode } from "@/lib/destination-image-generator"
import { ItineraryGenerator } from "@/components/ItineraryGenerator"
import { DestinationDashboard } from "@/components/destination/DestinationDashboard"
import type { GeneratedDay } from "@/lib/destination-itinerary-generator"
import type { SquadType } from "@/lib/travel-data"

// Squad config
const SQUAD_CONFIG: Record<SquadType, { label: string; emoji: string; tagline: string }> = {
  solo:    { label: "Solo",    emoji: "👤", tagline: "Your personal adventure awaits" },
  couple:  { label: "Couple",  emoji: "💑", tagline: "A romantic escape for two" },
  friends: { label: "Friends", emoji: "👥", tagline: "Epic memories with your crew" },
  family:  { label: "Family",  emoji: "👨‍👩‍👧",  tagline: "Fun for every generation" },
}

// Destination data shape expected by DestinationDashboard
interface DestinationData {
  name: string
  matchPercentage: number
  image: string
  positives: string[]
  negatives: string[]
  hotels: Array<{
    name: string
    rating: number
    description: string
    price: string
    priceLevel: "budget" | "mid-range" | "luxury"
    address: string
    amenities: string[]
    image?: string
  }>
  restaurants: Array<{
    name: string
    rating: number
    cuisine: string
    description: string
    price: string
    priceLevel: "budget" | "mid-range" | "luxury"
    address: string
    image?: string
  }>
  activities: Array<{
    name: string
    duration: string
    description: string
    rating?: number
    image?: string
  }>
  mapMarkers?: Array<{
    id: string
    name: string
    type: "hotel" | "restaurant" | "attraction"
    location: { lat: number; lng: number }
    info: { rating?: number; price?: string; cuisine?: string }
  }>
}

// Fallbacks
function fallbackHotels(budget: string): DestinationData["hotels"] {
  const all = [
    { name: "Grand Hotel",    rating: 4.5, description: "Elegant city-centre hotel with full amenities", price: "$150–200/night", priceLevel: "mid-range" as const, address: "123 Main Street, City Centre", amenities: ["WiFi", "Pool", "Spa"],            image: "https://images.unsplash.com/photo-1566073771259-6aafc604bd87?w=400&q=80" },
    { name: "Budget Inn",     rating: 3.8, description: "Clean and comfortable rooms at great value",    price: "$60–80/night",  priceLevel: "budget"    as const, address: "456 Economy Ave",             amenities: ["WiFi", "Breakfast"],              image: "https://images.unsplash.com/photo-1520250497591-112f1f40d3ef?w=400&q=80" },
    { name: "Luxury Resort",  rating: 4.9, description: "World-class resort with private beach access",  price: "$300–500/night",priceLevel: "luxury"    as const, address: "789 Beach Road",              amenities: ["Pool", "Spa", "Gym", "Restaurant"],image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&q=80" },
    { name: "Boutique Hotel", rating: 4.3, description: "Charming boutique stay in the arts district",  price: "$120–180/night",priceLevel: "mid-range" as const, address: "321 Art District",             amenities: ["WiFi", "Bar", "Concierge"],       image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&q=80" },
  ]
  if (budget === "low")  return all.filter(h => h.priceLevel === "budget")
  if (budget === "high") return all.filter(h => h.priceLevel === "luxury")
  return all
}

function fallbackRestaurants(): DestinationData["restaurants"] {
  return [
    { name: "Local Kitchen",         rating: 4.4, cuisine: "Local",         description: "Authentic home-style cooking using seasonal produce",    price: "$15–25",  priceLevel: "budget"    as const, address: "100 Market St",     image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80" },
    { name: "Seafood Harbor",         rating: 4.6, cuisine: "Seafood",       description: "Fresh catch of the day with stunning harbour views",     price: "$30–50",  priceLevel: "mid-range" as const, address: "200 Harbor Blvd",   image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80" },
    { name: "Fine Dining Experience", rating: 4.8, cuisine: "International", description: "Award-winning tasting menus by a celebrated chef",       price: "$80–120", priceLevel: "luxury"    as const, address: "300 Gourmet Lane",  image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80" },
    { name: "Street Food Corner",     rating: 4.2, cuisine: "Street Food",   description: "Lively street-food stalls packed with local flavours",   price: "$5–15",   priceLevel: "budget"    as const, address: "400 Food Court",    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80" },
  ]
}

function fallbackActivities(): DestinationData["activities"] {
  return [
    { name: "City Walking Tour",       duration: "3 hours", description: "Explore the historic city centre with a local guide",    rating: 4.5, image: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=400&q=80" },
    { name: "Museum Visit",            duration: "2 hours", description: "Discover local art and history",                         rating: 4.3, image: "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=400&q=80" },
    { name: "Food Tasting Experience", duration: "4 hours", description: "Sample local cuisine and drinks at iconic spots",        rating: 4.7, image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80" },
    { name: "Outdoor Adventure",       duration: "6 hours", description: "Hiking and nature activities in nearby parks",           rating: 4.6, image: "https://images.unsplash.com/photo-1551698618-1d1a0a0f7181?w=400&q=80" },
  ]
}

// Page
export default function SquadDestinationPage() {
  const params = useParams()
  const sessionId = params.sessionId as string

  const { session, preferences, clearDestination, updatePreferences } = useMultiplayer()

  const [destination, setDestination] = useState<DestinationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [travelDates, setTravelDates] = useState<{ start: string; end: string } | null>(null)

  // Derive squad type: explicit preference → player count heuristic
  const rawSquad = (session?.preferences as any)?.squadType as SquadType | undefined
  const playerCount = Object.keys(session?.players || {}).length
  const squad: SquadType =
    rawSquad ?? (playerCount === 2 ? "couple" : playerCount >= 3 ? "friends" : "friends")
  const squadConfig = SQUAD_CONFIG[squad]

  const selectedIndex = preferences?.selectedDestinationIndex

  useEffect(() => {
    const load = async () => {
      if (!session?.analysisResults || selectedIndex === null || selectedIndex === undefined) {
        setLoading(false)
        return
      }

      const country = session.analysisResults.countries?.[selectedIndex]
      if (!country) {
        setLoading(false)
        return
      }

      if (session.preferences?.dateRange) {
        setTravelDates(session.preferences.dateRange)
      }

      const budget = session.preferences?.budget || "mid-range"
      const interests = session.preferences?.interests || []
      const squadPref = squad !== "solo" ? `${squad} travel` : "solo travel"

      try {
        const res = await fetch("/api/destination", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            countryName: country.name,
            countryCode: country.name.substring(0, 2).toUpperCase(),
            climate: country.climate || "Temperate",
            activities: interests,
            userPreferences: [squadPref, ...interests],
            budget,
            squad,
            seed: session.sessionId ? session.sessionId.charCodeAt(0) : 12345,
          }),
        })

        const destText = await res.text()
        let data: any
        try {
          data = JSON.parse(destText)
        } catch {
          console.error("[multiplayer/destination] Non-JSON response:", destText.slice(0, 200))
          throw new Error("Server returned an unexpected response.")
        }
        if (!res.ok) throw new Error(data?.error || "API error")

        setDestination({
          name: country.name,
          matchPercentage: Math.round(country.matchPercentage || 0),
          image: country.image || data.destinationImage,
          positives: [
            "Perfect match for your squad's preferences",
            "Great activities for group experiences",
            `Excellent value for ${budget} budget`,
            "Ideal conditions for your travel dates",
          ],
          negatives: data.negatives || [
            "Can be crowded during peak seasons",
            "Language barriers may exist in some areas",
            "Transportation costs may vary",
          ],
          hotels: (data.hotels || []).map((h: any) => ({
            name:        h.name,
            rating:      h.rating      || 4.0,
            description: h.description || "Great accommodation",
            price:       h.price       || "$$$",
            priceLevel:  h.priceLevel  || "mid-range",
            address:     h.address     || "City Centre",
            amenities:   h.amenities   || [],
            image:       h.image,
          })),
          restaurants: (data.restaurants || []).map((r: any) => ({
            name:        r.name,
            rating:      r.rating      || 4.0,
            cuisine:     r.cuisine     || "International",
            description: r.description || "Great dining experience",
            price:       r.price       || "$$",
            priceLevel:  r.priceLevel  || "mid-range",
            address:     r.address     || "City Centre",
            image:       r.image,
          })),
          activities: (data.activities || []).map((a: any) => ({
            name:        a.title || a.name,
            duration:    a.duration    || "Half day",
            description: a.description || "Exciting activity",
            rating:      a.rating,
            image:       a.image,
          })),
          mapMarkers: data.mapMarkers,
        })
      } catch {
        setDestination({
          name:            country.name,
          matchPercentage: Math.round(country.matchPercentage || 0),
          image:           country.image,
          positives: [
            "Perfect match for your squad's preferences",
            "Great activities for group experiences",
            `Excellent value for ${budget} budget`,
            "Ideal conditions for your travel dates",
          ],
          negatives: [
            "Can be crowded during peak seasons",
            "Language barriers may exist in some areas",
            "Transportation costs may vary",
          ],
          hotels:      fallbackHotels(budget),
          restaurants: fallbackRestaurants(),
          activities:  fallbackActivities(),
        })
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [session, selectedIndex, squad]) // eslint-disable-line react-hooks/exhaustive-deps

  // Loading state
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

  // Empty state
  if (!destination) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">No destination selected. Please select a country first.</p>
          <Button asChild>
            <Link href={`/multiplayer/session/${sessionId}`}>Back to Results</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Premium dashboard — identical UI to solo mode
  return (
    <DestinationDashboard
      destination={destination}
      squadLabel={squadConfig.label}
      squadEmoji={squadConfig.emoji}
      squadTagline={squadConfig.tagline}
      backHref={`/multiplayer/session/${sessionId}`}
      backLabel="Back to Session"
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
            userPreferences={preferences?.interests || []}
          />
        ) : undefined
      }
      mapContent={
        destination.mapMarkers?.length ? (
          <DestinationMap
            markers={destination.mapMarkers}
            countryName={destination.name}
          />
        ) : undefined
      }
      itineraryContent={
        <ItineraryGenerator
          destinationName={destination.name}
          hotels={destination.hotels}
          restaurants={destination.restaurants}
          activities={destination.activities}
          initialBudget={session?.preferences?.budget}
          initialDates={travelDates ?? undefined}
          initialDays={(session?.preferences as any)?.sharedItinerary}
          onSync={async (days: GeneratedDay[]) => {
            try {
              await updatePreferences({ sharedItinerary: days } as any)
            } catch (e) {
              console.error("Failed to sync itinerary:", e)
            }
          }}
        />
      }
    />
  )
}
