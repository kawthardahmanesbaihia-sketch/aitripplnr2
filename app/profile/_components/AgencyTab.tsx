"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Building2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface AgencyData {
  agency_name:  string | null
  agency_email: string | null
  phone:        string | null
  website:      string | null
  description:  string | null
  total_trips:  number
  active_trips: number
  bookings:     number
  travelers:    number
}

export function AgencyTab() {
  const { user } = useAuth()

  const [data,    setData]    = useState<AgencyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null)

  // Local form state
  const [agencyName,  setAgencyName]  = useState("")
  const [agencyEmail, setAgencyEmail] = useState("")
  const [phone,       setPhone]       = useState("")
  const [website,     setWebsite]     = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    fetch(`/api/agency/profile`, { credentials: "include" })
      .then((r) => r.json())
      .then((d: AgencyData) => {
        setData(d)
        setAgencyName(d.agency_name  ?? "")
        setAgencyEmail(d.agency_email ?? user?.email ?? "")
        setPhone(d.phone             ?? "")
        setWebsite(d.website         ?? "")
        setDescription(d.description ?? "")
      })
      .catch(() => {
        // no agency row yet — pre-fill with user email
        setAgencyEmail(user?.email ?? "")
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const res = await fetch("/api/agency/profile", {
        method:      "PUT",
        headers:     { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          agency_name:  agencyName,
          agency_email: agencyEmail,
          phone,
          website,
          description,
        }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error || "Save failed")
      setMessage({ type: "ok", text: "Agency profile updated." })
    } catch (err) {
      setMessage({ type: "err", text: err instanceof Error ? err.message : "Save failed" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Trips",   value: data.total_trips  },
            { label: "Active Trips",  value: data.active_trips },
            { label: "Bookings",      value: data.bookings     },
            { label: "Travelers",     value: data.travelers    },
          ].map(({ label, value }) => (
            <Card key={label} className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">{value ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </Card>
          ))}
        </div>
      )}

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <Building2 className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Agency Profile</h3>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Agency Name</label>
              <Input value={agencyName} onChange={(e) => setAgencyName(e.target.value)} placeholder="My Travel Agency" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Agency Email</label>
              <Input type="email" value={agencyEmail} onChange={(e) => setAgencyEmail(e.target.value)} placeholder="agency@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234 567 890" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Website</label>
              <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://myagency.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell travelers about your agency…" rows={4} />
          </div>

          {message && (
            <p className={`text-sm ${message.type === "ok" ? "text-green-600" : "text-destructive"}`}>{message.text}</p>
          )}

          <Button type="submit" disabled={saving}>
            {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : "Save Agency Profile"}
          </Button>
        </form>
      </Card>
    </div>
  )
}
