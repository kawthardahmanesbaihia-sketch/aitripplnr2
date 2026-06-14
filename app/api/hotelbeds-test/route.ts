/**
 * GET /api/hotelbeds-test
 *
 * Diagnostic route — verifies each HotelBeds product is returning live data.
 * Tests:
 *   1. Hotels Content API     — GET  /hotel-content-api/1.0/hotels
 *   2. Activities Booking API — POST /activity-api/3.0/activities          (v3, JSON body)
 *   3. Transfers Booking API  — GET  /transfer-api/1.0/availability/...    (path params)
 *   4. Transfers Cache API    — GET  /transfer-cache-api/1.0/routes        (content, no booking)
 *
 * Remove this route once integration is confirmed working.
 */

import { NextResponse } from "next/server"
import crypto from "crypto"

export const dynamic    = "force-dynamic"
export const revalidate = 0

// Test constants
const DEST        = "BCN"   // HotelBeds destination code — Barcelona
const IATA        = "BCN"   // Airport IATA — Barcelona El Prat
const ATLAS_HOTEL = "265"   // HotelBeds Atlas hotel code (example near BCN airport)

const FROM_DATE = (() => {
  const d = new Date(); d.setDate(d.getDate() + 10)
  return d.toISOString().split("T")[0]
})()
const TO_DATE = (() => {
  const d = new Date(); d.setDate(d.getDate() + 24)
  return d.toISOString().split("T")[0]
})()

// HMAC auth
function sign(apiKey: string, secret: string) {
  const ts = Math.floor(Date.now() / 1000).toString()
  const sig = crypto.createHash("sha256").update(apiKey + secret + ts).digest("hex")
  console.log(`[hb-test] HMAC — key=${apiKey.slice(0, 8)}… secret=${secret.slice(0, 4)}… ts=${ts} sig=${sig.slice(0, 16)}…`)
  return { "Api-key": apiKey, "X-Signature": sig, "Accept": "application/json", "Content-Type": "application/json" }
}

// Individual API tests
async function testHotels() {
  const apiKey = process.env.HOTELBEDS_HOTELS_API_KEY
  const secret = process.env.HOTELBEDS_HOTELS_SECRET

  if (!apiKey || !secret) return missingCreds("Hotels Content API", apiKey, secret)

  const url = `https://api.test.hotelbeds.com/hotel-content-api/1.0/hotels?destinationCode=${DEST}&fields=name,categoryCode,coordinates&language=ENG&from=1&to=5&useSecondaryLanguage=false`
  console.log("[hb-test] Hotels URL:", url)

  try {
    const res = await fetch(url, { headers: sign(apiKey, secret), cache: "no-store" })
    const text = await res.text()
    console.log("[hb-test] Hotels status:", res.status)
    console.log("[hb-test] Hotels raw (500):", text.slice(0, 500))

    let data: any = null
    try { data = JSON.parse(text) } catch {}
    const items: any[] = data?.hotels ?? []

    return {
      api: "Hotels Content API",
      endpoint: url, method: "GET",
      status: res.status, success: res.ok,
      recordCount: items.length,
      sampleNames: items.slice(0, 3).map((h: any) => h.name?.content ?? h.name ?? ""),
      rawPreview: text.slice(0, 400),
    }
  } catch (err) {
    return fetchError("Hotels Content API", url, err)
  }
}

async function testActivities() {
  const apiKey = process.env.HOTELBEDS_ACTIVITIES_API_KEY
  const secret = process.env.HOTELBEDS_ACTIVITIES_SECRET

  if (!apiKey || !secret) return missingCreds("Activities Booking API v3", apiKey, secret)

  // v3 endpoint — POST with JSON body (not GET query params)
  const url  = "https://api.test.hotelbeds.com/activity-api/3.0/activities"
  const body = {
    filters: [{ searchFilterItems: [{ type: "destination", value: DEST }] }],
    from: FROM_DATE,
    to:   TO_DATE,
    language: "en",
    pagination: { itemsPerPage: 20, page: 1 },
    order: "DEFAULT",
  }

  console.log("[hb-test] Activities URL:", url)
  console.log("[hb-test] Activities body:", JSON.stringify(body))

  try {
    const res = await fetch(url, {
      method:  "POST",
      headers: sign(apiKey, secret),
      body:    JSON.stringify(body),
      cache:   "no-store",
    })
    const text = await res.text()
    console.log("[hb-test] Activities status:", res.status)
    console.log("[hb-test] Activities raw (500):", text.slice(0, 500))

    let data: any = null
    try { data = JSON.parse(text) } catch {}
    const items: any[] = data?.activities ?? data?.activitiesContent ?? []

    return {
      api: "Activities Booking API v3",
      endpoint: url, method: "POST",
      requestBody: body,
      status: res.status, success: res.ok,
      recordCount: items.length,
      sampleNames: items.slice(0, 3).map((a: any) => a.name ?? ""),
      responseKeys: Object.keys(data ?? {}),
      rawPreview: text.slice(0, 400),
    }
  } catch (err) {
    return fetchError("Activities Booking API v3", url, err)
  }
}

async function testTransfersBooking() {
  const apiKey = process.env.HOTELBEDS_TRANSFERS_API_KEY
  const secret = process.env.HOTELBEDS_TRANSFERS_SECRET

  if (!apiKey || !secret) return missingCreds("Transfers Booking API", apiKey, secret)

  // Correct format: GET with path parameters
  const url = [
    "https://api.test.hotelbeds.com/transfer-api/1.0/availability",
    "/en",
    `/from/IATA/${IATA}`,
    `/to/ATLAS/${ATLAS_HOTEL}`,
    `/${FROM_DATE}T12:00:00`,
    "/2/0/0",
  ].join("")

  console.log("[hb-test] Transfers Booking URL:", url)

  try {
    const res = await fetch(url, { headers: sign(apiKey, secret), cache: "no-store" })
    const text = await res.text()
    console.log("[hb-test] Transfers Booking status:", res.status)
    console.log("[hb-test] Transfers Booking raw (500):", text.slice(0, 500))

    let data: any = null
    try { data = JSON.parse(text) } catch {}
    const items: any[] = data?.transfers ?? data?.services ?? []

    const note403 = res.status === 403
      ? "403 means Transfers product is NOT activated on this account. Contact HotelBeds support to request access."
      : undefined

    return {
      api: "Transfers Booking API",
      endpoint: url, method: "GET",
      status: res.status, success: res.ok,
      recordCount: items.length,
      sampleNames: items.slice(0, 3).map((t: any) => t.category?.name ?? t.name ?? ""),
      responseKeys: Object.keys(data ?? {}),
      rawPreview: text.slice(0, 400),
      ...(note403 ? { diagnosis: note403 } : {}),
    }
  } catch (err) {
    return fetchError("Transfers Booking API", url, err)
  }
}

async function testTransfersCache() {
  // The Transfers Cache API (routes/content) may be accessible even when
  // the booking API is blocked — it is read-only reference data.
  const apiKey = process.env.HOTELBEDS_TRANSFERS_API_KEY
  const secret = process.env.HOTELBEDS_TRANSFERS_SECRET

  if (!apiKey || !secret) return missingCreds("Transfers Cache API", apiKey, secret)

  const url = `https://api.test.hotelbeds.com/transfer-cache-api/1.0/routes?fields=ALL&destinationCode=PMI&offset=0&limit=5`
  console.log("[hb-test] Transfers Cache URL:", url)

  try {
    const res = await fetch(url, { headers: sign(apiKey, secret), cache: "no-store" })
    const text = await res.text()
    console.log("[hb-test] Transfers Cache status:", res.status)
    console.log("[hb-test] Transfers Cache raw (500):", text.slice(0, 500))

    let data: any = null
    try { data = JSON.parse(text) } catch {}
    const items: any[] = data?.routes ?? data?.results ?? []

    return {
      api: "Transfers Cache API (routes)",
      endpoint: url, method: "GET",
      status: res.status, success: res.ok,
      recordCount: items.length,
      sampleNames: items.slice(0, 3).map((r: any) =>
        `${r.pickupType ?? "?"} ${r.pickupCode ?? "?"} → ${r.dropoffType ?? "?"} ${r.dropoffCode ?? "?"}`
      ),
      responseKeys: Object.keys(data ?? {}),
      rawPreview: text.slice(0, 400),
    }
  } catch (err) {
    return fetchError("Transfers Cache API (routes)", url, err)
  }
}

// Helpers
function missingCreds(api: string, key: any, secret: any) {
  return {
    api, success: false, status: null, recordCount: 0, sampleNames: [],
    error: `Missing: ${!key ? "API_KEY " : ""}${!secret ? "SECRET" : ""}`.trim(),
  }
}

function fetchError(api: string, endpoint: string, err: unknown) {
  return {
    api, endpoint, success: false, status: null, recordCount: 0, sampleNames: [],
    error: String(err),
  }
}

// Route handler
export async function GET() {
  console.log("=== [hb-test] HotelBeds diagnostic — start ===")
  console.log(`[hb-test] Date window: ${FROM_DATE} → ${TO_DATE}`)

  const [hotels, activities, transfersBooking, transfersCache] = await Promise.all([
    testHotels(),
    testActivities(),
    testTransfersBooking(),
    testTransfersCache(),
  ])

  console.log("=== [hb-test] Results ===")
  console.log(`Hotels:             ${hotels.status} | count=${hotels.recordCount}`)
  console.log(`Activities:         ${activities.status} | count=${activities.recordCount}`)
  console.log(`Transfers Booking:  ${transfersBooking.status} | count=${transfersBooking.recordCount}`)
  console.log(`Transfers Cache:    ${transfersCache.status} | count=${transfersCache.recordCount}`)

  return NextResponse.json({
    timestamp:   new Date().toISOString(),
    environment: "api.test.hotelbeds.com",
    testDestination: `${DEST} (Barcelona)`,
    dateWindow:  { from: FROM_DATE, to: TO_DATE },
    summary: {
      hotels:            { status: hotels.status,            count: hotels.recordCount,            pass: hotels.success },
      activities:        { status: activities.status,        count: activities.recordCount,        pass: activities.success },
      transfersBooking:  { status: transfersBooking.status,  count: transfersBooking.recordCount,  pass: transfersBooking.success },
      transfersCache:    { status: transfersCache.status,    count: transfersCache.recordCount,    pass: transfersCache.success },
    },
    details: {
      hotels,
      activities,
      transfersBooking,
      transfersCache,
    },
    transfersNote: [
      "403 on Transfers Booking = product not activated. This is separate from Hotels/Activities.",
      "To activate: log into developer.hotelbeds.com and check your API products, or contact HotelBeds support.",
      "Transfers Cache API may still return data even when Booking is blocked.",
    ],
  })
}
