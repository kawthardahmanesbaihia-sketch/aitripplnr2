import { NextRequest, NextResponse } from "next/server"
import { RowDataPacket, ResultSetHeader } from "mysql2"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

interface NotifRow extends RowDataPacket {
  id:                number
  recipient_user_id: number
}

type RouteContext = { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const { id } = await params
  const notifId = parseInt(id, 10)
  if (isNaN(notifId)) {
    return NextResponse.json({ error: "Invalid notification id" }, { status: 400 })
  }

  // Verify ownership before updating
  const [rows] = await db.query<NotifRow[]>(
    "SELECT id, recipient_user_id FROM notifications WHERE id = ? LIMIT 1",
    [notifId]
  )

  if (rows.length === 0) {
    return NextResponse.json({ error: "Notification not found" }, { status: 404 })
  }

  if (rows[0].recipient_user_id !== auth.user.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await db.query<ResultSetHeader>(
    "UPDATE notifications SET is_read = 1 WHERE id = ?",
    [notifId]
  )

  return NextResponse.json({ ok: true })
}
