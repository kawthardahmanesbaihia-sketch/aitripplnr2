import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

// Paths that require authentication only (any role)
const AUTH_ONLY_PATHS = [
  "/profile",
  "/dashboard",
]

// Paths that require role="agency"
const AGENCY_PATHS = [
  "/agency",
]

const PROTECTED_API_PREFIXES = [
  "/api/profile",
  "/api/user",
  "/api/agency",
]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isAgencyPage = AGENCY_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  )
  const isAuthOnlyPage = AUTH_ONLY_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  )
  const isProtectedApi = PROTECTED_API_PREFIXES.some((p) =>
    pathname.startsWith(p)
  )

  if (!isAgencyPage && !isAuthOnlyPage && !isProtectedApi) {
    return NextResponse.next()
  }

  // ── Verify token ────────────────────────────────────────────────────────────

  const token = req.cookies.get("auth_token")?.value

  if (!token) {
    if (isProtectedApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const url = req.nextUrl.clone()
    url.pathname = "/auth"
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  const payload = await verifyToken(token)

  if (!payload) {
    if (isProtectedApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const url = req.nextUrl.clone()
    url.pathname = "/auth"
    return NextResponse.redirect(url)
  }

  // ── Agency-only role check ──────────────────────────────────────────────────

  if (isAgencyPage && payload.role !== "agency") {
    const url = req.nextUrl.clone()
    url.pathname = "/auth"
    url.searchParams.set("error", "agency_required")
    return NextResponse.redirect(url)
  }

  // /api/agency/* — agency role required
  if (pathname.startsWith("/api/agency") && payload.role !== "agency") {
    return NextResponse.json({ error: "Forbidden — agency role required" }, { status: 403 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/dashboard/:path*",
    "/agency/:path*",
    "/api/profile/:path*",
    "/api/user/:path*",
    "/api/agency/:path*",
  ],
}
