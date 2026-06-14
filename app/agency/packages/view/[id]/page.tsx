"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { usePackages } from "@/hooks/usePackages"
import { useParams } from "next/navigation"
import {
  ArrowLeft, Edit, MapPin, Clock, DollarSign,
  Tag, Phone, Mail, Building2, Calendar, Loader2,
  CheckCircle2, XCircle,
} from "lucide-react"
import Link from "next/link"
import type { Package } from "@/types/package"

// Helpers
type Status = "active" | "draft" | "featured"

function statusOf(pkg: Package): Status {
  return pkg.status ?? "active"
}

const STATUS_STYLES: Record<Status, string> = {
  active:   "bg-green-500/15 text-green-700 dark:text-green-400 border border-green-500/25",
  draft:    "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/25",
  featured: "bg-primary/15 text-primary border border-primary/25",
}

const STATUS_LABELS: Record<Status, string> = {
  active: "Active", draft: "Draft", featured: "Featured",
}

const FALLBACK = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80"

// Page
export default function ViewPackagePage() {
  const { packages, isLoading } = usePackages()
  const params    = useParams()
  const packageId = params.id as string

  const [pkg,      setPkg]      = useState<Package | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (isLoading) return
    const found = packages.find(p => p.id === packageId)
    if (found) setPkg(found)
    else       setNotFound(true)
  }, [packages, packageId, isLoading])

  // Loading
  if (isLoading || (!pkg && !notFound)) {
    return (
      <ProtectedRoute requiredRole="agency">
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </ProtectedRoute>
    )
  }

  // Not found
  if (notFound || !pkg) {
    return (
      <ProtectedRoute requiredRole="agency">
        <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
          <p className="text-muted-foreground mb-5">Package not found.</p>
          <Link href="/agency/packages/list">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Packages
            </Button>
          </Link>
        </div>
      </ProtectedRoute>
    )
  }

  const status       = statusOf(pkg)
  const includedList = pkg.includedServices
    ? pkg.includedServices.split("\n").map(s => s.trim()).filter(Boolean)
    : []
  const excludedList = pkg.excludedServices
    ? pkg.excludedServices.split("\n").map(s => s.trim()).filter(Boolean)
    : []

  return (
    <ProtectedRoute requiredRole="agency">
      <div className="container mx-auto max-w-4xl px-4 py-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Link href="/agency/packages/list">
            <Button variant="ghost" size="sm" className="text-muted-foreground mb-2 -ml-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Packages
            </Button>
          </Link>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold leading-tight">{pkg.title}</h1>
              <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {pkg.country ? `${pkg.destination}, ${pkg.country}` : pkg.destination}
              </div>
            </div>
            <Link href={`/agency/packages/edit/${pkg.id}`}>
              <Button size="sm" variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Package
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.07 }}
          className="mb-6"
        >
          <div className="relative h-72 rounded-2xl overflow-hidden border">
            <img
              src={pkg.image || FALLBACK}
              alt={pkg.title}
              className="w-full h-full object-cover"
              onError={e => { e.currentTarget.src = FALLBACK }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />

            {/* Status badge */}
            <div className="absolute top-4 left-4">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm ${STATUS_STYLES[status]}`}>
                {STATUS_LABELS[status]}
              </span>
            </div>

            {/* Price + duration overlay */}
            <div className="absolute bottom-4 left-4 flex items-center gap-4 text-white">
              <span className="flex items-center gap-1.5 text-lg font-bold drop-shadow">
                <DollarSign className="h-5 w-5" />
                {pkg.price.toLocaleString()}
              </span>
              <span className="flex items-center gap-1.5 text-sm drop-shadow">
                <Clock className="h-4 w-4" />
                {pkg.duration}
              </span>
            </div>
          </div>
        </motion.div>

        <div className="space-y-5">

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Description
              </p>
              <p className="text-sm leading-relaxed whitespace-pre-line">{pkg.description}</p>
            </Card>
          </motion.div>

          {/* Services */}
          {(includedList.length > 0 || excludedList.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.13 }}
              className="grid sm:grid-cols-2 gap-5"
            >
              {includedList.length > 0 && (
                <Card className="p-6">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                    Included Services
                  </p>
                  <ul className="space-y-2">
                    {includedList.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-green-500 shrink-0 mt-0.5 font-bold">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
              {excludedList.length > 0 && (
                <Card className="p-6">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <XCircle className="h-3.5 w-3.5 text-red-500" />
                    Excluded Services
                  </p>
                  <ul className="space-y-2">
                    {excludedList.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-red-500 shrink-0 mt-0.5 font-bold">✕</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </motion.div>
          )}

          {/* Tags */}
          {pkg.tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
            >
              <Card className="p-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" />
                  Tags
                </p>
                <div className="flex flex-wrap gap-2">
                  {pkg.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground capitalize"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Contact + Package Info */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.19 }}
            className="grid sm:grid-cols-2 gap-5"
          >
            {/* Contact */}
            {(pkg.contactEmail || pkg.contactPhone) && (
              <Card className="p-6">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Contact
                </p>
                <div className="space-y-2.5">
                  {pkg.contactEmail && (
                    <a
                      href={`mailto:${pkg.contactEmail}`}
                      className="flex items-center gap-2.5 text-sm hover:text-primary transition-colors"
                    >
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      {pkg.contactEmail}
                    </a>
                  )}
                  {pkg.contactPhone && (
                    <a
                      href={`tel:${pkg.contactPhone}`}
                      className="flex items-center gap-2.5 text-sm hover:text-primary transition-colors"
                    >
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      {pkg.contactPhone}
                    </a>
                  )}
                </div>
              </Card>
            )}

            {/* Package metadata */}
            <Card className="p-6">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Package Info
              </p>
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center gap-2.5">
                  <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{pkg.agencyName}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">
                    Created{" "}
                    {new Date(pkg.createdAt).toLocaleDateString("en-GB", {
                      day:   "numeric",
                      month: "long",
                      year:  "numeric",
                    })}
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>

        </div>
      </div>
    </ProtectedRoute>
  )
}
