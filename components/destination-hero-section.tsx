"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion"
import { Bookmark, ChevronLeft, ChevronRight, MapPin, ArrowUpRight } from "lucide-react"
import { fetchCountryImages } from "@/lib/country-image-generator"

// 9 cities per country
const COUNTRY_CITIES: Record<string, string[]> = {
  Japan:                    ["Tokyo", "Kyoto", "Osaka", "Nara", "Hiroshima", "Sapporo", "Fukuoka", "Nagoya", "Okinawa"],
  France:                   ["Paris", "Nice", "Lyon", "Marseille", "Bordeaux", "Strasbourg", "Toulouse", "Nantes", "Cannes"],
  Italy:                    ["Rome", "Venice", "Florence", "Milan", "Naples", "Amalfi", "Cinque Terre", "Bologna", "Palermo"],
  Spain:                    ["Barcelona", "Madrid", "Seville", "Granada", "Valencia", "Bilbao", "Toledo", "Ibiza", "Málaga"],
  Greece:                   ["Athens", "Santorini", "Mykonos", "Crete", "Rhodes", "Corfu", "Thessaloniki", "Nafplio", "Meteora"],
  Thailand:                 ["Bangkok", "Phuket", "Chiang Mai", "Koh Samui", "Pai", "Ayutthaya", "Hua Hin", "Koh Lanta", "Krabi"],
  Indonesia:                ["Bali", "Jakarta", "Lombok", "Yogyakarta", "Komodo", "Raja Ampat", "Gili Islands", "Ubud", "Seminyak"],
  Morocco:                  ["Marrakech", "Casablanca", "Fes", "Chefchaouen", "Essaouira", "Tangier", "Rabat", "Meknes", "Ouarzazate"],
  Portugal:                 ["Lisbon", "Porto", "Algarve", "Sintra", "Cascais", "Évora", "Coimbra", "Madeira", "Azores"],
  Turkey:                   ["Istanbul", "Cappadocia", "Bodrum", "Antalya", "Izmir", "Pamukkale", "Trabzon", "Ephesus", "Ankara"],
  India:                    ["Goa", "Mumbai", "Jaipur", "Delhi", "Agra", "Kerala", "Varanasi", "Udaipur", "Kolkata"],
  Vietnam:                  ["Hanoi", "Ho Chi Minh City", "Da Nang", "Hội An", "Ha Long Bay", "Nha Trang", "Hue", "Sapa", "Phú Quốc"],
  Mexico:                   ["Mexico City", "Cancun", "Tulum", "Oaxaca", "Guadalajara", "San Miguel", "Puerto Vallarta", "Playa del Carmen", "Mérida"],
  Brazil:                   ["Rio de Janeiro", "São Paulo", "Salvador", "Florianópolis", "Iguazu", "Fortaleza", "Recife", "Manaus", "Brasília"],
  "United States":          ["New York", "Los Angeles", "Miami", "San Francisco", "Las Vegas", "Chicago", "New Orleans", "Nashville", "Honolulu"],
  USA:                      ["New York", "Los Angeles", "Miami", "San Francisco", "Las Vegas", "Chicago", "New Orleans", "Nashville", "Honolulu"],
  Australia:                ["Sydney", "Melbourne", "Cairns", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Hobart", "Darwin"],
  "New Zealand":            ["Auckland", "Queenstown", "Rotorua", "Wellington", "Christchurch", "Dunedin", "Taupo", "Napier", "Nelson"],
  Peru:                     ["Cusco", "Lima", "Arequipa", "Machu Picchu", "Lake Titicaca", "Trujillo", "Iquitos", "Paracas", "Huacachina"],
  Colombia:                 ["Cartagena", "Bogota", "Medellin", "Cali", "Santa Marta", "Tayrona", "Villa de Leyva", "Popayán", "San Andrés"],
  Argentina:                ["Buenos Aires", "Mendoza", "Patagonia", "Bariloche", "Córdoba", "Salta", "Iguazu", "Ushuaia", "Mar del Plata"],
  Egypt:                    ["Cairo", "Luxor", "Aswan", "Alexandria", "Sharm El Sheikh", "Hurghada", "Dahab", "Siwa", "Giza"],
  Kenya:                    ["Nairobi", "Mombasa", "Masai Mara", "Amboseli", "Diani Beach", "Samburu", "Lake Nakuru", "Tsavo", "Lamu"],
  Tanzania:                 ["Zanzibar", "Serengeti", "Kilimanjaro", "Arusha", "Dar es Salaam", "Ngorongoro", "Selous", "Pemba", "Ruaha"],
  "South Africa":           ["Cape Town", "Johannesburg", "Kruger", "Durban", "Stellenbosch", "Knysna", "Garden Route", "Drakensberg", "Hermanus"],
  Iceland:                  ["Reykjavik", "Akureyri", "Blue Lagoon", "Golden Circle", "Jökulsárlón", "Snæfellsnes", "Westfjords", "Vík", "Húsavík"],
  Norway:                   ["Oslo", "Bergen", "Tromso", "Flam", "Geiranger", "Lofoten", "Stavanger", "Ålesund", "Trondheim"],
  Switzerland:              ["Zurich", "Geneva", "Interlaken", "Bern", "Lucerne", "Zermatt", "St. Moritz", "Basel", "Lausanne"],
  Croatia:                  ["Dubrovnik", "Split", "Zagreb", "Hvar", "Rovinj", "Plitvice", "Zadar", "Kotor", "Trogir"],
  Maldives:                 ["Male", "Maafushi", "Baa Atoll", "Ari Atoll", "North Male Atoll", "Addu Atoll", "Fuvahmulah", "Dhaalu", "Lhaviyani"],
  "Sri Lanka":              ["Colombo", "Kandy", "Sigiriya", "Galle", "Ella", "Trincomalee", "Nuwara Eliya", "Anuradhapura", "Polonnaruwa"],
  Nepal:                    ["Kathmandu", "Pokhara", "Everest Base Camp", "Chitwan", "Lumbini", "Bandipur", "Nagarkot", "Bhaktapur", "Patan"],
  Cambodia:                 ["Siem Reap", "Phnom Penh", "Kampot", "Kep", "Sihanoukville", "Battambang", "Kratie", "Mondulkiri", "Ratanakiri"],
  Malaysia:                 ["Kuala Lumpur", "Penang", "Langkawi", "Kota Kinabalu", "Malacca", "Cameron Highlands", "Ipoh", "Johor Bahru", "Kuching"],
  Singapore:                ["Marina Bay", "Sentosa", "Chinatown", "Little India", "Orchard Road", "Clarke Quay", "East Coast", "Tiong Bahru", "Jurong"],
  Philippines:              ["Manila", "Palawan", "Cebu", "Boracay", "Bohol", "Siargao", "Davao", "Vigan", "Baguio"],
  China:                    ["Beijing", "Shanghai", "Xi'an", "Chengdu", "Guilin", "Zhangjiajie", "Hangzhou", "Suzhou", "Lijiang"],
  "South Korea":            ["Seoul", "Busan", "Jeju", "Gyeongju", "Incheon", "Jeonju", "Suwon", "Daegu", "Sokcho"],
  Cuba:                     ["Havana", "Trinidad", "Varadero", "Santiago de Cuba", "Viñales", "Cienfuegos", "Baracoa", "Camagüey", "Santa Clara"],
  Jordan:                   ["Petra", "Wadi Rum", "Amman", "Aqaba", "Dead Sea", "Jerash", "Madaba", "Dana", "Azraq"],
  UAE:                      ["Dubai", "Abu Dhabi", "Sharjah", "Ras Al Khaimah", "Fujairah", "Ajman", "Al Ain", "Umm Al Quwain", "Hatta"],
  "United Arab Emirates":   ["Dubai", "Abu Dhabi", "Sharjah", "Ras Al Khaimah", "Fujairah", "Ajman", "Al Ain", "Umm Al Quwain", "Hatta"],
  Israel:                   ["Tel Aviv", "Jerusalem", "Eilat", "Haifa", "Nazareth", "Dead Sea", "Caesarea", "Akko", "Tiberias"],
  "United Kingdom":         ["London", "Edinburgh", "Bath", "Oxford", "Cambridge", "York", "Brighton", "Bristol", "Liverpool"],
  Germany:                  ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne", "Dresden", "Heidelberg", "Rothenburg", "Neuschwanstein"],
  Netherlands:              ["Amsterdam", "Rotterdam", "Utrecht", "The Hague", "Delft", "Haarlem", "Leiden", "Maastricht", "Eindhoven"],
  Canada:                   ["Vancouver", "Toronto", "Montreal", "Quebec City", "Banff", "Victoria", "Ottawa", "Calgary", "Whistler"],
  Chile:                    ["Santiago", "Valparaíso", "Patagonia", "San Pedro de Atacama", "Torres del Paine", "Chiloé", "Viña del Mar", "La Serena", "Puerto Natales"],
  Hungary:                  ["Budapest", "Debrecen", "Pécs", "Eger", "Lake Balaton", "Győr", "Sopron", "Hortobágy", "Visegrád"],
  "Czech Republic":         ["Prague", "Brno", "Cesky Krumlov", "Karlovy Vary", "Kutná Hora", "Olomouc", "Telč", "Plzeň", "Liberec"],
  Austria:                  ["Vienna", "Salzburg", "Hallstatt", "Innsbruck", "Graz", "Linz", "Zell am See", "Baden", "Wachau"],
  Sweden:                   ["Stockholm", "Gothenburg", "Malmö", "Uppsala", "Kiruna", "Visby", "Lund", "Helsingborg", "Västerås"],
  Denmark:                  ["Copenhagen", "Aarhus", "Odense", "Aalborg", "Roskilde", "Elsinore", "Bornholm", "Ribe", "Silkeborg"],
  Finland:                  ["Helsinki", "Rovaniemi", "Turku", "Tampere", "Oulu", "Lapland", "Savonlinna", "Jyväskylä", "Porvoo"],
  Poland:                   ["Warsaw", "Krakow", "Gdansk", "Wrocław", "Poznań", "Toruń", "Łódź", "Zakopane", "Lublin"],
  Romania:                  ["Bucharest", "Transylvania", "Brasov", "Sibiu", "Cluj-Napoca", "Sinaia", "Bran", "Sighișoara", "Timișoara"],
  Bulgaria:                 ["Sofia", "Plovdiv", "Varna", "Nessebar", "Bansko", "Rila", "Koprivshtitsa", "Sozopol", "Veliko Tarnovo"],
  Ireland:                  ["Dublin", "Galway", "Cork", "Killarney", "Dingle", "Cliffs of Moher", "Limerick", "Kilkenny", "Donegal"],
  Fiji:                     ["Nadi", "Suva", "Coral Coast", "Yasawa Islands", "Mamanuca Islands", "Savusavu", "Taveuni", "Kadavu", "Lautoka"],
  Russia:                   ["Moscow", "St Petersburg", "Sochi", "Kazan", "Vladivostok", "Irkutsk", "Yekaterinburg", "Novgorod", "Baikal"],
  Taiwan:                   ["Taipei", "Kaohsiung", "Tainan", "Taichung", "Jiufen", "Sun Moon Lake", "Taroko", "Hualien", "Kenting"],
  "Saudi Arabia":           ["Riyadh", "Jeddah", "AlUla", "Mecca", "Medina", "Abha", "Tabuk", "Diriyah", "Neom"],
}

const WINDOW_SIZE = 3
const DRAG_THRESHOLD = 55
const WHEEL_DEBOUNCE = 380
const FALLBACK = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=90"

function getCitiesForCountry(name: string): string[] {
  const key = Object.keys(COUNTRY_CITIES).find(
    (k) => k.toLowerCase() === name.toLowerCase()
  )
  if (key) return COUNTRY_CITIES[key]
  const suffixes = ["City", "Coast", "Hills", "Bay", "Valley", "Lake", "Peak", "Port", "Springs"]
  return suffixes.map((s) => `${name} ${s}`)
}

export interface HeroCountry {
  name: string
  city?: string        // single recommended city — when set, carousel shows only this city
  matchPercentage: number
  reason: string
  image: string
  tags: string[]
  climate: string
  vibe: string
}

interface DestinationHeroSectionProps {
  countries: HeroCountry[]
  selectedCountry: number
  onCountrySelect: (index: number) => void
  renderExploreButton: (country: HeroCountry, index: number, city: string) => React.ReactNode
  squadSelector?: React.ReactNode
}

// Standalone city card
interface CityCardProps {
  cityName: string
  countryName: string
  image: string
  isActive: boolean
  absIdx: number
  slideDir: 1 | -1
  posInWindow: number
  isBookmarked: boolean
  onToggleBookmark: (absIdx: number) => void
  onClick: () => void
}

function CityCard({
  cityName, countryName, image, isActive, absIdx, slideDir,
  posInWindow, isBookmarked, onToggleBookmark, onClick,
}: CityCardProps) {
  return (
    <motion.div
      layout
      key={`${countryName}::${cityName}`}
      custom={slideDir}
      initial={{ opacity: 0, x: slideDir * 90, scale: 0.86, filter: "blur(6px)" }}
      animate={{
        opacity: isActive ? 1 : 0.62,
        x: 0,
        scale: 1,
        filter: "blur(0px)",
      }}
      exit={{ opacity: 0, x: slideDir * -75, scale: 0.88, filter: "blur(4px)" }}
      transition={{
        layout: { duration: 0.42, ease: [0.25, 0.46, 0.45, 0.94] },
        opacity: { delay: posInWindow * 0.06, duration: 0.4 },
        x: { delay: posInWindow * 0.06, duration: 0.42, ease: [0.25, 0.46, 0.45, 0.94] },
        scale: { delay: posInWindow * 0.06, duration: 0.42 },
        filter: { duration: 0.35 },
      }}
      whileHover={{
        y: -18,
        scale: isActive ? 1.035 : 1.055,
        opacity: 1,
        transition: { duration: 0.22, ease: "easeOut" },
      }}
      whileTap={{ scale: 0.975, transition: { duration: 0.1 } }}
      onClick={onClick}
      className="relative flex-shrink-0 rounded-3xl overflow-hidden cursor-pointer select-none"
      style={{
        width: isActive ? 248 : 206,
        height: isActive ? 400 : 330,
        boxShadow: isActive
          ? "0 32px 64px rgba(0,0,0,0.7), 0 0 0 2px rgba(255,255,255,0.45)"
          : "0 16px 40px rgba(0,0,0,0.55)",
        transition: "width 0.42s cubic-bezier(0.25,0.46,0.45,0.94), height 0.42s cubic-bezier(0.25,0.46,0.45,0.94)",
      }}
    >
      {/* Photo */}
      <motion.img
        src={image}
        alt={`${cityName}, ${countryName}`}
        className="w-full h-full object-cover"
        onError={(e) => { e.currentTarget.src = FALLBACK }}
        whileHover={{ scale: 1.08, transition: { duration: 0.55, ease: "easeOut" } }}
      />

      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-black/5" />

      {/* Dim inactive */}
      {!isActive && <div className="absolute inset-0 bg-black/30" />}

      {/* Glassmorphism active glow */}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
      )}

      {/* Top row: index badge + bookmark */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`px-2.5 py-1 rounded-full backdrop-blur-md border text-[10px] font-mono font-bold ${
            isActive
              ? "bg-white/20 border-white/35 text-white"
              : "bg-black/30 border-white/15 text-white/60"
          }`}
        >
          {String(absIdx + 1).padStart(2, "0")}
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.85 }}
          onClick={(e) => { e.stopPropagation(); onToggleBookmark(absIdx) }}
          className={`p-2 rounded-full backdrop-blur-md border transition-colors duration-200 ${
            isBookmarked
              ? "bg-emerald-500/85 border-emerald-400/50 shadow-[0_0_12px_rgba(52,211,153,0.4)]"
              : "bg-black/30 border-white/20 hover:bg-white/20"
          }`}
        >
          <Bookmark
            className={`w-3.5 h-3.5 transition-all ${isBookmarked ? "fill-white text-white" : "text-white/80"}`}
          />
        </motion.button>
      </div>

      {/* Bottom: city name + progress bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pt-8 bg-gradient-to-t from-black/80 to-transparent">
        <div className="mb-3">
          <p className="text-white font-bold text-sm leading-tight mb-0.5">
            {cityName}
          </p>
          <p className="text-white/50 text-xs">{countryName}</p>
        </div>
        {/* Progress strip */}
        <div className="flex gap-[3px]">
          {Array.from({ length: 5 }).map((_, d) => (
            <div
              key={d}
              className={`h-[2px] rounded-full transition-all duration-300 ${
                d === 0 ? "flex-[2.5] bg-white" : "flex-1 bg-white/25"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Tap hint on inactive cards */}
      {!isActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55 }}
            className="w-10 h-10 rounded-full bg-white/12 backdrop-blur-sm border border-white/20 flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4 text-white" />
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}

// Main hero
export function DestinationHeroSection({
  countries,
  selectedCountry,
  onCountrySelect,
  renderExploreButton,
  squadSelector,
}: DestinationHeroSectionProps) {
  const visible = countries.slice(0, 3)
  const activeIndex = Math.max(0, Math.min(selectedCountry, visible.length - 1))
  const active = visible[activeIndex]

  // Use the API-recommended city when available; otherwise fall back to the full country list
  const allCities = active
    ? (active.city ? [active.city] : getCitiesForCountry(active.name))
    : []
  const maxStart = Math.max(0, allCities.length - WINDOW_SIZE)

  const [windowStart, setWindowStart] = useState(0)
  const [slideDir, setSlideDir] = useState<1 | -1>(1)
  const [cityImages, setCityImages] = useState<string[]>(Array(9).fill(""))
  const [bgImage, setBgImage] = useState("")
  const [bookmarked, setBookmarked] = useState<Set<number>>(new Set())
  const [isHovering, setIsHovering] = useState(false)

  const fetchedRef = useRef("")
  const prevActiveIndex = useRef(activeIndex)
  const wheelTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

  const visibleCities = allCities.slice(windowStart, windowStart + WINDOW_SIZE)
  const activeCityName = allCities[windowStart] || active?.name || ""
  const canBack = windowStart > 0
  const canForward = windowStart < maxStart
  const peekImage = cityImages[windowStart + WINDOW_SIZE] || active?.image || FALLBACK

  // Navigation
  const navigate = useCallback(
    (dir: 1 | -1) => {
      const next = dir === 1 ? Math.min(windowStart + 1, maxStart) : Math.max(windowStart - 1, 0)
      if (next === windowStart) return
      setSlideDir(dir)
      setWindowStart(next)
      setBgImage(cityImages[next] || active?.image || FALLBACK)
    },
    [windowStart, maxStart, cityImages, active]
  )

  const goForward = useCallback(() => navigate(1), [navigate])
  const goBack = useCallback(() => navigate(-1), [navigate])

  // Image pre-fetch
  useEffect(() => {
    if (!active || fetchedRef.current === active.name) return
    fetchedRef.current = active.name
    setWindowStart(0)
    setBgImage(active.image || FALLBACK)
    setCityImages(Array(9).fill(active.image || FALLBACK))

    const cities = active.city ? [active.city] : getCitiesForCountry(active.name)
    const queries = cities.map((c) => `${c} ${active.name}`)

    fetchCountryImages(queries).then((map) => {
      const imgs = queries.map((q) => map[q] || active.image || FALLBACK)
      setCityImages(imgs)
      setBgImage(imgs[0])
    })
  }, [active?.name]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset on country switch
  useEffect(() => {
    if (prevActiveIndex.current !== activeIndex && active) {
      prevActiveIndex.current = activeIndex
      setWindowStart(0)
      setBgImage(active.image || FALLBACK)
      fetchedRef.current = ""
    }
  }, [activeIndex, active])

  // Wheel scroll on carousel area
  useEffect(() => {
    const el = carouselRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (wheelTimer.current) return
      const dir = e.deltaX > 10 || e.deltaY > 10 ? 1 : e.deltaX < -10 || e.deltaY < -10 ? -1 : 0
      if (dir === 0) return
      navigate(dir as 1 | -1)
      wheelTimer.current = setTimeout(() => { wheelTimer.current = null }, WHEEL_DEBOUNCE)
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [navigate])

  // Keyboard when hovering carousel
  useEffect(() => {
    if (!isHovering) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") { e.preventDefault(); goForward() }
      if (e.key === "ArrowLeft")  { e.preventDefault(); goBack() }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isHovering, goForward, goBack])

  // Drag end handler
  const onDragEnd = useCallback(
    (_: any, info: PanInfo) => {
      if (info.offset.x < -DRAG_THRESHOLD) goForward()
      else if (info.offset.x > DRAG_THRESHOLD) goBack()
    },
    [goForward, goBack]
  )

  // City card click
  const handleCardClick = (indexInWindow: number) => {
    const absIdx = windowStart + indexInWindow
    if (indexInWindow === 0) {
      setBgImage(cityImages[absIdx] || active?.image || FALLBACK)
      return
    }
    const newStart = Math.min(absIdx, maxStart)
    setSlideDir(1)
    setWindowStart(newStart)
    setBgImage(cityImages[newStart] || active?.image || FALLBACK)
  }

  if (!active || visible.length === 0) return null

  const progressPct = maxStart > 0 ? (windowStart / maxStart) * 100 : 0

  return (
    <div
      className="relative w-full overflow-hidden select-none"
      style={{ height: "94vh", minHeight: "680px", maxHeight: "1100px" }}
    >
      {/* ════ CINEMATIC BACKGROUND ════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={bgImage}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.07 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src={bgImage || FALLBACK}
            alt={active.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.src = FALLBACK }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Gradient layers */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/96 via-black/72 to-black/18" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-transparent to-black/45" />

      {/* ════ TOP BAR — country tabs + squad selector ═════════════════════════ */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 md:px-12 pt-6 pb-16 bg-gradient-to-b from-black/65 to-transparent pointer-events-none">
        {/* Country switcher pills */}
        <div className="flex gap-2 pointer-events-auto">
          {visible.map((c, i) => (
            <motion.button
              key={c.name}
              onClick={() => onCountrySelect(i)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 ${
                activeIndex === i
                  ? "bg-white text-black shadow-[0_4px_20px_rgba(255,255,255,0.2)]"
                  : "bg-white/10 text-white/55 hover:bg-white/18 hover:text-white backdrop-blur-md border border-white/10"
              }`}
            >
              {activeIndex === i && (
                <motion.span
                  layoutId="countryDot"
                  className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                />
              )}
              {c.name}
            </motion.button>
          ))}
        </div>

      </div>

      {/* ════ LEFT PANEL — country info ════════════════════════════════════════ */}
      <div className="absolute inset-y-0 left-0 z-20 flex items-center" style={{ width: "44%" }}>
        <div className="pl-8 md:pl-14 lg:pl-20 pr-6 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.name}
              initial={{ opacity: 0, y: 48 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col"
            >
              {/* Tags */}
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08, duration: 0.45 }}
                className="flex flex-wrap gap-2 mb-7"
              >
                {active.tags?.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/14 rounded-full text-white/80 text-[10px] font-bold uppercase tracking-[0.18em]"
                  >
                    {tag}
                  </span>
                ))}
                {active.vibe && (
                  <span className="px-3 py-1 bg-emerald-500/22 backdrop-blur-md border border-emerald-400/28 rounded-full text-emerald-300 text-[10px] font-bold tracking-wider">
                    {active.vibe}
                  </span>
                )}
              </motion.div>

              {/* Country name — cinematic scale */}
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12, duration: 0.55 }}
                className="font-black text-white uppercase leading-[0.83] tracking-tight drop-shadow-2xl mb-7"
                style={{ fontSize: "clamp(3.6rem, 6.8vw, 9.5rem)" }}
              >
                {active.name}
              </motion.h1>

              {/* Match + active city chip */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="flex items-center gap-5 mb-6 flex-wrap"
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl md:text-5xl font-black text-emerald-400 tabular-nums leading-none">
                    {active.matchPercentage}
                  </span>
                  <span className="text-emerald-400/70 font-bold text-lg">%</span>
                  <span className="text-white/35 text-[10px] tracking-[0.25em] uppercase ml-1">match</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/8 backdrop-blur-sm border border-white/12 rounded-full">
                  <MapPin className="w-3 h-3 text-white/50" />
                  <span className="text-white/65 text-xs font-medium">{activeCityName}</span>
                </div>
              </motion.div>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.27, duration: 0.45 }}
                className="text-white/58 text-sm md:text-base leading-relaxed mb-10 max-w-sm line-clamp-3"
              >
                {active.reason}
              </motion.p>

              {/* Explore CTA */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.34, duration: 0.4 }}
              >
                {renderExploreButton(active, activeIndex, activeCityName)}
              </motion.div>

              {/* Destination counter */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-12 flex items-center gap-3"
              >
                <span className="text-white/25 text-[10px] font-mono tracking-[0.35em]">
                  {String(activeIndex + 1).padStart(2, "0")} OF {String(visible.length).padStart(2, "0")} DESTINATIONS
                </span>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ════ RIGHT PANEL — city card carousel ════════════════════════════════ */}
      <div
        ref={carouselRef}
        className="absolute inset-y-0 right-0 z-20 overflow-hidden"
        style={{ left: "42%", paddingRight: "0px" }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Drag wrapper */}
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.07}
          dragMomentum={false}
          onDragEnd={onDragEnd}
          className="h-full flex items-end pb-20 pl-8 pr-4 gap-5 cursor-grab active:cursor-grabbing"
          style={{ touchAction: "pan-y" }}
          whileDrag={{ cursor: "grabbing" }}
        >
          <AnimatePresence mode="popLayout" initial={false} custom={slideDir}>
            {visibleCities.map((cityName, i) => (
              <CityCard
                key={`${active.name}::${cityName}`}
                cityName={cityName}
                countryName={active.name}
                image={cityImages[windowStart + i] || active.image || FALLBACK}
                isActive={i === 0}
                absIdx={windowStart + i}
                slideDir={slideDir}
                posInWindow={i}
                isBookmarked={bookmarked.has(windowStart + i)}
                onToggleBookmark={(absIdx) => {
                  setBookmarked((prev) => {
                    const next = new Set(prev)
                    next.has(absIdx) ? next.delete(absIdx) : next.add(absIdx)
                    return next
                  })
                }}
                onClick={() => handleCardClick(i)}
              />
            ))}
          </AnimatePresence>

          {/* Peek: ghost of the next hidden card */}
          {canForward && (
            <motion.div
              key={`peek-${windowStart}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="relative flex-shrink-0 rounded-3xl overflow-hidden"
              style={{ width: 72, height: 280, opacity: 0.35 }}
              aria-hidden
            >
              <img
                src={peekImage}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = FALLBACK }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/60" />
            </motion.div>
          )}
        </motion.div>

        {/* Navigation controls */}
        <div className="absolute bottom-8 left-8 flex items-center gap-3">
          {/* Back arrow */}
          <motion.button
            onClick={goBack}
            whileHover={canBack ? { scale: 1.1, backgroundColor: "rgba(255,255,255,0.22)" } : {}}
            whileTap={canBack ? { scale: 0.92 } : {}}
            className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all duration-200 ${
              canBack
                ? "bg-white/12 border-white/20 text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                : "bg-white/5 border-white/8 text-white/18 cursor-not-allowed"
            }`}
            disabled={!canBack}
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.button>

          {/* City counter */}
          <div className="flex items-center gap-2.5 px-4 py-2 bg-white/8 backdrop-blur-md border border-white/12 rounded-full">
            <span className="text-white text-sm font-bold tabular-nums">{String(windowStart + 1).padStart(2, "0")}</span>
            <div className="w-6 h-px bg-white/25" />
            <span className="text-white/40 text-xs font-mono tabular-nums">09</span>
          </div>

          {/* Forward arrow */}
          <motion.button
            onClick={goForward}
            whileHover={canForward ? { scale: 1.1, backgroundColor: "rgba(255,255,255,0.22)" } : {}}
            whileTap={canForward ? { scale: 0.92 } : {}}
            className={`w-11 h-11 rounded-full flex items-center justify-center border transition-all duration-200 ${
              canForward
                ? "bg-white/12 border-white/20 text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                : "bg-white/5 border-white/8 text-white/18 cursor-not-allowed"
            }`}
            disabled={!canForward}
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>

          {/* Dot progress track */}
          <div className="hidden lg:flex items-center gap-1.5 ml-2">
            {allCities.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => {
                  const dir = i > windowStart ? 1 : -1
                  const newStart = Math.min(i, maxStart)
                  setSlideDir(dir)
                  setWindowStart(newStart)
                  setBgImage(cityImages[newStart] || active.image || FALLBACK)
                }}
                animate={{
                  width: i === windowStart ? 20 : 6,
                  opacity: i >= windowStart && i < windowStart + WINDOW_SIZE ? 1 : 0.3,
                  backgroundColor: i === windowStart ? "rgb(255,255,255)" : "rgba(255,255,255,0.4)",
                }}
                transition={{ duration: 0.3 }}
                className="h-[3px] rounded-full"
                aria-label={`Go to city ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Keyboard hint */}
        <AnimatePresence>
          {isHovering && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="absolute bottom-8 right-6 hidden lg:flex items-center gap-1.5 text-white/28 text-[10px] font-mono"
            >
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/15">←</kbd>
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/15">→</kbd>
              <span className="ml-1 tracking-wider">OR DRAG</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ════ PROGRESS BAR ════════════════════════════════════════════════════ */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/8 z-30">
        <motion.div
          className="h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-white/60"
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
        />
      </div>

      {/* ════ MOBILE city pill strip ══════════════════════════════════════════ */}
      <div className="md:hidden absolute bottom-10 left-0 right-0 z-30 flex gap-2 px-5 overflow-x-auto no-scrollbar">
        {allCities.map((city, i) => {
          const isInWindow = i >= windowStart && i < windowStart + WINDOW_SIZE
          return (
            <motion.button
              key={city}
              onClick={() => {
                const dir = i > windowStart ? 1 : -1
                const newStart = Math.min(i, maxStart)
                setSlideDir(dir as 1 | -1)
                setWindowStart(newStart)
                setBgImage(cityImages[newStart] || active.image || FALLBACK)
              }}
              animate={{
                scale: isInWindow ? 1 : 0.95,
                opacity: isInWindow ? 1 : 0.55,
              }}
              transition={{ duration: 0.25 }}
              className={`flex-shrink-0 px-3.5 py-2 rounded-full text-[11px] font-semibold transition-colors ${
                isInWindow
                  ? "bg-white text-black shadow-lg"
                  : "bg-white/14 text-white/75 backdrop-blur-sm border border-white/12"
              }`}
            >
              {city}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
