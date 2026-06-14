import { NextRequest, NextResponse } from "next/server"
import { RowDataPacket } from "mysql2"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

// Row interfaces
interface KpiRow extends RowDataPacket {
  total:            number | bigint
  accepted:         number | bigint
  pending:          number | bigint
  declined:         number | bigint
  unique_travelers: number | bigint
  this_week:        number | bigint | null
  acceptance_rate:  number | string  | null
  overdue_pending:  number | bigint | null
  this_month:       number | bigint | null
  last_month:       number | bigint | null
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

interface SupplyRow extends RowDataPacket {
  destination:   string
  package_count: number | bigint
}

interface MarketDemandRow extends RowDataPacket {
  package_destination: string
  total_requests:      number | bigint
}

interface MarketSupplyRow extends RowDataPacket {
  destination:   string
  package_count: number | bigint
}

interface PackageScoreRow extends RowDataPacket {
  package_id:         number
  package_title:      string
  destination:        string
  price:              string
  status:             string
  description_length: number | null
  has_services:       number
  tag_count:          number
  total_requests:     number | bigint
  acceptance_rate:    number | string | null
  dest_avg_price:     string | null
}

// GET /api/analytics/bookings
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
    [supplyRows],
    [marketDemandRows],
    [marketSupplyRows],
    [packageScoreRows],
  ] = await Promise.all([

    // A. KPI summary
    db.query<KpiRow[]>(
      `SELECT
         COUNT(*)                                                                                                  AS total,
         SUM(status = 'accepted')                                                                                  AS accepted,
         SUM(status = 'pending')                                                                                   AS pending,
         SUM(status = 'declined')                                                                                  AS declined,
         COUNT(DISTINCT traveler_user_id)                                                                          AS unique_travelers,
         SUM(created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY))                                                       AS this_week,
         ROUND(100.0 * SUM(status = 'accepted') / NULLIF(COUNT(*), 0), 1)                                        AS acceptance_rate,
         SUM(status = 'pending' AND TIMESTAMPDIFF(HOUR, created_at, NOW()) > 24)                                  AS overdue_pending,
         SUM(YEAR(created_at) = YEAR(NOW())
           AND MONTH(created_at) = MONTH(NOW())
           AND DAY(created_at) <= DAY(NOW()))                                                                      AS this_month,
         SUM(YEAR(created_at) = YEAR(DATE_SUB(NOW(), INTERVAL 1 MONTH))
           AND MONTH(created_at) = MONTH(DATE_SUB(NOW(), INTERVAL 1 MONTH))
           AND DAY(created_at) <= DAY(NOW()))                                                                      AS last_month
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

    // F. Supply — active/featured packages per destination for this agency
    db.query<SupplyRow[]>(
      `SELECT
         destination,
         COUNT(*) AS package_count
       FROM packages
       WHERE agency_user_id = ?
         AND status IN ('active', 'featured')
       GROUP BY destination
       ORDER BY package_count DESC`,
      [uid]
    ),

    // G. Market Demand — booking requests across all agencies, platform-wide
    db.query<MarketDemandRow[]>(
      `SELECT package_destination, COUNT(*) AS total_requests
       FROM package_booking_requests
       GROUP BY package_destination
       ORDER BY total_requests DESC
       LIMIT 10`,
      []
    ),

    // H. Market Supply — active/featured packages across all agencies, platform-wide
    db.query<MarketSupplyRow[]>(
      `SELECT destination, COUNT(*) AS package_count
       FROM packages
       WHERE status IN ('active', 'featured')
       GROUP BY destination
       ORDER BY package_count DESC`,
      []
    ),

    // I. Package Performance Score — per-package scoring for this agency's active/featured packages
    db.query<PackageScoreRow[]>(
      `SELECT
         p.id                                                                        AS package_id,
         p.title                                                                     AS package_title,
         p.destination,
         p.price,
         p.status,
         CHAR_LENGTH(p.description)                                                  AS description_length,
         CASE WHEN p.included_services IS NOT NULL
                   AND TRIM(p.included_services) != ''
              THEN 1 ELSE 0 END                                                      AS has_services,
         COALESCE(JSON_LENGTH(p.tags), 0)                                            AS tag_count,
         COALESCE(br.total_requests, 0)                                              AS total_requests,
         COALESCE(br.acceptance_rate, 0)                                             AS acceptance_rate,
         COALESCE(da.avg_price, p.price)                                             AS dest_avg_price
       FROM packages p
       LEFT JOIN (
         SELECT package_id,
                COUNT(*)                                                             AS total_requests,
                ROUND(100.0 * SUM(status = 'accepted') / COUNT(*), 2)              AS acceptance_rate
         FROM package_booking_requests
         GROUP BY package_id
       ) br ON br.package_id = p.id
       LEFT JOIN (
         SELECT destination, AVG(price)                                              AS avg_price
         FROM packages
         WHERE status IN ('active', 'featured')
         GROUP BY destination
       ) da ON da.destination = p.destination
       WHERE p.agency_user_id = ?
         AND p.status IN ('active', 'featured')
       ORDER BY p.created_at DESC`,
      [uid]
    ),

  ])

  const kpi = kpiRows[0] ?? { total: 0, accepted: 0, pending: 0, declined: 0, unique_travelers: 0 }

  const thisMonth = Number(kpi.this_month ?? 0)
  const lastMonth = Number(kpi.last_month ?? 0)
  const percentageChange: number | null = lastMonth === 0
    ? null
    : Math.round(((thisMonth - lastMonth) / lastMonth) * 100)

  return NextResponse.json({
    kpi: {
      total:            Number(kpi.total),
      accepted:         Number(kpi.accepted),
      pending:          Number(kpi.pending),
      declined:         Number(kpi.declined),
      unique_travelers: Number(kpi.unique_travelers),
      thisWeek:         Number(kpi.this_week        ?? 0),
      acceptanceRate:   Number(kpi.acceptance_rate  ?? 0),
      overduePending:   Number(kpi.overdue_pending  ?? 0),
      thisMonth,
      lastMonth,
      percentageChange,
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
    supply: (supplyRows as SupplyRow[]).map(r => ({
      destination:   r.destination,
      package_count: Number(r.package_count),
    })),
    marketDemand: (marketDemandRows as MarketDemandRow[]).map(r => ({
      destination:    r.package_destination,
      total_requests: Number(r.total_requests),
    })),
    marketSupply: (marketSupplyRows as MarketSupplyRow[]).map(r => ({
      destination:   r.destination,
      package_count: Number(r.package_count),
    })),
    packageScores: (packageScoreRows as PackageScoreRow[])
      .map(r => {
        // Completeness (0–35)
        const completeness =
          ((r.description_length ?? 0) > 50 ? 15 : 0) +
          (r.has_services ? 10 : 0) +
          (r.tag_count >= 3 ? 10 : 0)

        // Popularity (0–30)
        const requests  = Number(r.total_requests)
        const rate      = Number(r.acceptance_rate ?? 0)
        const popularity = Math.min(requests / 5, 1) * 20 + (rate * 10 / 100)

        // Price Competitiveness (0–25)
        const price    = parseFloat(String(r.price))
        const destAvg  = parseFloat(String(r.dest_avg_price ?? r.price))
        const ratio    = destAvg > 0 ? price / destAvg : 1
        const priceScore = Math.max(0, Math.min(25, 25 * (1.5 - ratio)))

        // Status Bonus (0–10)
        const statusBonus = r.status === "featured" ? 10 : 5

        return {
          package_id:   String(r.package_id),
          title:        r.package_title,
          destination:  r.destination,
          score:        Math.round(completeness + popularity + priceScore + statusBonus),
          completeness,
          popularity:   Math.round(popularity),
          price_score:  Math.round(priceScore),
          status_bonus: statusBonus,
        }
      })
      .sort((a, b) => b.score - a.score),
  })
}
