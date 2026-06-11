"use client"

import { motion } from "framer-motion"
import { Star, MapPin, ChevronLeft, ChevronRight, ExternalLink, Clock } from "lucide-react"
import { useRef } from "react"

interface Restaurant {
  name:            string
  rating:          number
  userRatingsTotal?: number
  cuisine:         string
  description:     string
  price:           string
  priceLevel:      "budget" | "mid-range" | "luxury"
  address:         string
  image?:          string
  openNow?:        boolean
  mapsUrl?:        string
}

const CUISINE_TAGS: Record<string, string> = {
  "Japanese":              "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  "Innovative Japanese":   "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  "Ramen":                 "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  "Sushi":                 "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  "Korean":                "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  "French":                "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "Fine Dining":           "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  "Italian":               "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  "Thai":                  "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  "Seafood":               "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "Moroccan":              "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  "Mediterranean":         "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  "Indian":                "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  "Chinese":               "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  "Vietnamese":            "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  "Steakhouse":            "bg-stone-100 text-stone-700 dark:bg-stone-800/30 dark:text-stone-300",
  "Middle Eastern":        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  "Greek":                 "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  "Spanish":               "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "Turkish":               "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  "Mexican":               "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  "American":              "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "Street Food":           "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  "Local":                 "bg-muted text-muted-foreground",
}
const DEFAULT_TAG = "bg-muted text-muted-foreground"

function formatReviewCount(n?: number): string {
  if (!n) return ""
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

export function RestaurantsCarousel({ restaurants }: { restaurants: Restaurant[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const scroll = (dir: "left" | "right") =>
    ref.current?.scrollBy({ left: dir === "left" ? -296 : 296, behavior: "smooth" })

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-foreground">Must-Try Restaurants</h2>
          <p className="text-sm text-muted-foreground">{restaurants.length} places curated for you</p>
        </div>
        <div className="flex gap-1">
          {(["left", "right"] as const).map((dir) => (
            <button
              key={dir}
              onClick={() => scroll(dir)}
              className="w-8 h-8 rounded-full border border-border hover:bg-muted flex items-center justify-center transition-colors"
            >
              {dir === "left"
                ? <ChevronLeft className="w-4 h-4 text-foreground" />
                : <ChevronRight className="w-4 h-4 text-foreground" />}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none" }}
      >
        {restaurants.length === 0 && (
          <p className="text-sm text-muted-foreground py-8 px-2">No restaurant data available.</p>
        )}
        {restaurants.map((r, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="shrink-0 w-72 snap-start bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-shadow duration-300 group cursor-pointer"
          >
            {/* Image */}
            <div className="relative h-44 overflow-hidden">
              {r.image ? (
                <img
                  src={r.image}
                  alt={r.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none" }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <span className="text-5xl">🍜</span>
                </div>
              )}

              {/* Price badge */}
              <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm rounded-full px-2.5 py-1">
                <span className="text-xs font-bold text-foreground">{r.price}</span>
              </div>

              {/* Open/Closed badge */}
              {r.openNow !== undefined && (
                <div className={`absolute top-3 left-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-sm ${
                  r.openNow
                    ? "bg-green-500/90 text-white"
                    : "bg-red-500/90 text-white"
                }`}>
                  <Clock className="w-3 h-3" />
                  {r.openNow ? "Open now" : "Closed"}
                </div>
              )}
            </div>

            {/* Body */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-card-foreground text-sm">{r.name}</h3>
                <div className="flex items-center gap-1 shrink-0">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-card-foreground">{r.rating}</span>
                  {r.userRatingsTotal && (
                    <span className="text-xs text-muted-foreground">
                      ({formatReviewCount(r.userRatingsTotal)})
                    </span>
                  )}
                </div>
              </div>

              {/* Cuisine tags */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {r.cuisine.split(",").map((c, j) => {
                  const tag = c.trim()
                  const cls = CUISINE_TAGS[tag] ?? DEFAULT_TAG
                  return (
                    <span key={j} className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${cls}`}>
                      {tag}
                    </span>
                  )
                })}
              </div>

              <div className="flex items-center gap-1 mb-2">
                <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground truncate">{r.address}</p>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                {r.description}
              </p>

              <div className="flex gap-2">
                {r.mapsUrl ? (
                  <a
                    href={r.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 dark:bg-blue-400/10 dark:hover:bg-blue-400/20 text-blue-700 dark:text-blue-400 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-3 h-3" />
                    Maps
                  </a>
                ) : null}
                <button className={`${r.mapsUrl ? "flex-1" : "w-full"} py-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 dark:bg-orange-400/10 dark:hover:bg-orange-400/20 text-orange-700 dark:text-orange-400 text-xs font-semibold transition-colors`}>
                  Reserve a Table
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
