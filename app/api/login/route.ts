import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { RowDataPacket } from "mysql2"
import { db } from "@/lib/db"
import { signToken, attachAuthCookie } from "@/lib/auth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

interface UserRow extends RowDataPacket {
  id:         number
  username:   string
  email:      string
  password:   string
  role:       "user" | "agency"
  full_name:  string | null
  avatar_url: string | null
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Support both { identifier, password } and legacy { username, password }
    const identifier = (body.identifier ?? body.username ?? "") as string
    const password   = (body.password ?? "") as string

    if (!identifier.trim() || !password) {
      return NextResponse.json(
        { error: "Email/username and password are required" },
        { status: 400 }
      )
    }

    const login   = identifier.trim()
    const isEmail = login.includes("@")

    // Find user by email OR username
    const [rows] = await db.query<UserRow[]>(
      `SELECT id, username, email, password, role, full_name, avatar_url
       FROM users
       WHERE ${isEmail ? "email = ?" : "username = ?"}
       LIMIT 1`,
      [isEmail ? login.toLowerCase() : login]
    )

    if (rows.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const found = rows[0]

    // Verify password
    const match = await bcrypt.compare(password, found.password)
    if (!match) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Async: update last login timestamp
    db.query("UPDATE users SET last_login = NOW() WHERE id = ?", [found.id]).catch(() => {})

    // Sign JWT + attach as HttpOnly cookie
    const token = await signToken({
      userId: found.id,
      role:   found.role,
      email:  found.email,
    })

    const res = NextResponse.json({
      user: {
        uid:        String(found.id),
        username:   found.username,
        email:      found.email,
        role:       found.role,
        full_name:  found.full_name,
        avatar_url: found.avatar_url,
      },
    })

    return attachAuthCookie(res, token)
  } catch (err: unknown) {
    const e = err as NodeJS.ErrnoException & { sqlMessage?: string; sqlState?: string; sql?: string; stack?: string }
    console.error("━━━ [/api/login] ERROR ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.error("  code      :", e.code)
    console.error("  message   :", e.message)
    console.error("  sqlMessage:", e.sqlMessage)
    console.error("  sqlState  :", e.sqlState)
    console.error("  sql       :", e.sql)
    console.error("  stack     :\n", e.stack)
    console.error("  DB_HOST   :", process.env.DB_HOST   ?? "(not set — using localhost)")
    console.error("  DB_USER   :", process.env.DB_USER   ?? "(not set — using root)")
    console.error("  DB_NAME   :", process.env.DB_NAME   ?? "(not set — using travel_app)")
    console.error("  JWT_SECRET:", process.env.JWT_SECRET ? `set (${process.env.JWT_SECRET.length} chars)` : "⚠ MISSING")
    console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
