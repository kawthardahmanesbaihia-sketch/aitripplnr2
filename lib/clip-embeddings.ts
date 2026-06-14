/**
 * CLIP Embedding Engine — precomputed text embeddings + vectorized inference
 *
 * Replaces the zero-shot-image-classification pipeline for the hot path.
 * Text embeddings are computed ONCE at startup and cached in typed-array matrices.
 * Each request: one vision-encoder call + batch dot-products (no text encoder).
 *
 * Architecture:
 *   Startup → precomputeEmbeddings()
 *     CLIPTextModelWithProjection encodes all phrases in batches of 64
 *     Stores [N_phrases × 512] Float32Array as _phraseMatrix (row-major)
 *     Averages phrase embeddings per destination → centroid matrix
 *
 *   Per-request → computeImageEmbedding() + allPhraseScores()
 *     CLIPVisionModelWithProjection encodes image once → 512-dim vector
 *     batchDotProduct(imageEmb, _phraseMatrix, N) → all cosine similarities
 *     centroidRanking(imageEmb, K) → top-K destinations by centroid score
 */

import {
  CLIPTextModelWithProjection,
  CLIPVisionModelWithProjection,
  AutoTokenizer,
  AutoProcessor,
  RawImage,
  env,
} from "@xenova/transformers"

// Config
const MODEL     = "Xenova/clip-vit-base-patch32"
const DIM       = 512
const TXT_BATCH = 64   // phrases per text-encoder forward pass

env.allowRemoteModels = true
env.cacheDir = process.env.TRANSFORMERS_CACHE ?? "./.cache/transformers"

// Model singletons
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _tokenizer: any  = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _textModel: any  = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _processor: any  = null
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _visionModel: any = null
let _modelsPromise: Promise<void> | null = null

// Precomputed matrices
let _phraseMatrix: Float32Array | null = null     // [N_phrases × DIM] row-major
let _phraseList: string[]              = []        // phrase at row i
const _phraseIndexMap                  = new Map<string, number>()  // phrase → row

let _centroidMatrix: Float32Array | null = null   // [N_dests × DIM] row-major
let _destList: string[]                  = []      // destId at row i
const _destIndexMap                      = new Map<string, number>() // destId → row
const _destPhraseIndices                 = new Map<string, number[]>() // destId → phrase rows

let _embeddingsReady  = false
let _precompPromise: Promise<void> | null = null
let _startupMs = 0

// Model loading
async function loadModels(): Promise<void> {
  const t0 = Date.now()
  console.log("[CLIP-Embed] Loading text + vision encoders…")
  ;[_tokenizer, _textModel, _processor, _visionModel] = await Promise.all([
    AutoTokenizer.from_pretrained(MODEL),
    CLIPTextModelWithProjection.from_pretrained(MODEL, { quantized: true } as Record<string, unknown>),
    AutoProcessor.from_pretrained(MODEL),
    CLIPVisionModelWithProjection.from_pretrained(MODEL, { quantized: true } as Record<string, unknown>),
  ])
  console.log(`[CLIP-Embed] Models loaded in ${Date.now() - t0}ms`)
}

export async function ensureModels(): Promise<void> {
  if (!_modelsPromise) _modelsPromise = loadModels()
  await _modelsPromise
}

// Math utilities
function l2normalize(v: Float32Array): Float32Array {
  let norm = 0
  for (let i = 0; i < v.length; i++) norm += v[i] * v[i]
  norm = Math.sqrt(norm)
  if (norm < 1e-9) return v.slice()
  const out = new Float32Array(v.length)
  for (let i = 0; i < v.length; i++) out[i] = v[i] / norm
  return out
}

/**
 * Vectorized batch dot product: image embedding (1×DIM) vs N rows of matrix (N×DIM).
 * All vectors assumed L2-normalized → result = cosine similarity.
 */
export function batchDotProduct(
  imageEmb: Float32Array,
  matrix: Float32Array,
  N: number,
): Float32Array {
  const scores = new Float32Array(N)
  for (let i = 0; i < N; i++) {
    let dot = 0
    const off = i * DIM
    for (let j = 0; j < DIM; j++) dot += imageEmb[j] * matrix[off + j]
    scores[i] = dot
  }
  return scores
}

// Startup: precompute all phrase + centroid embeddings
/**
 * Build phrase matrix and centroid matrix at process startup.
 * Safe to call multiple times — runs only once.
 *
 * @param phrases        All knowledge-base phrases (ALL_CONCEPT_LABELS)
 * @param destPhraseMap  destId → phrases array (from DEST_CATEGORY_CONCEPTS, flattened)
 */
export async function precomputeEmbeddings(
  phrases: string[],
  destPhraseMap: Record<string, string[]>,
): Promise<void> {
  if (_embeddingsReady) return
  if (_precompPromise) { await _precompPromise; return }

  _precompPromise = (async () => {
    const t0 = Date.now()
    await ensureModels()

    // 1. Phrase matrix
    console.log(`[CLIP-Embed] Precomputing ${phrases.length} phrase embeddings in batches of ${TXT_BATCH}…`)
    _phraseList   = phrases
    _phraseMatrix = new Float32Array(phrases.length * DIM)
    phrases.forEach((p, i) => _phraseIndexMap.set(p, i))

    for (let start = 0; start < phrases.length; start += TXT_BATCH) {
      const batch  = phrases.slice(start, start + TXT_BATCH)
      const inputs = await _tokenizer(batch, { padding: true, truncation: true })
      const { text_embeds } = await _textModel(inputs) as { text_embeds: { data: Float32Array } }
      const data = text_embeds.data

      for (let j = 0; j < batch.length; j++) {
        const raw  = data.slice(j * DIM, (j + 1) * DIM)
        const norm = l2normalize(raw)
        _phraseMatrix!.set(norm, (start + j) * DIM)
      }

      if ((start / TXT_BATCH) % 10 === 0) {
        process.stdout.write(
          `\r[CLIP-Embed] Text embeddings: ${Math.min(start + TXT_BATCH, phrases.length)}/${phrases.length}`
        )
      }
    }
    console.log()  // newline after progress

    // 2. Centroid matrix
    const destIds = Object.keys(destPhraseMap)
    _destList = destIds
    destIds.forEach((id, i) => _destIndexMap.set(id, i))
    _centroidMatrix = new Float32Array(destIds.length * DIM)

    for (let di = 0; di < destIds.length; di++) {
      const destId      = destIds[di]
      const destPhrases = destPhraseMap[destId]
      const phraseIdxs: number[] = []
      const centroid = new Float32Array(DIM)

      for (const phrase of destPhrases) {
        const idx = _phraseIndexMap.get(phrase)
        if (idx === undefined) continue
        phraseIdxs.push(idx)
        const off = idx * DIM
        for (let d = 0; d < DIM; d++) centroid[d] += _phraseMatrix![off + d]
      }

      _destPhraseIndices.set(destId, phraseIdxs)

      if (phraseIdxs.length > 0) {
        const n = phraseIdxs.length
        for (let d = 0; d < DIM; d++) centroid[d] /= n
      }
      _centroidMatrix!.set(l2normalize(centroid), di * DIM)
    }

    _embeddingsReady = true
    _startupMs = Date.now() - t0

    const matMB  = (phrases.length * DIM * 4 / 1024 / 1024).toFixed(1)
    const centKB = (destIds.length * DIM * 4 / 1024).toFixed(1)
    console.log(`\n${"═".repeat(60)}`)
    console.log(`[Performance] Embedding precomputation complete`)
    console.log(`  Phrases        : ${phrases.length}`)
    console.log(`  Destinations   : ${destIds.length}`)
    console.log(`  Phrase matrix  : ${matMB} MB  (${phrases.length} × ${DIM} float32)`)
    console.log(`  Centroid matrix: ${centKB} KB  (${destIds.length} × ${DIM} float32)`)
    console.log(`  Startup time   : ${_startupMs}ms`)
    console.log(`${"═".repeat(60)}\n`)
  })()

  await _precompPromise
}

// Per-request: image embedding
/**
 * Encode one image → normalized 512-dim embedding.
 * This is the ONLY model forward pass during a request.
 *
 * Supports two input shapes:
 *   - https:// remote URLs  (existing /single flow via Unsplash)
 *   - data:image/... URIs   (uploaded images from /explore)
 *
 * Only the image-load step differs between the two paths.
 * The processor, vision model, normalization, and DIM slice are identical.
 */
export async function computeImageEmbedding(imageUrl: string): Promise<Float32Array> {
  await ensureModels()

  const isDataUri = imageUrl.startsWith('data:image/')
  console.log(`[CLIP] Input type: ${isDataUri ? 'base64-upload' : 'remote-url'}`)

  const t0 = Date.now()
  let image: Awaited<ReturnType<typeof RawImage.fromURL>>
  let logLabel: string

  if (isDataUri) {
    // Format: "data:<mimeType>;base64,<b64data>"
    // Buffer is a Node.js built-in; Blob is a global in Node.js 18+ (required by Next.js 13+).
    const commaIdx = imageUrl.indexOf(',')
    const mimeType = imageUrl.slice(5, commaIdx).split(';')[0]  // e.g. "image/jpeg"
    const b64      = imageUrl.slice(commaIdx + 1)
    const buffer   = Buffer.from(b64, 'base64')
    console.log(`[CLIP] Decoded upload size: ${(buffer.byteLength / 1024).toFixed(1)} KB`)
    const blob = new Blob([buffer], { type: mimeType })
    image    = await RawImage.fromBlob(blob)
    logLabel = '[base64-upload]'
  } else {
    const url = imageUrl.includes("unsplash.com")
      ? imageUrl.replace(/[?&]w=\d+/, "").replace(/[?&]q=\d+/, "").replace(/\??$/, "?w=336&q=75")
      : imageUrl
    image    = await RawImage.fromURL(url)
    logLabel = url.substring(0, 70)
  }

  const inputs = await _processor(image)
  const { image_embeds } = await _visionModel(inputs) as { image_embeds: { data: Float32Array } }
  const raw = image_embeds.data.slice(0, DIM)
  const emb = l2normalize(raw)
  console.log(`[CLIP] Embedding success`)
  console.log(`[Timing] Image embedding (vision encoder): ${Date.now() - t0}ms — ${logLabel}`)
  return emb
}

// Per-request: phrase similarity
/**
 * Compute cosine similarity between imageEmb and every phrase embedding.
 * Returns Float32Array of length N_phrases — indexed identically to getPhraseList().
 * This is a pure math operation on cached matrices — no model inference.
 */
export function allPhraseScores(imageEmb: Float32Array): Float32Array {
  if (!_phraseMatrix) throw new Error("[CLIP-Embed] Phrase matrix not ready")
  const t0 = Date.now()
  const scores = batchDotProduct(imageEmb, _phraseMatrix, _phraseList.length)
  console.log(`[Timing] Batch phrase similarity (${_phraseList.length} phrases): ${Date.now() - t0}ms`)
  return scores
}

// Stage 1: centroid ranking
/**
 * Rank all destinations by centroid cosine similarity.
 * Returns top-K results sorted descending.
 */
export function centroidRanking(
  imageEmb: Float32Array,
  topK: number,
): Array<{ destId: string; score: number }> {
  if (!_centroidMatrix || !_destList.length) {
    throw new Error("[CLIP-Embed] Centroids not ready — call precomputeEmbeddings first")
  }
  const t0     = Date.now()
  const scores = batchDotProduct(imageEmb, _centroidMatrix, _destList.length)
  const ranked = Array.from({ length: _destList.length }, (_, i) => ({
    destId: _destList[i],
    score:  scores[i],
  }))
  ranked.sort((a, b) => b.score - a.score)
  console.log(`[Timing] Centroid ranking (${_destList.length} dests): ${Date.now() - t0}ms`)
  return ranked.slice(0, topK)
}

// Accessors
export function getPhraseList(): string[]                { return _phraseList }
export function getPhraseIndex(p: string): number        { return _phraseIndexMap.get(p) ?? -1 }
export function getDestPhraseIndices(d: string): number[]{ return _destPhraseIndices.get(d) ?? [] }
export function isEmbeddingsReady(): boolean             { return _embeddingsReady }

export function getEmbeddingStats() {
  return {
    ready:        _embeddingsReady,
    phraseCount:  _phraseList.length,
    centroidCount:_destList.length,
    startupMs:    _startupMs,
    matrixMB:     _phraseList.length * DIM * 4 / 1024 / 1024,
  }
}
