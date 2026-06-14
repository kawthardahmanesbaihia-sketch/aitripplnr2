import { NextRequest, NextResponse } from "next/server"
import type { ImageTemplate } from "@/lib/image-templates"
import {
  CATEGORY_QUERY_POOLS,
  FALLBACK_QUERIES,
  type CategoryQueryEntry,
} from "@/lib/category-queries"

export const dynamic = "force-dynamic"
export const revalidate = 0

// Response shape
interface FetchedTemplateImage {
  id: string
  templateId: string
  imageUrl: string
  thumbUrl: string
  altDescription: string | null
  photographerName: string
  tags: ImageTemplate["tags"]
  query: string
}

interface UnsplashPhoto {
  id: string
  regular: string
  thumb: string
  alt: string | null
  photographer: string
}

// Session-level cross-request deduplication
// Prevents the same Unsplash image from appearing across refreshes or categories
// within a 30-minute server process window.
const _globalSeenIds   = new Set<string>()
const SESSION_TTL_MS   = 30 * 60 * 1000   // 30 minutes
const MAX_GLOBAL_IDS   = 600               // clear when too large to avoid unbounded growth
let   _globalClearedAt = Date.now()

function isGlobalDuplicate(id: string): boolean {
  const now = Date.now()
  if (_globalSeenIds.size >= MAX_GLOBAL_IDS || now - _globalClearedAt > SESSION_TTL_MS) {
    _globalSeenIds.clear()
    _globalClearedAt = now
  }
  if (_globalSeenIds.has(id)) return true
  _globalSeenIds.add(id)
  return false
}

// Distribution constants
const DIVERSITY_QUERY_COUNT = 4    // Phase 1 parallel subqueries — reduced from 8 to halve burst
const MAX_PER_QUERY         = 3    // hard cap per query — Phase 1 (reduced from 4)
const MAX_TOPUP_PER_QUERY   = 2    // hard cap per query — Phase 2 top-up (reduced from 3)
const MAX_PER_PHOTOGRAPHER  = 2    // photographer dedup — unchanged
const EARLY_STOP_THRESHOLD  = 18   // stop once we have this many; 18 diverse > 24 repetitive/failed

// Compatibility shim for AbortSignal.timeout
function makeTimeoutSignal(ms: number): { signal: AbortSignal; clear: () => void } {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  return { signal: controller.signal, clear: () => clearTimeout(timer) }
}

// Core fetch helper
async function fetchUnsplashBatch(
  query: string,
  accessKey: string,
  perPage: number = 12
): Promise<UnsplashPhoto[]> {
  const { signal, clear } = makeTimeoutSignal(8000)
  try {
    const page = Math.floor(Math.random() * 3) + 1
    const url = [
      "https://api.unsplash.com/search/photos",
      `?query=${encodeURIComponent(query)}`,
      `&per_page=${perPage}`,
      `&page=${page}`,
      "&orientation=landscape",
    ].join("")

    const res = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        "Accept-Version": "v1",
      },
      cache: "no-store",
      signal,
    })

    if (!res.ok) {
      let errBody = "(could not read body)"
      try { errBody = await res.text() } catch {}
      console.error(
        `[image-templates] Unsplash HTTP ${res.status} for "${query}" — body: ${errBody.slice(0, 300)}`
      )
      return []
    }

    const data = await res.json()
    const photos: any[] = data.results ?? []

    return photos.map((p: any) => ({
      id: p.id,
      regular: p.urls?.regular ?? p.urls?.full ?? "",
      thumb:   p.urls?.thumb  ?? p.urls?.small ?? "",
      alt:     p.alt_description ?? p.description ?? null,
      photographer: p.user?.name ?? "Unknown",
    }))
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn(`[image-templates] Fetch error for "${query}": ${msg}`)
    return []
  } finally {
    clear()
  }
}

// Route handler
export async function GET(req: NextRequest) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY

  if (!accessKey) {
    console.error("[image-templates] UNSPLASH_ACCESS_KEY is not set in environment variables")
    return NextResponse.json(
      { error: "Unsplash API key not configured. Set UNSPLASH_ACCESS_KEY in your .env file." },
      { status: 500 }
    )
  }

  console.log(`[image-templates] Using key: ${accessKey.slice(0, 8)}…`)

  const { searchParams } = req.nextUrl
  const count          = Math.min(parseInt(searchParams.get("count") ?? "10"), 30)
  const categoryFilter = searchParams.get("category") ?? ""

  const queryPool: CategoryQueryEntry[] =
    CATEGORY_QUERY_POOLS[categoryFilter] ?? FALLBACK_QUERIES

  console.log(
    `[image-templates] category="${categoryFilter}" | target=${count} | pool=${queryPool.length} queries`
  )

  const t0                = Date.now()
  const seenIds           = new Set<string>()
  const seenPhotographers = new Map<string, number>()
  const images: FetchedTemplateImage[] = []
  const subqueriesUsed: string[]       = []
  const perQueryCounts: Record<string, number> = {}
  let   duplicatesRemoved = 0
  let   requestsMade      = 0
  let   requestsAvoided   = 0
  let   topupTriggered    = false
  let   earlyStop         = false

  // Shuffle pool so each request draws a different cross-section of subcategories
  const shuffled = [...queryPool].sort(() => Math.random() - 0.5)

  // Phase 1: parallel fetch — first DIVERSITY_QUERY_COUNT subqueries
  // All Phase 1 queries fire simultaneously; results are capped per query so no
  // single subcategory can fill all slots.
  const phase1Queries  = shuffled.slice(0, DIVERSITY_QUERY_COUNT)
  const targetPerQuery = Math.min(MAX_PER_QUERY, Math.max(2, Math.ceil(EARLY_STOP_THRESHOLD / Math.max(phase1Queries.length, 1))))
  const fetchPerPage   = Math.min(targetPerQuery + 4, 10)
  requestsMade        += phase1Queries.length

  const batchResults = await Promise.all(
    phase1Queries.map(async (entry) => {
      const photos = await fetchUnsplashBatch(entry.query, accessKey, fetchPerPage)
      return { entry, photos }
    })
  )

  for (const { entry, photos } of batchResults) {
    if (images.length >= EARLY_STOP_THRESHOLD) { earlyStop = true; break }
    let added = 0
    for (const photo of photos) {
      if (images.length >= EARLY_STOP_THRESHOLD) break
      if (added >= MAX_PER_QUERY) break
      if (!photo.regular) continue
      if (seenIds.has(photo.id))                                               { duplicatesRemoved++; continue }
      if (isGlobalDuplicate(photo.id))                                         { duplicatesRemoved++; continue }
      const photographerCount = seenPhotographers.get(photo.photographer) ?? 0
      if (photographerCount >= MAX_PER_PHOTOGRAPHER)                           { duplicatesRemoved++; continue }

      seenIds.add(photo.id)
      seenPhotographers.set(photo.photographer, photographerCount + 1)
      images.push({
        id:              photo.id,
        templateId:      entry.id,
        imageUrl:        photo.regular,
        thumbUrl:        photo.thumb,
        altDescription:  photo.alt,
        photographerName: photo.photographer,
        tags:            entry.tags,
        query:           entry.query,
      })
      added++
    }
    if (added > 0) {
      subqueriesUsed.push(entry.id)
      perQueryCounts[entry.id] = added
    }
  }

  // Phase 2: sequential top-up — skipped entirely when EARLY_STOP_THRESHOLD met
  // Avoids wasteful requests when Phase 1 already returned enough diverse images.
  const phase2Queries = shuffled.slice(DIVERSITY_QUERY_COUNT)
  if (images.length < EARLY_STOP_THRESHOLD) {
    topupTriggered = true
    for (let p2i = 0; p2i < phase2Queries.length; p2i++) {
      if (images.length >= EARLY_STOP_THRESHOLD) {
        earlyStop       = true
        requestsAvoided += phase2Queries.length - p2i
        break
      }
      const entry = phase2Queries[p2i]
      requestsMade++
      const quota = Math.min(MAX_TOPUP_PER_QUERY, EARLY_STOP_THRESHOLD - images.length)
      const batch = await fetchUnsplashBatch(entry.query, accessKey, Math.min(quota + 3, 8))

      let added = 0
      for (const photo of batch) {
        if (images.length >= EARLY_STOP_THRESHOLD || added >= quota) break
        if (!photo.regular) continue
        if (seenIds.has(photo.id))                                             { duplicatesRemoved++; continue }
        if (isGlobalDuplicate(photo.id))                                       { duplicatesRemoved++; continue }
        const photographerCount = seenPhotographers.get(photo.photographer) ?? 0
        if (photographerCount >= MAX_PER_PHOTOGRAPHER)                         { duplicatesRemoved++; continue }

        seenIds.add(photo.id)
        seenPhotographers.set(photo.photographer, photographerCount + 1)
        images.push({
          id:              photo.id,
          templateId:      entry.id,
          imageUrl:        photo.regular,
          thumbUrl:        photo.thumb,
          altDescription:  photo.alt,
          photographerName: photo.photographer,
          tags:            entry.tags,
          query:           entry.query,
        })
        added++
      }
      if (added > 0) {
        subqueriesUsed.push(entry.id)
        perQueryCounts[entry.id] = (perQueryCounts[entry.id] ?? 0) + added
      }
    }
  } else {
    requestsAvoided = phase2Queries.length
  }

  // Final fallback — category pool returned nothing
  if (images.length === 0 && queryPool !== FALLBACK_QUERIES) {
    console.warn("[image-templates] Category pool returned 0 results — trying fallback queries")
    for (const entry of FALLBACK_QUERIES) {
      if (images.length >= count) break
      const quota = Math.min(MAX_TOPUP_PER_QUERY, count - images.length)
      const batch = await fetchUnsplashBatch(entry.query, accessKey, Math.min(quota + 5, 10))
      for (const photo of batch) {
        if (images.length >= count) break
        if (!photo.regular || seenIds.has(photo.id) || isGlobalDuplicate(photo.id)) continue
        seenIds.add(photo.id)
        images.push({
          id:              photo.id,
          templateId:      entry.id,
          imageUrl:        photo.regular,
          thumbUrl:        photo.thumb,
          altDescription:  photo.alt,
          photographerName: photo.photographer,
          tags:            entry.tags,
          query:           entry.query,
        })
      }
    }
  }

  if (images.length === 0) {
    console.error(
      `[image-templates] All queries failed for category="${categoryFilter}". ` +
      "Check your UNSPLASH_ACCESS_KEY and Unsplash rate limits (50 req/hr on demo)."
    )
    return NextResponse.json(
      { error: "Failed to fetch images. Check server logs for the Unsplash error details." },
      { status: 502 }
    )
  }

  images.sort(() => Math.random() - 0.5)
  const finalImages = images.slice(0, count)

  // Diagnostics
  const distribution = Object.entries(perQueryCounts)
    .map(([id, n]) => `${id}×${n}`)
    .join(", ")
  console.log(
    `[ImagePipeline] Category: ${categoryFilter} | ` +
    `Phase1 queries: ${phase1Queries.length} | ` +
    `Topup triggered: ${topupTriggered} | ` +
    `Early stop: ${earlyStop} | ` +
    `Final image count: ${finalImages.length} | ` +
    `Requests avoided: ${requestsAvoided} | ` +
    `Total requests: ${requestsMade} | ` +
    `Duplicates removed: ${duplicatesRemoved} | ` +
    `Subqueries: ${distribution} | ` +
    `Total time: ${Date.now() - t0}ms`
  )

  return NextResponse.json({ images: finalImages, total: finalImages.length })
}
