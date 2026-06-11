import { NextRequest, NextResponse } from "next/server"
import { RowDataPacket, ResultSetHeader } from "mysql2"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

interface HistoryRow extends RowDataPacket {
  id:               number
  country:          string
  city:             string | null
  country_code:     string | null
  match_percentage: number | null
  travel_style:     string | null
  budget:           string | null
  image_url:        string | null
  viewed_at:        string
}

// ── GET /api/profile/history ──────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const url    = new URL(req.url)
  const limit  = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100)
  const offset = parseInt(url.searchParams.get("offset") || "0")

  const [rows] = await db.query<HistoryRow[]>(
    `SELECT id, country, city, country_code, match_percentage,
            travel_style, budget, image_url, viewed_at
     FROM travel_history
     WHERE user_id = ?
     ORDER BY viewed_at DESC
     LIMIT ? OFFSET ?`,
    [auth.user.userId, limit, offset]
  )

  return NextResponse.json({ history: rows })
}

// ── POST /api/profile/history — auto-save a destination view ─────────────────

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const body = await req.json()
  const { country, city, country_code, match_percentage, travel_style, budget, image_url } =
    body as Record<string, unknown>

  if (!country || typeof country !== "string") {
    return NextResponse.json({ error: "country is required" }, { status: 400 })
  }

  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO travel_history
       (user_id, country, city, country_code, match_percentage, travel_style, budget, image_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      auth.user.userId,
      country,
      city          ?? null,
      country_code  ?? null,
      typeof match_percentage === "number" ? match_percentage : null,
      travel_style  ?? null,
      budget        ?? null,
      image_url     ?? null,
    ]
  )

  return NextResponse.json({ id: result.insertId }, { status: 201 })
}
