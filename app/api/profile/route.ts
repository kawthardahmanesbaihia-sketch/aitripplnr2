import { NextRequest, NextResponse } from "next/server"
import { RowDataPacket } from "mysql2"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

interface UserRow extends RowDataPacket {
  id:         number
  username:   string
  email:      string
  role:       "user" | "agency"
  full_name:  string | null
  phone:      string | null
  country:    string | null
  city:       string | null
  bio:        string | null
  avatar_url: string | null
  last_login: string | null
  created_at: string | null
}

// GET /api/profile
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const [rows] = await db.query<UserRow[]>(
    `SELECT id, username, email, role, full_name, phone, country, city,
            bio, avatar_url, last_login, created_at
     FROM users WHERE id = ? LIMIT 1`,
    [auth.user.userId]
  )

  if (rows.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const u = rows[0]
  return NextResponse.json({
    uid:        String(u.id),
    username:   u.username,
    email:      u.email,
    role:       u.role,
    full_name:  u.full_name,
    phone:      u.phone,
    country:    u.country,
    city:       u.city,
    bio:        u.bio,
    avatar_url: u.avatar_url,
    last_login: u.last_login,
    created_at: u.created_at,
  })
}

// PUT /api/profile
export async function PUT(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const body = await req.json()
  const { full_name, username, phone, country, city, bio } = body as Record<string, string>

  // Validate username if changed
  if (username) {
    const clean = username.trim()
    if (clean.length < 3 || clean.length > 50) {
      return NextResponse.json(
        { error: "Username must be between 3 and 50 characters" },
        { status: 400 }
      )
    }

    // Check uniqueness (excluding self)
    const [taken] = await db.query<RowDataPacket[]>(
      "SELECT id FROM users WHERE username = ? AND id <> ? LIMIT 1",
      [clean, auth.user.userId]
    )
    if (taken.length > 0) {
      return NextResponse.json({ error: "Username is already taken" }, { status: 409 })
    }
  }

  await db.query(
    `UPDATE users SET
       full_name = COALESCE(NULLIF(?, ''), full_name),
       username  = COALESCE(NULLIF(?, ''), username),
       phone     = COALESCE(NULLIF(?, ''), phone),
       country   = COALESCE(NULLIF(?, ''), country),
       city      = COALESCE(NULLIF(?, ''), city),
       bio       = COALESCE(NULLIF(?, ''), bio)
     WHERE id = ?`,
    [
      full_name?.trim() ?? null,
      username?.trim()  ?? null,
      phone?.trim()     ?? null,
      country?.trim()   ?? null,
      city?.trim()      ?? null,
      bio?.trim()       ?? null,
      auth.user.userId,
    ]
  )

  return NextResponse.json({ ok: true })
}
