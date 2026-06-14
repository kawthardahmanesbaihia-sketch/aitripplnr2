"use client"

import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart3, ArrowLeft, Loader2,
  TrendingUp, Users, CheckCircle2,
  Clock, XCircle, MapPin, Package,
} from "lucide-react"
import Link from "next/link"
import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts"

// Types
interface AnalyticsData {
  kpi: {
    total:            number
    accepted:         number
    pending:          number
    declined:         number
    unique_travelers: number
  }
  topPackages: Array<{
    package_id:     string
    package_title:  string
    total_requests: number
  }>
  topDestinations: Array<{
    package_destination: string
    total_requests:      number
  }>
  trend: Array<{
    day:   string
    count: number
  }>
  conversion: Array<{
    package_id:      string
    package_title:   string
    total:           number
    accepted:        number
    acceptance_rate: number
  }>
  supply: Array<{
    destination:   string
    package_count: number
  }>
  marketDemand: Array<{
    destination:    string
    total_requests: number
  }>
  marketSupply: Array<{
    destination:   string
    package_count: number
  }>
}

// Constants
const COLORS = ["#16a34a", "#0ea5e9", "#f97316", "#a855f7", "#f59e0b", "#f43f5e"]

const TIP_STYLE = {
  contentStyle: {
    background:   "hsl(var(--card))",
    border:       "1px solid hsl(var(--border))",
    borderRadius: "8px",
    fontSize:     "12px",
    color:        "hsl(var(--foreground))",
    boxShadow:    "0 4px 12px rgba(0,0,0,.08)",
  },
  labelStyle: { color: "hsl(var(--foreground))", fontWeight: 600 },
  itemStyle:  { color: "hsl(var(--muted-foreground))" },
}

const AXIS_TICK = { fontSize: 11, fill: "hsl(var(--muted-foreground))" }

// Helpers
function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n) + "…" : s
}

function buildTrend(raw: AnalyticsData["trend"]) {
  const map = new Map(raw.map(r => [r.day, r.count]))
  const result: { label: string; Requests: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key   = d.toISOString().split("T")[0]
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    result.push({ label, Requests: map.get(key) ?? 0 })
  }
  return result
}

// Sub-components
function SectionCard({
  icon: Icon,
  title,
  subtitle,
  delay,
  className = "",
  children,
}: {
  icon:       React.ElementType
  title:      string
  subtitle:   string
  delay:      number
  className?: string
  children:   React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={className}
    >
      <Card className="p-6 h-full">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{title}</h3>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        {children}
      </Card>
    </motion.div>
  )
}

function KpiCard({
  label,
  value,
  icon: Icon,
  color,
  delay,
}: {
  label: string
  value: number
  icon:  React.ElementType
  color: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </p>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
        <p className={`text-3xl font-bold ${color}`}>{value.toLocaleString()}</p>
      </Card>
    </motion.div>
  )
}

// Empty state
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-5">
        <BarChart3 className="h-8 w-8 text-muted-foreground/30" />
      </div>
      <p className="text-lg font-semibold mb-2">No booking data yet</p>
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
        Analytics will appear here once travelers start submitting booking requests for your packages.
      </p>
      <div className="flex gap-3 mt-6">
        <Link href="/agency/packages/list">
          <Button variant="outline" size="sm">
            <Package className="h-4 w-4 mr-2" />
            View Packages
          </Button>
        </Link>
        <Link href="/agency/bookings">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            View Requests
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}

// Analytics content
function AnalyticsContent({ data }: { data: AnalyticsData }) {
  const { kpi, topPackages, topDestinations, trend, conversion, supply, marketDemand, marketSupply } = data

  const trendData = useMemo(() => buildTrend(trend), [trend])

  const pkgChartData = useMemo(
    () => topPackages.map(p => ({
      name:     truncate(p.package_title, 22),
      Requests: p.total_requests,
    })),
    [topPackages]
  )

  const destChartData = useMemo(
    () => topDestinations.map(d => ({
      name:     truncate(d.package_destination, 20),
      Requests: d.total_requests,
    })),
    [topDestinations]
  )

  const demandSupplyData = useMemo(() => {
    const supplyMap = new Map(supply.map(s => [s.destination, s.package_count]))
    return topDestinations.map(d => ({
      name:   truncate(d.package_destination, 20),
      Demand: d.total_requests,
      Supply: supplyMap.get(d.package_destination) ?? 0,
    }))
  }, [topDestinations, supply])

  const opportunities = useMemo(
    () => demandSupplyData.filter(d => d.Demand > 0 && d.Supply === 0),
    [demandSupplyData]
  )

  const marketDemandSupplyData = useMemo(() => {
    const supplyMap = new Map(marketSupply.map(s => [s.destination, s.package_count]))
    return marketDemand.map(d => ({
      name:   truncate(d.destination, 20),
      Demand: d.total_requests,
      Supply: supplyMap.get(d.destination) ?? 0,
    }))
  }, [marketDemand, marketSupply])

  const marketOpportunities = useMemo(
    () => marketDemandSupplyData.filter(d => d.Demand > 0 && d.Supply === 0),
    [marketDemandSupplyData]
  )

  const topOpportunityDestinations = useMemo(
    () =>
      [...marketDemandSupplyData]
        .map(d => ({ ...d, score: d.Demand / Math.max(d.Supply, 1) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5),
    [marketDemandSupplyData]
  )

  if (kpi.total === 0) return <EmptyState />

  return (
    <div className="space-y-6">

      {/* KPI cards */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard label="Total Requests"    value={kpi.total}            icon={BarChart3}    color="text-foreground"  delay={0.10} />
        <KpiCard label="Accepted"          value={kpi.accepted}         icon={CheckCircle2} color="text-green-600"   delay={0.14} />
        <KpiCard label="Pending"           value={kpi.pending}          icon={Clock}        color="text-amber-600"   delay={0.18} />
        <KpiCard label="Declined"          value={kpi.declined}         icon={XCircle}      color="text-red-500"     delay={0.22} />
        <KpiCard label="Unique Travelers"  value={kpi.unique_travelers} icon={Users}        color="text-primary"     delay={0.26} />
      </div>

      {/* Trend chart */}
      <SectionCard
        icon={TrendingUp}
        title="Request Trend"
        subtitle="Booking requests received over the last 30 days"
        delay={0.32}
      >
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={trendData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="label"
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              interval={5}
            />
            <YAxis
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip {...TIP_STYLE} />
            <Bar
              dataKey="Requests"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* Top packages + top destinations */}
      <div className="grid gap-6 lg:grid-cols-2">

        <SectionCard
          icon={Package}
          title="Top Packages"
          subtitle="Packages ranked by booking requests received"
          delay={0.40}
        >
          {topPackages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No package data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={pkgChartData}
                layout="vertical"
                margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={AXIS_TICK} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={AXIS_TICK} tickLine={false} axisLine={false} width={90} />
                <Tooltip {...TIP_STYLE} />
                <Bar dataKey="Requests" fill={COLORS[0]} radius={[0, 4, 4, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        <SectionCard
          icon={MapPin}
          title="Top Destinations"
          subtitle="Destinations ranked by booking requests received"
          delay={0.46}
        >
          {topDestinations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No destination data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={destChartData}
                layout="vertical"
                margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={AXIS_TICK} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={AXIS_TICK} tickLine={false} axisLine={false} width={90} />
                <Tooltip {...TIP_STYLE} />
                <Bar dataKey="Requests" fill={COLORS[1]} radius={[0, 4, 4, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>
      </div>

      {/* Demand vs Supply */}
      {demandSupplyData.length > 0 && (
        <SectionCard
          icon={TrendingUp}
          title="Demand vs Supply"
          subtitle="Booking request demand compared to your active packages per destination"
          delay={0.58}
        >
          <ResponsiveContainer width="100%" height={Math.max(160, demandSupplyData.length * 44)}>
            <BarChart
              data={demandSupplyData}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={AXIS_TICK} tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={AXIS_TICK} tickLine={false} axisLine={false} width={90} />
              <Tooltip {...TIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Bar dataKey="Demand" fill={COLORS[1]} radius={[0, 4, 4, 0]} maxBarSize={16} />
              <Bar dataKey="Supply" fill={COLORS[0]} radius={[0, 4, 4, 0]} maxBarSize={16} />
            </BarChart>
          </ResponsiveContainer>

          {opportunities.length > 0 && (
            <div className="mt-5 pt-5 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Opportunities — Destinations with demand but no packages
              </p>
              <div className="flex flex-wrap gap-2">
                {opportunities.map(o => (
                  <span
                    key={o.name}
                    className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-400 px-3 py-1 text-xs font-medium"
                  >
                    <MapPin className="h-3 w-3 shrink-0" />
                    {o.name}
                    <span className="ml-1 opacity-70">
                      · {o.Demand} request{o.Demand !== 1 ? "s" : ""}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </SectionCard>
      )}

      {/* Market Insights — platform-wide demand vs supply across all agencies */}
      {marketDemandSupplyData.length > 0 && (
        <SectionCard
          icon={TrendingUp}
          title="Market Insights"
          subtitle="Platform-wide booking demand vs available packages across all agencies"
          delay={0.64}
        >
          <ResponsiveContainer width="100%" height={Math.max(160, marketDemandSupplyData.length * 44)}>
            <BarChart
              data={marketDemandSupplyData}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={AXIS_TICK} tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={AXIS_TICK} tickLine={false} axisLine={false} width={90} />
              <Tooltip {...TIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Bar dataKey="Demand" fill={COLORS[3]} radius={[0, 4, 4, 0]} maxBarSize={16} />
              <Bar dataKey="Supply" fill={COLORS[4]} radius={[0, 4, 4, 0]} maxBarSize={16} />
            </BarChart>
          </ResponsiveContainer>

          {marketOpportunities.length > 0 && (
            <div className="mt-5 pt-5 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Market Opportunities — Platform demand with no packages available
              </p>
              <div className="flex flex-wrap gap-2">
                {marketOpportunities.map(o => (
                  <span
                    key={o.name}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary px-3 py-1 text-xs font-medium"
                  >
                    <MapPin className="h-3 w-3 shrink-0" />
                    {o.name}
                    <span className="ml-1 opacity-70">
                      · {o.Demand} request{o.Demand !== 1 ? "s" : ""}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </SectionCard>
      )}

      {/* Top Opportunity Destinations */}
      {topOpportunityDestinations.length > 0 && (
        <SectionCard
          icon={TrendingUp}
          title="Top Opportunity Destinations"
          subtitle="Platform destinations with the highest demand-to-supply ratio (top 5)"
          delay={0.70}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Destination</th>
                  <th className="text-right pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-20">Demand</th>
                  <th className="text-right pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-20">Supply</th>
                  <th className="text-right pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-28">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {topOpportunityDestinations.map(d => (
                  <tr key={d.name}>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="font-medium leading-snug">{d.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-right tabular-nums text-muted-foreground">{d.Demand}</td>
                    <td className="py-3 text-right tabular-nums text-muted-foreground">{d.Supply}</td>
                    <td className="py-3 text-right tabular-nums font-semibold">
                      <span
                        className={
                          d.score >= 5
                            ? "text-red-500"
                            : d.score >= 2
                            ? "text-amber-600"
                            : "text-muted-foreground"
                        }
                      >
                        {d.score.toFixed(1)}×
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {/* Conversion metrics table */}
      {conversion.length > 0 && (
        <SectionCard
          icon={CheckCircle2}
          title="Conversion Metrics"
          subtitle="Acceptance rate per package"
          delay={0.52}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Package</th>
                  <th className="text-right pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-20">Requests</th>
                  <th className="text-right pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-20">Accepted</th>
                  <th className="text-right pb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-24">Rate</th>
                  <th className="pb-3 w-28 hidden sm:table-cell"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {conversion.map((row, i) => (
                  <tr key={row.package_id} className="group">
                    <td className="py-3 pr-4">
                      <span className="font-medium leading-snug line-clamp-1">
                        {row.package_title}
                      </span>
                    </td>
                    <td className="py-3 text-right text-muted-foreground tabular-nums">{row.total}</td>
                    <td className="py-3 text-right text-green-600 font-medium tabular-nums">{row.accepted}</td>
                    <td className="py-3 text-right font-semibold tabular-nums">
                      <span
                        className={
                          row.acceptance_rate >= 70
                            ? "text-green-600"
                            : row.acceptance_rate >= 40
                            ? "text-amber-600"
                            : "text-muted-foreground"
                        }
                      >
                        {row.acceptance_rate}%
                      </span>
                    </td>
                    <td className="py-3 pl-4 hidden sm:table-cell">
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${Math.min(100, row.acceptance_rate)}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

    </div>
  )
}

// Page
export default function AgencyAnalyticsPage() {
  const [data,    setData]    = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/analytics/bookings", { credentials: "include" })
      .then(r => {
        if (!r.ok) throw new Error("Failed to load analytics")
        return r.json() as Promise<AnalyticsData>
      })
      .then(setData)
      .catch(() => setError("Could not load analytics data. Please try again."))
      .finally(() => setLoading(false))
  }, [])

  return (
    <ProtectedRoute requiredRole="agency">
      <div className="container mx-auto max-w-6xl px-4 py-10">

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
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Analytics</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-12">
            Booking request performance across all your packages
          </p>
        </motion.div>

        {/* Body */}
        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-24">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : data ? (
          <AnalyticsContent data={data} />
        ) : null}

      </div>
    </ProtectedRoute>
  )
}
