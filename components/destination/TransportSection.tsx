"use client"

import { useEffect, useRef, useMemo } from "react"
import { motion } from "framer-motion"
import {
  Bus, Car, Train, Plane, Ship, Cable, Clock, DollarSign,
  MapPin, Zap, Navigation, Users, Globe, ExternalLink, Activity,
} from "lucide-react"
import type {
  TransportationInfo, TransitStation, TransitLine,
} from "@/lib/transport-client"

declare global { interface Window { L: any } }

// ─── Legacy transfer type (HotelBeds) ────────────────────────────────────────

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

// ─── Aggregated transit system ────────────────────────────────────────────────

interface TransitSystem {
  id:          string
  name:        string
  primaryMode: string
  allModes:    string[]
  lineCount:   number
  stationCount: number
  operator?:   string
  website?:    string
  hours:       string
  price:       string
  frequency:   string
  description: string
  isStatic:    boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

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
  airport:       { emoji: "✈️", bg: "#0EA5E9" },
  train_station: { emoji: "🚂", bg: "#9333EA" },
  bus_station:   { emoji: "🚌", bg: "#16A34A" },
  metro:         { emoji: "🚇", bg: "#2563EB" },
  tram:          { emoji: "🚋", bg: "#EA580C" },
  ferry:         { emoji: "⛴️", bg: "#0891B2" },
  transit:       { emoji: "📍", bg: "#6B7280" },
}

const MODE_META: Record<string, {
  icon:   typeof Bus
  color:  string
  bg:     string
  label:  string
}> = {
  bus:        { icon: Bus,       color: "text-green-600 dark:text-green-400",   bg: "bg-green-100 dark:bg-green-900/40",   label: "Bus"        },
  metro:      { icon: Zap,       color: "text-blue-600 dark:text-blue-400",     bg: "bg-blue-100 dark:bg-blue-900/40",     label: "Metro"      },
  rail:       { icon: Train,     color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900/40", label: "Rail"       },
  tram:       { icon: Cable,     color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-100 dark:bg-orange-900/40", label: "Tram"       },
  ferry:      { icon: Ship,      color: "text-cyan-600 dark:text-cyan-400",     bg: "bg-cyan-100 dark:bg-cyan-900/40",     label: "Ferry"      },
  taxi:       { icon: Car,       color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-100 dark:bg-yellow-900/40", label: "Taxi"       },
  rideshare:  { icon: Navigation,color: "text-pink-600 dark:text-pink-400",     bg: "bg-pink-100 dark:bg-pink-900/40",     label: "Ride Share" },
  cable_car:  { icon: Cable,     color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-100 dark:bg-indigo-900/40", label: "Cable Car"  },
  funicular:  { icon: Cable,     color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-100 dark:bg-indigo-900/40", label: "Funicular"  },
  trolleybus: { icon: Bus,       color: "text-teal-600 dark:text-teal-400",     bg: "bg-teal-100 dark:bg-teal-900/40",     label: "Trolleybus" },
  other:      { icon: Bus,       color: "text-muted-foreground",                bg: "bg-muted",                            label: "Transit"    },
}

function modeMeta(mode: string) { return MODE_META[mode] ?? MODE_META.other }

const MODE_FREQUENCY: Record<string, string> = {
  metro:      "Every 2–5 min",
  bus:        "Varies by route",
  rail:       "Every 15–30 min",
  tram:       "Every 5–10 min",
  ferry:      "Every 30–60 min",
  cable_car:  "Continuous",
  funicular:  "Continuous",
  trolleybus: "Every 5–15 min",
  taxi:       "On demand",
  rideshare:  "On demand",
  other:      "Check schedule",
}

const MODE_DEFAULT_HOURS: Record<string, string> = {
  metro:      "~05:00 – 00:30",
  bus:        "Varies by route",
  rail:       "05:00 – 23:00",
  tram:       "06:00 – 00:00",
  ferry:      "Seasonal schedule",
  taxi:       "24 hours",
  rideshare:  "24 hours",
  cable_car:  "Daily schedule",
  funicular:  "Daily schedule",
  trolleybus: "06:00 – 00:00",
  other:      "Check schedule",
}

const SOURCE_LABEL: Record<string, string> = {
  transitland: "Transitland",
  overpass:    "OpenStreetMap",
  ors:         "OpenRouteService",
  static:      "Curated data",
}

const VEHICLE_META: Record<string, { icon: typeof Car; color: string; label: string }> = {
  TAXI:    { icon: Car,   color: "text-yellow-500", label: "Taxi"        },
  CAR:     { icon: Car,   color: "text-blue-500",   label: "Private Car" },
  MINIBUS: { icon: Bus,   color: "text-green-500",  label: "Minibus"     },
  BUS:     { icon: Bus,   color: "text-green-500",  label: "Bus"         },
  TRAIN:   { icon: Train, color: "text-purple-500", label: "Train"       },
  SHUTTLE: { icon: Bus,   color: "text-orange-500", label: "Shuttle"     },
}

function getVehicleMeta(code: string) {
  const key = Object.keys(VEHICLE_META).find(k => code?.toUpperCase().includes(k))
  return key ? VEHICLE_META[key] : { icon: Car, color: "text-muted-foreground", label: code || "Transfer" }
}

// ─── Data extraction helpers ──────────────────────────────────────────────────

function extractHours(text: string): string | null {
  if (!text) return null
  if (/24[- ]?hours?|24\/7|round[\s-]?the[\s-]?clock/i.test(text)) return "24 hours"
  const m = text.match(/(\d{1,2}:\d{2})\s*[–\-—~]+\s*(\d{1,2}:\d{2})/)
  if (m) return `${m[1]} – ${m[2]}`
  const runs = text.match(/runs?\s+(?:daily\s+)?(\d{1,2}:\d{2}[^;,\.]{0,20})/)
  if (runs) return runs[1].trim()
  return null
}

function extractPrice(text: string): string | null {
  if (!text) return null
  const m = text.match(/(?:€|£|\$|¥|₺|AED|S\$|฿|₩|A\$)[^\s,;]+/)
  if (m) return m[0]
  return null
}

// ─── Aggregation: raw data → TransitSystem[] ──────────────────────────────────

function aggregateSystems(t: TransportationInfo, cityName: string): TransitSystem[] {
  const { routes, operators, modes, lines, stations, summary } = t

  const getDesc = (mode: string): string =>
    modes.find(m => m.mode === mode)?.description ?? (summary as Record<string, string>)[mode] ?? ""

  const getPrice = (mode: string): string => {
    const obj = modes.find(m => m.mode === mode)
    if (obj?.ticketPrice) return obj.ticketPrice.split("|")[0].trim()
    return extractPrice(getDesc(mode)) ?? "Varies"
  }

  const stationCountForMode = (mode: string): number =>
    stations.filter(s => {
      if (mode === "metro") return s.type === "metro"
      if (mode === "rail")  return s.type === "train_station"
      if (mode === "bus")   return s.type === "bus_station"
      if (mode === "ferry") return s.type === "ferry"
      return false
    }).length

  // ── Attempt 1: operator-based (Transitland with operators + routes) ──
  if (operators.length > 0 && routes.length > 0) {
    const systems: TransitSystem[] = []

    for (const op of operators) {
      const opRoutes = routes.filter(r => r.operator === op.name)
      if (opRoutes.length === 0) continue

      const modeCounts: Record<string, number> = {}
      for (const r of opRoutes) modeCounts[r.mode] = (modeCounts[r.mode] ?? 0) + 1
      const sortedModes = Object.entries(modeCounts).sort((a, b) => b[1] - a[1])
      const primaryMode = sortedModes[0]?.[0] ?? "bus"
      const desc        = getDesc(primaryMode)

      systems.push({
        id:          op.id || op.name,
        name:        op.name,
        primaryMode,
        allModes:    sortedModes.map(([m]) => m),
        lineCount:   opRoutes.length,
        stationCount: stationCountForMode(primaryMode),
        operator:    op.name,
        website:     op.website,
        hours:       extractHours(desc) ?? MODE_DEFAULT_HOURS[primaryMode] ?? "Check schedule",
        price:       getPrice(primaryMode),
        frequency:   MODE_FREQUENCY[primaryMode] ?? "Varies",
        description: desc,
        isStatic:    false,
      })
    }

    if (systems.length > 0) return systems
  }

  // ── Attempt 2: mode-based (routes or lines, no operator matches) ──
  if (routes.length > 0 || lines.length > 0) {
    const source = routes.length > 0 ? routes : lines
    const byMode: Record<string, number> = {}
    for (const item of source) byMode[item.mode] = (byMode[item.mode] ?? 0) + 1

    return Object.entries(byMode).map(([mode, count], i) => {
      const desc = getDesc(mode)
      return {
        id:          `mode-${mode}-${i}`,
        name:        `${cityName} ${modeMeta(mode).label} Network`,
        primaryMode: mode,
        allModes:    [mode],
        lineCount:   count,
        stationCount: stationCountForMode(mode),
        hours:       extractHours(desc) ?? MODE_DEFAULT_HOURS[mode] ?? "Check schedule",
        price:       getPrice(mode),
        frequency:   MODE_FREQUENCY[mode] ?? "Varies",
        description: desc,
        isStatic:    false,
      }
    })
  }

  // ── Attempt 3: static modes (no API data) ──
  const TRANSIT_MODES = new Set(["bus", "metro", "rail", "tram", "ferry", "cable_car", "trolleybus"])
  return modes
    .filter(m => m.available && TRANSIT_MODES.has(m.mode))
    .map(m => ({
      id:          `static-${m.mode}`,
      name:        `${cityName} ${m.label}`,
      primaryMode: m.mode,
      allModes:    [m.mode],
      lineCount:   0,
      stationCount: 0,
      hours:       extractHours(m.description) ?? MODE_DEFAULT_HOURS[m.mode] ?? "Check schedule",
      price:       m.ticketPrice?.split("|")[0].trim() ?? extractPrice(m.description) ?? "Varies",
      frequency:   MODE_FREQUENCY[m.mode] ?? "Varies",
      description: m.description,
      isStatic:    true,
    }))
}

// ─── Coverage computation ─────────────────────────────────────────────────────

interface Coverage {
  label:       string
  description: string
  dotColor:    string
  textColor:   string
  bgColor:     string
}

function computeCoverage(
  lineCount: number, stationCount: number, opCount: number, routeCount: number, isStatic: boolean,
): Coverage {
  if (isStatic) return {
    label: "Curated", description: "Curated transport overview",
    dotColor: "bg-muted-foreground", textColor: "text-muted-foreground", bgColor: "bg-muted",
  }
  const score = lineCount * 2 + stationCount * 0.4 + opCount * 3 + routeCount * 0.5
  if (score >= 15) return {
    label: "Excellent", description: "Excellent public transport coverage",
    dotColor: "bg-green-500", textColor: "text-green-600 dark:text-green-400", bgColor: "bg-green-100 dark:bg-green-900/40",
  }
  if (score >= 6) return {
    label: "Good", description: "Good public transport network",
    dotColor: "bg-blue-500", textColor: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-100 dark:bg-blue-900/40",
  }
  if (score >= 2) return {
    label: "Moderate", description: "Moderate public transport available",
    dotColor: "bg-yellow-500", textColor: "text-yellow-600 dark:text-yellow-400", bgColor: "bg-yellow-100 dark:bg-yellow-900/40",
  }
  return {
    label: "Limited", description: "Limited transit data available",
    dotColor: "bg-muted-foreground", textColor: "text-muted-foreground", bgColor: "bg-muted",
  }
}

function getDominantMode(systems: TransitSystem[]): string | null {
  const transit = systems.filter(s => !["taxi", "rideshare"].includes(s.primaryMode))
  if (transit.length === 0) return null
  const byMode: Record<string, number> = {}
  for (const s of transit) byMode[s.primaryMode] = (byMode[s.primaryMode] ?? 0) + Math.max(s.lineCount, 1)
  const top = Object.entries(byMode).sort((a, b) => b[1] - a[1])[0]
  if (!top) return null
  const labels: Record<string, string> = {
    metro: "Metro network", bus: "Bus network", rail: "Rail network",
    tram: "Tram network", ferry: "Ferry services", cable_car: "Cable car",
    trolleybus: "Trolleybus network",
  }
  return labels[top[0]] ?? modeMeta(top[0]).label
}

// ─── Stat chips ───────────────────────────────────────────────────────────────

interface StatChip { emoji: string; label: string; count: number }

const MODE_CHIP_EMOJI: Record<string, string> = {
  metro: "🚇", bus: "🚌", rail: "🚉", tram: "🚋",
  ferry: "⛴️", cable_car: "🚡", trolleybus: "🚎",
}

function computeStatChips(t: TransportationInfo): StatChip[] {
  const { lines, routes, stations, operators } = t
  const source = lines.length > 0 ? lines : routes
  const byMode: Record<string, number> = {}
  for (const item of source) byMode[item.mode] = (byMode[item.mode] ?? 0) + 1

  const chips: StatChip[] = []
  for (const [mode, count] of Object.entries(byMode)) {
    if (count > 0 && MODE_CHIP_EMOJI[mode]) {
      chips.push({ emoji: MODE_CHIP_EMOJI[mode], label: `${modeMeta(mode).label} ${count > 1 ? "lines" : "line"}`, count })
    }
  }
  if (stations.length > 0) chips.push({ emoji: "🏢", label: "Stations",  count: stations.length  })
  if (operators.length > 0) chips.push({ emoji: "🏛️", label: "Operators", count: operators.length })
  return chips
}

// ─── Enhanced TransportMap ────────────────────────────────────────────────────

const MAP_LEGEND_ITEMS = [
  { mode: "metro" as const, label: "Metro"    },
  { mode: "bus"   as const, label: "Bus"      },
  { mode: "rail"  as const, label: "Rail"     },
  { mode: "tram"  as const, label: "Tram"     },
  { mode: "ferry" as const, label: "Ferry"    },
  { mode: "cable_car" as const, label: "Cable" },
]

function TransportMap({ stations, lines }: { stations: TransitStation[]; lines: TransitLine[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<any>(null)

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return
    let cancelled = false

    const initMap = () => {
      if (cancelled || !containerRef.current || mapRef.current) return
      try {
        const hasLines    = lines.length > 0
        const centerLat   = lines[0]?.coordinates?.[0]?.lat ?? stations[0]?.lat ?? 0
        const centerLng   = lines[0]?.coordinates?.[0]?.lng ?? stations[0]?.lon ?? 0
        if (!centerLat && !centerLng) return

        const map = window.L.map(containerRef.current, { center: [centerLat, centerLng], zoom: 12 })
        mapRef.current = map

        window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap contributors",
          maxZoom: 19,
        }).addTo(map)

        const boundObjects: any[] = []

        // Primary: transit line polylines
        for (const line of lines) {
          if (line.coordinates.length < 2) continue
          const latlngs = line.coordinates.map(c => [c.lat, c.lng])
          const color   = line.color || LINE_COLORS[line.mode] || LINE_COLORS.other
          const poly    = window.L.polyline(latlngs, { color, weight: 5, opacity: 0.82, lineJoin: "round" }).addTo(map)
          const mLabel  = modeMeta(line.mode).label
          poly.bindPopup(
            `<div style="font-family:system-ui,sans-serif;padding:6px 4px;min-width:180px">` +
            `<p style="margin:0 0 2px;font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.05em">${mLabel}</p>` +
            `<b style="font-size:14px;display:block;margin-bottom:4px">${line.name}</b>` +
            `<div style="display:flex;align-items:center;gap:6px">` +
            `<span style="display:inline-block;width:16px;height:4px;border-radius:2px;background:${color}"></span>` +
            `<span style="font-size:11px;color:#666">${mLabel} line</span></div></div>`
          )
          boundObjects.push(poly)
        }

        // Fallback: station markers when no lines exist
        if (!hasLines) {
          for (const station of stations) {
            if (!station.lat || !station.lon) continue
            const { emoji, bg } = STATION_ICON[station.type] ?? STATION_ICON.transit
            const icon = window.L.divIcon({
              html: `<div style="background:${bg};color:white;border-radius:50%;width:32px;height:32px;` +
                    `display:flex;align-items:center;justify-content:center;font-size:14px;` +
                    `box-shadow:0 2px 8px rgba(0,0,0,0.35);border:2px solid white">${emoji}</div>`,
              className: "transport-station-marker",
              iconSize: [32, 32], iconAnchor: [16, 16],
            })
            const m = window.L.marker([station.lat, station.lon], { icon }).addTo(map)
            m.bindPopup(
              `<div style="font-family:system-ui,sans-serif;padding:6px;min-width:160px">` +
              `<p style="margin:0 0 2px;font-size:10px;color:#888;text-transform:uppercase">${station.type.replace(/_/g, " ")}</p>` +
              `<b style="font-size:13px">${station.name}</b>` +
              (station.address ? `<p style="margin:4px 0 0;font-size:11px;color:#666">${station.address}</p>` : "") +
              `</div>`
            )
            boundObjects.push(m)
          }
        }

        if (boundObjects.length > 0) {
          map.fitBounds(window.L.featureGroup(boundObjects).getBounds().pad(0.1))
        }
      } catch (err) {
        console.error("[TransportMap] init error:", err)
      }
    }

    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement("link")
      link.rel  = "stylesheet"
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      document.head.appendChild(link)
    }

    if (window.L) {
      initMap()
    } else if (document.querySelector('script[src*="leaflet.js"]')) {
      const poll = setInterval(() => { if (window.L) { clearInterval(poll); initMap() } }, 50)
    } else {
      const script  = document.createElement("script")
      script.src    = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
      script.onload = () => { if (!cancelled) initMap() }
      document.head.appendChild(script)
    }

    return () => {
      cancelled = true
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const visibleModes = Array.from(new Set(lines.map(l => l.mode)))

  return (
    <div className="relative rounded-xl overflow-hidden border border-border bg-muted" style={{ height: "480px" }}>
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />

      {/* Inline legend overlay */}
      {visibleModes.length > 0 && (
        <div
          className="absolute bottom-4 left-4 bg-background/92 backdrop-blur-sm rounded-xl px-3 py-2.5 border border-border/60 shadow-lg"
          style={{ zIndex: 1000 }}
        >
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Transit Lines
          </p>
          <div className="space-y-1.5">
            {MAP_LEGEND_ITEMS.filter(({ mode }) => visibleModes.includes(mode)).map(({ mode, label }) => (
              <div key={mode} className="flex items-center gap-2 text-xs text-foreground">
                <div
                  className="w-6 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: LINE_COLORS[mode] }}
                />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Transit system card ──────────────────────────────────────────────────────

function TransitSystemCard({ system, delay }: { system: TransitSystem; delay: number }) {
  const { icon: Icon, color, bg, label: modeLabel } = modeMeta(system.primaryMode)

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="bg-card border border-border rounded-2xl p-4 space-y-3 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-sm text-foreground leading-snug">{system.name}</p>
            <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${bg} ${color}`}>
              {modeLabel}
            </span>
          </div>
          {!system.isStatic && system.lineCount > 0 ? (
            <p className="text-xs text-muted-foreground mt-0.5">
              {system.lineCount} {system.lineCount === 1 ? "line" : "lines"}
              {system.stationCount > 0 && ` · ${system.stationCount} stations`}
            </p>
          ) : system.isStatic ? (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{system.description}</p>
          ) : null}
        </div>
      </div>

      {/* Detail rows */}
      <div className="space-y-1.5 border-t border-border/60 pt-2.5">
        <div className="flex items-center gap-2 text-xs">
          <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground w-20 shrink-0">Hours</span>
          <span className="text-foreground font-medium truncate">{system.hours}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Activity className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground w-20 shrink-0">Frequency</span>
          <span className="text-foreground font-medium">{system.frequency}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <DollarSign className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground w-20 shrink-0">Price</span>
          <span className="text-foreground font-medium truncate">{system.price}</span>
        </div>
        {system.operator && system.operator !== system.name && (
          <div className="flex items-center gap-2 text-xs">
            <Users className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground w-20 shrink-0">Operator</span>
            {system.website ? (
              <a
                href={system.website}
                target="_blank"
                rel="noopener noreferrer"
                className={`${color} font-medium flex items-center gap-1 hover:underline truncate`}
              >
                {system.operator}<ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            ) : (
              <span className="text-foreground font-medium truncate">{system.operator}</span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── Coverage indicator ───────────────────────────────────────────────────────

function CoverageIndicator({ coverage, dominant }: { coverage: Coverage; dominant: string | null }) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 px-4 py-3 flex items-center gap-3">
      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${coverage.dotColor}`} />
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold ${coverage.textColor}`}>{coverage.description}</p>
        {dominant && (
          <p className="text-xs text-muted-foreground mt-0.5">
            Most convenient: <span className="font-medium text-foreground">{dominant}</span>
          </p>
        )}
      </div>
      <span className={`ml-auto shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${coverage.bgColor} ${coverage.textColor}`}>
        {coverage.label}
      </span>
    </div>
  )
}

// ─── Stat chips row ───────────────────────────────────────────────────────────

function StatChipsRow({ chips }: { chips: StatChip[] }) {
  if (chips.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip, i) => (
        <div
          key={i}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 border border-border/40 text-xs"
        >
          <span>{chip.emoji}</span>
          <span className="font-semibold text-foreground">{chip.count}</span>
          <span className="text-muted-foreground">{chip.label}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Airport transfers ────────────────────────────────────────────────────────

function AirportTransfersSection({ transfers }: { transfers: Transfer[] }) {
  const hasTransfers = transfers.length > 0
  return (
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
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <DollarSign className="w-3 h-3" />Price
                      </span>
                      <span className="font-semibold text-foreground">{tf.price}</span>
                    </div>
                  )}
                  {tf.duration && (
                    <div className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" />Time
                      </span>
                      <span className="font-semibold text-foreground">{tf.duration}</span>
                    </div>
                  )}
                  {tf.capacity > 0 && (
                    <div className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Users className="w-3 h-3" />Max
                      </span>
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
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function TransportSection({ transfers, cityName, transportation }: TransportSectionProps) {
  const t        = transportation
  const stations = t?.stations  ?? []
  const lines    = t?.lines     ?? []
  const routes   = t?.routes    ?? []
  const operators = t?.operators ?? []

  // Diagnostic: trace what the backend delivered to the frontend
  if (typeof window !== "undefined") {
    console.log(`[TransportSection] lines=${lines.length} stations=${stations.length} source=${t?.dataSource}`)
    if (lines.length > 0) {
      const s = lines[0]
      console.log(`[TransportSection] first line: name="${s.name}" mode=${s.mode} coords=${s.coordinates?.length} sample=${JSON.stringify(s.coordinates?.slice(0, 2))}`)
    } else {
      console.log(`[TransportSection] lines[] empty — map falls back to ${stations.length > 0 ? "station markers" : "nothing"}`)
    }
  }

  const hasMap   = lines.length > 0 || stations.length > 0
  const isStatic = !t || t.dataSource === "static"

  const systems   = useMemo(() => t ? aggregateSystems(t, cityName) : [], [t, cityName])
  const coverage  = useMemo(
    () => computeCoverage(lines.length, stations.length, operators.length, routes.length, isStatic),
    [lines.length, stations.length, operators.length, routes.length, isStatic],
  )
  const dominant  = useMemo(() => getDominantMode(systems), [systems])
  const statChips = useMemo(() => (t && !isStatic) ? computeStatChips(t) : [], [t, isStatic])

  return (
    <div className="p-6 space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Transportation Network</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Getting around {cityName}</p>
        </div>
        {t?.dataSource && (
          <span className="shrink-0 text-[10px] px-2.5 py-1 rounded-full border border-border bg-muted text-muted-foreground font-medium flex items-center gap-1">
            <Globe className="w-3 h-3" />
            {SOURCE_LABEL[t.dataSource] ?? t.dataSource}
          </span>
        )}
      </div>

      {/* Two-column layout */}
      <div className={`grid gap-6 items-start ${hasMap ? "lg:grid-cols-[1fr_380px]" : ""}`}>

        {/* Left: Transit map */}
        {hasMap && (
          <div className="min-w-0">
            <TransportMap stations={stations} lines={lines} />
          </div>
        )}

        {/* Right: Insights + System cards */}
        <div className="space-y-4">

          <CoverageIndicator coverage={coverage} dominant={dominant} />

          {statChips.length > 0 && <StatChipsRow chips={statChips} />}

          {systems.length > 0 ? (
            <div className="space-y-3">
              {systems.map((sys, i) => (
                <TransitSystemCard key={sys.id} system={sys} delay={i * 0.06} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-muted/30 p-6 text-sm text-muted-foreground text-center">
              <MapPin className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No transit network data available for {cityName}.
            </div>
          )}

        </div>
      </div>

      {/* Airport transfers */}
      <AirportTransfersSection transfers={transfers} />

    </div>
  )
}
