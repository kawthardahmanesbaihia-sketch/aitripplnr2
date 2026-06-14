import { NextRequest, NextResponse } from "next/server"
import { RowDataPacket } from "mysql2"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

// PUT /api/profile/password
export async function PUT(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const body = await req.json()
  const { current_password, new_password } = body as Record<string, unknown>

  if (typeof current_password !== "string" || typeof new_password !== "string") {
    return NextResponse.json({ error: "current_password and new_password are required" }, { status: 400 })
  }

  if (new_password.length < 8) {
    return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 })
  }

  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT password FROM users WHERE id = ? LIMIT 1",
    [auth.user.userId]
  )

  if (rows.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const valid = await bcrypt.compare(current_password, rows[0].password)
  if (!valid) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 })
  }

  const hashed = await bcrypt.hash(new_password, 12)
  await db.query("UPDATE users SET password = ? WHERE id = ?", [hashed, auth.user.userId])

  return NextResponse.json({ ok: true })
}
