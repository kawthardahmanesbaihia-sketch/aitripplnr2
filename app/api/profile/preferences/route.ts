import { NextRequest, NextResponse } from "next/server"
import { RowDataPacket } from "mysql2"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

interface PrefRow extends RowDataPacket {
  travel_style:        string | null
  budget:              string | null
  preferred_climate:   string | null
  favorite_activities: string | null
  travel_type:         string | null
}

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const [rows] = await db.query<PrefRow[]>(
    "SELECT travel_style, budget, preferred_climate, favorite_activities, travel_type FROM user_preferences WHERE user_id = ? LIMIT 1",
    [auth.user.userId]
  )

  if (rows.length === 0) {
    return NextResponse.json({})
  }

  const r = rows[0]
  return NextResponse.json({
    travel_style:        r.travel_style,
    budget:              r.budget,
    preferred_climate:   r.preferred_climate,
    favorite_activities: r.favorite_activities ? JSON.parse(r.favorite_activities) : [],
    travel_type:         r.travel_type,
  })
}

export async function PUT(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const body = await req.json()
  const { travel_style, budget, preferred_climate, favorite_activities, travel_type } =
    body as Record<string, unknown>

  const activitiesJson =
    Array.isArray(favorite_activities) ? JSON.stringify(favorite_activities) : null

  await db.query(
    `INSERT INTO user_preferences (user_id, travel_style, budget, preferred_climate, favorite_activities, travel_type)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       travel_style        = VALUES(travel_style),
       budget              = VALUES(budget),
       preferred_climate   = VALUES(preferred_climate),
       favorite_activities = VALUES(favorite_activities),
       travel_type         = VALUES(travel_type)`,
    [
      auth.user.userId,
      travel_style     ?? null,
      budget           ?? null,
      preferred_climate ?? null,
      activitiesJson,
      travel_type      ?? null,
    ]
  )

  return NextResponse.json({ ok: true })
}
