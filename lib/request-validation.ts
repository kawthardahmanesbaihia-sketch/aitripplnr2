/**
 * Request validation schemas (Zod) and in-memory rate limiter.
 * Used by all /api/analyze, /api/explore-analyze, /api/multiplayer/analyze routes.
 */

import { z } from "zod"
import { NextResponse, type NextRequest } from "next/server"

// Shared primitives
const squadEnum = z.enum(["solo", "couple", "friends", "family"]).optional().nullable()

const imageUrlField = z
  .string()
  // 12_000 was too small for canvas-resized data URIs (800px JPEG ≈ 70k–160k chars).
  // Unsplash URLs are ~200 chars; 1_500_000 safely covers all upload scenarios.
  .max(1_500_000, "Image URL or data URI is too long")
  .refine(
    (u) =>
      u.startsWith("https://") ||
      u.startsWith("http://") ||
      u.startsWith("data:image/"),
    "Must be a valid https URL or data:image/ URI"
  )

const imageMetadataItem = z
  .object({ url: imageUrlField })
  .passthrough()   // allow extra fields (templateTags etc.) — they are ignored

// /api/analyze
export const AnalyzeBodySchema = z.object({
  imageMetadata: z
    .array(imageMetadataItem)
    .min(1, "At least one image is required")
    .max(20, "Maximum 20 images per request"),
  language:        z.string().max(10).optional().default("en"),
  seed:            z.number().optional().nullable(),
  travelCompanion: squadEnum,
  preferences: z
    .object({
      budget: z.string().max(30).optional(),
      travelDates: z
        .object({ start: z.string(), end: z.string() })
        .optional(),
    })
    .optional(),
})

export type AnalyzeBody = z.infer<typeof AnalyzeBodySchema>

// /api/explore-analyze
export const ExploreBodySchema = z.object({
  images: z
    .array(imageUrlField)
    .min(1, "At least one image is required")
    .max(10, "Maximum 10 images per request"),
  squad: squadEnum,
})

export type ExploreBody = z.infer<typeof ExploreBodySchema>

// /api/multiplayer/analyze
export const MultiplayerBodySchema = z.object({
  preferences: z.object({
    imageMetadata: z.array(imageMetadataItem).max(30).optional(),
    interests:     z.array(z.string().max(60)).max(30).optional(),
    squad:         squadEnum,
    budget:        z.string().max(30).optional(),
  }),
  playerCount: z.number().int().min(1).max(12).optional(),
})

export type MultiplayerBody = z.infer<typeof MultiplayerBodySchema>

// Validation helper
export function parseBody<T>(
  schema: z.ZodSchema<T>,
  raw: unknown
): { ok: true; data: T } | { ok: false; response: NextResponse } {
  const res = schema.safeParse(raw)
  if (res.success) return { ok: true, data: res.data }

  const detail = res.error.issues
    .map((i) => `[${i.path.join(".")}] ${i.message}`)
    .join("; ")

  console.warn("[validation] Request rejected:", detail)
  return {
    ok: false,
    response: NextResponse.json(
      { error: "Invalid request", detail },
      { status: 400 }
    ),
  }
}

// In-memory rate limiter (per IP, per minute)
interface RateRecord {
  count:   number
  resetAt: number
}

const WINDOW_MS    = 60_000   // 1-minute sliding window
const MAX_PER_MIN  = 40       // requests per IP per minute for analysis routes

const _rateLimitMap = new Map<string, RateRecord>()

// Cleanup stale entries occasionally (every 500 requests)
let _cleanupCounter = 0
function maybeCleanup() {
  if (++_cleanupCounter % 500 !== 0) return
  const now = Date.now()
  for (const [ip, rec] of _rateLimitMap) {
    if (now > rec.resetAt) _rateLimitMap.delete(ip)
  }
}

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  maybeCleanup()
  const now = Date.now()
  const rec = _rateLimitMap.get(ip)

  if (!rec || now > rec.resetAt) {
    _rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, remaining: MAX_PER_MIN - 1 }
  }

  if (rec.count >= MAX_PER_MIN) {
    return { allowed: false, remaining: 0 }
  }

  rec.count++
  return { allowed: true, remaining: MAX_PER_MIN - rec.count }
}

export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  )
}

export function rateLimitResponse(): NextResponse {
  return NextResponse.json(
    { error: "Too many requests. Please wait before trying again." },
    { status: 429, headers: { "Retry-After": "60" } }
  )
}
