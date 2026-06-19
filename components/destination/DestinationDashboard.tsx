"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import type { TransportationInfo } from "@/lib/transport-client"
import { motion, AnimatePresence } from "framer-motion"
import { DestinationSidebar, MobileBottomNav } from "./DestinationSidebar"
import { DestinationHero } from "./DestinationHero"
import { NavTabs } from "./NavTabs"
import { OverviewSection } from "./OverviewSection"
import { HotelsCarousel } from "./HotelsCarousel"
import { RestaurantsCarousel } from "./RestaurantsCarousel"
import { ActivitiesGrid } from "./ActivitiesGrid"
import { EventsPanel } from "./EventsPanel"
import { MapSection } from "./MapSection"
import { ItinerarySection } from "./ItinerarySection"
import { AIInsightBox } from "./AIInsightBox"
import { TransportSection } from "./TransportSection"
import { AITransformSection } from "./AITransformSection"

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
    name:             string
    rating:           number
    userRatingsTotal?: number
    cuisine:          string
    description:      string
    price:            string
    priceLevel:       "budget" | "mid-range" | "luxury"
    address:          string
    image?:           string
    openNow?:         boolean
    mapsUrl?:         string
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
    id: string
    name: string
    type: "hotel" | "restaurant" | "attraction"
    location: { lat: number; lng: number }
    info: { rating?: number; price?: string; cuisine?: string }
  }>
  transportation?: TransportationInfo
}

interface SquadEvent {
  title:       string
  category:    string
  date:        string
  matchPct:    number
  description?: string
}

interface SquadItineraryDay {
  day:       number
  theme:     string
  morning:   string
  afternoon: string
  evening:   string
  icon:      string
}

interface DestinationDashboardProps {
  destination:     DestinationData
  city?:           string
  summary?:        string
  squadTagline?:   string
  squadLabel?:     string
  squadEmoji?:     string
  squadEvents?:    SquadEvent[]
  squadItinerary?: SquadItineraryDay[]
  weatherBadge?:   string
  backHref?:       string
  backLabel?:      string
  weatherContent?: ReactNode
  eventsContent?:  ReactNode
  mapContent?:     ReactNode
  itineraryContent?: ReactNode
  holidayWarning?: ReactNode
  aiContext?:      { vibes: string[]; travelStyle: string; confidenceBreakdown?: Record<string, number> }
}

const SECTION_VARIANTS = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
}

export function DestinationDashboard({
  destination,
  city,
  summary,
  squadLabel,
  squadEmoji,
  squadEvents,
  squadItinerary,
  weatherBadge,
  backHref,
  backLabel,
  weatherContent,
  eventsContent,
  mapContent,
  itineraryContent,
  holidayWarning,
  aiContext,
}: DestinationDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const resolvedCity = city || destination.name

  const renderSection = () => {
    switch (activeTab) {
      case "overview":
        return (
          <motion.div key="overview" {...SECTION_VARIANTS}>
            {holidayWarning && <div className="px-6 pt-6">{holidayWarning}</div>}
            <OverviewSection
              positives={destination.positives}
              negatives={destination.negatives}
              weatherContent={weatherContent}
              aiContext={aiContext}
            />
            <AIInsightBox
              destinationName={destination.name}
              summary={summary}
              positives={destination.positives}
              vibes={aiContext?.vibes}
              travelStyle={aiContext?.travelStyle}
            />
          </motion.div>
        )
      case "hotels":
        return (
          <motion.div key="hotels" {...SECTION_VARIANTS}>
            <HotelsCarousel hotels={destination.hotels} />
          </motion.div>
        )
      case "restaurants":
        return (
          <motion.div key="restaurants" {...SECTION_VARIANTS}>
            <RestaurantsCarousel restaurants={destination.restaurants} />
          </motion.div>
        )
      case "activities":
        console.log("[RUNTIME:dashboard] Rendering ActivitiesGrid — activeTab:", activeTab, "destination.activities.length:", destination.activities.length)
        return (
          <motion.div key="activities" {...SECTION_VARIANTS}>
            <ActivitiesGrid activities={destination.activities} />
          </motion.div>
        )
      case "events":
        return (
          <motion.div key="events" {...SECTION_VARIANTS}>
            <EventsPanel eventsContent={eventsContent} events={squadEvents} />
          </motion.div>
        )
      case "map":
        return (
          <motion.div key="map" {...SECTION_VARIANTS}>
            <MapSection mapContent={mapContent} markers={destination.mapMarkers} />
          </motion.div>
        )
      case "transport":
        return (
          <motion.div key="transport" {...SECTION_VARIANTS}>
            <TransportSection
              transfers={destination.transfers ?? []}
              cityName={resolvedCity}
              transportation={destination.transportation}
            />
          </motion.div>
        )
      case "ai-insights":
        return (
          <motion.div key="ai-insights" {...SECTION_VARIANTS}>
            <AITransformSection
              vibes={aiContext?.vibes ?? []}
              travelStyle={aiContext?.travelStyle ?? ""}
              positives={destination.positives}
              negatives={destination.negatives}
              destinationName={destination.name}
              confidenceBreakdown={aiContext?.confidenceBreakdown}
            />
          </motion.div>
        )
      case "plan":
        return (
          <motion.div key="plan" {...SECTION_VARIANTS}>
            <ItinerarySection generatorContent={itineraryContent} travelDays={squadItinerary} />
          </motion.div>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex bg-background min-h-screen">
      {/* Sidebar */}
      <div className="hidden md:block sticky top-0 h-screen shrink-0">
        <DestinationSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          destinationName={destination.name}
          backHref={backHref}
          backLabel={backLabel}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <DestinationHero
          name={destination.name}
          city={city}
          matchPercentage={destination.matchPercentage}
          image={destination.image}
          squadLabel={squadLabel}
          squadEmoji={squadEmoji}
          weatherBadge={weatherBadge}
        />

        <NavTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="pb-24 md:pb-8">
          <AnimatePresence mode="wait">
            {renderSection()}
          </AnimatePresence>
        </div>
      </div>

      <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
