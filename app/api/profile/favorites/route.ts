import { NextRequest, NextResponse } from "next/server"
import { RowDataPacket, ResultSetHeader } from "mysql2"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

interface FavRow extends RowDataPacket {
  id:               number
  country:          string
  city:             string | null
  destination_name: string | null
  image_url:        string | null
  match_percentage: number | null
  saved_at:         string
}

// GET /api/profile/favorites
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const [rows] = await db.query<FavRow[]>(
    `SELECT id, country, city, destination_name, image_url, match_percentage, saved_at
     FROM saved_destinations
     WHERE user_id = ?
     ORDER BY saved_at DESC`,
    [auth.user.userId]
  )

  return NextResponse.json({ favorites: rows })
}

// POST /api/profile/favorites — save or remove (toggle)
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const body = await req.json()
  const { country, city, destination_name, image_url, match_percentage } =
    body as Record<string, unknown>

  if (!country || typeof country !== "string") {
    return NextResponse.json({ error: "country is required" }, { status: 400 })
  }

  // Check if already saved (prevent duplicate)
  const [existing] = await db.query<RowDataPacket[]>(
    "SELECT id FROM saved_destinations WHERE user_id = ? AND country = ? AND (city = ? OR (city IS NULL AND ? IS NULL)) LIMIT 1",
    [auth.user.userId, country, city ?? null, city ?? null]
  )

  if (existing.length > 0) {
    // Already saved — remove it (toggle)
    await db.query(
      "DELETE FROM saved_destinations WHERE id = ? AND user_id = ?",
      [existing[0].id, auth.user.userId]
    )
    return NextResponse.json({ saved: false })
  }

  // Insert new favourite
  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO saved_destinations
       (user_id, country, city, destination_name, image_url, match_percentage)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      auth.user.userId,
      country,
      city             ?? null,
      destination_name ?? null,
      image_url        ?? null,
      typeof match_percentage === "number" ? match_percentage : null,
    ]
  )

  return NextResponse.json({ saved: true, id: result.insertId }, { status: 201 })
}

// DELETE /api/profile/favorites?id=X
export async function DELETE(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const id = new URL(req.url).searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 })

  await db.query(
    "DELETE FROM saved_destinations WHERE id = ? AND user_id = ?",
    [parseInt(id), auth.user.userId]
  )

  return NextResponse.json({ ok: true })
}
