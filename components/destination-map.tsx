"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { MapPin, Hotel, Utensils, Camera } from "lucide-react"
import type { TransitLine } from "@/lib/transport-client"

// Extend Window interface to include Leaflet
declare global {
  interface Window {
    L: any;
  }
}

interface MapMarker {
  id: string
  name: string
  type: 'hotel' | 'restaurant' | 'attraction'
  location: {
    lat: number
    lng: number
  }
  info: {
    rating?: number
    price?: string
    cuisine?: string
  }
}

// Per-mode colours for transit polylines
const LINE_COLORS: Record<string, string> = {
  metro:      "#2563EB",  // blue
  bus:        "#16A34A",  // green
  rail:       "#9333EA",  // purple
  tram:       "#EA580C",  // orange
  ferry:      "#0891B2",  // cyan
  cable_car:  "#7C3AED",  // violet
  funicular:  "#7C3AED",
  trolleybus: "#0D9488",  // teal
  other:      "#6B7280",  // gray
}

function lineColor(mode: string, overrideColor?: string): string {
  return overrideColor || LINE_COLORS[mode] || LINE_COLORS.other
}

interface DestinationMapProps {
  markers:      MapMarker[]
  countryName:  string
  transitLines?: TransitLine[]
}

export function DestinationMap({ markers, countryName, transitLines }: DestinationMapProps) {
  const [mapError, setMapError] = useState<string | null>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    let cancelled = false

    // Load Leaflet CSS if not already present
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    const runInit = () => {
      if (!cancelled) initializeMap()
    }

    if (window.L) {
      // Leaflet already available — initialise immediately
      runInit()
    } else if (document.querySelector('script[src*="leaflet.js"]')) {
      // Script tag is in the DOM but still loading — poll until window.L is set
      const poll = setInterval(() => {
        if (window.L) {
          clearInterval(poll)
          runInit()
        }
      }, 50)
    } else {
      // No script tag yet — inject it
      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = runInit
      document.head.appendChild(script)
    }

    return () => {
      cancelled = true
      // Destroy the map instance first to release the container
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
      // Then clean up the injected DOM nodes
      const existingLink = document.querySelector('link[href*="leaflet.css"]')
      const existingScript = document.querySelector('script[src*="leaflet.js"]')
      if (existingLink) existingLink.remove()
      if (existingScript) existingScript.remove()
    }
  }, [])

  const initializeMap = () => {
    try {
      const hasMarkers = markers && markers.length > 0
      const hasLines   = transitLines && transitLines.length > 0

      if (!hasMarkers && !hasLines) {
        setMapError('No locations to display on map')
        return
      }

      // Guard against double-initialisation (React Strict Mode / remounts)
      if (mapInstanceRef.current) return

      // Derive centre from markers first, then from first transit line coordinate
      const centerLat = markers?.[0]?.location.lat
        ?? transitLines?.[0]?.coordinates?.[0]?.lat
        ?? 0
      const centerLng = markers?.[0]?.location.lng
        ?? transitLines?.[0]?.coordinates?.[0]?.lng
        ?? 0

      const map = window.L.map('map-container', {
        center: [centerLat, centerLng],
        zoom: 13,
        zoomControl: true,
      })
      mapInstanceRef.current = map

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      // ── Draw transit polylines (below markers so markers are on top) ────────
      const allBoundObjects: any[] = []

      if (hasLines) {
        for (const line of transitLines!) {
          if (line.coordinates.length < 2) continue
          const latlngs = line.coordinates.map(c => [c.lat, c.lng] as [number, number])
          const color   = lineColor(line.mode, line.color)
          const poly    = window.L.polyline(latlngs, {
            color,
            weight:  4,
            opacity: 0.75,
          }).addTo(map)

          const modeLabel = line.mode.replace(/_/g, " ")
          poly.bindPopup(
            `<div style="font-family:system-ui,sans-serif;padding:6px 2px">` +
            `<p style="margin:0 0 2px;font-size:10px;color:#888;text-transform:uppercase">${modeLabel}</p>` +
            `<b style="font-size:13px">${line.name}</b>` +
            `</div>`
          )
          allBoundObjects.push(poly)
        }
      }

      // ── Add place markers (hotels, restaurants, attractions) ────────────────
      if (hasMarkers) {
        for (const marker of markers!) {
          const emoji   = marker.type === 'hotel' ? '🏨' : marker.type === 'restaurant' ? '🍽️' : '📸'
          const bgColor = marker.type === 'hotel' ? '#3b82f6' : marker.type === 'restaurant' ? '#ef4444' : '#22c55e'

          const icon = window.L.divIcon({
            html: `<div style="background:${bgColor};color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 6px rgba(0,0,0,0.4);border:2px solid white">${emoji}</div>`,
            className:  'custom-marker',
            iconSize:   [36, 36],
            iconAnchor: [18, 18],
          })

          const ratingHtml  = marker.info.rating  ? `<p style="margin:4px 0">⭐ ${marker.info.rating}/5</p>` : ""
          const priceHtml   = marker.info.price   ? `<p style="margin:4px 0">💰 ${marker.info.price}</p>` : ""
          const cuisineHtml = marker.info.cuisine ? `<p style="margin:4px 0">🍴 ${marker.info.cuisine}</p>` : ""
          const typeLabel   = marker.type === 'hotel' ? 'Hotel' : marker.type === 'restaurant' ? 'Restaurant' : 'Attraction'

          const leafletMarker = window.L.marker(
            [marker.location.lat, marker.location.lng],
            { icon },
          ).addTo(map)

          leafletMarker.bindPopup(
            `<div style="min-width:200px;padding:10px;font-family:system-ui,sans-serif">` +
            `<p style="margin:0 0 2px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.05em">${typeLabel}</p>` +
            `<h3 style="margin:0 0 6px;font-weight:700;font-size:14px">${marker.name}</h3>` +
            `${ratingHtml}${priceHtml}${cuisineHtml}` +
            `</div>`
          )
          allBoundObjects.push(leafletMarker)
        }
      }

      // ── Fit bounds to everything on the map ─────────────────────────────────
      if (allBoundObjects.length > 0) {
        const group = window.L.featureGroup(allBoundObjects)
        map.fitBounds(group.getBounds().pad(0.1))
      }

      setMapError(null)
    } catch (error) {
      console.error('Map initialization error:', error)
      setMapError('Failed to load map. Please try refreshing the page.')
    }
  }

  if (mapError) {
    return (
      <Card className="border-2 bg-red-50 border-red-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <MapPin className="h-8 w-8 text-red-500" />
          <div>
            <h3 className="font-bold text-red-800">Map Error</h3>
            <p className="text-red-600">{mapError}</p>
          </div>
        </div>
        <p className="text-sm text-red-600">
          This could be due to network issues or missing location data.
        </p>
      </Card>
    )
  }

  return (
    <Card className="border-2 bg-card/50 backdrop-blur-sm p-6">
      <div className="mb-4">
        <h2 className="mb-1 flex items-center gap-2 text-2xl font-bold">
          <MapPin className="h-8 w-8 text-primary" />
          Interactive Map — {countryName}
        </h2>
        <p className="text-sm text-muted-foreground">
          {markers.length > 0 && `${markers.length} locations · `}
          {(transitLines?.length ?? 0) > 0 && `${transitLines!.length} transit lines · `}
          Click markers or lines for details
        </p>
      </div>

      <div
        id="map-container"
        style={{ height: '500px', width: '100%', borderRadius: '8px' }}
        className="border-2 border-border overflow-hidden"
      />

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {/* Place legend */}
        <div>
          <h3 className="font-semibold mb-2 text-sm">Places</h3>
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs shrink-0">🏨</div>
              <span>Hotels</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs shrink-0">🍽</div>
              <span>Restaurants</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs shrink-0">📸</div>
              <span>Attractions</span>
            </div>
          </div>
        </div>

        {/* Transit lines legend — only shown when lines exist */}
        {(transitLines?.length ?? 0) > 0 && (
          <div>
            <h3 className="font-semibold mb-2 text-sm">Transit Lines</h3>
            <div className="space-y-1.5 text-sm">
              {[
                { mode: "metro",  label: "Metro / Subway" },
                { mode: "bus",    label: "Bus" },
                { mode: "rail",   label: "Rail / Train" },
                { mode: "tram",   label: "Tram" },
                { mode: "ferry",  label: "Ferry" },
              ].filter(({ mode }) =>
                transitLines!.some(l => l.mode === mode)
              ).map(({ mode, label }) => (
                <div key={mode} className="flex items-center gap-2">
                  <div
                    className="w-8 h-1 rounded-full shrink-0"
                    style={{ backgroundColor: LINE_COLORS[mode] }}
                  />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
