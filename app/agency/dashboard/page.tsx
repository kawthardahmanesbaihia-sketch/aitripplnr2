"use client"

import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { useAuth } from "@/contexts/auth-context"
import { usePackages } from "@/hooks/usePackages"
import {
  Package, DollarSign, Clock, TrendingUp, CheckCircle2,
  ClipboardList, Star, Plus, BarChart3, Loader2,
  AlertTriangle, TrendingDown,
} from "lucide-react"
import Link from "next/link"

// ── Types ─────────────────────────────────────────────────────────────────────

interface KpiData {
  total:            number
  accepted:         number
  pending:          number
  declined:         number
  unique_travelers: number
  thisWeek:         number
  acceptanceRate:   number
  overduePending:   number
  thisMonth:        number
  lastMonth:        number
  percentageChange: number | null
}

interface RecentRequest {
  id:                  number
  package_title:       string
  package_destination: string
  traveler_name:       string | null
  traveler_email:      string
  status:              "pending" | "accepted" | "declined"
  created_at:          string
}

interface RawBestPackage {
  package_id:      string
  package_title:   string
  total_requests:  number
  acceptance_rate: number | null
}

interface AnalyticsApiResponse {
  kpi: KpiData
  topPackages: Array<{ package_id: string; package_title: string; total_requests: number }>
  conversion:  Array<{ package_id: string; acceptance_rate: number }>
}


// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)  return "Just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function StatusBadge({ status }: { status: RecentRequest["status"] }) {
  const cls = {
    pending:  "bg-amber-100 text-amber-700 border-amber-200",
    accepted: "bg-green-100 text-green-700 border-green-200",
    declined: "bg-red-100  text-red-700   border-red-200",
  }[status]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function KpiCard({
  label,
  value,
  icon: Icon,
  color,
  delay,
  badge,
}: {
  label:  string
  value:  string | number
  icon:   React.ElementType
  color:  string
  delay:  number
  badge?: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
        {badge && <div className="mt-1">{badge}</div>}
      </Card>
    </motion.div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AgencyDashboard() {
  const { user }     = useAuth()
  const { packages } = usePackages()

  const [kpi,            setKpi]            = useState<KpiData | null>(null)
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([])
  const [rawBest,        setRawBest]        = useState<RawBestPackage | null>(null)
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState<string | null>(null)

  // ── Package stats from localStorage (this agency only) ─────────────────────
  const agencyPackages = useMemo(
    () => packages.filter(p => p.agencyId === user?.uid),
    [packages, user?.uid]
  )
  const totalPackages = agencyPackages.length
  const averagePrice  = totalPackages > 0
    ? Math.round(agencyPackages.reduce((s, p) => s + p.price, 0) / totalPackages)
    : 0

  // ── Best package: merge DB data with localStorage destination ───────────────
  const bestPackage = useMemo(() => {
    if (!rawBest) return null
    const local = agencyPackages.find(p => p.id === rawBest.package_id)
    return { ...rawBest, destination: local?.destination ?? null }
  }, [rawBest, agencyPackages])

  // ── Fetch DB data ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return
    setLoading(true)
    Promise.all([
      fetch("/api/analytics/bookings",      { credentials: "include" }).then(r => r.ok ? r.json() as Promise<AnalyticsApiResponse> : null),
      fetch("/api/package-bookings/agency", { credentials: "include" }).then(r => r.ok ? r.json() as Promise<RecentRequest[]>      : []),
    ])
      .then(([analytics, bookings]) => {
        if (analytics) {
          setKpi(analytics.kpi)
          if (analytics.topPackages?.length > 0) {
            const top  = analytics.topPackages[0]
            const conv = analytics.conversion?.find((c: { package_id: string; acceptance_rate: number }) => c.package_id === top.package_id)
            setRawBest({
              package_id:      top.package_id,
              package_title:   top.package_title,
              total_requests:  top.total_requests,
              acceptance_rate: conv?.acceptance_rate ?? null,
            })
          }
        }
        if (Array.isArray(bookings)) {
          setRecentRequests((bookings as RecentRequest[]).slice(0, 5))
        }
      })
      .catch(() => setError("Could not load dashboard data. Please refresh."))
      .finally(() => setLoading(false))
  }, [user])

  // ── Derived display values ──────────────────────────────────────────────────
  const rateDisplay = kpi
    ? (kpi.total === 0 ? "—" : `${kpi.acceptanceRate}%`)
    : "—"

  const rateColor = (kpi && kpi.total > 0)
    ? kpi.acceptanceRate >= 70 ? "text-green-600"
    : kpi.acceptanceRate >= 40 ? "text-amber-600"
    : "text-red-500"
    : "text-muted-foreground"

  const pendingColor = kpi
    ? kpi.pending > 5 ? "text-red-500"
    : kpi.pending > 0 ? "text-amber-600"
    : "text-foreground"
    : "text-foreground"

  const displayName = user?.full_name || user?.username || user?.email

  return (
    <ProtectedRoute requiredRole="agency">
      <div className="container mx-auto max-w-7xl px-4 py-8">

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-3xl font-bold">Agency Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {displayName}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Link href="/agency/analytics">
                <Button variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Detailed Analytics
                </Button>
              </Link>
              <Link href="/agency/packages">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Package
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ── KPI Strip ────────────────────────────────────────────────────── */}
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 mb-8">
          <KpiCard
            label="Your Packages"
            value={totalPackages}
            icon={Package}
            color="text-foreground"
            delay={0.10}
          />
          <KpiCard
            label="Avg. Package Price"
            value={`$${averagePrice.toLocaleString()}`}
            icon={DollarSign}
            color="text-foreground"
            delay={0.14}
          />
          <KpiCard
            label="Pending Requests"
            value={kpi?.pending ?? "—"}
            icon={Clock}
            color={pendingColor}
            delay={0.18}
            badge={kpi && kpi.overduePending > 0
              ? <span className="text-xs font-medium text-red-500">{kpi.overduePending} overdue</span>
              : undefined
            }
          />
          <KpiCard
            label="New (7 Days)"
            value={kpi?.thisWeek ?? "—"}
            icon={TrendingUp}
            color="text-primary"
            delay={0.22}
          />
          <KpiCard
            label="Acceptance Rate"
            value={rateDisplay}
            icon={CheckCircle2}
            color={rateColor}
            delay={0.26}
          />
        </div>

        {/* ── DB sections ──────────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : (
          <>
            {/* Recent Requests + Best Package */}
            <div className="grid gap-6 lg:grid-cols-3 mb-6">

              {/* ── Recent Booking Requests ─────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32 }}
                className="lg:col-span-2"
              >
                <Card className="p-6 h-full">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <ClipboardList className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">Recent Booking Requests</h3>
                        <p className="text-xs text-muted-foreground">Latest 5 requests</p>
                      </div>
                    </div>
                    <Link href="/agency/bookings">
                      <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                        View all →
                      </Button>
                    </Link>
                  </div>

                  {recentRequests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <ClipboardList className="h-8 w-8 text-muted-foreground/30 mb-3" />
                      <p className="text-sm font-medium mb-1">No booking requests yet</p>
                      <p className="text-xs text-muted-foreground max-w-xs">
                        Share your packages to start receiving requests from travelers.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {recentRequests.map(req => (
                        <Link
                          key={req.id}
                          href="/agency/bookings"
                          className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{req.package_title}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {req.traveler_name || req.traveler_email}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 ml-3">
                            <StatusBadge status={req.status} />
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {timeAgo(req.created_at)}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>

              {/* ── Best Performing Package ─────────────────────────────── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38 }}
              >
                <Card className="p-6 h-full">
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Star className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Best Performing Package</h3>
                      <p className="text-xs text-muted-foreground">By booking demand</p>
                    </div>
                  </div>

                  {!bestPackage ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <Star className="h-8 w-8 text-muted-foreground/30 mb-3" />
                      <p className="text-sm font-medium mb-1">No data yet</p>
                      <p className="text-xs text-muted-foreground max-w-xs">
                        Receive booking requests to see your top package here.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold text-base leading-snug mb-1">
                        {bestPackage.package_title}
                      </p>
                      {bestPackage.destination && (
                        <p className="text-xs text-muted-foreground mb-4">
                          Destination: {bestPackage.destination}
                        </p>
                      )}
                      <div className="space-y-3 mt-4 pt-4 border-t border-border/50">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Total Requests</span>
                          <span className="text-sm font-bold text-primary">
                            {bestPackage.total_requests}
                          </span>
                        </div>
                        {bestPackage.acceptance_rate !== null && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Acceptance Rate</span>
                            <span className={`text-sm font-bold ${
                              bestPackage.acceptance_rate >= 70 ? "text-green-600"
                              : bestPackage.acceptance_rate >= 40 ? "text-amber-600"
                              : "text-red-500"
                            }`}>
                              {bestPackage.acceptance_rate}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            </div>

            {/* ── Quick Actions ─────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.44 }}
            >
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/agency/packages">
                    <Button className="w-full sm:w-auto justify-start">
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Package
                    </Button>
                  </Link>
                  <Link href="/agency/packages/list">
                    <Button variant="outline" className="w-full sm:w-auto justify-start">
                      <Package className="h-4 w-4 mr-2" />
                      View All Packages
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>

            {/* ── Operational Insights ─────────────────────────────────── */}
            {kpi && kpi.total > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.52 }}
                className="mt-6 grid gap-4 sm:grid-cols-2"
              >
                {/* Requests Needing Action */}
                <Card className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className={`h-4 w-4 shrink-0 ${
                      kpi.overduePending > 0 ? "text-red-500" : "text-green-600"
                    }`} />
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Requests Needing Action
                    </p>
                  </div>
                  {kpi.pending === 0 ? (
                    <p className="text-sm text-green-600 font-medium">Inbox clear — no pending requests.</p>
                  ) : kpi.overduePending === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      All pending requests are fresh — no urgent action needed.
                    </p>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-red-500 mb-1">
                        {kpi.overduePending} request{kpi.overduePending !== 1 ? "s" : ""} waiting over 24 hours.
                      </p>
                      <p className="text-xs text-muted-foreground">Respond promptly to maintain your acceptance rate.</p>
                      <Link href="/agency/bookings" className="block mt-3">
                        <Button size="sm" variant="outline" className="text-xs">Review Now →</Button>
                      </Link>
                    </>
                  )}
                </Card>

                {/* Demand Momentum */}
                <Card className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    {kpi.percentageChange === null
                      ? <BarChart3    className="h-4 w-4 shrink-0 text-muted-foreground" />
                      : kpi.percentageChange < 0
                      ? <TrendingDown className="h-4 w-4 shrink-0 text-red-500" />
                      : <TrendingUp   className="h-4 w-4 shrink-0 text-green-600" />
                    }
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Demand Momentum
                    </p>
                  </div>
                  <p className="text-2xl font-bold mb-1">
                    {kpi.thisMonth}
                    <span className="text-sm font-normal text-muted-foreground ml-1">requests so far this month</span>
                  </p>
                  {kpi.percentageChange === null ? (
                    <p className="text-xs text-muted-foreground">No last-month baseline to compare yet.</p>
                  ) : kpi.percentageChange === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Same pace as last month ({kpi.lastMonth} same-period requests).
                    </p>
                  ) : (
                    <p className={`text-xs font-medium ${kpi.percentageChange > 0 ? "text-green-600" : "text-red-500"}`}>
                      {kpi.percentageChange > 0 ? "+" : ""}{kpi.percentageChange}% vs same period last month ({kpi.lastMonth} requests).
                    </p>
                  )}
                </Card>
              </motion.div>
            )}
          </>
        )}

      </div>
    </ProtectedRoute>
  )
}
