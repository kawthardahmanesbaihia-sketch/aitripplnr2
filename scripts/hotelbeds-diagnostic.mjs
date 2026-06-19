/**
 * HotelBeds TEST environment — inventory coverage diagnostic
 *
 * Standalone script: no production code imported, no files modified.
 * Run: node scripts/hotelbeds-diagnostic.mjs
 *
 * Reads HOTELBEDS_HOTELS_API_KEY and HOTELBEDS_HOTELS_SECRET from
 * .env.development.local in the project root.
 */

import crypto from "node:crypto"
import { readFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

// ── Env loader ────────────────────────────────────────────────────────────────
const __dir = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dir, "..", ".env.development.local")

function loadEnv(filePath) {
  try {
    const raw = readFileSync(filePath, "utf8")
    const env = {}
    for (const line of raw.split("\n")) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#")) continue
      const eq = trimmed.indexOf("=")
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      const val = trimmed.slice(eq + 1).trim()
      env[key] = val
    }
    return env
  } catch (err) {
    console.error(`Cannot read env file at ${filePath}:`, err.message)
    process.exit(1)
  }
}

const env = loadEnv(envPath)
const API_KEY = env.HOTELBEDS_HOTELS_API_KEY
const SECRET  = env.HOTELBEDS_HOTELS_SECRET

if (!API_KEY || !SECRET) {
  console.error("HOTELBEDS_HOTELS_API_KEY or HOTELBEDS_HOTELS_SECRET missing from .env.development.local")
  process.exit(1)
}

// ── HMAC auth ─────────────────────────────────────────────────────────────────
function makeHeaders() {
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const signature = crypto
    .createHash("sha256")
    .update(API_KEY + SECRET + timestamp)
    .digest("hex")
  return {
    "Api-key":      API_KEY,
    "X-Signature":  signature,
    "Accept":       "application/json",
    "Content-Type": "application/json",
  }
}

// ── Destination codes (same as DEST_CODES in hotelbeds-client.ts) ─────────────
const DEST_CODES = {
  // Greece
  "Athens":        "ATH",
  "Santorini":     "JTR",
  "Mykonos":       "JMK",
  "Crete":         "HER",
  // Italy
  "Rome":          "ROM",
  // France
  "Paris":         "PAR",
  // Brazil
  "Rio de Janeiro":"RIO",
  // Japan
  "Tokyo":         "TYO",
  // UAE
  "Dubai":         "DXB",
  // Indonesia
  "Bali":          "DPS",
}

const BASE = "https://api.test.hotelbeds.com/hotel-content-api/1.0"

// ── Single destination probe ───────────────────────────────────────────────────
async function probe(city, destCode) {
  const url = [
    `${BASE}/hotels`,
    `?destinationCode=${destCode}`,
    `&fields=name,categoryCode`,
    `&language=ENG`,
    `&from=1&to=20`,
    `&categoryCodes=1EST,2EST,3EST,4EST,5EST`,  // all star levels
    `&useSecondaryLanguage=false`,
  ].join("")

  const start = Date.now()
  let status, hotelsCount, firstName, errorDetail

  try {
    const res = await fetch(url, {
      headers: makeHeaders(),
      signal:  AbortSignal.timeout(15_000),
    })

    status = res.status
    const elapsed = Date.now() - start

    if (res.ok) {
      const text = await res.text()
      let data
      try { data = JSON.parse(text) } catch {
        errorDetail = "Non-JSON response"
        hotelsCount = 0
        firstName   = "—"
        return { city, destCode, status, hotelsCount, firstName, elapsed, errorDetail }
      }
      const raw = data?.hotels ?? []
      hotelsCount = raw.length
      firstName   = raw[0]?.name?.content ?? raw[0]?.name ?? (hotelsCount > 0 ? "(name missing)" : "—")
    } else {
      const errText = await res.text().catch(() => "(unreadable)")
      hotelsCount = 0
      firstName   = "—"
      // Extract a compact error message
      try {
        const errJson = JSON.parse(errText)
        const msgs = errJson?.errors?.map(e => e.code + ": " + e.description).join(" | ")
        errorDetail = msgs ?? errText.slice(0, 120)
      } catch {
        errorDetail = errText.slice(0, 120)
      }
    }

    return { city, destCode, status, hotelsCount, firstName, elapsed, errorDetail }
  } catch (err) {
    return {
      city, destCode,
      status:      "ERR",
      hotelsCount: 0,
      firstName:   "—",
      elapsed:     Date.now() - start,
      errorDetail: err.message,
    }
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
console.log("=".repeat(72))
console.log("  HotelBeds TEST Environment — Inventory Coverage Diagnostic")
console.log("  Endpoint : https://api.test.hotelbeds.com/hotel-content-api/1.0")
console.log(`  API key  : ${API_KEY.slice(0, 8)}… (len=${API_KEY.length})`)
console.log(`  Secret   : ${"*".repeat(SECRET.length)} (len=${SECRET.length})`)
console.log(`  Timestamp: ${new Date().toISOString()}`)
console.log("=".repeat(72))
console.log()

const destinations = Object.entries(DEST_CODES)

// Run sequentially to avoid rate-limit bursts on the test tier
const results = []
for (const [city, code] of destinations) {
  process.stdout.write(`  Probing ${city.padEnd(16)} (${code}) ... `)
  const r = await probe(city, code)
  results.push(r)

  const indicator = r.hotelsCount > 0 ? "✓" : r.status === 200 ? "○" : "✗"
  console.log(
    `${indicator}  HTTP ${r.status}  hotels=${r.hotelsCount}  (${r.elapsed}ms)` +
    (r.errorDetail ? `  ERROR: ${r.errorDetail.slice(0, 80)}` : "")
  )
  // Small delay between requests to stay within test-tier rate limits
  await new Promise(r => setTimeout(r, 400))
}

// ── Detailed results table ─────────────────────────────────────────────────────
console.log()
console.log("─".repeat(72))
console.log(
  "  " +
  "City".padEnd(18) +
  "Code".padEnd(6) +
  "Status".padEnd(8) +
  "Hotels".padEnd(8) +
  "First hotel name"
)
console.log("─".repeat(72))

for (const r of results) {
  const nameCol = r.errorDetail
    ? `[${r.errorDetail.slice(0, 40)}]`
    : r.firstName
  console.log(
    "  " +
    r.city.padEnd(18) +
    r.destCode.padEnd(6) +
    String(r.status).padEnd(8) +
    String(r.hotelsCount).padEnd(8) +
    nameCol
  )
}

console.log("─".repeat(72))
console.log()

// ── Summary ────────────────────────────────────────────────────────────────────
const withInventory  = results.filter(r => r.hotelsCount > 0)
const emptyOk        = results.filter(r => r.hotelsCount === 0 && r.status === 200)
const httpErrors     = results.filter(r => r.status !== 200)

console.log("  SUMMARY")
console.log(`  Destinations with inventory  : ${withInventory.length} / ${results.length}`)
console.log(`  HTTP 200 but 0 hotels        : ${emptyOk.length}`)
console.log(`  HTTP errors / timeouts       : ${httpErrors.length}`)
if (withInventory.length > 0) {
  console.log(`  Has data                     : ${withInventory.map(r => r.city).join(", ")}`)
}
if (emptyOk.length > 0) {
  console.log(`  Empty (200, no hotels)       : ${emptyOk.map(r => r.city).join(", ")}`)
}
if (httpErrors.length > 0) {
  console.log(`  Errors                       : ${httpErrors.map(r => `${r.city}(${r.status})`).join(", ")}`)
}

console.log()
console.log("  CONCLUSION")
if (httpErrors.some(r => r.status === 401)) {
  console.log("  ✗ Authentication failure (401) — HMAC credentials are incorrect or clock drift > 5 min")
} else if (httpErrors.length === results.length) {
  console.log("  ✗ All requests failed with HTTP errors — check credentials and account activation")
} else if (withInventory.length === 0) {
  console.log("  ✗ Credentials accepted (HTTP 200) but TEST environment has no hotel inventory")
  console.log("    for any of the probed destinations. This is a HotelBeds TEST environment limitation,")
  console.log("    not a destination resolution issue.")
} else if (withInventory.length < results.length / 2) {
  console.log("  △ Partial coverage — TEST environment inventory is sparse.")
  console.log(`    Only ${withInventory.length}/${results.length} destinations have data.`)
} else {
  console.log("  ✓ Reasonable coverage — TEST environment returning data for most destinations.")
}

console.log()
