"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MapPin, DollarSign, Clock, X, Loader2, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Package } from "@/types/package"

interface BookingModalProps {
  pkg:     Package
  onClose: () => void
}

export function BookingModal({ pkg, onClose }: BookingModalProps) {
  const [notes,      setNotes]      = useState("")
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const res = await fetch("/api/package-bookings", {
        method:      "POST",
        headers:     { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          package_id:          pkg.id,
          package_title:       pkg.title,
          package_destination: pkg.destination,
          agency_user_id:      Number(pkg.agencyId),
          notes:               notes.trim() || null,
        }),
      })

      if (res.status === 409) {
        onClose()
        toast({
          title:       "Already Requested",
          description: "You already submitted a booking request for this package.",
        })
        return
      }

      if (!res.ok) {
        throw new Error("Request failed")
      }

      onClose()
      toast({
        title:       "Request Submitted",
        description: "Trip request submitted successfully. The agency will be in touch.",
      })
    } catch {
      toast({
        title:       "Something went wrong",
        description: "Could not submit your request. Please try again.",
        variant:     "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="relative z-10 bg-background border rounded-2xl shadow-2xl p-6 w-full max-w-md"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-7 w-7 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {/* Header */}
        <h2 className="text-lg font-bold mb-1 pr-8">Confirm Booking Request</h2>
        <p className="text-sm text-muted-foreground mb-5">
          This sends a request to the agency. No payment is charged.
        </p>

        {/* Package summary */}
        <div className="rounded-xl border bg-muted/40 p-4 mb-5 space-y-2">
          <p className="font-semibold leading-snug">{pkg.title}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {pkg.country ? `${pkg.destination}, ${pkg.country}` : pkg.destination}
            </span>
            <span className="flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5" />
              ${pkg.price.toLocaleString()}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {pkg.duration}
            </span>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2 mb-6">
          <Label htmlFor="bm-notes">Notes for the agency (optional)</Label>
          <Textarea
            id="bm-notes"
            placeholder="Travel dates, group size, special requirements…"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending…</>
            ) : (
              <><Send className="h-4 w-4 mr-2" />Send Request</>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
