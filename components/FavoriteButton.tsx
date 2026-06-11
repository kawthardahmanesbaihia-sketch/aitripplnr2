"use client"

import { useCallback, useEffect, useState } from "react"
import { Heart, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface FavoriteButtonProps {
  country:          string
  city?:            string | null
  destinationName?: string
  imageUrl?:        string | null
  matchPercentage?: number
  className?:       string
  size?:            "sm" | "md"
}

export function FavoriteButton({
  country,
  city,
  destinationName,
  imageUrl,
  matchPercentage,
  className = "",
  size = "md",
}: FavoriteButtonProps) {
  const { user }  = useAuth()
  const [saved,   setSaved]   = useState(false)
  const [loading, setLoading] = useState(false)

  // Check whether this destination is already saved
  useEffect(() => {
    if (!user || !country) return
    fetch("/api/profile/favorites", { credentials: "include" })
      .then(r => r.json())
      .then(data => {
        const isSaved = (data.favorites ?? []).some(
          (f: { country: string; city: string | null }) =>
            f.country === country && (!city || f.city === city)
        )
        setSaved(isSaved)
      })
      .catch(() => {})
  }, [user, country, city])

  const toggle = useCallback(async () => {
    if (!user || loading) return
    setLoading(true)
    try {
      const res = await fetch("/api/profile/favorites", {
        method:      "POST",
        credentials: "include",
        headers:     { "Content-Type": "application/json" },
        body: JSON.stringify({
          country,
          city:             city             ?? undefined,
          destination_name: destinationName  ?? city ?? country,
          image_url:        imageUrl         ?? undefined,
          match_percentage: matchPercentage  ?? undefined,
        }),
      })
      const data = await res.json()
      setSaved(data.saved ?? false)
    } catch {}
    setLoading(false)
  }, [user, loading, country, city, destinationName, imageUrl, matchPercentage])

  // Don't render if user is not logged in
  if (!user) return null

  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={saved ? "Remove from favorites" : "Save to favorites"}
      className={`flex items-center gap-1.5 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border transition-all focus:outline-none disabled:opacity-70 ${
        saved
          ? "bg-rose-500/90 border-rose-400/50 text-white hover:bg-rose-600/90"
          : "bg-white/20 border-white/20 text-white/90 hover:bg-white/30 hover:text-white"
      } ${className}`}
    >
      {loading
        ? <Loader2 className={`${iconSize} animate-spin`} />
        : <Heart className={`${iconSize} ${saved ? "fill-current" : ""}`} />
      }
      <span className="text-sm font-medium">{saved ? "Saved" : "Save"}</span>
    </button>
  )
}
