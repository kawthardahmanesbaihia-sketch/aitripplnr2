"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import {
  Bus, Car, Train, Plane, Ship, Cable, Clock, DollarSign,
  MapPin, Zap, Navigation, Users, Globe, AlertCircle, CheckCircle2,
  XCircle, ExternalLink,
} from "lucide-react"
import type {
  TransportationInfo, TransitStation, TransitRoute, TransportMode, TransitLine,
} from "@/lib/transport-client"

// Extend window for Leaflet CDN
declare global { interface Window { L: any } }

// ─── Legacy transfer types (HotelBeds) ───────────────────────────────────────

interface Transfer {
  name:     string
  vehicle:  string
  capacity: number
  price:    string
  duration: string
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface TransportSectionProps {
  transfers:       Transfer[]
  cityName:        string
  transportation?: TransportationInfo
}

// ─── Map colour / icon constants ──────────────────────────────────────────────

const LINE_COLORS: Record<string, string> = {
  metro:      "#2563EB",
  bus:        "#16A34A",
  rail:       "#9333EA",
  tram:       "#EA580C",
  ferry:      "#0891B2",
  cable_car:  "#7C3AED",
  funicular:  "#7C3AED",
  trolleybus: "#0D9488",
  other:      "#6B7280",
}

const STATION_ICON: Record<TransitStation["type"], { emoji: string; bg: string }> = {
  airport:       { emoji: "✈️",  bg: "#0EA5E9" },
  train_station: { emoji: "🚂",  bg: "#9333EA" },
  bus_station:   { emoji: "🚌",  bg: "#16A34A" },
  metro:         { emoji: "🚇",  bg: "#2563EB" },
  tram:          { emoji: "🚋",  bg: "#EA580C" },
  ferry:         { emoji: "⛴️",  bg: "#0891B2" },
  transit:       { emoji: "📍",  bg: "#6B7280" },
}

// ─── Inline Leaflet transport map ─────────────────────────────────────────────

interface TransportMapProps {
  stations: TransitStation[]
  lines:    TransitLine[]
}

function TransportMap({ stations, lines }: TransportMapProps) {
  const containerRef  = useRef<HTMLDivElement>(null)
  const mapRef        = useRef<any>(null)

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return
    let cancelled = false

    const initMap = () => {
      if (cancelled || !containerRef.current || mapRef.current) return

      try {
        const centerLat = stations[0]?.lat ?? lines[0]?.coordinates?.[0]?.lat ?? 0
        const centerLng = stations[0]?.lon ?? lines[0]?.coordinates?.[0]?.lng ?? 0

        if (!centerLat && !centerLng) {
          console.warn("[TransportMap] No coordinates — skipping init")
          return
        }

        const map = window.L.map(containerRef.current, {
          center:      [centerLat, centerLng],
          zoom:        12,
          zoomControl: true,
        })
        mapRef.current = map

        window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(map)

        const boundObjects: any[] = []

        // Transit line polylines
        for (const line of lines) {
          if (line.coordinates.length < 2) continue
          const latlngs = line.coordinates.map(c => [c.lat, c.lng])
          const color   = line.color || LINE_COLORS[line.mode] || LINE_COLORS.other
          const poly    = window.L.polyline(latlngs, { color, weight: 4, opacity: 0.78 }).addTo(map)
          poly.bindPopup(
            `<div style="font-family:system-ui;padding:4px 2px">` +
            `<p style="margin:0 0 2px;font-size:10px;color:#888;text-transform:uppercase">` +
            `${line.mode.replace(/_/g, " ")}</p>` +
            `<b style="font-size:13px">${line.name}</b>` +
            `</div>`
          )
          boundObjects.push(poly)
        }

        // Station markers
        for (const station of stations) {
          if (!station.lat || !station.lon) continue
          const { emoji, bg } = STATION_ICON[station.type] ?? STATION_ICON.transit
          const icon = window.L.divIcon({
            html: `<div style="background:${bg};color:white;border-radius:50%;width:32px;height:32px;` +
                  `display:flex;align-items:center;justify-content:center;font-size:15px;` +
                  `box-shadow:0 2px 6px rgba(0,0,0,0.4);border:2px solid white">${emoji}</div>`,
            className:  "transport-station-marker",
            iconSize:   [32, 32],
            iconAnchor: [16, 16],
          })
          const m = window.L.marker([station.lat, station.lon], { icon }).addTo(map)
          m.bindPopup(
            `<div style="font-family:system-ui;padding:6px;min-width:160px">` +
            `<p style="margin:0 0 2px;font-size:10px;color:#888;text-transform:uppercase">` +
            `${station.type.replace(/_/g, " ")}</p>` +
            `<b style="font-size:13px">${station.name}</b>` +
            (station.address  ? `<p style="margin:4px 0 0;font-size:11px;color:#666">${station.address}</p>` : "") +
            (station.openHours ? `<p style="margin:2px 0 0;font-size:11px;color:#666">${station.openHours}</p>` : "") +
            `</div>`
          )
          boundObjects.push(m)
        }

        if (boundObjects.length > 0) {
          const group = window.L.featureGroup(boundObjects)
          map.fitBounds(group.getBounds().pad(0.12))
        }
      } catch (err) {
        console.error("[TransportMap] Leaflet init error:", err)
      }
    }

    // Ensure Leaflet CSS
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link  = document.createElement("link")
      link.rel    = "stylesheet"
      link.href   = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      document.head.appendChild(link)
    }

    // Ensure Leaflet JS
    if (window.L) {
      initMap()
    } else if (document.querySelector('script[src*="leaflet.js"]')) {
      const poll = setInterval(() => {
        if (window.L) { clearInterval(poll); initMap() }
      }, 50)
    } else {
      const script   = document.createElement("script")
      script.src     = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
      script.onload  = () => { if (!cancelled) initMap() }
      document.head.appendChild(script)
    }

    return () => {
      cancelled = true
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      style={{ height: "420px", width: "100%", borderRadius: "12px" }}
      className="border border-border overflow-hidden bg-muted"
    />
  )
}

// ─── Map legend ───────────────────────────────────────────────────────────────

const LEGEND_LINES = [
  { mode: "metro", label: "Metro / Subway" },
  { mode: "bus",   label: "Bus" },
  { mode: "rail",  label: "Rail / Train" },
  { mode: "tram",  label: "Tram" },
  { mode: "ferry", label: "Ferry" },
] as const

const LEGEND_STATIONS = [
  { type: "airport"       as const, label: "Airport" },
  { type: "train_station" as const, label: "Train Station" },
  { type: "bus_station"   as const, label: "Bus Terminal" },
  { type: "metro"         as const, label: "Metro Station" },
] as const

// ─── Mode icon + colour map ───────────────────────────────────────────────────

const MODE_META: Record<string, { icon: typeof Bus; color: string; bg: string }> = {
  bus:        { icon: Bus,       color: "text-green-600 dark:text-green-400",   bg: "bg-green-100 dark:bg-green-900/40" },
  metro:      { icon: Zap,       color: "text-blue-600 dark:text-blue-400",     bg: "bg-blue-100 dark:bg-blue-900/40" },
  rail:       { icon: Train,     color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/40" },
  tram:       { icon: Cable,     color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-100 dark:bg-orange-900/40" },
  ferry:      { icon: Ship,      color: "text-cyan-600 dark:text-cyan-400",     bg: "bg-cyan-100 dark:bg-cyan-900/40" },
  taxi:       { icon: Car,       color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-900/40" },
  rideshare:  { icon: Navigation,color: "text-pink-600 dark:text-pink-400",     bg: "bg-pink-100 dark:bg-pink-900/40" },
  cable_car:  { icon: Cable,     color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-100 dark:bg-indigo-900/40" },
  funicular:  { icon: Cable,     color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-100 dark:bg-indigo-900/40" },
  trolleybus: { icon: Bus,       color: "text-teal-600 dark:text-teal-400",     bg: "bg-teal-100 dark:bg-teal-900/40" },
  other:      { icon: Bus,       color: "text-muted-foreground",                bg: "bg-muted" },
}

function modeMeta(mode: string) { return MODE_META[mode] ?? MODE_META.other }

// ─── Station type icon ────────────────────────────────────────────────────────

const STATION_META: Record<string, { icon: typeof Bus; color: string; label: string }> = {
  airport:       { icon: Plane,  color: "text-sky-500",    label: "Airport" },
  train_station: { icon: Train,  color: "text-purple-500", label: "Train Station" },
  bus_station:   { icon: Bus,    color: "text-green-500",  label: "Bus Terminal" },
  metro:         { icon: Zap,    color: "text-blue-500",   label: "Metro" },
  tram:          { icon: Cable,  color: "text-orange-500", label: "Tram Stop" },
  ferry:         { icon: Ship,   color: "text-cyan-500",   label: "Ferry Terminal" },
  transit:       { icon: MapPin, color: "text-muted-foreground", label: "Transit Hub" },
}

function stationMeta(type: TransitStation["type"]) {
  return STATION_META[type] ?? STATION_META.transit
}

// ─── Legacy vehicle meta ──────────────────────────────────────────────────────

const VEHICLE_META: Record<string, { icon: typeof Car; color: string; label: string }> = {
  TAXI:    { icon: Car,   color: "text-yellow-500", label: "Taxi" },
  CAR:     { icon: Car,   color: "text-blue-500",   label: "Private Car" },
  MINIBUS: { icon: Bus,   color: "text-green-500",  label: "Minibus" },
  BUS:     { icon: Bus,   color: "text-green-500",  label: "Bus" },
  TRAIN:   { icon: Train, color: "text-purple-500", label: "Train" },
  SHUTTLE: { icon: Bus,   color: "text-orange-500", label: "Shuttle" },
}

function getVehicleMeta(code: string) {
  const key = Object.keys(VEHICLE_META).find(k => code?.toUpperCase().includes(k))
  return key ? VEHICLE_META[key] : { icon: Car, color: "text-muted-foreground", label: code || "Transfer" }
}

// ─── Data-source badge ────────────────────────────────────────────────────────

const SOURCE_LABEL: Record<string, string> = {
  transitland: "Transitland",
  overpass:    "OpenStreetMap",
  ors:         "OpenRouteService",
  static:      "Curated",
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ModeCard({ mode, delay }: { mode: TransportMode; delay: number }) {
  const { icon: Icon, color, bg } = modeMeta(mode.mode)
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex items-start gap-3 bg-card border border-border rounded-2xl p-4"
    >
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="font-semibold text-sm text-foreground">{mode.label}</p>
          {mode.available
            ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
            : <XCircle      className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
          }
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{mode.description}</p>
        {mode.ticketPrice && (
          <p className="mt-1.5 text-xs font-medium text-primary flex items-center gap-1">
            <DollarSign className="w-3 h-3" />{mode.ticketPrice}
          </p>
        )}
      </div>
    </motion.div>
  )
}

function RouteCard({ route, delay }: { route: TransitRoute; delay: number }) {
  const { icon: Icon, color, bg } = modeMeta(route.mode)
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3"
    >
      <div className="w-1 h-10 rounded-full shrink-0" style={{ backgroundColor: route.color ?? "" }} />
      <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-sm text-foreground truncate">{route.name}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
          {route.shortName && (
            <span className="px-1.5 py-0.5 rounded bg-muted font-mono font-bold">{route.shortName}</span>
          )}
          <span className="capitalize">{route.mode.replace("_", " ")}</span>
          {route.operator && <span>· {route.operator}</span>}
        </div>
      </div>
    </motion.div>
  )
}

function StationCard({ station, delay }: { station: TransitStation; delay: number }) {
  const { icon: Icon, color, label } = stationMeta(station.type)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="bg-card border border-border rounded-2xl p-4 space-y-2"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm text-foreground leading-snug">{station.name}</p>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">{label}</span>
        </div>
      </div>
      {station.address && (
        <p className="text-xs text-muted-foreground flex items-start gap-1">
          <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
          <span className="line-clamp-1">{station.address}</span>
        </p>
      )}
      {station.openHours && (
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3 shrink-0" />
          <span className="line-clamp-1">{station.openHours}</span>
        </p>
      )}
      {station.mapsUrl && (
        <a
          href={station.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary flex items-center gap-1 hover:underline"
        >
          <ExternalLink className="w-3 h-3" />View on maps
        </a>
      )}
    </motion.div>
  )
}

// ─── Summary table ────────────────────────────────────────────────────────────

const SUMMARY_ROWS: Array<{ key: keyof TransportationInfo["summary"]; icon: typeof Bus; label: string }> = [
  { key: "airport",     icon: Plane,      label: "Airport" },
  { key: "rail",        icon: Train,      label: "Rail" },
  { key: "bus",         icon: Bus,        label: "Bus" },
  { key: "metro",       icon: Zap,        label: "Metro" },
  { key: "tram",        icon: Cable,      label: "Tram" },
  { key: "ferry",       icon: Ship,       label: "Ferry" },
  { key: "taxi",        icon: Car,        label: "Taxi" },
  { key: "rideSharing", icon: Navigation, label: "Ride Sharing" },
]

// ─── Main component ───────────────────────────────────────────────────────────

export function TransportSection({ transfers, cityName, transportation }: TransportSectionProps) {
  console.log("TRANSPORT DATA", transportation)

  const t           = transportation
  const stations    = t?.stations  ?? []
  const lines       = t?.lines     ?? []
  const hasMap      = stations.length > 0 || lines.length > 0
  const hasRoutes   = (t?.routes?.length   ?? 0) > 0
  const hasStations = stations.length > 0
  const hasOps      = (t?.operators?.length ?? 0) > 0
  const hasModes    = (t?.modes?.length     ?? 0) > 0
  const hasSummary  = !!t?.summary
  const hasTransfers = transfers && transfers.length > 0

  console.log("MAP PROPS", { markers: stations, transitLines: lines })

  return (
    <div className="p-6 space-y-10">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Transportation & Mobility</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Getting around {cityName}</p>
        </div>
        {t?.dataSource && (
          <span className="shrink-0 text-[10px] px-2.5 py-1 rounded-full border border-border bg-muted text-muted-foreground font-medium flex items-center gap-1">
            <Globe className="w-3 h-3" />
            {SOURCE_LABEL[t.dataSource] ?? t.dataSource}
          </span>
        )}
      </div>

      {/* ── Transport Network Map ───────────────────────────────────── */}
      {hasMap && (
        <section>
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Transport Network Map
            <span className="text-xs text-muted-foreground font-normal">
              — {lines.length} lines · {stations.length} stations
            </span>
          </h3>

          <TransportMap stations={stations} lines={lines} />

          {/* Map legend */}
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            {LEGEND_LINES.filter(({ mode }) => lines.some(l => l.mode === mode)).map(({ mode, label }) => (
              <div key={mode} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-6 h-1 rounded-full" style={{ backgroundColor: LINE_COLORS[mode] }} />
                {label}
              </div>
            ))}
            {LEGEND_STATIONS.filter(({ type }) => stations.some(s => s.type === type)).map(({ type, label }) => (
              <div key={type} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[9px]"
                  style={{ backgroundColor: STATION_ICON[type].bg }}
                >
                  {STATION_ICON[type].emoji}
                </div>
                {label}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Transport Modes ─────────────────────────────────────────── */}
      {hasModes && (
        <section>
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Bus className="w-4 h-4 text-primary" />
            Transport Modes
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {t!.modes.map((mode, i) => <ModeCard key={mode.mode} mode={mode} delay={i * 0.05} />)}
          </div>
        </section>
      )}

      {/* ── Summary Table ────────────────────────────────────────────── */}
      {hasSummary && (
        <section>
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-primary" />
            Quick Reference
          </h3>
          <div className="rounded-2xl border border-border overflow-hidden">
            {SUMMARY_ROWS.map(({ key, icon: Icon, label }, i) => {
              const value = t!.summary[key]
              if (!value) return null
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`flex items-start gap-4 px-5 py-3.5 ${i % 2 === 0 ? "bg-muted/30" : "bg-card"}`}
                >
                  <div className="flex items-center gap-2 w-28 shrink-0">
                    <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-sm font-medium text-foreground">{label}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{value}</p>
                </motion.div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Transit Routes ───────────────────────────────────────────── */}
      {hasRoutes && (
        <section>
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Train className="w-4 h-4 text-primary" />
            Transit Lines
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium ml-1">
              {t!.routes.length}
            </span>
          </h3>
          <div className="space-y-2">
            {t!.routes.map((route, i) => <RouteCard key={route.id || i} route={route} delay={i * 0.04} />)}
          </div>
        </section>
      )}

      {/* ── Stations & Hubs ─────────────────────────────────────────── */}
      {hasStations && (
        <section>
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Stations & Terminals
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium ml-1">
              {stations.length}
            </span>
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stations.map((s, i) => <StationCard key={s.id || i} station={s} delay={i * 0.04} />)}
          </div>
        </section>
      )}

      {/* ── Operators ────────────────────────────────────────────────── */}
      {hasOps && (
        <section>
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Transit Operators
          </h3>
          <div className="flex flex-wrap gap-2">
            {t!.operators.map((op, i) => (
              <motion.div
                key={op.id || i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
              >
                {op.website ? (
                  <a
                    href={op.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card text-sm text-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    {op.name}<ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="px-3 py-1.5 rounded-full border border-border bg-card text-sm text-foreground">
                    {op.name}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ── Airport Transfers (HotelBeds) ────────────────────────────── */}
      <section>
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Plane className="w-4 h-4 text-primary" />
          Airport Transfers
          {hasTransfers && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium ml-1">
              {transfers.length} options
            </span>
          )}
        </h3>

        {hasTransfers ? (
          <div className="grid sm:grid-cols-2 gap-3">
            {transfers.map((tf, i) => {
              const { icon: Icon, color, label } = getVehicleMeta(tf.vehicle)
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="bg-card rounded-2xl border border-border p-4 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{tf.name || label}</p>
                      <p className="text-xs text-muted-foreground">{label}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {tf.price && (
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1 text-muted-foreground"><DollarSign className="w-3 h-3" />Price</span>
                        <span className="font-semibold text-foreground">{tf.price}</span>
                      </div>
                    )}
                    {tf.duration && (
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1 text-muted-foreground"><Clock className="w-3 h-3" />Time</span>
                        <span className="font-semibold text-foreground">{tf.duration}</span>
                      </div>
                    )}
                    {tf.capacity > 0 && (
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1 text-muted-foreground"><Users className="w-3 h-3" />Max</span>
                        <span className="font-semibold text-foreground">{tf.capacity} pax</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-muted/30 p-5 text-sm text-muted-foreground">
            Pre-booked transfer data requires travel dates. Check local taxi apps or public transport on arrival.
          </div>
        )}
      </section>

    </div>
  )
}
