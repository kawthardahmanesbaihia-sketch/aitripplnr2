import { SignJWT, jwtVerify, type JWTPayload } from "jose"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

// ── Constants ──────────────────────────────────────────────────────────────────

const COOKIE_NAME  = "auth_token"
const JWT_EXPIRY   = "7d"
const MAX_AGE_SECS = 7 * 24 * 60 * 60 // 7 days

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be set and at least 32 characters")
  }
  return new TextEncoder().encode(secret)
}

// ── Token payload ──────────────────────────────────────────────────────────────

export interface AuthPayload {
  userId: number
  role:   "user" | "agency"
  email:  string
}

// ── Sign ───────────────────────────────────────────────────────────────────────

export async function signToken(payload: AuthPayload): Promise<string> {
  return new SignJWT({ ...payload } as unknown as JWTPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(getSecret())
}

// ── Verify ─────────────────────────────────────────────────────────────────────

export async function verifyToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    const p = payload as unknown as Record<string, unknown>
    if (typeof p.userId !== "number" || typeof p.role !== "string" || typeof p.email !== "string") {
      return null
    }
    return { userId: p.userId, role: p.role as AuthPayload["role"], email: p.email }
  } catch {
    return null
  }
}

// ── Cookie helpers ─────────────────────────────────────────────────────────────

const isProduction = process.env.NODE_ENV === "production"

function cookieAttributes(maxAge: number): string {
  return [
    `Max-Age=${maxAge}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    isProduction ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ")
}

export function attachAuthCookie(res: NextResponse, token: string): NextResponse {
  res.headers.append(
    "Set-Cookie",
    `${COOKIE_NAME}=${token}; ${cookieAttributes(MAX_AGE_SECS)}`
  )
  return res
}

export function clearAuthCookie(res: NextResponse): NextResponse {
  res.headers.append(
    "Set-Cookie",
    `${COOKIE_NAME}=; ${cookieAttributes(0)}`
  )
  return res
}

// ── getCurrentUser ─────────────────────────────────────────────────────────────
// Pass the NextRequest object when calling from an API route.
// Call without arguments from a Server Component (uses next/headers).

export async function getCurrentUser(req?: NextRequest): Promise<AuthPayload | null> {
  let token: string | undefined

  if (req) {
    token = req.cookies.get(COOKIE_NAME)?.value
  } else {
    try {
      const store = await cookies()
      token = store.get(COOKIE_NAME)?.value
    } catch {
      return null
    }
  }

  if (!token) return null
  return verifyToken(token)
}

// ── Convenience: require auth or return 401 ────────────────────────────────────

export async function requireAuth(
  req: NextRequest
): Promise<{ user: AuthPayload } | NextResponse> {
  const user = await getCurrentUser(req)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return { user }
}
