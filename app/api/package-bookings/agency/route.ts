import { NextRequest, NextResponse } from "next/server"
import { RowDataPacket } from "mysql2"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

interface BookingRow extends RowDataPacket {
  id:                  number
  package_id:          string
  package_title:       string
  package_destination: string
  traveler_name:       string | null
  traveler_email:      string
  traveler_phone:      string | null
  notes:               string | null
  status:              "pending" | "accepted" | "declined"
  created_at:          string
  traveler_user_id:    number
}

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  if (auth.user.role !== "agency") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const [rows] = await db.query<BookingRow[]>(
    `SELECT id, package_id, package_title, package_destination,
            traveler_name, traveler_email, traveler_phone,
            notes, status, created_at, traveler_user_id
     FROM package_booking_requests
     WHERE agency_user_id = ?
     ORDER BY created_at DESC`,
    [auth.user.userId]
  )

  return NextResponse.json(rows)
}
