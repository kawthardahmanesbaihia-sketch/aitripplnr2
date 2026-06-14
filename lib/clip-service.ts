/**
 * CLIP Service — model management + type exports
 *
 * The hot-path inference (classifyImage) has been replaced by clip-embeddings.ts
 * which precomputes all text embeddings at startup and serves per-request similarity
 * via a vectorized batch dot-product. This file is kept for:
 *   1. LabelScore type (used by geo-reasoning-engine and clip-scorer)
 *   2. prewarm() — triggers clip-embeddings model loading at startup
 *   3. cosineSimilarity() utility for external callers
 */

import { env } from "@xenova/transformers"
import { ensureModels } from "./clip-embeddings"

// Model configuration
env.allowRemoteModels = true
env.cacheDir = process.env.TRANSFORMERS_CACHE ?? "./.cache/transformers"

// Types
export interface LabelScore {
  label: string
  score: number
}

// Startup warmup
let _prewarmStarted = false

/**
 * Trigger model loading in the background before the first request.
 * Delegates to clip-embeddings.ts which loads the separated text + vision
 * encoders (more efficient than the zero-shot pipeline for our use case).
 * Safe to call multiple times — only loads once.
 */
export function prewarm(): void {
  if (_prewarmStarted) return
  _prewarmStarted = true
  ensureModels().catch(err => {
    console.error("[CLIP] Pre-warm failed:", err)
    _prewarmStarted = false
  })
}

// Cosine similarity utility
export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dot = 0, normA = 0, normB = 0
  for (let i = 0; i < a.length; i++) {
    dot   += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  return denom === 0 ? 0 : Math.max(-1, Math.min(1, dot / denom))
}
