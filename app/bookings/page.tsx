"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { MapPin, Calendar, CalendarCheck, Loader2 } from "lucide-react"

// Types
interface Booking {
  id:                  number
  package_id:          string
  package_title:       string
  package_destination: string
  status:              "pending" | "accepted" | "declined"
  created_at:          string
  agency_user_id:      number
}

// Status badge
const STATUS_STYLES = {
  pending:  "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/25",
  accepted: "bg-green-500/15 text-green-700 dark:text-green-400 border border-green-500/25",
  declined: "bg-red-500/15   text-red-700   dark:text-red-400   border border-red-500/25",
} as const

const STATUS_LABELS = {
  pending:  "Pending",
  accepted: "Accepted",
  declined: "Declined",
} as const

function StatusBadge({ status }: { status: Booking["status"] }) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}

// Page
function BookingsContent() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/package-bookings/my", { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error("Failed to load bookings")
        return res.json() as Promise<Booking[]>
      })
      .then(data => setBookings(data))
      .catch(() => setError("Could not load your booking requests. Please try again."))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-24">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    )
  }

  if (bookings.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <CalendarCheck className="h-7 w-7 text-muted-foreground/40" />
        </div>
        <p className="font-semibold mb-1">No booking requests yet</p>
        <p className="text-sm text-muted-foreground">
          You have not submitted any booking requests yet.
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid gap-4 sm:grid-cols-2"
    >
      {bookings.map((b, i) => (
        <motion.div
          key={b.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
          className="rounded-2xl border bg-card p-5 flex flex-col gap-3 hover:shadow-sm transition-shadow"
        >
          {/* Title + status */}
          <div className="flex items-start justify-between gap-3">
            <p className="font-semibold leading-snug">{b.package_title}</p>
            <StatusBadge status={b.status} />
          </div>

          {/* Meta */}
          <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {b.package_destination}
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              {new Date(b.created_at).toLocaleDateString("en-GB", {
                day:   "numeric",
                month: "long",
                year:  "numeric",
              })}
            </span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}

export default function BookingsPage() {
  return (
    <ProtectedRoute requiredRole="user">
      <div className="container mx-auto max-w-3xl px-4 py-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <CalendarCheck className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">My Bookings</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-12">
            Track the status of your trip requests
          </p>
        </motion.div>

        <BookingsContent />
      </div>
    </ProtectedRoute>
  )
}
