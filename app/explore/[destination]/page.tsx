import { notFound } from "next/navigation"
import { DESTINATIONS, SQUAD_LABELS, SQUAD_EMOJI } from "@/lib/travel-data"
import type { SquadType } from "@/lib/travel-data"
import { DestinationDashboard } from "@/components/destination/DestinationDashboard"

const VALID_SQUADS: SquadType[] = ["solo", "couple", "friends", "family"]

export default async function ExploreDashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ destination: string }>
  searchParams: Promise<{ squad?: string }>
}) {
  const { destination: destId } = await params
  const { squad: squadParam } = await searchParams

  // Validate and normalise squad — default to solo if param is missing or invalid
  const squad: SquadType = VALID_SQUADS.includes(squadParam as SquadType)
    ? (squadParam as SquadType)
    : "solo"

  const entry = DESTINATIONS.find((d) => d.id === destId)
  if (!entry) notFound()

  // Squad-filtered data
  const hotels = entry.hotels
    .filter((h) => h.squadTags.includes(squad))
    .map((h) => ({
      name: h.name,
      rating: h.rating,
      description: h.description,
      price: h.price,
      priceLevel: h.priceLevel,
      address: h.address,
      amenities: h.amenities,
      image: h.image,
    }))

  const restaurants = entry.restaurants
    .filter((r) => r.squadTags.includes(squad))
    .map((r) => ({
      name: r.name,
      rating: r.rating,
      cuisine: r.cuisine,
      description: r.description,
      price: r.price,
      priceLevel: r.priceLevel,
      address: r.address,
      image: r.image,
    }))

  const activities = entry.activities
    .filter((a) => a.squadTags.includes(squad))
    .map((a) => ({
      name: a.name,
      duration: a.duration,
      description: a.description,
      rating: a.rating,
      image: a.image,
    }))

  const squadEvents = entry.events
    .filter((e) => e.squadTags.includes(squad))
    .map((e) => ({
      title: e.name,
      category: e.category,
      date: e.date,
      matchPct: e.matchPercentage,
      description: e.description,
    }))

  // Map markers — approximate coords offset from city centre
  const { lat, lng } = entry.mapCenter
  const mapMarkers = [
    ...hotels.slice(0, 3).map((h, i) => ({
      id: `h${i}`,
      name: h.name,
      type: "hotel" as const,
      location: { lat: lat + i * 0.006 - 0.003, lng: lng + i * 0.005 - 0.002 },
      info: { rating: h.rating, price: h.price },
    })),
    ...restaurants.slice(0, 3).map((r, i) => ({
      id: `r${i}`,
      name: r.name,
      type: "restaurant" as const,
      location: { lat: lat - i * 0.004 + 0.002, lng: lng + i * 0.007 - 0.003 },
      info: { rating: r.rating, cuisine: r.cuisine },
    })),
    ...activities.slice(0, 2).map((a, i) => ({
      id: `a${i}`,
      name: a.name,
      type: "attraction" as const,
      location: { lat: lat + i * 0.003 + 0.004, lng: lng - i * 0.006 + 0.005 },
      info: { rating: a.rating },
    })),
  ]

  // Render the shared dashboard — same components as every other mode
  return (
    <DestinationDashboard
      destination={{
        name: entry.name,
        matchPercentage: entry.matchPercentage,
        image: entry.heroImage,
        positives: entry.positives[squad],
        negatives: entry.negatives[squad],
        hotels,
        restaurants,
        activities,
        mapMarkers,
      }}
      summary={entry.aiInsight[squad]}
      squadTagline={entry.taglines[squad]}
      squadLabel={SQUAD_LABELS[squad]}
      squadEmoji={SQUAD_EMOJI[squad]}
      squadEvents={squadEvents}
      squadItinerary={entry.itinerary[squad]}
      weatherBadge={`${entry.weather.temp} · ${entry.weather.condition}`}
      backHref="/explore"
      backLabel="Back to Explore"
    />
  )
}
