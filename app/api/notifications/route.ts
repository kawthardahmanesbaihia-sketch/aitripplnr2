import { NextRequest, NextResponse } from "next/server"
import { RowDataPacket } from "mysql2"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

interface NotifRow extends RowDataPacket {
  id:                 number
  type:               string
  message:            string
  package_id:         string | null
  booking_request_id: number | null
  is_read:            number
  created_at:         string
}

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const [rows] = await db.query<NotifRow[]>(
    `SELECT id, type, message, package_id, booking_request_id, is_read, created_at
     FROM notifications
     WHERE recipient_user_id = ?
     ORDER BY created_at DESC
     LIMIT 20`,
    [auth.user.userId]
  )

  // Coerce TINYINT is_read to boolean regardless of mysql2 typeCast setting
  const payload = rows.map(r => ({ ...r, is_read: Boolean(r.is_read) }))
  return NextResponse.json(payload)
}
