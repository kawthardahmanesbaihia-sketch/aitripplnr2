"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

const TRAVEL_STYLES  = ["Adventure", "Relaxation", "Cultural", "Business", "Family", "Luxury", "Backpacking"]
const BUDGETS        = ["Budget ($0-$1k)", "Mid-range ($1k-$3k)", "Premium ($3k-$7k)", "Luxury ($7k+)"]
const CLIMATES       = ["Tropical", "Temperate", "Cold / Snow", "Dry / Desert", "Mediterranean"]
const ACTIVITIES_LIST = ["Hiking", "Beach", "Sightseeing", "Food & Dining", "Museums", "Nightlife", "Shopping", "Sports", "Wellness & Spa"]
const TRAVEL_TYPES   = ["Solo", "Couple", "Family", "Group / Friends"]

function Chip({
  label,
  selected,
  onClick,
}: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
        selected
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background border-border hover:border-primary hover:text-primary"
      }`}
    >
      {label}
    </button>
  )
}

export function TravelPreferencesTab() {
  const [travelStyle,    setTravelStyle]    = useState("")
  const [budget,         setBudget]         = useState("")
  const [climate,        setClimate]        = useState("")
  const [activities,     setActivities]     = useState<string[]>([])
  const [travelType,     setTravelType]     = useState("")
  const [loading,        setLoading]        = useState(true)
  const [saving,         setSaving]         = useState(false)
  const [message,        setMessage]        = useState<{ type: "ok" | "err"; text: string } | null>(null)

  useEffect(() => {
    fetch("/api/profile/preferences", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        setTravelStyle(d.travel_style      ?? "")
        setBudget(d.budget                 ?? "")
        setClimate(d.preferred_climate     ?? "")
        setActivities(d.favorite_activities ?? [])
        setTravelType(d.travel_type        ?? "")
      })
      .finally(() => setLoading(false))
  }, [])

  const toggleActivity = (a: string) =>
    setActivities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]))

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch("/api/profile/preferences", {
        method:      "PUT",
        headers:     { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          travel_style:        travelStyle  || null,
          budget:              budget       || null,
          preferred_climate:   climate      || null,
          favorite_activities: activities,
          travel_type:         travelType   || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Save failed")
      setMessage({ type: "ok", text: "Preferences saved." })
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Save failed" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>

  return (
    <div className="space-y-6">
      <Card className="p-6 space-y-5">
        <Section title="Travel Style">
          <div className="flex flex-wrap gap-2">
            {TRAVEL_STYLES.map((s) => <Chip key={s} label={s} selected={travelStyle === s} onClick={() => setTravelStyle(s === travelStyle ? "" : s)} />)}
          </div>
        </Section>

        <Section title="Budget Range">
          <div className="flex flex-wrap gap-2">
            {BUDGETS.map((b) => <Chip key={b} label={b} selected={budget === b} onClick={() => setBudget(b === budget ? "" : b)} />)}
          </div>
        </Section>

        <Section title="Preferred Climate">
          <div className="flex flex-wrap gap-2">
            {CLIMATES.map((c) => <Chip key={c} label={c} selected={climate === c} onClick={() => setClimate(c === climate ? "" : c)} />)}
          </div>
        </Section>

        <Section title="Favorite Activities">
          <div className="flex flex-wrap gap-2">
            {ACTIVITIES_LIST.map((a) => <Chip key={a} label={a} selected={activities.includes(a)} onClick={() => toggleActivity(a)} />)}
          </div>
        </Section>

        <Section title="Travel Type">
          <div className="flex flex-wrap gap-2">
            {TRAVEL_TYPES.map((t) => <Chip key={t} label={t} selected={travelType === t} onClick={() => setTravelType(t === travelType ? "" : t)} />)}
          </div>
        </Section>

        {message && (
          <p className={`text-sm ${message.type === "ok" ? "text-green-600" : "text-destructive"}`}>{message.text}</p>
        )}

        <Button onClick={handleSave} disabled={saving}>
          {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : "Save Preferences"}
        </Button>
      </Card>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">{title}</h4>
      {children}
    </div>
  )
}
