"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Hotel, Utensils, Camera } from "lucide-react"

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

interface DestinationMapProps {
  markers: MapMarker[]
  countryName: string
}

export function DestinationMap({ markers, countryName }: DestinationMapProps) {
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null)
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
      if (!markers || markers.length === 0) {
        setMapError('No locations to display on map')
        return
      }

      // Guard against double-initialisation (React Strict Mode / remounts)
      if (mapInstanceRef.current) return

      // Get center point from markers or use default
      const centerLat = markers[0]?.location.lat || 0
      const centerLng = markers[0]?.location.lng || 0

      // Initialize map
      const map = window.L.map('map-container', {
        center: [centerLat, centerLng],
        zoom: 13,
        zoomControl: true
      })
      mapInstanceRef.current = map

      // Add tile layer
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map)

      // Add markers
      markers.forEach((marker) => {
        const emoji = marker.type === 'hotel' ? '🏨' : marker.type === 'restaurant' ? '🍽️' : '📸'
        const bgColor = marker.type === 'hotel' ? '#3b82f6' : marker.type === 'restaurant' ? '#ef4444' : '#22c55e'

        const icon = window.L.divIcon({
          html: `
            <div style="
              background: ${bgColor};
              color: white;
              border-radius: 50%;
              width: 36px;
              height: 36px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 18px;
              box-shadow: 0 2px 6px rgba(0,0,0,0.4);
              border: 2px solid white;
            ">${emoji}</div>
          `,
          className: 'custom-marker',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        })

        const ratingHtml  = marker.info.rating  ? `<p style="margin:4px 0">⭐ ${marker.info.rating}/5</p>` : ""
        const priceHtml   = marker.info.price   ? `<p style="margin:4px 0">💰 ${marker.info.price}</p>` : ""
        const cuisineHtml = marker.info.cuisine ? `<p style="margin:4px 0">🍴 ${marker.info.cuisine}</p>` : ""
        const typeLabel   = marker.type === 'hotel' ? 'Hotel' : marker.type === 'restaurant' ? 'Restaurant' : 'Attraction'

        const popupContent = `
          <div style="min-width:200px;padding:10px;font-family:system-ui,sans-serif">
            <p style="margin:0 0 2px 0;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.05em">${typeLabel}</p>
            <h3 style="margin:0 0 6px 0;font-weight:700;font-size:14px">${marker.name}</h3>
            ${ratingHtml}${priceHtml}${cuisineHtml}
          </div>
        `

        const leafletMarker = window.L.marker([marker.location.lat, marker.location.lng], {
          icon: icon
        }).addTo(map)

        leafletMarker.bindPopup(popupContent)

        // Store marker reference
        ;(leafletMarker as any).markerData = marker
      })

      // Fit map to show all markers
      const group = window.L.featureGroup(markers.map(m => 
        window.L.marker([m.location.lat, m.location.lng])
      ))
      map.fitBounds(group.getBounds().pad(0.1))

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
        <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold">
          <MapPin className="h-8 w-8 text-primary" />
          Interactive Map - {countryName}
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Click on markers to see hotel, restaurant, and attraction details.
          Total locations: {markers.length}
        </p>
      </div>
      
      <div 
        id="map-container" 
        style={{ height: '500px', width: '100%', borderRadius: '8px' }}
        className="border-2 border-border overflow-hidden"
      />
      
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <h3 className="font-semibold mb-2">Legend</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                🏨
              </div>
              <span>Hotels</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                🍽
              </div>
              <span>Restaurants</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs">
                📸
              </div>
              <span>Attractions</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold mb-2">Location Summary</h3>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>• Interactive map with real location data</p>
            <p>• Click markers for detailed information</p>
            <p>• Color-coded by place type</p>
            <p>• Zoom and pan controls available</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
