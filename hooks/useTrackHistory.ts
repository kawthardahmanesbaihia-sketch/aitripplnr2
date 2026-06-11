"use client"

import { useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"

interface TrackHistoryPayload {
  country:          string
  city?:            string
  country_code?:    string
  match_percentage?: number
  travel_style?:    string
  budget?:          string
  image_url?:       string
}

export function useTrackHistory() {
  const { user } = useAuth()

  const track = useCallback(
    async (payload: TrackHistoryPayload) => {
      if (!user) return
      try {
        await fetch("/api/profile/history", {
          method:      "POST",
          headers:     { "Content-Type": "application/json" },
          credentials: "include",
          body:        JSON.stringify(payload),
        })
      } catch {
        // Non-critical — silently discard
      }
    },
    [user]
  )

  return track
}
