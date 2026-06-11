"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useTrackHistory } from "@/hooks/useTrackHistory"
import { FavoriteButton } from "@/components/FavoriteButton"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Calendar, Sparkles, ArrowRight, ChevronLeft, ChevronRight,
  MapPin, Star, Utensils, Hotel, Activity,
  Mountain, Waves, Landmark, Camera, Globe, Sun,
  BarChart3, Heart, RefreshCw, Loader2, AlertTriangle,
  Wind, Droplets, Thermometer, Bus, Train, Car,
} from "lucide-react"
import Link from "next/link"

// ── Types ─────────────────────────────────────────────────────────────────────

interface Destination {
  name: string
  code: string
  city?: string | null
  matchPercentage: number
  reason: string
  image?: string | null
  tags?: string[]
  shortSummary?: string
  climate: string
  vibe: string
  positives: string[]
  negatives: string[]
  activities: string[]
  foodHighlights: string[]
  hotels: Array<{ name: string; style: string; activity_level: string }>
  confidenceBreakdown: { activity: number; climate: number; mood: number; food: number }
}

interface SessionData {
  countries: Destination[]
  summary: string
  travelCompanion?: string | null
  userProfile?: {
    dominantMood:         string
    preferredClimate:     string
    preferredEnvironment: string
    activityLevel:        string
    foodPreferences:      string[]
  }
  selectedDestinationDetails?: {
    hotels?:      Array<{ name: string; priceLevel: string; rating?: number }>
    restaurants?: Array<{ name: string; cuisine?: string; priceLevel: string }>
    events?:      Array<{ date: string; name: string; localName?: string }>
  }
}

// Shape returned by /api/destination
interface DestinationApiData {
  hotels:           any[]
  restaurants:      any[]
  activities:       any[]
  transfers:        any[]
  weather:          any | null
  events:           any[]
  mapMarkers:       any[]
  negatives:        string[]
  summary:          any | null
  destinationImage: string
  dataSources:      Record<string, string>
}

// ── Utilities ─────────────────────────────────────────────────────────────────

const FALLBACK = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=80"

function countryCodeToFlag(code: string): string {
  if (!code || code.length < 2) return "🌍"
  try {
    const pts = code.toUpperCase().slice(0, 2).split("").map(c => 0x1f1e6 + c.charCodeAt(0) - 65)
    return String.fromCodePoint(...pts)
  } catch { return "🌍" }
}

function getClimateInfo(climate: string): { label: string; emoji: string; season: string } {
  const map: Record<string, { label: string; emoji: string; season: string }> = {
    tropical:      { label: "Tropical",       emoji: "🌴", season: "Nov – Apr" },
    mediterranean: { label: "Mediterranean",  emoji: "☀️", season: "Apr – Oct" },
    temperate:     { label: "Temperate",      emoji: "🌤️", season: "May – Sep" },
    cold:          { label: "Alpine",         emoji: "❄️", season: "Jun – Aug" },
    desert:        { label: "Desert",         emoji: "🏜️", season: "Oct – Mar" },
    varied:        { label: "Diverse",        emoji: "🌍", season: "Year-round" },
  }
  return map[climate?.toLowerCase()] ?? { label: "Mixed", emoji: "🌍", season: "Year-round" }
}

function getBudgetLabel(hotels?: Destination["hotels"]): { label: string; emoji: string } {
  const style = hotels?.[0]?.style
  if (style === "budget") return { label: "Budget-Friendly", emoji: "💵" }
  if (style === "luxury") return { label: "Luxury",          emoji: "💎" }
  return                         { label: "Mid-Range",       emoji: "💰" }
}

function getActivityIcon(activity: string) {
  const a = activity.toLowerCase()
  if (/beach|surf|ocean|sea|swim|coast|diving|water/.test(a)) return Waves
  if (/hik|trek|mountain|climb|alpine|ski/.test(a))           return Mountain
  if (/cultur|museum|histor|art|temple|cathedral|palace/.test(a)) return Landmark
  if (/food|cuisine|restaurant|dining|market|gastronomy/.test(a)) return Utensils
  if (/photo|scenic|viewpoint|landscape/.test(a))             return Camera
  if (/city|urban|nightlife|shopping|tour/.test(a))           return Globe
  if (/wildlife|safari|nature|park|jungle/.test(a))           return Sun
  return Activity
}

// ── Static attractions database ───────────────────────────────────────────────

const CITY_ATTRACTIONS: Record<string, Array<{ name: string; description: string; emoji: string }>> = {
  Paris:      [{ name: "Eiffel Tower", description: "The iron lattice symbol of France standing 330m above the city", emoji: "🗼" }, { name: "Louvre Museum", description: "World's most visited museum, home to the Mona Lisa and 35,000 artworks", emoji: "🏛️" }, { name: "Sacré-Cœur & Montmartre", description: "Hilltop basilica in the bohemian artist district with sweeping city views", emoji: "⛪" }, { name: "Seine River Cruise", description: "Glide past Notre-Dame and illuminated Parisian monuments at dusk", emoji: "🚢" }],
  Tokyo:      [{ name: "Senso-ji Temple", description: "Tokyo's oldest Buddhist temple in historic Asakusa, founded in 645 AD", emoji: "⛩️" }, { name: "Shibuya Crossing", description: "The world's busiest pedestrian scramble — a defining Tokyo moment", emoji: "🚦" }, { name: "Shinjuku Gyoen", description: "Peaceful national garden blending French, English and Japanese landscapes", emoji: "🌸" }, { name: "teamLab Planets", description: "Mind-bending immersive digital art museum unlike anything else on earth", emoji: "🎨" }],
  Rome:       [{ name: "Colosseum", description: "Ancient amphitheater that once staged gladiatorial battles for 80,000", emoji: "🏟️" }, { name: "Vatican & Sistine Chapel", description: "Michelangelo's breathtaking ceiling fresco in the world's smallest state", emoji: "✝️" }, { name: "Trevi Fountain", description: "Baroque masterpiece — toss a coin to guarantee your return to Rome", emoji: "⛲" }, { name: "Borghese Gallery", description: "Intimate gallery with Bernini sculptures and Caravaggio paintings", emoji: "🖼️" }],
  Barcelona:  [{ name: "Sagrada Família", description: "Gaudí's unfinished masterpiece — a basilica unlike any other in the world", emoji: "🕌" }, { name: "Park Güell", description: "Mosaic-covered terraces and surreal architecture on a Barcelona hillside", emoji: "🌈" }, { name: "La Boqueria Market", description: "Vibrant covered market on La Rambla bursting with tapas and fresh produce", emoji: "🥘" }, { name: "Gothic Quarter", description: "Medieval maze of streets hiding Roman ruins, cathedrals and hidden plazas", emoji: "🏰" }],
  Bali:       [{ name: "Tanah Lot Temple", description: "Sea temple perched on a rocky offshore islet, especially stunning at sunset", emoji: "🌅" }, { name: "Tegallalang Rice Terraces", description: "Stunning stepped rice paddies carved into the hillside above Ubud", emoji: "🌾" }, { name: "Uluwatu Kecak Dance", description: "Clifftop Balinese fire ceremony performed at sunset above the Indian Ocean", emoji: "🔥" }, { name: "Sacred Monkey Forest", description: "Ancient forest sanctuary with 700 long-tailed macaques and temple ruins", emoji: "🐒" }],
  Dubai:      [{ name: "Burj Khalifa", description: "World's tallest building at 828m with an observation deck for infinite views", emoji: "🏙️" }, { name: "Dubai Gold Souk", description: "Traditional market glittering with gold jewellery in the historic creek area", emoji: "⚓" }, { name: "Desert Safari", description: "Dune bashing at sunset followed by a Bedouin camp dinner under the stars", emoji: "🏜️" }, { name: "Palm Jumeirah", description: "Man-made island archipelago with luxury hotels, clubs and the Atlantis", emoji: "🌴" }],
  Bangkok:    [{ name: "Grand Palace", description: "Magnificent royal complex housing the sacred Emerald Buddha since 1782", emoji: "👑" }, { name: "Floating Markets", description: "Damnoen Saduak vendors selling food from wooden boats on canal waterways", emoji: "🛶" }, { name: "Khao San Road", description: "Legendary backpacker street — street food, bars and cultural crossroads", emoji: "🎉" }, { name: "Wat Arun", description: "Temple of Dawn with mosaic spires on the banks of the Chao Phraya River", emoji: "⛩️" }],
  Kyoto:      [{ name: "Fushimi Inari Shrine", description: "Thousands of vermillion torii gates winding up a mountain through cedar forest", emoji: "⛩️" }, { name: "Arashiyama Bamboo Grove", description: "Towering bamboo stalks create an otherworldly rustling green corridor", emoji: "🎋" }, { name: "Kinkaku-ji", description: "Gold-leaf covered Zen temple perfectly reflected in the surrounding pond", emoji: "🏯" }, { name: "Gion District", description: "Historic geisha district where maiko still walk lantern-lit cobblestone streets", emoji: "🌸" }],
  Amsterdam:  [{ name: "Rijksmuseum", description: "Dutch national museum housing Rembrandt's Night Watch and Vermeer masterpieces", emoji: "🎨" }, { name: "Anne Frank House", description: "The secret annex where Anne Frank wrote her diary — a profound historic site", emoji: "📖" }, { name: "Jordaan District", description: "Charming canal-side neighbourhood with galleries, markets and brown cafes", emoji: "🌷" }, { name: "Canal Boat Tour", description: "See Amsterdam from the water — 17th-century gabled houses and 1,500 bridges", emoji: "⚓" }],
  Istanbul:   [{ name: "Hagia Sophia", description: "Byzantine masterpiece that has been cathedral, mosque and museum across 1,500 years", emoji: "🕌" }, { name: "Grand Bazaar", description: "One of the world's oldest covered markets with 4,000 shops and vivid colour", emoji: "🛍️" }, { name: "Bosphorus Cruise", description: "Sail between Europe and Asia watching Ottoman palaces glide by", emoji: "🚢" }, { name: "Topkapi Palace", description: "Lavish Ottoman royal palace housing the Imperial Treasury and sacred relics", emoji: "🏛️" }],
  Marrakech:  [{ name: "Jemaa el-Fnaa", description: "UNESCO square that transforms at night into a festival of music and food", emoji: "🎭" }, { name: "Majorelle Garden", description: "Electric blue garden sanctuary once owned by Yves Saint Laurent", emoji: "🌵" }, { name: "Medina Souks", description: "Labyrinthine market alleyways selling spices, lanterns and handcrafted goods", emoji: "🧺" }, { name: "Bahia Palace", description: "19th-century riad palace with ornate mosaic courtyards and stucco ceilings", emoji: "🏯" }],
  Santorini:  [{ name: "Oia Sunset", description: "World-famous caldera views and blue-domed churches at the most romantic village", emoji: "🌅" }, { name: "Akrotiri Ruins", description: "Preserved Minoan Bronze Age city buried by the same eruption that shaped the island", emoji: "🏺" }, { name: "Red Beach", description: "Dramatic rust-red volcanic cliffs framing a unique beach accessible by boat", emoji: "🏖️" }, { name: "Caldera Hot Springs", description: "Soak in naturally warm volcanic waters with cliff views in Palea Kameni", emoji: "♨️" }],
  Lisbon:     [{ name: "Belém Tower", description: "16th-century limestone fortress on the Tagus — Portugal's Age of Discovery icon", emoji: "🗼" }, { name: "Alfama & Fado Houses", description: "Ancient Moorish district of steep alleys and melancholic fado music", emoji: "🎵" }, { name: "Sintra Palaces", description: "Fairy-tale palaces and Moorish castles in the misty Serra mountains", emoji: "🏰" }, { name: "Time Out Market", description: "The world's best food hall bringing Lisbon's top chefs under one roof", emoji: "🍽️" }],
  Prague:     [{ name: "Prague Castle", description: "World's largest ancient castle complex dominating the skyline since the 9th century", emoji: "🏰" }, { name: "Charles Bridge", description: "Baroque-statued 14th-century bridge across the Vltava — magical at sunrise", emoji: "🌉" }, { name: "Old Town Square", description: "Gothic and Baroque architecture surrounding the famous Astronomical Clock", emoji: "⏰" }, { name: "Josefov", description: "The beautifully preserved Jewish Quarter with six synagogues and a cemetery", emoji: "✡️" }],
  Sydney:     [{ name: "Sydney Opera House", description: "Jørn Utzon's sail-shaped masterpiece on Bennelong Point — Australia's icon", emoji: "🎭" }, { name: "Bondi to Coogee Walk", description: "Spectacular 6km clifftop coastal walk past rock pools and ocean sculptures", emoji: "🏖️" }, { name: "Taronga Zoo", description: "World-class zoo with harbour views where you can meet native Australian wildlife", emoji: "🦘" }, { name: "Royal Botanic Garden", description: "26 hectares of lush gardens on the harbour with views of the Opera House", emoji: "🌿" }],
  Singapore:  [{ name: "Gardens by the Bay", description: "Futuristic park with 18-storey Supertrees and the world's largest glass greenhouses", emoji: "🌿" }, { name: "Hawker Centres", description: "UNESCO-recognised street food culture where Michelin dishes cost under $5", emoji: "🍜" }, { name: "Marina Bay Sands", description: "The iconic three-tower hotel with an infinity pool 200m above the city", emoji: "🏙️" }, { name: "Chinatown & Little India", description: "Vibrant cultural enclaves with temples, street markets and Asian flavours", emoji: "🏮" }],
  London:     [{ name: "British Museum", description: "Eight million objects spanning two million years of history — free admission", emoji: "🏛️" }, { name: "Tower of London", description: "900-year-old royal fortress housing the Crown Jewels and centuries of history", emoji: "👑" }, { name: "Borough Market", description: "London's oldest food market under Southwark Bridge — a foodie paradise", emoji: "🥩" }, { name: "Tate Modern", description: "World-class contemporary art in a converted Bankside power station", emoji: "🎨" }],
  Phuket:     [{ name: "Phang Nga Bay", description: "Dramatic limestone karst islands rising from emerald water — James Bond Island", emoji: "⛵" }, { name: "Big Buddha", description: "45m white marble Maravija statue visible from across the island", emoji: "🪷" }, { name: "Old Phuket Town", description: "Colourful Sino-Portuguese shophouses, street art and local restaurants", emoji: "🏘️" }, { name: "Phi Phi Islands", description: "Impossibly turquoise lagoons surrounded by sheer limestone cliffs — paradise", emoji: "🏝️" }],
  "New York": [{ name: "Central Park", description: "843 acres of green escape in Manhattan — the world's most visited urban park", emoji: "🌳" }, { name: "The High Line", description: "Elevated park on a 1930s freight rail line with art, gardens and Hudson views", emoji: "🚂" }, { name: "The Met", description: "One of the world's largest museums spanning 5,000 years of human creativity", emoji: "🎨" }, { name: "Brooklyn Bridge", description: "Iconic 1883 suspension bridge — walk across for classic Manhattan skyline shots", emoji: "🌉" }],
}

function getAttractions(city: string, activities?: string[]) {
  for (const key of Object.keys(CITY_ATTRACTIONS)) {
    if (key.toLowerCase() === city.toLowerCase()) return CITY_ATTRACTIONS[key]
  }
  for (const [key, attractions] of Object.entries(CITY_ATTRACTIONS)) {
    if (city.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(city.toLowerCase())) {
      return attractions
    }
  }
  const fallback = (activities ?? []).slice(0, 4).map(a => ({
    name: a.charAt(0).toUpperCase() + a.slice(1),
    description: `Experience the best of ${city}'s ${a.toLowerCase()} scene`,
    emoji: "📍",
  }))
  return fallback.length > 0
    ? fallback
    : [{ name: `${city} Old Town`, description: `Explore the historic heart of ${city}`, emoji: "🏛️" }]
}

// ── ScoreBar component ────────────────────────────────────────────────────────

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-medium">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-foreground">{Math.round(value)}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  )
}

// ── Small loading spinner inline ──────────────────────────────────────────────

function SectionLoader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-8 justify-center text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const { user } = useAuth()
  const track    = useTrackHistory()
  const historyTracked = useRef(false)

  // ── Session data ────────────────────────────────────────────────────────────
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [isLoading,   setIsLoading]   = useState(true)

  // ── Multi-destination navigation ─────────────────────────────────────────────
  const [activeDestIndex, setActiveDestIndex] = useState(0)
  const [slideDir, setSlideDir] = useState<1 | -1>(1)

  // ── Per-destination gallery state ─────────────────────────────────────────────
  const [destGalleries,   setDestGalleries]   = useState<Record<string, string[]>>({})
  const [galleryLoading,  setGalleryLoading]  = useState<Record<string, boolean>>({})
  const [activePhotos,    setActivePhotos]    = useState<Record<string, number>>({})

  // ── Per-destination full API data ─────────────────────────────────────────────
  const [destDetails,  setDestDetails]  = useState<Record<string, DestinationApiData>>({})
  const [detailLoading, setDetailLoading] = useState<Record<string, boolean>>({})

  // ── Track history once both session data and auth are ready ──────────────────
  useEffect(() => {
    if (!user || !sessionData || historyTracked.current) return
    historyTracked.current = true
    const budget = sessionStorage.getItem("selectedBudget") || undefined
    sessionData.countries.slice(0, 3).forEach(d => {
      track({
        country:          d.name,
        city:             d.city             || undefined,
        country_code:     d.code             || undefined,
        match_percentage: Math.round(d.matchPercentage),
        travel_style:     d.vibe             || undefined,
        budget,
        image_url:        d.image            || undefined,
      })
    })
  }, [user, sessionData]) // eslint-disable-line react-hooks/exhaustive-deps

  // Prevent duplicate in-flight requests
  const fetchedGalleries = useRef<Set<string>>(new Set())
  const fetchedDetails   = useRef<Set<string>>(new Set())

  // ── Load sessionStorage on mount ─────────────────────────────────────────────
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("analysisResults")
      if (!raw) { setIsLoading(false); return }
      const parsed: SessionData = JSON.parse(raw)
      if (!parsed.countries?.length) { setIsLoading(false); return }
      setSessionData(parsed)

      console.log(`RESULTS — ${parsed.countries.length} destinations`)
      parsed.countries.forEach((d, i) => {
        console.log(`  [${i + 1}] ${d.name} | city=${d.city ?? "—"} | match=${d.matchPercentage}% | image=${d.image ? "✓" : "✗"}`)
      })
    } catch (e) {
      console.error("[results] sessionStorage parse error:", e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const destinations = sessionData?.countries?.slice(0, 3) ?? []

  // ── Lazy fetch gallery for a destination ──────────────────────────────────────
  const fetchGallery = useCallback(async (dest: Destination) => {
    const key = dest.name
    if (fetchedGalleries.current.has(key)) return
    fetchedGalleries.current.add(key)
    setGalleryLoading(prev => ({ ...prev, [key]: true }))
    try {
      const city = dest.city || dest.name
      const res = await fetch(
        `/api/destination-gallery?city=${encodeURIComponent(city)}&country=${encodeURIComponent(dest.name)}`
      )
      if (res.ok) {
        const json = await res.json()
        setDestGalleries(prev => ({ ...prev, [key]: json.images ?? [] }))
        console.log(`GALLERY [${dest.name}]:`, (json.images ?? []).length, "photos")
      }
    } catch (e) {
      console.error(`[results] Gallery fetch error for ${dest.name}:`, e)
    } finally {
      setGalleryLoading(prev => ({ ...prev, [key]: false }))
    }
  }, [])

  // ── Lazy fetch full API data for a destination ────────────────────────────────
  const fetchDetails = useCallback(async (dest: Destination, sd: SessionData) => {
    const key = dest.name
    if (fetchedDetails.current.has(key)) return
    fetchedDetails.current.add(key)
    setDetailLoading(prev => ({ ...prev, [key]: true }))
    try {
      const budget       = sessionStorage.getItem("selectedBudget") || "medium"
      const travelRaw    = sessionStorage.getItem("travelDates")
      const travelDates  = travelRaw ? JSON.parse(travelRaw) : undefined
      const squad        = sd.travelCompanion ?? "solo"
      const profile      = sd.userProfile
      const userPrefs    = [
        squad !== "solo" ? `${squad} travel` : "solo travel",
        ...(profile ? [profile.dominantMood, profile.preferredEnvironment] : []),
        ...(dest.activities ?? []).slice(0, 2),
      ].filter(Boolean)

      const res = await fetch("/api/destination", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryCode:     dest.code || "US",
          countryName:     dest.name,
          city:            dest.city || undefined,
          climate:         dest.climate,
          activities:      dest.activities ?? [],
          userPreferences: userPrefs,
          budget,
          squad,
          travelDates,
        }),
      })
      if (res.ok) {
        const data: DestinationApiData = await res.json()
        setDestDetails(prev => ({ ...prev, [key]: data }))
        console.log(`DETAILS [${dest.name}]: hotels=${data.hotels?.length ?? 0} restaurants=${data.restaurants?.length ?? 0} activities=${data.activities?.length ?? 0} events=${data.events?.length ?? 0} weather=${data.weather?.type ?? "null"}`)
      }
    } catch (e) {
      console.error(`[results] Detail fetch error for ${dest.name}:`, e)
    } finally {
      setDetailLoading(prev => ({ ...prev, [key]: false }))
    }
  }, [])

  // ── Trigger fetches when active destination or session data changes ──────────
  useEffect(() => {
    if (!sessionData || !destinations.length) return
    const dest = destinations[activeDestIndex]
    if (!dest) return
    fetchGallery(dest)
    fetchDetails(dest, sessionData)
    // Prefetch gallery for the NEXT destination so it's ready when user navigates
    const next = destinations[activeDestIndex + 1]
    if (next) fetchGallery(next)
  }, [activeDestIndex, sessionData, destinations.length]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Keyboard navigation ───────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") { e.preventDefault(); goNext() }
      if (e.key === "ArrowLeft")  { e.preventDefault(); goPrev() }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }) // no dep array — always references latest nav functions

  // ── Navigation helpers ────────────────────────────────────────────────────────
  const goNext = useCallback(() => {
    setActiveDestIndex(i => {
      if (i >= destinations.length - 1) return i
      setSlideDir(1)
      return i + 1
    })
  }, [destinations.length])

  const goPrev = useCallback(() => {
    setActiveDestIndex(i => {
      if (i <= 0) return i
      setSlideDir(-1)
      return i - 1
    })
  }, [])

  const goTo = (index: number) => {
    setSlideDir(index > activeDestIndex ? 1 : -1)
    setActiveDestIndex(index)
  }

  // ── Per-destination photo helpers ─────────────────────────────────────────────
  const getPhotos = (dest: Destination) => {
    const gallery = destGalleries[dest.name] ?? []
    return [dest.image || FALLBACK, ...gallery].filter(Boolean) as string[]
  }

  const getActivePhoto = (destName: string) => activePhotos[destName] ?? 0

  const setPhoto = (destName: string, idx: number) => {
    setActivePhotos(prev => ({ ...prev, [destName]: idx }))
  }

  const prevPhoto = (dest: Destination) => {
    const photos = getPhotos(dest)
    setPhoto(dest.name, (getActivePhoto(dest.name) - 1 + photos.length) % photos.length)
  }

  const nextPhoto = (dest: Destination) => {
    const photos = getPhotos(dest)
    setPhoto(dest.name, (getActivePhoto(dest.name) + 1) % photos.length)
  }

  // ── Loading / empty states ────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
            <Sparkles className="h-12 w-12 text-primary mx-auto" />
          </motion.div>
          <p className="text-muted-foreground font-medium">Finding your perfect destinations…</p>
        </div>
      </div>
    )
  }

  if (!sessionData || !destinations.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-lg text-muted-foreground">No results found.</p>
          <Button asChild><Link href="/single">Start Over</Link></Button>
        </div>
      </div>
    )
  }

  const squad = sessionData.travelCompanion ?? "solo"

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="relative bg-background overflow-x-hidden">

      {/* ── Destination slide area ─── */}
      <AnimatePresence mode="wait" custom={slideDir} initial={false}>
        <motion.div
          key={`dest-${activeDestIndex}`}
          custom={slideDir}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          initial={((dir: number) => ({ opacity: 0, x: dir > 0 ? 60 : -60 })) as any}
          animate={{ opacity: 1, x: 0 }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          exit={((dir: number) => ({ opacity: 0, x: dir > 0 ? -60 : 60 })) as any}
          transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="min-h-screen"
        >
          {(() => {
            const dest     = destinations[activeDestIndex]
            const city     = dest.city || dest.name
            const flag     = countryCodeToFlag(dest.code || "")
            const climate  = getClimateInfo(dest.climate)
            const budget   = getBudgetLabel(dest.hotels)
            const match    = Math.round(dest.matchPercentage)
            const allPhotos = getPhotos(dest)
            const curPhoto = getActivePhoto(dest.name)
            const detail   = destDetails[dest.name]
            const loading  = detailLoading[dest.name] ?? false
            const isGalLoading = galleryLoading[dest.name] ?? false
            const breakdown = dest.confidenceBreakdown
            const positives = dest.positives ?? [dest.reason].filter(Boolean)

            // Data resolution: prefer real API data, fall back to analyze data
            const hotels = (detail?.hotels?.length ?? 0) > 0
              ? detail.hotels
              : (activeDestIndex === 0 && (sessionData.selectedDestinationDetails?.hotels?.length ?? 0) > 0)
                ? sessionData.selectedDestinationDetails!.hotels
                : (dest.hotels ?? []).map(h => ({ name: h.name, priceLevel: h.style, rating: undefined }))

            const restaurants = (detail?.restaurants?.length ?? 0) > 0
              ? detail.restaurants
              : (activeDestIndex === 0 ? sessionData.selectedDestinationDetails?.restaurants ?? [] : [])

            const liveActivities = (detail?.activities?.length ?? 0) > 0
              ? detail.activities
              : null

            const displayActivities = (liveActivities
              ? liveActivities.map((a: any) => a.name || a.title || "")
              : (dest.activities ?? [])
            ).filter(Boolean).slice(0, 6)

            const weather    = detail?.weather ?? null
            const events     = detail?.events ?? []
            const transfers  = detail?.transfers ?? []
            const negatives  = (detail?.negatives?.length ?? 0) > 0
              ? detail.negatives
              : dest.negatives ?? []
            const attractions = getAttractions(city, dest.activities)

            // Holiday events (public holidays from analyze, Eventbrite from detail)
            const publicHolidays = activeDestIndex === 0
              ? (sessionData.selectedDestinationDetails?.events ?? [])
              : []

            return (
              <>
                {/* ════ CINEMATIC HERO ════════════════════════════════════════ */}
                <div className="relative w-full" style={{ height: "85vh", minHeight: 560 }}>
                  {/* Background photo carousel */}
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={`${dest.name}-photo-${curPhoto}`}
                      src={allPhotos[curPhoto] || FALLBACK}
                      alt={`${city} photo ${curPhoto + 1}`}
                      initial={{ opacity: 0, scale: 1.04 }}
                      animate={{ opacity: 1,  scale: 1    }}
                      exit={  { opacity: 0,  scale: 0.98  }}
                      transition={{ duration: 0.55, ease: "easeInOut" }}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={e => { e.currentTarget.src = FALLBACK }}
                    />
                  </AnimatePresence>

                  {/* Gradient overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

                  {/* ── Top bar ── */}
                  <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex items-center justify-between z-20 gap-3">
                    {/* Left: back */}
                    <Button asChild variant="ghost" size="sm" className="text-white/90 hover:text-white hover:bg-white/15 backdrop-blur-sm border border-white/20 rounded-full flex-shrink-0">
                      <Link href="/single">
                        <ChevronLeft className="h-4 w-4 mr-1" /> Start over
                      </Link>
                    </Button>

                    {/* Center: destination switcher pills */}
                    <div className="flex items-center gap-1.5 flex-wrap justify-center">
                      {destinations.map((d, i) => {
                        const f = countryCodeToFlag(d.code || "")
                        const isActive = i === activeDestIndex
                        return (
                          <motion.button
                            key={d.name}
                            onClick={() => goTo(i)}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all backdrop-blur-sm border ${
                              isActive
                                ? "bg-white text-black border-white/50 shadow-lg"
                                : "bg-white/10 text-white/70 border-white/20 hover:bg-white/20 hover:text-white"
                            }`}
                          >
                            <span className="text-sm leading-none">{f}</span>
                            <span className="hidden sm:block">{d.city || d.name}</span>
                            <span className="sm:hidden">{String(i + 1).padStart(2, "0")}</span>
                          </motion.button>
                        )
                      })}
                    </div>

                    {/* Right: nav + match badge */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={goPrev}
                        disabled={activeDestIndex === 0}
                        className="h-8 w-8 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Previous destination"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center gap-1.5 bg-primary/90 backdrop-blur-sm text-primary-foreground px-3 py-1.5 rounded-full text-xs font-bold shadow-lg"
                      >
                        <Star className="h-3 w-3 fill-current" />
                        {match}%
                        <span className="hidden sm:inline">AI Match</span>
                      </motion.div>
                      <button
                        onClick={goNext}
                        disabled={activeDestIndex >= destinations.length - 1}
                        className="h-8 w-8 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Next destination"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* ── Center hero content ── */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 px-6 text-center">
                    <motion.div
                      key={`hero-content-${dest.name}`}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15, duration: 0.6 }}
                      className="space-y-3"
                    >
                      <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-4 py-1.5 text-sm font-medium mb-2">
                        <Sparkles className="h-3.5 w-3.5" />
                        Destination {String(activeDestIndex + 1).padStart(2, "0")} of {String(destinations.length).padStart(2, "0")}
                      </div>

                      <div className="flex items-center justify-center gap-3 flex-wrap">
                        <MapPin className="h-6 w-6 text-primary shrink-0" />
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight drop-shadow-lg">
                          {city}
                        </h1>
                      </div>

                      <p className="text-2xl md:text-3xl font-semibold text-white/90 drop-shadow">
                        {dest.name} {flag}
                      </p>

                      {/* Quick stats */}
                      <div className="flex items-center justify-center gap-3 flex-wrap mt-4">
                        {[
                          { icon: climate.emoji, text: climate.label },
                          { icon: budget.emoji,  text: budget.label  },
                          { icon: "🗓️",          text: climate.season },
                          { icon: "✨",           text: dest.vibe     },
                        ].map(({ icon, text }) => (
                          <span key={text} className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 text-sm font-medium">
                            {icon} {text}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  </div>

                  {/* ── Photo gallery nav arrows ── */}
                  {allPhotos.length > 1 && (
                    <>
                      <button onClick={() => prevPhoto(dest)} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center transition-all" aria-label="Previous photo">
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button onClick={() => nextPhoto(dest)} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center transition-all" aria-label="Next photo">
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}

                  {/* ── Bottom: CTAs + thumbnail strip ── */}
                  <div className="absolute bottom-0 left-0 right-0 z-10">
                    <div className="flex items-center justify-center gap-3 px-6 pb-4 flex-wrap">
                      <Button asChild size="lg" className="rounded-full px-7 py-5 text-sm font-semibold shadow-lg">
                        <Link href="/itinerary">
                          <Calendar className="mr-2 h-4 w-4" />
                          Generate Itinerary
                        </Link>
                      </Button>
                      <Button
                        asChild variant="outline" size="lg"
                        className="rounded-full px-7 py-5 text-sm font-semibold bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20"
                        onClick={() => {
                          sessionStorage.setItem("selectedCountry", JSON.stringify({
                            index: activeDestIndex, name: dest.name, city,
                            climate: dest.climate, vibe: dest.vibe,
                            matchPercentage: dest.matchPercentage,
                            image: dest.image ?? null,
                            tags:  dest.tags ?? [],
                            timestamp: Date.now(),
                          }))
                        }}
                      >
                        <Link href={`/destination/${encodeURIComponent(dest.name)}?squad=${squad}&city=${encodeURIComponent(city)}`}>
                          <ArrowRight className="mr-2 h-4 w-4" />
                          Full Destination Guide
                        </Link>
                      </Button>
                      <FavoriteButton
                        country={dest.name}
                        city={dest.city}
                        destinationName={city}
                        imageUrl={dest.image}
                        matchPercentage={Math.round(dest.matchPercentage)}
                      />
                    </div>

                    {/* Photo thumbnails */}
                    {allPhotos.length > 1 && (
                      <div className="flex gap-2 px-6 pb-5 overflow-x-auto scrollbar-none justify-center">
                        {allPhotos.map((src, i) => (
                          <button
                            key={i}
                            onClick={() => setPhoto(dest.name, i)}
                            className={`flex-shrink-0 h-14 w-20 rounded-lg overflow-hidden border-2 transition-all ${
                              i === curPhoto
                                ? "border-white scale-105 shadow-lg shadow-white/20"
                                : "border-white/30 opacity-60 hover:opacity-90"
                            }`}
                          >
                            <img src={src} alt="" className="h-full w-full object-cover" />
                          </button>
                        ))}
                        {isGalLoading && (
                          <div className="flex-shrink-0 h-14 w-20 rounded-lg bg-white/10 border-2 border-white/20 flex items-center justify-center">
                            <RefreshCw className="h-4 w-4 text-white animate-spin" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* ════ BODY SECTIONS ═════════════════════════════════════════ */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-16">

                  {/* ── WHY YOU'LL LOVE IT ──────────────────────────────────── */}
                  <motion.section initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                        <Heart className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <h2 className="text-2xl font-bold">Why {city} matches you</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* AI reasoning */}
                      <div className="space-y-4">
                        {(detail?.summary?.whyMatch || sessionData.summary) && (
                          <div className="rounded-2xl bg-muted/50 border p-6">
                            <p className="text-muted-foreground leading-relaxed text-sm">
                              {detail?.summary?.whyMatch || sessionData.summary}
                            </p>
                          </div>
                        )}
                        {positives.length > 0 && (
                          <div className="space-y-2.5">
                            {positives.slice(0, 5).map((pos, i) => (
                              <div key={i} className="flex items-start gap-3 rounded-xl bg-primary/5 border border-primary/15 px-4 py-3">
                                <Star className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <p className="text-sm leading-snug">{pos}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Match breakdown */}
                      <div className="rounded-2xl bg-card border p-6 space-y-5">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="h-5 w-5 text-primary" />
                          <h3 className="font-bold">Match breakdown</h3>
                        </div>
                        <div className="flex items-center justify-center py-2">
                          <div className="relative h-32 w-32">
                            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                              <circle cx="60" cy="60" r="50" fill="none" stroke="currentColor" strokeWidth="10" className="text-muted" />
                              <motion.circle
                                cx="60" cy="60" r="50" fill="none"
                                stroke="hsl(var(--primary))" strokeWidth="10"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 50}`}
                                initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                                animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - match / 100) }}
                                transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                              />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-3xl font-black">{match}%</span>
                              <span className="text-xs text-muted-foreground">match</span>
                            </div>
                          </div>
                        </div>
                        {breakdown && (
                          <div className="space-y-3">
                            <ScoreBar label="Activities"  value={breakdown.activity} color="bg-blue-500"   />
                            <ScoreBar label="Climate"     value={breakdown.climate}  color="bg-amber-500"  />
                            <ScoreBar label="Mood & Vibe" value={breakdown.mood}     color="bg-violet-500" />
                            <ScoreBar label="Food Scene"  value={breakdown.food}     color="bg-rose-500"   />
                          </div>
                        )}
                        {(dest.tags?.length ?? 0) > 0 && (
                          <div className="pt-2 border-t">
                            <p className="text-xs text-muted-foreground mb-2 font-medium">Your preferences</p>
                            <div className="flex flex-wrap gap-1.5">
                              {(dest.tags ?? []).slice(0, 8).map(tag => (
                                <span key={tag} className="rounded-full bg-secondary text-secondary-foreground text-xs px-2.5 py-1 font-medium capitalize">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.section>

                  {/* ── THINGS TO CONSIDER ──────────────────────────────────── */}
                  {negatives.length > 0 && (
                    <motion.section initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                      <div className="flex items-center gap-2 mb-6">
                        <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center">
                          <AlertTriangle className="h-4 w-4 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold">Things to Consider</h2>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {negatives.slice(0, 4).map((neg, i) => (
                          <div key={i} className="flex items-start gap-3 rounded-xl border bg-card px-4 py-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0" />
                            <p className="text-sm text-muted-foreground leading-relaxed">{neg}</p>
                          </div>
                        ))}
                      </div>
                    </motion.section>
                  )}

                  {/* ── FAMOUS ATTRACTIONS ──────────────────────────────────── */}
                  <motion.section initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center">
                        <Landmark className="h-4 w-4 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold">Famous Attractions</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {attractions.map((a, i) => {
                        const photo = allPhotos[i + 1] || allPhotos[0] || FALLBACK
                        return (
                          <motion.div key={a.name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="group rounded-2xl overflow-hidden border bg-card hover:shadow-xl transition-shadow duration-300">
                            <div className="relative h-40 overflow-hidden">
                              <img src={photo} alt={a.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={e => { e.currentTarget.src = FALLBACK }} />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                              <span className="absolute top-3 right-3 text-2xl">{a.emoji}</span>
                            </div>
                            <div className="p-4">
                              <h3 className="font-bold text-sm mb-1 leading-snug">{a.name}</h3>
                              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{a.description}</p>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </motion.section>

                  {/* ── RECOMMENDED ACTIVITIES ─────────────────────────────── */}
                  <motion.section initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                        <Activity className="h-4 w-4 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold">Top Activities</h2>
                      {(detail?.dataSources?.activities === "hotelbeds") && (
                        <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">Live HotelBeds data</span>
                      )}
                    </div>

                    {loading && !displayActivities.length ? (
                      <SectionLoader label="Loading activities…" />
                    ) : displayActivities.length > 0 ? (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {displayActivities.map((activity: string, i: number) => {
                          const Icon = getActivityIcon(activity)
                          const liveActivity = liveActivities?.[i]
                          return (
                            <motion.div key={`${activity}-${i}`} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} className="flex items-start gap-4 rounded-2xl border bg-card p-4 hover:shadow-md transition-shadow">
                              <div className="h-11 w-11 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                                <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-sm capitalize leading-snug">{activity}</p>
                                {liveActivity?.duration && <p className="text-xs text-muted-foreground mt-0.5">⏱ {liveActivity.duration}</p>}
                                {liveActivity?.price && <p className="text-xs text-muted-foreground">💶 {liveActivity.price}</p>}
                                {!liveActivity && <p className="text-xs text-muted-foreground mt-0.5">{city}, {dest.name}</p>}
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No activities data available for this destination.</p>
                    )}
                  </motion.section>

                  {/* ── WEATHER FORECAST ────────────────────────────────────── */}
                  <motion.section initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="h-8 w-8 rounded-lg bg-sky-500 flex items-center justify-center">
                        <Wind className="h-4 w-4 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold">Weather Forecast</h2>
                      {weather?.type === "real" && <span className="text-xs bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-full">Live OpenWeather</span>}
                    </div>

                    {loading && !weather ? (
                      <SectionLoader label="Fetching weather data…" />
                    ) : weather ? (
                      <div className="rounded-2xl border bg-card p-6">
                        <div className="flex items-start gap-6 flex-wrap">
                          <div className="flex items-center gap-4">
                            <span className="text-5xl">{weather.icon}</span>
                            <div>
                              <p className="text-4xl font-black text-primary">{weather.temperature}</p>
                              <p className="text-lg font-semibold">{weather.condition}</p>
                              {weather.feelsLike && <p className="text-sm text-muted-foreground">Feels like {weather.feelsLike}</p>}
                            </div>
                          </div>
                          <div className="flex-1 min-w-48">
                            <p className="text-sm leading-relaxed text-muted-foreground">{weather.description}</p>
                            {(weather.humidity || weather.windSpeed) && (
                              <div className="flex gap-6 mt-3 text-sm">
                                {weather.humidity !== undefined && (
                                  <div className="flex items-center gap-1.5">
                                    <Droplets className="h-4 w-4 text-sky-500" />
                                    <span>{weather.humidity}% humidity</span>
                                  </div>
                                )}
                                {weather.windSpeed && (
                                  <div className="flex items-center gap-1.5">
                                    <Wind className="h-4 w-4 text-sky-500" />
                                    <span>{weather.windSpeed}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4 border-t pt-3">
                          {weather.type === "real"
                            ? "Real-time weather data (travel within 7 days)"
                            : `Climate estimate based on historical patterns for ${climate.label} destinations`}
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-2xl border bg-card p-6">
                        <div className="flex items-start gap-4">
                          <span className="text-3xl">{climate.emoji}</span>
                          <div>
                            <p className="font-bold">{climate.label} Climate</p>
                            <p className="text-sm text-muted-foreground mt-1">Best season: {climate.season}</p>
                            <p className="text-sm text-muted-foreground mt-1">Weather data will load when travel dates are set</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.section>

                  {/* ── HOLIDAY OVERLAP ─────────────────────────────────────── */}
                  {(publicHolidays.length > 0 || events.length > 0) && (
                    <motion.section initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                      <div className="flex items-center gap-2 mb-6">
                        <div className="h-8 w-8 rounded-lg bg-purple-500 flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold">Holiday & Event Overlap</h2>
                      </div>
                      <div className="space-y-3">
                        {publicHolidays.slice(0, 3).map((holiday: any, i: number) => (
                          <div key={i} className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3">
                            <span className="text-lg">🎉</span>
                            <div>
                              <p className="font-semibold text-sm">{holiday.name}</p>
                              <p className="text-xs text-muted-foreground">{new Date(holiday.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
                            </div>
                          </div>
                        ))}
                        {events.slice(0, 5).map((event: any, i: number) => (
                          <div key={`ev-${i}`} className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
                            <div className="flex items-center gap-3">
                              <span className="text-lg">🎪</span>
                              <div>
                                <p className="font-semibold text-sm">{event.name}</p>
                                <p className="text-xs text-muted-foreground">{event.date} · {event.category || "Event"}{event.location ? ` · ${event.location}` : ""}</p>
                              </div>
                            </div>
                            {event.url && event.url !== "https://www.eventbrite.com" && (
                              <a href={event.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline ml-3 shrink-0">
                                Details →
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.section>
                  )}

                  {/* ── WHERE TO STAY & EAT ─────────────────────────────────── */}
                  <motion.section initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center">
                        <Hotel className="h-4 w-4 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold">Where to Stay & Eat</h2>
                      {(detail?.dataSources?.hotels === "hotelbeds") && (
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">Live HotelBeds</span>
                      )}
                      {(detail?.dataSources?.restaurants === "google_places") && (
                        <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">Google Places</span>
                      )}
                    </div>

                    {loading && !(hotels?.length) && !(restaurants?.length) ? (
                      <SectionLoader label="Loading hotels and restaurants…" />
                    ) : (
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Hotels */}
                        <div>
                          <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide mb-3">🏨 Hotels</h3>
                          {(hotels?.length ?? 0) > 0 ? (
                            <div className="space-y-3">
                              {(hotels ?? []).slice(0, 5).map((h: any, i: number) => {
                                const pl = h.priceLevel || h.style || "medium"
                                const priceEmoji = pl === "low" || pl === "budget" ? "💵" : pl === "high" || pl === "luxury" ? "💎" : "💰"
                                const priceLabel = pl === "low" || pl === "budget" ? "Budget" : pl === "high" || pl === "luxury" ? "Luxury" : "Mid-Range"
                                return (
                                  <div key={i} className="flex items-center justify-between rounded-xl border bg-card px-4 py-3 hover:shadow-sm transition-shadow">
                                    <div className="flex items-center gap-3">
                                      <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                        <Hotel className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                      </div>
                                      <div>
                                        <p className="font-semibold text-sm leading-snug">{h.name}</p>
                                        {h.rating && (
                                          <div className="flex items-center gap-1 mt-0.5">
                                            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                            <span className="text-xs text-muted-foreground">{typeof h.rating === "number" ? `${h.rating}/5` : h.rating}</span>
                                          </div>
                                        )}
                                        {h.stars > 0 && !h.rating && (
                                          <p className="text-xs text-muted-foreground">{"★".repeat(h.stars)}{"☆".repeat(5 - h.stars)}</p>
                                        )}
                                      </div>
                                    </div>
                                    <span className="text-xs font-medium bg-secondary text-secondary-foreground rounded-full px-2.5 py-1 ml-2 shrink-0">{priceEmoji} {priceLabel}</span>
                                  </div>
                                )
                              })}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground py-4">No hotel data available.</p>
                          )}
                        </div>

                        {/* Restaurants */}
                        <div>
                          <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wide mb-3">🍽️ Must-Try Restaurants</h3>
                          {restaurants.length > 0 ? (
                            <div className="space-y-3">
                              {restaurants.slice(0, 5).map((r: any, i: number) => {
                                const pl = r.priceLevel || "medium"
                                const priceEmoji = pl === "low" || pl === "budget" ? "💵" : pl === "high" || pl === "luxury" ? "💎" : "💰"
                                return (
                                  <div key={i} className="flex items-center justify-between rounded-xl border bg-card px-4 py-3 hover:shadow-sm transition-shadow">
                                    <div className="flex items-center gap-3">
                                      <div className="h-9 w-9 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0">
                                        <Utensils className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                                      </div>
                                      <div>
                                        <p className="font-semibold text-sm leading-snug">{r.name}</p>
                                        {r.cuisine && <p className="text-xs text-muted-foreground mt-0.5">{r.cuisine}</p>}
                                        {r.rating && (
                                          <div className="flex items-center gap-1 mt-0.5">
                                            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                            <span className="text-xs text-muted-foreground">{r.rating}/5</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <span className="text-xs font-medium bg-secondary text-secondary-foreground rounded-full px-2.5 py-1 ml-2 shrink-0">{priceEmoji} {r.price || ""}</span>
                                  </div>
                                )
                              })}
                            </div>
                          ) : dest.foodHighlights && dest.foodHighlights.length > 0 ? (
                            <div className="space-y-3">
                              <p className="text-xs text-muted-foreground mb-1">Local cuisine highlights</p>
                              {dest.foodHighlights.slice(0, 5).map((food, i) => (
                                <div key={i} className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3">
                                  <div className="h-9 w-9 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0">
                                    <Utensils className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                                  </div>
                                  <p className="font-medium text-sm capitalize">{food}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground py-4">No restaurant data available.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.section>

                  {/* ── EVENTS DURING YOUR TRIP ────────────────────────────── */}
                  <motion.section initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="h-8 w-8 rounded-lg bg-pink-500 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold">Events During Your Trip</h2>
                      {(detail?.dataSources?.events === "eventbrite") && (
                        <span className="text-xs bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 px-2 py-0.5 rounded-full">Live Eventbrite</span>
                      )}
                    </div>

                    {loading && !events.length ? (
                      <SectionLoader label="Searching for events…" />
                    ) : events.length > 0 ? (
                      <div className="grid sm:grid-cols-2 gap-3">
                        {events.slice(0, 6).map((event: any, i: number) => (
                          <div key={i} className="flex items-start gap-3 rounded-xl border bg-card p-4 hover:shadow-sm transition-shadow">
                            <div className="h-10 w-10 rounded-lg bg-pink-500/10 flex items-center justify-center shrink-0">
                              <Calendar className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm leading-snug">{event.name}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{event.date}{event.location ? ` · ${event.location}` : ""}</p>
                              {event.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{event.description}</p>}
                              {event.category && <span className="inline-block mt-1.5 text-xs rounded-full bg-secondary text-secondary-foreground px-2 py-0.5">{event.category}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border bg-card p-6 text-center">
                        <p className="text-sm text-muted-foreground">
                          {detail ? "No events found for your travel dates. Check Eventbrite.com for last-minute listings." : "Set travel dates to discover events during your trip."}
                        </p>
                      </div>
                    )}
                  </motion.section>

                  {/* ── TRANSPORTATION OPTIONS ─────────────────────────────── */}
                  <motion.section initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="h-8 w-8 rounded-lg bg-teal-500 flex items-center justify-center">
                        <Bus className="h-4 w-4 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold">Transportation Options</h2>
                      {(detail?.dataSources?.transfers === "hotelbeds") && (
                        <span className="text-xs bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-full">Live HotelBeds Transfers</span>
                      )}
                    </div>

                    {loading && !transfers.length ? (
                      <SectionLoader label="Loading transport options…" />
                    ) : transfers.length > 0 ? (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {transfers.slice(0, 6).map((t: any, i: number) => (
                          <div key={i} className="rounded-xl border bg-card p-4 space-y-2">
                            <div className="flex items-center gap-2">
                              <Car className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                              <p className="font-semibold text-sm">{t.name || t.vehicle}</p>
                            </div>
                            {t.vehicle && t.vehicle !== t.name && <p className="text-xs text-muted-foreground capitalize">{t.vehicle}</p>}
                            {t.capacity > 0 && <p className="text-xs text-muted-foreground">👥 Up to {t.capacity} passengers</p>}
                            {t.duration && <p className="text-xs text-muted-foreground">⏱ {t.duration}</p>}
                            {t.price && <p className="text-sm font-semibold text-primary">{t.price}</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-3 gap-4">
                        {[
                          { icon: Bus,   label: "Public Transport", desc: `${city} has well-connected public transport networks including metro, bus, and rail services.` },
                          { icon: Car,   label: "Car Rental",       desc: `Explore ${dest.name} at your own pace with rental cars available from major providers.` },
                          { icon: Train, label: "Train / Rail",     desc: `Regional trains connect ${city} to surrounding areas and neighbouring destinations.` },
                        ].map(({ icon: Icon, label, desc }) => (
                          <div key={label} className="rounded-xl border bg-card p-4 space-y-2">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                              <p className="font-semibold text-sm">{label}</p>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.section>

                  {/* ── FINAL CTA ───────────────────────────────────────────── */}
                  <motion.section initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="rounded-3xl overflow-hidden border-2 border-primary/20 relative">
                    <div className="absolute inset-0">
                      <img src={allPhotos[2] || allPhotos[0] || FALLBACK} alt="" className="w-full h-full object-cover" onError={e => { e.currentTarget.src = FALLBACK }} />
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary/70 dark:from-primary/95 dark:to-primary/80" />
                    </div>
                    <div className="relative z-10 p-10 md:p-14 text-center text-primary-foreground">
                      <div className="text-5xl mb-4">{flag}</div>
                      <h2 className="text-3xl md:text-4xl font-black mb-3">Ready for {city}?</h2>
                      <p className="text-primary-foreground/80 max-w-md mx-auto mb-8 leading-relaxed">
                        Your AI-matched destination awaits. Build a personalised itinerary or explore the full destination guide.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 rounded-full px-8 py-6 text-base font-bold shadow-xl">
                          <Link href="/itinerary">
                            <Calendar className="mr-2 h-5 w-5" />
                            Generate Itinerary
                          </Link>
                        </Button>
                        <Button
                          asChild size="lg" variant="outline"
                          className="border-white/50 text-white hover:bg-white/15 rounded-full px-8 py-6 text-base font-bold"
                          onClick={() => {
                            sessionStorage.setItem("selectedCountry", JSON.stringify({
                              index: activeDestIndex, name: dest.name, city,
                              climate: dest.climate, vibe: dest.vibe,
                              matchPercentage: dest.matchPercentage,
                              image: dest.image ?? null, tags: dest.tags ?? [],
                              timestamp: Date.now(),
                            }))
                          }}
                        >
                          <Link href={`/destination/${encodeURIComponent(dest.name)}?squad=${squad}&city=${encodeURIComponent(city)}`}>
                            <Sparkles className="mr-2 h-5 w-5" />
                            Full Destination Guide
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </motion.section>

                  {/* ── Destination navigation footer ───────────────────────── */}
                  <div className="flex items-center justify-center gap-6 pb-4 pt-2 border-t border-border/50">
                    <Button variant="ghost" size="sm" onClick={goPrev} disabled={activeDestIndex === 0} className="gap-2">
                      <ChevronLeft className="h-4 w-4" /> Previous
                    </Button>

                    {/* Dot indicator */}
                    <div className="flex items-center gap-2">
                      {destinations.map((d, i) => (
                        <button key={d.name} onClick={() => goTo(i)} className={`transition-all rounded-full ${i === activeDestIndex ? "w-6 h-2.5 bg-primary" : "w-2.5 h-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"}`} aria-label={`Go to ${d.name}`} />
                      ))}
                    </div>

                    <Button variant="ghost" size="sm" onClick={goNext} disabled={activeDestIndex >= destinations.length - 1} className="gap-2">
                      Next <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="text-center pb-4">
                    <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
                      <Link href="/single">← Try a different preference set</Link>
                    </Button>
                  </div>

                </div>{/* end BODY */}
              </>
            )
          })()}
        </motion.div>
      </AnimatePresence>

    </div>
  )
}
