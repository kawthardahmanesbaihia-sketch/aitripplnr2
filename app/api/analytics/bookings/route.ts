import { NextRequest, NextResponse } from "next/server"
import { RowDataPacket } from "mysql2"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

// ── Row interfaces ─────────────────────────────────────────────────────────────

interface KpiRow extends RowDataPacket {
  total:            number | bigint
  accepted:         number | bigint
  pending:          number | bigint
  declined:         number | bigint
  unique_travelers: number | bigint
}

interface TopPackageRow extends RowDataPacket {
  package_id:     string
  package_title:  string
  total_requests: number | bigint
}

interface TopDestRow extends RowDataPacket {
  package_destination: string
  total_requests:      number | bigint
}

interface TrendRow extends RowDataPacket {
  day:   string
  count: number | bigint
}

interface ConversionRow extends RowDataPacket {
  package_id:      string
  package_title:   string
  total:           number | bigint
  accepted:        number | bigint
  acceptance_rate: number | string
}

// ── GET /api/analytics/bookings ───────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  if (auth.user.role !== "agency") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const uid = auth.user.userId

  // All five queries run in parallel — no writes, SELECT only
  const [
    [kpiRows],
    [topPkgRows],
    [topDestRows],
    [trendRows],
    [convRows],
  ] = await Promise.all([

    // A. KPI summary
    db.query<KpiRow[]>(
      `SELECT
         COUNT(*)                           AS total,
         SUM(status = 'accepted')           AS accepted,
         SUM(status = 'pending')            AS pending,
         SUM(status = 'declined')           AS declined,
         COUNT(DISTINCT traveler_user_id)   AS unique_travelers
       FROM package_booking_requests
       WHERE agency_user_id = ?`,
      [uid]
    ),

    // B. Top packages by request volume
    db.query<TopPackageRow[]>(
      `SELECT package_id, package_title, COUNT(*) AS total_requests
       FROM package_booking_requests
       WHERE agency_user_id = ?
       GROUP BY package_id, package_title
       ORDER BY total_requests DESC
       LIMIT 5`,
      [uid]
    ),

    // C. Top destinations by request volume
    db.query<TopDestRow[]>(
      `SELECT package_destination, COUNT(*) AS total_requests
       FROM package_booking_requests
       WHERE agency_user_id = ?
       GROUP BY package_destination
       ORDER BY total_requests DESC
       LIMIT 10`,
      [uid]
    ),

    // D. Daily trend — last 30 days (active days only; frontend fills zeros)
    db.query<TrendRow[]>(
      `SELECT
         DATE_FORMAT(DATE(created_at), '%Y-%m-%d') AS day,
         COUNT(*) AS count
       FROM package_booking_requests
       WHERE agency_user_id = ?
         AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(created_at)
       ORDER BY day ASC`,
      [uid]
    ),

    // E. Conversion rate per package
    db.query<ConversionRow[]>(
      `SELECT
         package_id,
         package_title,
         COUNT(*)                                                AS total,
         SUM(status = 'accepted')                               AS accepted,
         ROUND(100.0 * SUM(status = 'accepted') / COUNT(*), 1) AS acceptance_rate
       FROM package_booking_requests
       WHERE agency_user_id = ?
       GROUP BY package_id, package_title
       ORDER BY total DESC
       LIMIT 10`,
      [uid]
    ),

  ])

  const kpi = kpiRows[0] ?? { total: 0, accepted: 0, pending: 0, declined: 0, unique_travelers: 0 }

  return NextResponse.json({
    kpi: {
      total:            Number(kpi.total),
      accepted:         Number(kpi.accepted),
      pending:          Number(kpi.pending),
      declined:         Number(kpi.declined),
      unique_travelers: Number(kpi.unique_travelers),
    },
    topPackages: (topPkgRows as TopPackageRow[]).map(r => ({
      package_id:     r.package_id,
      package_title:  r.package_title,
      total_requests: Number(r.total_requests),
    })),
    topDestinations: (topDestRows as TopDestRow[]).map(r => ({
      package_destination: r.package_destination,
      total_requests:      Number(r.total_requests),
    })),
    trend: (trendRows as TrendRow[]).map(r => ({
      day:   r.day,
      count: Number(r.count),
    })),
    conversion: (convRows as ConversionRow[]).map(r => ({
      package_id:      r.package_id,
      package_title:   r.package_title,
      total:           Number(r.total),
      accepted:        Number(r.accepted),
      acceptance_rate: Number(r.acceptance_rate),
    })),
  })
}
