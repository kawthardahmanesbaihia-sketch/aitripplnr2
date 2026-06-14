"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
  MapPin, Calendar, Mail, Phone, User as UserIcon,
  FileText, ClipboardList, Loader2, CheckCircle2, XCircle,
  ArrowLeft,
} from "lucide-react"
import Link from "next/link"

// Types
interface AgencyBooking {
  id:                  number
  package_id:          string
  package_title:       string
  package_destination: string
  traveler_name:       string | null
  traveler_email:      string
  traveler_phone:      string | null
  notes:               string | null
  status:              "pending" | "accepted" | "declined"
  created_at:          string
  traveler_user_id:    number
}

// Status badge
const STATUS_STYLES = {
  pending:  "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/25",
  accepted: "bg-green-500/15 text-green-700 dark:text-green-400 border border-green-500/25",
  declined: "bg-red-500/15   text-red-700   dark:text-red-400   border border-red-500/25",
} as const

const STATUS_LABELS = {
  pending: "Pending", accepted: "Accepted", declined: "Declined",
} as const

function StatusBadge({ status }: { status: AgencyBooking["status"] }) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}

// Booking card
function BookingCard({
  booking,
  onAction,
  actionLoading,
}: {
  booking:       AgencyBooking
  onAction:      (id: number, status: "accepted" | "declined") => Promise<void>
  actionLoading: boolean
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border bg-card p-5 flex flex-col gap-4"
    >
      {/* Title + status */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold leading-snug">{booking.package_title}</p>
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {booking.package_destination}
          </span>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {/* Traveler info */}
      <div className="rounded-xl bg-muted/40 border px-4 py-3 space-y-1.5 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <UserIcon className="h-3.5 w-3.5 shrink-0" />
          <span className="font-medium text-foreground">
            {booking.traveler_name || "—"}
          </span>
        </div>
        <a
          href={`mailto:${booking.traveler_email}`}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <Mail className="h-3.5 w-3.5 shrink-0" />
          {booking.traveler_email}
        </a>
        {booking.traveler_phone && (
          <a
            href={`tel:${booking.traveler_phone}`}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <Phone className="h-3.5 w-3.5 shrink-0" />
            {booking.traveler_phone}
          </a>
        )}
      </div>

      {/* Notes */}
      {booking.notes && (
        <div className="flex gap-2 text-sm text-muted-foreground">
          <FileText className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{booking.notes}</p>
        </div>
      )}

      {/* Date */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Calendar className="h-3.5 w-3.5 shrink-0" />
        {new Date(booking.created_at).toLocaleDateString("en-GB", {
          day: "numeric", month: "long", year: "numeric",
        })}
      </div>

      {/* Actions — only for pending */}
      {booking.status === "pending" && (
        <div className="flex gap-2 pt-1 border-t">
          <Button
            size="sm"
            className="flex-1 gap-2"
            disabled={actionLoading}
            onClick={() => onAction(booking.id, "accepted")}
          >
            {actionLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" />
            )}
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
            disabled={actionLoading}
            onClick={() => onAction(booking.id, "declined")}
          >
            {actionLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <XCircle className="h-3.5 w-3.5" />
            )}
            Decline
          </Button>
        </div>
      )}
    </motion.div>
  )
}

// Page content
function AgencyBookingsContent() {
  const [bookings,      setBookings]      = useState<AgencyBooking[]>([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<Record<number, boolean>>({})
  const { toast } = useToast()

  const fetchBookings = useCallback(() => {
    setLoading(true)
    fetch("/api/package-bookings/agency", { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error("Failed to load booking requests")
        return res.json() as Promise<AgencyBooking[]>
      })
      .then(data => setBookings(data))
      .catch(() => setError("Could not load booking requests. Please try again."))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  const handleAction = useCallback(
    async (id: number, newStatus: "accepted" | "declined") => {
      setActionLoading(prev => ({ ...prev, [id]: true }))
      try {
        const res = await fetch(`/api/package-bookings/${id}`, {
          method:      "PATCH",
          headers:     { "Content-Type": "application/json" },
          credentials: "include",
          body:        JSON.stringify({ status: newStatus }),
        })

        if (res.status === 409) {
          toast({
            title:       "Already Resolved",
            description: "This booking has already been accepted or declined.",
          })
          return
        }

        if (!res.ok) throw new Error("Action failed")

        // Update local state — no full refetch needed
        setBookings(prev =>
          prev.map(b => b.id === id ? { ...b, status: newStatus } : b)
        )

        toast({
          title:       newStatus === "accepted" ? "Booking Accepted" : "Booking Declined",
          description: newStatus === "accepted"
            ? "The traveler has been notified."
            : "The traveler has been notified.",
        })
      } catch {
        toast({
          title:       "Something went wrong",
          description: "Could not update the booking. Please try again.",
          variant:     "destructive",
        })
      } finally {
        setActionLoading(prev => ({ ...prev, [id]: false }))
      }
    },
    [toast]
  )

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
          <ClipboardList className="h-7 w-7 text-muted-foreground/40" />
        </div>
        <p className="font-semibold mb-1">No booking requests yet</p>
        <p className="text-sm text-muted-foreground">
          No booking requests received yet.
        </p>
      </motion.div>
    )
  }

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid gap-4 sm:grid-cols-2"
      >
        {bookings.map((b, i) => (
          <motion.div
            key={b.id}
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
            exit={{ opacity: 0, scale: 0.97 }}
          >
            <BookingCard
              booking={b}
              onAction={handleAction}
              actionLoading={!!actionLoading[b.id]}
            />
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  )
}

// Page
export default function AgencyBookingsPage() {
  return (
    <ProtectedRoute requiredRole="agency">
      <div className="container mx-auto max-w-4xl px-4 py-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/agency/dashboard">
            <Button variant="ghost" size="sm" className="text-muted-foreground mb-3 -ml-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <ClipboardList className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Booking Requests</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-12">
            Review and respond to traveler booking requests for your packages
          </p>
        </motion.div>

        <AgencyBookingsContent />
      </div>
    </ProtectedRoute>
  )
}
