import { NextRequest, NextResponse } from "next/server"
import { RowDataPacket } from "mysql2"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

interface CountRow extends RowDataPacket {
  count: number
}

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const [rows] = await db.query<CountRow[]>(
    `SELECT COUNT(*) AS count
     FROM notifications
     WHERE recipient_user_id = ? AND is_read = 0`,
    [auth.user.userId]
  )

  return NextResponse.json({ count: rows[0]?.count ?? 0 })
}
