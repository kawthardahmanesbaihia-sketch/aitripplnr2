import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { RowDataPacket, ResultSetHeader } from "mysql2"
import { db } from "@/lib/db"
import { signToken, attachAuthCookie } from "@/lib/auth"
import { validateEmailFormat, validateEmailDomain } from "@/lib/email-validator"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      full_name,
      username,
      email,
      password,
      role = "user",
    } = body as Record<string, string>

    // Field presence
    if (!username?.trim() || !email?.trim() || !password) {
      return NextResponse.json(
        { error: "username, email, and password are required" },
        { status: 400 }
      )
    }

    // Username rules
    const cleanUsername = username.trim()
    if (cleanUsername.length < 3 || cleanUsername.length > 50) {
      return NextResponse.json(
        { error: "Username must be between 3 and 50 characters" },
        { status: 400 }
      )
    }
    if (!/^[a-zA-Z0-9_.-]+$/.test(cleanUsername)) {
      return NextResponse.json(
        { error: "Username may only contain letters, numbers, underscores, dots, and hyphens" },
        { status: 400 }
      )
    }

    // Email format
    const cleanEmail = email.trim().toLowerCase()
    if (!validateEmailFormat(cleanEmail)) {
      return NextResponse.json({ error: "Invalid email address format" }, { status: 400 })
    }

    // DNS MX validation
    const mxResult = await validateEmailDomain(cleanEmail)
    if (!mxResult.valid) {
      return NextResponse.json(
        { error: mxResult.reason ?? "Email domain does not accept mail" },
        { status: 400 }
      )
    }

    // Password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    // Role validation
    if (!["user", "agency"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    // Uniqueness
    const [existing] = await db.query<RowDataPacket[]>(
      "SELECT id, email, username FROM users WHERE email = ? OR username = ? LIMIT 2",
      [cleanEmail, cleanUsername]
    )

    if (existing.length > 0) {
      const emailTaken    = existing.some((r: RowDataPacket) => r.email    === cleanEmail)
      const usernameTaken = existing.some((r: RowDataPacket) => r.username === cleanUsername)
      if (emailTaken)    return NextResponse.json({ error: "Email is already registered" },  { status: 409 })
      if (usernameTaken) return NextResponse.json({ error: "Username is already taken" },     { status: 409 })
      return NextResponse.json({ error: "Email or username already registered" },             { status: 409 })
    }

    // Hash & insert
    const hashed = await bcrypt.hash(password, 12)

    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO users (full_name, username, email, password, role, last_login)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [full_name?.trim() || null, cleanUsername, cleanEmail, hashed, role]
    )

    const userId = result.insertId

    // Auto-create agency row
    if (role === "agency") {
      await db
        .query(
          "INSERT IGNORE INTO agencies (user_id, agency_name) VALUES (?, ?)",
          [userId, full_name?.trim() || cleanUsername]
        )
        .catch((e) => console.warn("[signup] agencies insert failed:", e.message))
    }

    // Sign JWT + set cookie
    const token = await signToken({
      userId,
      role: role as "user" | "agency",
      email: cleanEmail,
    })

    const res = NextResponse.json(
      {
        user: {
          uid:        String(userId),
          username:   cleanUsername,
          email:      cleanEmail,
          role,
          full_name:  full_name?.trim() || null,
          avatar_url: null,
        },
      },
      { status: 201 }
    )

    return attachAuthCookie(res, token)
  } catch (err: unknown) {
    const e = err as NodeJS.ErrnoException & { sqlMessage?: string; sqlState?: string; sql?: string; stack?: string }
    console.error("━━━ [/api/signup] ERROR ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
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
