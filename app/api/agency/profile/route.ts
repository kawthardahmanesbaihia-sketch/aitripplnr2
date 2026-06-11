import { NextRequest, NextResponse } from "next/server"
import { RowDataPacket } from "mysql2"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  if (auth.user.role !== "agency") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT agency_name, agency_email, phone, website, description,
            total_trips, active_trips, bookings, travelers
     FROM agencies WHERE user_id = ? LIMIT 1`,
    [auth.user.userId]
  )

  if (rows.length === 0) {
    return NextResponse.json({
      agency_name: null, agency_email: null, phone: null,
      website: null, description: null,
      total_trips: 0, active_trips: 0, bookings: 0, travelers: 0,
    })
  }

  return NextResponse.json(rows[0])
}

export async function PUT(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  if (auth.user.role !== "agency") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const { agency_name, agency_email, phone, website, description } = body as Record<string, unknown>

  await db.query(
    `INSERT INTO agencies (user_id, agency_name, agency_email, phone, website, description)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       agency_name  = VALUES(agency_name),
       agency_email = VALUES(agency_email),
       phone        = VALUES(phone),
       website      = VALUES(website),
       description  = VALUES(description)`,
    [
      auth.user.userId,
      agency_name  ?? null,
      agency_email ?? null,
      phone        ?? null,
      website      ?? null,
      description  ?? null,
    ]
  )

  return NextResponse.json({ ok: true })
}
