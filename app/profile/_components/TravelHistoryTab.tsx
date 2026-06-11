"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, MapPin, CalendarDays } from "lucide-react"

interface HistoryEntry {
  id:               number
  country:          string
  city:             string | null
  match_percentage: number | null
  travel_style:     string | null
  budget:           string | null
  image_url:        string | null
  viewed_at:        string
}

export function TravelHistoryTab() {
  const [items,   setItems]   = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [offset,  setOffset]  = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const LIMIT = 12

  const load = async (o: number) => {
    setLoading(true)
    try {
      const res  = await fetch(`/api/profile/history?limit=${LIMIT}&offset=${o}`, { credentials: "include" })
      const data = await res.json()
      const rows = data.history as HistoryEntry[]
      setItems((prev) => o === 0 ? rows : [...prev, ...rows])
      setHasMore(rows.length === LIMIT)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(0) }, [])

  const loadMore = () => {
    const next = offset + LIMIT
    setOffset(next)
    load(next)
  }

  if (loading && items.length === 0) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
  }

  if (items.length === 0) {
    return (
      <Card className="p-10 text-center text-muted-foreground">
        <MapPin className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="text-lg font-medium">No travel history yet</p>
        <p className="text-sm mt-1">Destinations you view will appear here automatically.</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((entry) => (
          <Card key={entry.id} className="overflow-hidden">
            {entry.image_url && (
              <img
                src={entry.image_url}
                alt={entry.city || entry.country}
                className="h-32 w-full object-cover"
              />
            )}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{entry.city ? `${entry.city}, ${entry.country}` : entry.country}</p>
                  {entry.travel_style && <p className="text-xs text-muted-foreground">{entry.travel_style}</p>}
                </div>
                {entry.match_percentage != null && (
                  <span className="text-xs font-bold text-primary whitespace-nowrap">
                    {entry.match_percentage}% match
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                <CalendarDays className="h-3 w-3" />
                {new Date(entry.viewed_at).toLocaleDateString()}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={loadMore} disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading…</> : "Load more"}
          </Button>
        </div>
      )}
    </div>
  )
}
