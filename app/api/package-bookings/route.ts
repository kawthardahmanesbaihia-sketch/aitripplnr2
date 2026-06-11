import { NextRequest, NextResponse } from "next/server"
import { RowDataPacket, ResultSetHeader } from "mysql2"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

interface UserRow extends RowDataPacket {
  full_name: string | null
  email:     string
  phone:     string | null
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  let body: {
    package_id?:          string
    package_title?:       string
    package_destination?: string
    agency_user_id?:      unknown
    notes?:               string | null
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { package_id, package_title, package_destination, agency_user_id, notes } = body

  if (!package_id || !package_title || !package_destination) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const agencyUserId = Number(agency_user_id)
  if (!agencyUserId || isNaN(agencyUserId)) {
    return NextResponse.json({ error: "Invalid agency" }, { status: 400 })
  }

  try {
    const [travelerRows] = await db.query<UserRow[]>(
      "SELECT full_name, email, phone FROM users WHERE id = ? LIMIT 1",
      [auth.user.userId]
    )

    if (travelerRows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const traveler = travelerRows[0]

    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO package_booking_requests
         (package_id, package_title, package_destination,
          agency_user_id, traveler_user_id,
          traveler_name, traveler_email, traveler_phone, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        package_id,
        package_title,
        package_destination,
        agencyUserId,
        auth.user.userId,
        traveler.full_name ?? null,
        traveler.email,
        traveler.phone ?? null,
        notes?.trim() || null,
      ]
    )

    const displayName = traveler.full_name || traveler.email
    await db.query(
      `INSERT INTO notifications
         (recipient_user_id, type, message, package_id, booking_request_id)
       VALUES (?, 'booking_request', ?, ?, ?)`,
      [agencyUserId, `${displayName} requested booking for: ${package_title}`, package_id, result.insertId]
    )

    return NextResponse.json({ id: result.insertId }, { status: 201 })
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "ER_DUP_ENTRY") {
      return NextResponse.json({ error: "already_booked" }, { status: 409 })
    }
    console.error("[POST /api/package-bookings]", err)
    return NextResponse.json({ error: "Failed to submit booking request" }, { status: 500 })
  }
}
