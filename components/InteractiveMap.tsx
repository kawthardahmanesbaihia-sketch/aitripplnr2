"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Loader2 } from "lucide-react"

// Types
interface PlaceInput {
  name: string
  rating?: number
  cuisine?: string
}

interface ResolvedPlace {
  id: string
  name: string
  type: "hotel" | "restaurant" | "attraction"
  lat: number
  lng: number
  rating?: number
  cuisine?: string
}

export interface InteractiveMapProps {
  city: string
  hotels: PlaceInput[]
  restaurants: PlaceInput[]
  attractions?: PlaceInput[]
}

// Hardcoded city coordinates — no external API needed
const KNOWN_CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  // Europe
  Paris: { lat: 48.8566, lng: 2.3522 },
  London: { lat: 51.5074, lng: -0.1278 },
  Rome: { lat: 41.9028, lng: 12.4964 },
  Barcelona: { lat: 41.3851, lng: 2.1734 },
  Madrid: { lat: 40.4168, lng: -3.7038 },
  Amsterdam: { lat: 52.3676, lng: 4.9041 },
  Berlin: { lat: 52.52, lng: 13.405 },
  Vienna: { lat: 48.2082, lng: 16.3738 },
  Prague: { lat: 50.0755, lng: 14.4378 },
  Budapest: { lat: 47.4979, lng: 19.0402 },
  Lisbon: { lat: 38.7223, lng: -9.1393 },
  Porto: { lat: 41.1579, lng: -8.6291 },
  Athens: { lat: 37.9838, lng: 23.7275 },
  Santorini: { lat: 36.3932, lng: 25.4615 },
  Mykonos: { lat: 37.4415, lng: 25.3283 },
  Dubrovnik: { lat: 42.6507, lng: 18.0944 },
  Split: { lat: 43.5081, lng: 16.4402 },
  Venice: { lat: 45.4408, lng: 12.3155 },
  Florence: { lat: 43.7696, lng: 11.2558 },
  Milan: { lat: 45.4654, lng: 9.1859 },
  Naples: { lat: 40.8518, lng: 14.2681 },
  Nice: { lat: 43.7102, lng: 7.262 },
  Lyon: { lat: 45.764, lng: 4.8357 },
  Edinburgh: { lat: 55.9533, lng: -3.1883 },
  Dublin: { lat: 53.3498, lng: -6.2603 },
  Copenhagen: { lat: 55.6761, lng: 12.5683 },
  Stockholm: { lat: 59.3293, lng: 18.0686 },
  Oslo: { lat: 59.9139, lng: 10.7522 },
  Helsinki: { lat: 60.1699, lng: 24.9384 },
  Warsaw: { lat: 52.2297, lng: 21.0122 },
  Krakow: { lat: 50.0647, lng: 19.945 },
  Zurich: { lat: 47.3769, lng: 8.5417 },
  Geneva: { lat: 46.2044, lng: 6.1432 },
  Interlaken: { lat: 46.6863, lng: 7.8632 },
  Lucerne: { lat: 47.0502, lng: 8.3093 },
  Zermatt: { lat: 46.0207, lng: 7.7491 },
  Salzburg: { lat: 47.8095, lng: 13.055 },
  Reykjavik: { lat: 64.1466, lng: -21.9426 },
  Istanbul: { lat: 41.0082, lng: 28.9784 },
  Cappadocia: { lat: 38.6431, lng: 34.8289 },
  Bodrum: { lat: 37.0344, lng: 27.4305 },
  Antalya: { lat: 36.8969, lng: 30.7133 },
  // Asia
  Tokyo: { lat: 35.6762, lng: 139.6503 },
  Kyoto: { lat: 35.0116, lng: 135.7681 },
  Osaka: { lat: 34.6937, lng: 135.5023 },
  Bangkok: { lat: 13.7563, lng: 100.5018 },
  Phuket: { lat: 7.8804, lng: 98.3923 },
  "Chiang Mai": { lat: 18.7883, lng: 98.9853 },
  "Koh Samui": { lat: 9.5120, lng: 100.0136 },
  Bali: { lat: -8.3405, lng: 115.092 },
  Ubud: { lat: -8.5069, lng: 115.2624 },
  Seminyak: { lat: -8.6897, lng: 115.1702 },
  Canggu: { lat: -8.6478, lng: 115.1385 },
  "Nusa Dua": { lat: -8.7905, lng: 115.2255 },
  Lombok: { lat: -8.65, lng: 116.3249 },
  Singapore: { lat: 1.3521, lng: 103.8198 },
  "Kuala Lumpur": { lat: 3.139, lng: 101.6869 },
  Penang: { lat: 5.4141, lng: 100.3288 },
  Langkawi: { lat: 6.35, lng: 99.8 },
  "Ho Chi Minh City": { lat: 10.8231, lng: 106.6297 },
  Hanoi: { lat: 21.0278, lng: 105.8342 },
  "Da Nang": { lat: 16.0544, lng: 108.2022 },
  "Hội An": { lat: 15.8794, lng: 108.335 },
  "Phú Quốc": { lat: 10.2899, lng: 103.9840 },
  Seoul: { lat: 37.5665, lng: 126.978 },
  Busan: { lat: 35.1796, lng: 129.0756 },
  Jeju: { lat: 33.4996, lng: 126.5312 },
  Beijing: { lat: 39.9042, lng: 116.4074 },
  Shanghai: { lat: 31.2304, lng: 121.4737 },
  "Hong Kong": { lat: 22.3193, lng: 114.1694 },
  Taipei: { lat: 25.0329, lng: 121.5654 },
  Mumbai: { lat: 19.076, lng: 72.8777 },
  Delhi: { lat: 28.6139, lng: 77.209 },
  "New Delhi": { lat: 28.6139, lng: 77.209 },
  Goa: { lat: 15.2993, lng: 74.124 },
  Jaipur: { lat: 26.9124, lng: 75.7873 },
  Kerala: { lat: 10.8505, lng: 76.2711 },
  Varanasi: { lat: 25.3176, lng: 82.9739 },
  Kathmandu: { lat: 27.7172, lng: 85.324 },
  Pokhara: { lat: 28.2096, lng: 83.9856 },
  "Siem Reap": { lat: 13.3671, lng: 103.8448 },
  Marrakech: { lat: 31.6295, lng: -7.9811 },
  Casablanca: { lat: 33.5731, lng: -7.5898 },
  Fez: { lat: 34.0181, lng: -5.0078 },
  Chefchaouen: { lat: 35.1688, lng: -5.2636 },
  Essaouira: { lat: 31.5085, lng: -9.7595 },
  // Americas
  "New York": { lat: 40.7128, lng: -74.006 },
  "Los Angeles": { lat: 34.0522, lng: -118.2437 },
  Miami: { lat: 25.7617, lng: -80.1918 },
  "San Francisco": { lat: 37.7749, lng: -122.4194 },
  Chicago: { lat: 41.8781, lng: -87.6298 },
  "Las Vegas": { lat: 36.1699, lng: -115.1398 },
  Toronto: { lat: 43.6532, lng: -79.3832 },
  Vancouver: { lat: 49.2827, lng: -123.1207 },
  Montreal: { lat: 45.5017, lng: -73.5673 },
  "Mexico City": { lat: 19.4326, lng: -99.1332 },
  "Cancún": { lat: 21.1619, lng: -86.8515 },
  Cancun: { lat: 21.1619, lng: -86.8515 },
  Tulum: { lat: 20.2114, lng: -87.4654 },
  Oaxaca: { lat: 17.0732, lng: -96.7266 },
  Havana: { lat: 23.1136, lng: -82.3666 },
  "Rio de Janeiro": { lat: -22.9068, lng: -43.1729 },
  "São Paulo": { lat: -23.5505, lng: -46.6333 },
  "Buenos Aires": { lat: -34.6037, lng: -58.3816 },
  Mendoza: { lat: -32.8908, lng: -68.8272 },
  Lima: { lat: -12.0464, lng: -77.0428 },
  Cusco: { lat: -13.5319, lng: -71.9675 },
  Cartagena: { lat: 10.391, lng: -75.4794 },
  Bogota: { lat: 4.711, lng: -74.0721 },
  Medellin: { lat: 6.2442, lng: -75.5812 },
  // Middle East & Africa
  Dubai: { lat: 25.2048, lng: 55.2708 },
  "Abu Dhabi": { lat: 24.4539, lng: 54.3773 },
  Cairo: { lat: 30.0444, lng: 31.2357 },
  Nairobi: { lat: -1.2921, lng: 36.8219 },
  Mombasa: { lat: -4.0435, lng: 39.6682 },
  "Cape Town": { lat: -33.9249, lng: 18.4241 },
  Johannesburg: { lat: -26.2041, lng: 28.0473 },
  Petra: { lat: 30.3285, lng: 35.4444 },
  Amman: { lat: 31.9454, lng: 35.9284 },
  "Tel Aviv": { lat: 32.0853, lng: 34.7818 },
  Jerusalem: { lat: 31.7683, lng: 35.2137 },
  // Oceania
  Sydney: { lat: -33.8688, lng: 151.2093 },
  Melbourne: { lat: -37.8136, lng: 144.9631 },
  Cairns: { lat: -16.9186, lng: 145.7781 },
  "Gold Coast": { lat: -28.0167, lng: 153.4 },
  Auckland: { lat: -36.8485, lng: 174.7633 },
  Queenstown: { lat: -45.031, lng: 168.6626 },
  Rotorua: { lat: -38.1368, lng: 176.2497 },
  Wellington: { lat: -41.2866, lng: 174.7756 },
}

const COUNTRY_TO_CAPITAL: Record<string, string> = {
  France: "Paris", Italy: "Rome", Japan: "Tokyo", "United States": "New York",
  Spain: "Barcelona", "United Kingdom": "London", Germany: "Berlin",
  Australia: "Sydney", Canada: "Toronto", Brazil: "Rio de Janeiro",
  Mexico: "Mexico City", India: "Delhi", China: "Beijing", Thailand: "Bangkok",
  Greece: "Athens", Turkey: "Istanbul", Egypt: "Cairo", Morocco: "Marrakech",
  "South Africa": "Cape Town", Argentina: "Buenos Aires",
  Peru: "Lima", Colombia: "Cartagena", Netherlands: "Amsterdam",
  Switzerland: "Zurich", Austria: "Vienna", Sweden: "Stockholm",
  Norway: "Oslo", Denmark: "Copenhagen", Finland: "Helsinki",
  Poland: "Warsaw", "Czech Republic": "Prague", Hungary: "Budapest",
  Croatia: "Dubrovnik", Portugal: "Lisbon", Ireland: "Dublin",
  Iceland: "Reykjavik", "New Zealand": "Queenstown", Indonesia: "Bali",
  Malaysia: "Kuala Lumpur", Singapore: "Singapore", Philippines: "Manila",
  Vietnam: "Hanoi", UAE: "Dubai", "United Arab Emirates": "Dubai",
  Israel: "Tel Aviv", "South Korea": "Seoul", Taiwan: "Taipei",
  Kenya: "Nairobi", "Sri Lanka": "Colombo",
}

function getCityCoords(name: string): { lat: number; lng: number } | null {
  const key = Object.keys(KNOWN_CITY_COORDS).find(
    (k) => k.toLowerCase() === name.toLowerCase()
  )
  if (key) return KNOWN_CITY_COORDS[key]

  const countryKey = Object.keys(COUNTRY_TO_CAPITAL).find(
    (k) => k.toLowerCase() === name.toLowerCase()
  )
  if (countryKey) {
    const capital = COUNTRY_TO_CAPITAL[countryKey]
    const capKey = Object.keys(KNOWN_CITY_COORDS).find(
      (k) => k.toLowerCase() === capital.toLowerCase()
    )
    if (capKey) return KNOWN_CITY_COORDS[capKey]
  }
  return null
}

// Deterministic spread — each place gets a stable offset from city center
function deterministicOffset(seed: string, slot: number): { dlat: number; dlng: number } {
  // Simple hash of seed string
  let h = slot + 1
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) & 0x7fffffff
  }
  // Spread within ±0.012° (~1.3 km) so all markers stay in one map view
  const dlat = ((h % 241) - 120) / 10000
  const dlng = (((h * 13) % 241) - 120) / 10000
  return { dlat, dlng }
}

// Nominatim lightweight geocoder (free, OpenStreetMap-backed)
const GEOCODE_LS_KEY = "travel_geocode_v1"

function readGeocodeCache(): Record<string, { lat: number; lng: number }> {
  try {
    return JSON.parse(localStorage.getItem(GEOCODE_LS_KEY) ?? "{}")
  } catch {
    return {}
  }
}

function writeGeocodeCache(cache: Record<string, { lat: number; lng: number }>) {
  try {
    localStorage.setItem(GEOCODE_LS_KEY, JSON.stringify(cache))
  } catch {}
}

async function geocodePlace(
  name: string,
  city: string,
  cache: Record<string, { lat: number; lng: number }>
): Promise<{ lat: number; lng: number } | null> {
  const key = `${name}|${city}`
  if (cache[key]) return cache[key]

  try {
    const q = encodeURIComponent(`${name}, ${city}`)
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
      { headers: { "User-Agent": "TravelRecommendationApp/1.0" } }
    )
    if (!res.ok) return null
    const data = await res.json()
    if (Array.isArray(data) && data.length > 0) {
      const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
      cache[key] = coords
      writeGeocodeCache(cache)
      return coords
    }
  } catch {}
  return null
}

// Leaflet loader — singleton promise so the script is added only once
let leafletPromise: Promise<any> | null = null

function loadLeaflet(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("SSR"))

  const L = (window as any).L
  if (L) return Promise.resolve(L)

  if (leafletPromise) return leafletPromise

  leafletPromise = new Promise((resolve, reject) => {
    // CSS
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      document.head.appendChild(link)
    }

    // JS
    const existing = document.querySelector('script[src*="leaflet.js"]') as HTMLScriptElement | null
    if (existing) {
      const poll = setInterval(() => {
        if ((window as any).L) {
          clearInterval(poll)
          resolve((window as any).L)
        }
      }, 80)
      return
    }

    const script = document.createElement("script")
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    script.onload = () => {
      leafletPromise = null // reset so the next call resolves immediately via window.L
      resolve((window as any).L)
    }
    script.onerror = () => {
      leafletPromise = null
      reject(new Error("Failed to load Leaflet"))
    }
    document.head.appendChild(script)
  })

  return leafletPromise
}

// Marker helpers
const TYPE_COLOR: Record<string, string> = {
  hotel: "#3b82f6",
  restaurant: "#ef4444",
  attraction: "#22c55e",
}
const TYPE_EMOJI: Record<string, string> = {
  hotel: "🏨",
  restaurant: "🍽",
  attraction: "📸",
}

function buildIcon(L: any, type: string) {
  const color = TYPE_COLOR[type]
  const emoji = TYPE_EMOJI[type]
  return L.divIcon({
    html: `<div style="background:${color};color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:17px;box-shadow:0 2px 6px rgba(0,0,0,0.35);border:2px solid white;">${emoji}</div>`,
    className: "",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -22],
  })
}

function buildPopup(place: ResolvedPlace): string {
  return `
    <div style="min-width:160px;font-family:system-ui,sans-serif;padding:4px;">
      <strong style="font-size:13px;">${place.name}</strong>
      <p style="margin:4px 0 0;font-size:11px;color:#666;text-transform:capitalize;">${place.type}</p>
      ${place.rating != null ? `<p style="margin:3px 0 0;font-size:11px;">⭐ ${place.rating}/5</p>` : ""}
      ${place.cuisine ? `<p style="margin:3px 0 0;font-size:11px;">🍴 ${place.cuisine}</p>` : ""}
    </div>
  `
}

// Main component
export function InteractiveMap({
  city,
  hotels,
  restaurants,
  attractions = [],
}: InteractiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const leafletMarkersRef = useRef<Map<string, any>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [mapError, setMapError] = useState<string | null>(null)

  // Stable serialised key — only re-runs when city/places actually change
  const placesKey = JSON.stringify({ city, h: hotels.map((h) => h.name), r: restaurants.map((r) => r.name), a: attractions.map((a) => a.name) })

  useEffect(() => {
    if (!containerRef.current) return

    let cancelled = false
    const geocodeTimers: ReturnType<typeof setTimeout>[] = []

    const cityCoords = getCityCoords(city) ?? { lat: 48.8566, lng: 2.3522 }

    // Build initial place list with deterministic city-relative offsets
    const allPlaces: ResolvedPlace[] = []

    hotels.forEach((h, i) => {
      const { dlat, dlng } = deterministicOffset(`hotel${i}${h.name}`, i)
      allPlaces.push({
        id: `hotel-${i}`,
        name: h.name,
        type: "hotel",
        lat: cityCoords.lat + dlat,
        lng: cityCoords.lng + dlng,
        rating: h.rating,
      })
    })

    restaurants.forEach((r, i) => {
      const { dlat, dlng } = deterministicOffset(`restaurant${i}${r.name}`, i + 50)
      allPlaces.push({
        id: `restaurant-${i}`,
        name: r.name,
        type: "restaurant",
        lat: cityCoords.lat + dlat,
        lng: cityCoords.lng + dlng,
        rating: r.rating,
        cuisine: r.cuisine,
      })
    })

    attractions.forEach((a, i) => {
      const { dlat, dlng } = deterministicOffset(`attraction${i}${a.name}`, i + 100)
      allPlaces.push({
        id: `attraction-${i}`,
        name: a.name,
        type: "attraction",
        lat: cityCoords.lat + dlat,
        lng: cityCoords.lng + dlng,
      })
    })

    // Tear down previous map instance if city/places changed
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
      leafletMarkersRef.current.clear()
    }

    setIsLoading(true)
    setMapError(null)

    loadLeaflet()
      .then((L) => {
        // Guard against React Strict Mode double-invoke or unmount before load
        if (cancelled || !containerRef.current) return

        const map = L.map(containerRef.current, {
          center: [cityCoords.lat, cityCoords.lng],
          zoom: 13,
          zoomControl: true,
        })
        mapInstanceRef.current = map

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map)

        // Add markers immediately with deterministic positions
        allPlaces.forEach((place) => {
          const marker = L.marker([place.lat, place.lng], {
            icon: buildIcon(L, place.type),
          })
            .addTo(map)
            .bindPopup(buildPopup(place))
          leafletMarkersRef.current.set(place.id, marker)
        })

        // Fit bounds to show all markers
        if (allPlaces.length > 0) {
          const leafletMarkerList = Array.from(leafletMarkersRef.current.values())
          const group = L.featureGroup(leafletMarkerList)
          map.fitBounds(group.getBounds().pad(0.2))
        }

        setIsLoading(false)

        // Background: try Nominatim for each place to improve pin accuracy
        // Requests are spaced 1.2 s apart to respect the 1 req/s rate limit
        const geocodeCache = readGeocodeCache()
        let delay = 500
        allPlaces.forEach((place) => {
          const t = setTimeout(async () => {
            if (cancelled) return
            const coords = await geocodePlace(place.name, city, geocodeCache)
            if (!coords || cancelled) return
            const marker = leafletMarkersRef.current.get(place.id)
            if (marker && mapInstanceRef.current) {
              marker.setLatLng([coords.lat, coords.lng])
            }
          }, delay)
          geocodeTimers.push(t)
          delay += 1200
        })
      })
      .catch(() => {
        if (cancelled) return
        setMapError("Could not load the map. Please check your internet connection.")
        setIsLoading(false)
      })

    return () => {
      cancelled = true
      geocodeTimers.forEach(clearTimeout)
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        leafletMarkersRef.current.clear()
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placesKey])

  const hotelCount = hotels.length
  const restaurantCount = restaurants.length
  const attractionCount = attractions.length
  const total = hotelCount + restaurantCount + attractionCount

  // Error state
  if (mapError) {
    return (
      <Card className="border-2 border-destructive/40 p-6">
        <div className="flex items-center gap-3 text-destructive">
          <MapPin className="h-5 w-5" />
          <p>{mapError}</p>
        </div>
      </Card>
    )
  }

  // Render
  return (
    <Card className="border-2 overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Interactive Map</h3>
            <p className="text-sm text-muted-foreground">{city}</p>
          </div>
        </div>

        <ul className="text-sm text-muted-foreground space-y-1 mb-4">
          <li>• Click a marker to see details</li>
          <li>• Showing AI-recommended places only</li>
          <li>• Powered by OpenStreetMap — no API key required</li>
        </ul>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            🏨 Hotels: {hotelCount}
          </Badge>
          <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100">
            🍽 Restaurants: {restaurantCount}
          </Badge>
          <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
            📸 Attractions: {attractionCount}
          </Badge>
          <Badge variant="outline">Total: {total}</Badge>
        </div>
      </div>

      {/* Map container */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted/60 backdrop-blur-sm">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-primary" />
              <p className="text-sm text-muted-foreground">Loading map…</p>
            </div>
          </div>
        )}
        <div
          ref={containerRef}
          style={{ height: "400px", width: "100%" }}
        />
      </div>

      {/* Legend */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>Hotels</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Restaurants</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>Attractions</span>
          </div>
          <span className="ml-auto text-xs text-muted-foreground">
            © OpenStreetMap contributors
          </span>
        </div>
      </div>
    </Card>
  )
}
