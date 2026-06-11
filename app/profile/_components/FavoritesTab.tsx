"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Heart, MapPin, Trash2 } from "lucide-react"

interface FavEntry {
  id:               number
  country:          string
  city:             string | null
  destination_name: string | null
  image_url:        string | null
  match_percentage: number | null
  saved_at:         string
}

export function FavoritesTab() {
  const [items,   setItems]   = useState<FavEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<number | null>(null)

  useEffect(() => {
    fetch("/api/profile/favorites", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setItems(d.favorites ?? []))
      .finally(() => setLoading(false))
  }, [])

  const handleRemove = async (id: number) => {
    setRemoving(id)
    try {
      await fetch(`/api/profile/favorites?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      setItems((prev) => prev.filter((f) => f.id !== id))
    } finally {
      setRemoving(null)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
  }

  if (items.length === 0) {
    return (
      <Card className="p-10 text-center text-muted-foreground">
        <Heart className="h-10 w-10 mx-auto mb-3 opacity-30" />
        <p className="text-lg font-medium">No favorites saved</p>
        <p className="text-sm mt-1">Save destinations you love and they will appear here.</p>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((fav) => (
        <Card key={fav.id} className="overflow-hidden group">
          <div className="relative h-36">
            {fav.image_url ? (
              <img src={fav.image_url} alt={fav.destination_name ?? fav.country} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-primary/10 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-primary/30" />
              </div>
            )}
            <button
              onClick={() => handleRemove(fav.id)}
              disabled={removing === fav.id}
              className="absolute top-2 right-2 h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
            >
              {removing === fav.id
                ? <Loader2 className="h-3 w-3 animate-spin" />
                : <Trash2 className="h-3 w-3" />
              }
            </button>
          </div>
          <div className="p-4">
            <p className="font-semibold">
              {fav.destination_name ?? (fav.city ? `${fav.city}, ${fav.country}` : fav.country)}
            </p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-muted-foreground">{new Date(fav.saved_at).toLocaleDateString()}</p>
              {fav.match_percentage != null && (
                <span className="text-xs font-bold text-primary">{fav.match_percentage}% match</span>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
