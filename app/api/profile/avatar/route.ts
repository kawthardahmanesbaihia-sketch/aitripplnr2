import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export const dynamic = "force-dynamic"

/**
 * POST /api/profile/avatar
 * Body: { url: string }
 * The client uploads the image to Firebase Storage and sends the download URL here.
 * We validate the JWT, then persist the URL to MySQL.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const body = await req.json()
  const { url } = body as { url?: string }

  if (!url || typeof url !== "string" || !url.startsWith("https://")) {
    return NextResponse.json(
      { error: "A valid HTTPS URL is required" },
      { status: 400 }
    )
  }

  // Max URL length guard
  if (url.length > 600) {
    return NextResponse.json({ error: "URL too long" }, { status: 400 })
  }

  await db.query("UPDATE users SET avatar_url = ? WHERE id = ?", [
    url,
    auth.user.userId,
  ])

  return NextResponse.json({ avatar_url: url })
}
