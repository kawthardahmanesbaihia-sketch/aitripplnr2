/**
 * Performance cache singleton — image-level LRU cache + runtime stats.
 *
 * Caches CLIP label scores by image URL so repeat requests for the same
 * image skip the expensive vision-encoder inference entirely.
 */

import type { LabelScore } from "./clip-service"

const MAX_CACHE = 50

interface Entry {
  scores: LabelScore[]
  ts: number
}

const _cache = new Map<string, Entry>()
let _hits = 0
let _misses = 0
const _startTs = Date.now()

// Image score cache
export function getCachedImageScores(url: string): LabelScore[] | null {
  const e = _cache.get(url)
  if (e) { _hits++; return e.scores }
  _misses++
  return null
}

export function setCachedImageScores(url: string, scores: LabelScore[]): void {
  if (_cache.size >= MAX_CACHE) {
    // Evict the oldest entry
    let oldKey = ""
    let oldTs  = Infinity
    for (const [k, v] of _cache) {
      if (v.ts < oldTs) { oldTs = v.ts; oldKey = k }
    }
    if (oldKey) _cache.delete(oldKey)
  }
  _cache.set(url, { scores, ts: Date.now() })
}

// Stats
export function getImageCacheStats(): {
  size: number; maxSize: number; hits: number; misses: number; uptimeMs: number
} {
  return {
    size: _cache.size,
    maxSize: MAX_CACHE,
    hits: _hits,
    misses: _misses,
    uptimeMs: Date.now() - _startTs,
  }
}
