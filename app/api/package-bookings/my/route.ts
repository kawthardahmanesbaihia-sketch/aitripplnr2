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
  status:              "pending" | "accepted" | "declined"
  created_at:          string
  agency_user_id:      number
}

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const [rows] = await db.query<BookingRow[]>(
    `SELECT id, package_id, package_title, package_destination,
            status, created_at, agency_user_id
     FROM package_booking_requests
     WHERE traveler_user_id = ?
     ORDER BY created_at DESC`,
    [auth.user.userId]
  )

  return NextResponse.json(rows)
}
