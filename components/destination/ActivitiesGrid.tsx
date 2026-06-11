"use client"

import { motion } from "framer-motion"
import { Clock, Star, Compass, Mountain, Camera, Utensils, Waves, Trees, DollarSign } from "lucide-react"

const ICONS = [Compass, Mountain, Camera, Utensils, Waves, Trees]

const THEMES = [
  {
    lightBg: "from-orange-100 to-amber-100",
    darkBg:  "dark:from-orange-900/30 dark:to-amber-900/30",
    icon:    "text-orange-400 dark:text-orange-300",
    badge:   "bg-orange-500",
  },
  {
    lightBg: "from-purple-100 to-violet-100",
    darkBg:  "dark:from-purple-900/30 dark:to-violet-900/30",
    icon:    "text-purple-400 dark:text-purple-300",
    badge:   "bg-purple-500",
  },
  {
    lightBg: "from-blue-100 to-sky-100",
    darkBg:  "dark:from-blue-900/30 dark:to-sky-900/30",
    icon:    "text-blue-400 dark:text-blue-300",
    badge:   "bg-blue-500",
  },
  {
    lightBg: "from-green-100 to-emerald-100",
    darkBg:  "dark:from-green-900/30 dark:to-emerald-900/30",
    icon:    "text-green-500 dark:text-green-300",
    badge:   "bg-green-500",
  },
  {
    lightBg: "from-rose-100 to-pink-100",
    darkBg:  "dark:from-rose-900/30 dark:to-pink-900/30",
    icon:    "text-rose-400 dark:text-rose-300",
    badge:   "bg-rose-500",
  },
  {
    lightBg: "from-cyan-100 to-teal-100",
    darkBg:  "dark:from-cyan-900/30 dark:to-teal-900/30",
    icon:    "text-cyan-500 dark:text-cyan-300",
    badge:   "bg-teal-500",
  },
]

interface Activity {
  name:        string
  duration:    string
  description: string
  rating?:     number
  image?:      string
  price?:      string
  category?:   string
}

export function ActivitiesGrid({ activities }: { activities: Activity[] }) {
  return (
    <div className="p-6">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-foreground">Top Activities</h2>
        <p className="text-sm text-muted-foreground">Curated experiences for you</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {activities.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-3 py-8">No activity data available.</p>
        )}
        {activities.map((activity, i) => {
          const Icon  = ICONS[i % ICONS.length]
          const theme = THEMES[i % THEMES.length]
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -4 }}
              className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer"
            >
              {/* Visual header */}
              <div className="relative h-36 overflow-hidden">
                {activity.image ? (
                  <img
                    src={activity.image}
                    alt={activity.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none" }}
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${theme.lightBg} ${theme.darkBg} flex items-center justify-center`}>
                    <Icon className={`w-12 h-12 ${theme.icon}`} />
                  </div>
                )}

                {/* Duration badge */}
                {activity.duration && (
                  <div className={`absolute bottom-3 left-3 ${theme.badge} text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5`}>
                    <Clock className="w-3 h-3" />
                    {activity.duration}
                  </div>
                )}

                {/* Rating */}
                {activity.rating && (
                  <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold text-foreground">{activity.rating}</span>
                  </div>
                )}

                {/* Price badge */}
                {activity.price && (
                  <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-green-600" />
                    <span className="text-xs font-semibold text-foreground">{activity.price}</span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h3 className="font-bold text-card-foreground text-sm">{activity.name}</h3>
                  {activity.category && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium shrink-0">
                      {activity.category}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                  {activity.description}
                </p>
                <button className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 text-xs font-semibold transition-colors">
                  Learn more →
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
