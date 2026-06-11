"use client"

import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { useAuth } from "@/contexts/auth-context"
import { usePackages } from "@/hooks/usePackages"
import type { Package } from "@/types/package"
import Link from "next/link"
import {
  Package as PackageIcon,
  Plus, Search, Edit, Trash2,
  CheckCircle2, FileText, Star,
  MapPin, Clock, DollarSign,
  ArrowLeft, Loader2,
} from "lucide-react"

// ── Helpers ───────────────────────────────────────────────────────────────────

type Status = "active" | "draft" | "featured"

function statusOf(pkg: Package): Status {
  return pkg.status ?? "active"
}

const STATUS_STYLES: Record<Status, string> = {
  active:
    "bg-green-500/15 text-green-700 dark:text-green-400 border border-green-500/25",
  draft:
    "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/25",
  featured:
    "bg-primary/15 text-primary border border-primary/25",
}

const STATUS_LABELS: Record<Status, string> = {
  active: "Active", draft: "Draft", featured: "Featured",
}

const FILTER_TABS = ["all", "active", "draft", "featured"] as const
type FilterTab = typeof FILTER_TABS[number]

// ── Delete confirmation modal ─────────────────────────────────────────────────

function DeleteModal({
  pkg,
  onConfirm,
  onCancel,
}: {
  pkg: Package
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="relative z-10 bg-background border rounded-xl shadow-2xl p-6 w-full max-w-sm"
      >
        <div className="flex items-start gap-3 mb-5">
          <div className="shrink-0 mt-0.5 p-2 rounded-full bg-destructive/10">
            <Trash2 className="h-4 w-4 text-destructive" />
          </div>
          <div>
            <h3 className="font-semibold">Delete Package?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              <span className="font-medium text-foreground">&ldquo;{pkg.title}&rdquo;</span>{" "}
              will be permanently removed. This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>Delete</Button>
        </div>
      </motion.div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PackagesListPage() {
  const { user }                       = useAuth()
  const { packages, deletePackage, isLoading } = usePackages()
  const [search, setSearch]            = useState("")
  const [filter, setFilter]            = useState<FilterTab>("all")
  const [deleteTarget, setDeleteTarget] = useState<Package | null>(null)

  const userId = user?.uid

  const agencyPackages = useMemo(
    () => packages.filter(p => p.agencyId === userId),
    [packages, userId],
  )

  const stats = useMemo(() => ({
    total:    agencyPackages.length,
    active:   agencyPackages.filter(p => statusOf(p) === "active").length,
    draft:    agencyPackages.filter(p => statusOf(p) === "draft").length,
    featured: agencyPackages.filter(p => statusOf(p) === "featured").length,
  }), [agencyPackages])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return agencyPackages.filter(pkg => {
      const matchesSearch =
        !q ||
        pkg.title.toLowerCase().includes(q) ||
        pkg.destination.toLowerCase().includes(q) ||
        (pkg.country ?? "").toLowerCase().includes(q)
      const matchesFilter =
        filter === "all" || statusOf(pkg) === filter
      return matchesSearch && matchesFilter
    })
  }, [agencyPackages, search, filter])

  const handleDelete = () => {
    if (!deleteTarget) return
    deletePackage(deleteTarget.id)
    setDeleteTarget(null)
  }

  return (
    <ProtectedRoute requiredRole="agency">
      <div className="container mx-auto max-w-7xl px-4 py-8">

        {/* ── Header ─────────────────────────────────────────────────── */}
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
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Packages</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Create, manage and publish your travel packages
              </p>
            </div>
            <Link href="/agency/packages">
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Create Package
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* ── Stats ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {([
            { label: "Total Packages", value: stats.total,    Icon: PackageIcon,  color: "text-foreground" },
            { label: "Active",         value: stats.active,   Icon: CheckCircle2, color: "text-green-600"  },
            { label: "Drafts",         value: stats.draft,    Icon: FileText,     color: "text-amber-600"  },
            { label: "Featured",       value: stats.featured, Icon: Star,         color: "text-primary"    },
          ] as const).map(({ label, value, Icon, color }) => (
            <Card key={label} className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {label}
                </p>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
            </Card>
          ))}
        </motion.div>

        {/* ── Search & Filter ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          className="flex flex-col sm:flex-row gap-3 mb-6"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by title, destination or country…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-1 p-1 rounded-lg border bg-muted/40 shrink-0">
            {FILTER_TABS.map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
                  filter === tab
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Content ─────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <PackageIcon className="h-10 w-10 mx-auto mb-3 text-muted-foreground/25" />
            <h3 className="font-semibold mb-1">
              {search || filter !== "all" ? "No packages match" : "No packages yet"}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {search || filter !== "all"
                ? "Try adjusting your search or filter"
                : "Create your first travel package to get started"}
            </p>
            {!search && filter === "all" && (
              <Link href="/agency/packages">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Package
                </Button>
              </Link>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.18 }}
            className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((pkg, i) => (
                <motion.div
                  key={pkg.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="overflow-hidden group flex flex-col hover:shadow-md transition-shadow">

                    {/* Image */}
                    <div className="relative h-44 shrink-0">
                      <img
                        src={
                          pkg.image ||
                          "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80"
                        }
                        alt={pkg.title}
                        className="w-full h-full object-cover"
                        onError={e => {
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80"
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                      {/* Status badge */}
                      <div className="absolute top-3 left-3">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm ${
                            STATUS_STYLES[statusOf(pkg)]
                          }`}
                        >
                          {STATUS_LABELS[statusOf(pkg)]}
                        </span>
                      </div>

                      {/* Hover action icons */}
                      <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/agency/packages/edit/${pkg.id}`}>
                          <button
                            type="button"
                            title="Edit"
                            className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white shadow transition-colors"
                          >
                            <Edit className="h-3.5 w-3.5 text-foreground" />
                          </button>
                        </Link>
                        <button
                          type="button"
                          title="Delete"
                          onClick={() => setDeleteTarget(pkg)}
                          className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-red-50 shadow transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col flex-1 p-4 gap-3">
                      <div>
                        <h3 className="font-semibold leading-tight truncate">{pkg.title}</h3>
                        {pkg.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {pkg.description}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {pkg.country
                            ? `${pkg.destination}, ${pkg.country}`
                            : pkg.destination}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {pkg.duration}
                        </span>
                        <span className="flex items-center gap-1 font-medium text-foreground">
                          <DollarSign className="h-3 w-3" />
                          {pkg.price.toLocaleString()}
                        </span>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {pkg.tags.slice(0, 4).map(tag => (
                          <span
                            key={tag}
                            className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground capitalize"
                          >
                            {tag}
                          </span>
                        ))}
                        {pkg.tags.length > 4 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                            +{pkg.tags.length - 4}
                          </span>
                        )}
                      </div>

                      {/* Action row */}
                      <div className="flex gap-2 mt-auto pt-1 border-t">
                        <Link href={`/agency/packages/edit/${pkg.id}`} className="flex-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs h-8"
                          >
                            <Edit className="h-3 w-3 mr-1.5" />
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => setDeleteTarget(pkg)}
                        >
                          <Trash2 className="h-3 w-3 mr-1.5" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Footer count ────────────────────────────────────────────── */}
        {!isLoading && filtered.length > 0 && (
          <p className="text-sm text-muted-foreground text-center mt-8">
            Showing {filtered.length} of {agencyPackages.length} package
            {agencyPackages.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* ── Delete modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteModal
            pkg={deleteTarget}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>
    </ProtectedRoute>
  )
}
