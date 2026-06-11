"use client"

import { motion } from "framer-motion"
import { CloudSun, Sparkles } from "lucide-react"
import { getCountryFlagUrl } from "@/lib/destination-image-generator"
import { useEffect, useState } from "react"

interface DestinationHeroProps {
  name: string            // country name
  city?: string           // city name (shown as primary headline)
  matchPercentage: number
  image: string
  squadLabel?: string
  squadEmoji?: string
  weatherBadge?: string
}

export function DestinationHero({
  name,
  city,
  matchPercentage,
  image,
  squadLabel,
  squadEmoji,
  weatherBadge,
}: DestinationHeroProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const circumference = 2 * Math.PI * 34
  const displayCity = city || name
  const showCountryLine = !!city && city.toLowerCase() !== name.toLowerCase()

  return (
    <div className="relative h-72 md:h-96 overflow-hidden bg-foreground/90">
      {/* Background image */}
      <img
        src={image}
        alt={displayCity}
        className="w-full h-full object-cover opacity-90"
        onError={(e) => {
          e.currentTarget.src =
            "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=80"
        }}
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-transparent to-transparent" />

      {/* Bottom content */}
      <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 flex flex-col gap-3">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex items-end gap-3"
        >
          <img
            src={getCountryFlagUrl(name)}
            alt={`${name} flag`}
            className="h-7 w-11 rounded object-cover border border-white/30 shadow-md mb-0.5"
            onError={(e) => {
              ;(e.currentTarget as HTMLImageElement).style.display = "none"
            }}
          />
          <div>
            {/* City — primary headline */}
            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight drop-shadow-md leading-none">
              {displayCity}
            </h1>
            {/* Country — shown below city when they differ */}
            {showCountryLine && (
              <p className="text-white/65 text-sm md:text-base font-medium mt-1 tracking-wide">
                {name}
              </p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex flex-wrap gap-2"
        >
          {/* Match badge */}
          <div className="flex items-center gap-1.5 bg-green-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span className="text-white font-semibold text-sm">{matchPercentage}% Match</span>
          </div>

          {/* Squad badge */}
          {squadLabel && squadEmoji && (
            <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-white/20">
              <span className="text-sm">{squadEmoji}</span>
              <span className="text-white text-sm font-medium">{squadLabel}</span>
            </div>
          )}

          {/* Weather */}
          <div className="flex items-center gap-1.5 bg-sky-500/75 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm">
            <CloudSun className="w-3.5 h-3.5 text-white" />
            <span className="text-white text-sm font-medium">{weatherBadge ?? "Comfortable climate"}</span>
          </div>
        </motion.div>
      </div>

      {/* Match ring — top right */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.35, type: "spring", stiffness: 200 }}
        className="absolute top-4 right-4 md:top-6 md:right-6"
      >
        <div className="relative w-16 h-16 md:w-20 md:h-20">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="6" />
            {mounted && (
              <circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                stroke="#22c55e"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${(circumference * matchPercentage) / 100} ${circumference}`}
                style={{ transition: "stroke-dasharray 1s ease" }}
              />
            )}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-white font-bold text-sm md:text-base leading-none">{matchPercentage}%</span>
            <span className="text-white/60 text-[9px]">match</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
