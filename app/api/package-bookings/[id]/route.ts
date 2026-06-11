import { NextRequest, NextResponse } from "next/server"
import { RowDataPacket, ResultSetHeader } from "mysql2"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

interface BookingRow extends RowDataPacket {
  id:               number
  package_title:    string
  package_id:       string
  traveler_user_id: number
  agency_user_id:   number
  status:           "pending" | "accepted" | "declined"
}

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  if (auth.user.role !== "agency") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const bookingId = parseInt(id, 10)
  if (isNaN(bookingId)) {
    return NextResponse.json({ error: "Invalid booking id" }, { status: 400 })
  }

  let body: { status?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const newStatus = body.status
  if (newStatus !== "accepted" && newStatus !== "declined") {
    return NextResponse.json(
      { error: "status must be 'accepted' or 'declined'" },
      { status: 400 }
    )
  }

  const [rows] = await db.query<BookingRow[]>(
    `SELECT id, package_title, package_id, traveler_user_id, agency_user_id, status
     FROM package_booking_requests WHERE id = ? LIMIT 1`,
    [bookingId]
  )

  if (rows.length === 0) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }

  const booking = rows[0]

  if (booking.agency_user_id !== auth.user.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (booking.status !== "pending") {
    return NextResponse.json(
      { error: "Only pending bookings can be updated" },
      { status: 409 }
    )
  }

  await db.query<ResultSetHeader>(
    "UPDATE package_booking_requests SET status = ? WHERE id = ?",
    [newStatus, bookingId]
  )

  const verb    = newStatus === "accepted" ? "accepted" : "declined"
  const message = `Your booking request for ${booking.package_title} was ${verb}.`

  await db.query(
    `INSERT INTO notifications
       (recipient_user_id, type, message, package_id, booking_request_id)
     VALUES (?, 'booking_status', ?, ?, ?)`,
    [booking.traveler_user_id, message, booking.package_id, bookingId]
  )

  return NextResponse.json({ ok: true, status: newStatus })
}
