"use client"

/**
 * Firestore persistence for travel analysis sessions.
 * Called client-side after the user receives recommendation results.
 *
 * Collection: travel_sessions
 * Each document stores everything needed to recreate or audit a session:
 *   - selected image URLs
 *   - per-image Gemini analysis output
 *   - aggregated preference profile
 *   - final destination recommendations
 *   - travel dates + budget
 */

import { doc, setDoc, getDoc } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { firestore, isFirebaseInitialized } from "./firebase-config"

function isUserAuthenticated(): boolean {
  try {
    return !!getAuth().currentUser
  } catch {
    return false
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TravelSessionData {
  /** ISO-string URLs of the images the user selected */
  selectedImages: string[]

  /** Raw Gemini Vision output — one entry per image, null if analysis failed */
  imageAnalysis: Array<{
    travelStyle?: string
    preferredClimate?: string
    activities?: string[]
    environment?: string[]
    vibe?: string[]
    mood?: string
    tags?: string[]
  } | null>

  /** Aggregated preference profile produced by the recommendation engine */
  extractedPreferences: {
    dominantMood: string
    preferredClimate: string
    preferredEnvironment: string
    activityLevel: string
    foodPreferences: string[]
    allTags: string[]
  }

  /** Top 3 destinations returned by the scoring engine */
  recommendedDestinations: Array<{
    name: string
    code: string
    matchPercentage: number
  }>

  travelDates: { start: string; end: string } | null
  budget: string
  language: string
}

export interface SavedTravelSession extends TravelSessionData {
  sessionId: string
  createdAt: number
}

// ─── Save ─────────────────────────────────────────────────────────────────────

/**
 * Persist a travel analysis session to Firestore.
 * Returns the generated sessionId, or null if Firestore is unavailable.
 * Never throws — failures are logged and silently ignored so the UI is unaffected.
 */
export async function saveTravelSession(
  data: TravelSessionData
): Promise<string | null> {
  if (!isFirebaseInitialized || !firestore) {
    console.warn("[travel-firestore] Firestore not initialized — session not saved")
    return null
  }

  if (!isUserAuthenticated()) {
    console.warn("[travel-firestore] User not authenticated — session not saved")
    return null
  }

  // Deterministic ID: timestamp + random suffix (no Math.random in render)
  const sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  const session: SavedTravelSession = {
    sessionId,
    createdAt: Date.now(),
    ...data,
  }

  try {
    await setDoc(doc(firestore, "travel_sessions", sessionId), session)
    console.log("[travel-firestore] Session saved:", sessionId)
    return sessionId
  } catch (error) {
    console.error("[travel-firestore] Failed to save session:", error)
    return null
  }
}

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * Retrieve a previously saved travel session by its ID.
 * Returns null if not found or Firestore is unavailable.
 */
export async function getTravelSession(
  sessionId: string
): Promise<SavedTravelSession | null> {
  if (!isFirebaseInitialized || !firestore) return null

  try {
    const snap = await getDoc(doc(firestore, "travel_sessions", sessionId))
    return snap.exists() ? (snap.data() as SavedTravelSession) : null
  } catch (error) {
    console.error("[travel-firestore] Failed to fetch session:", error)
    return null
  }
}

// ─── Itinerary persistence ────────────────────────────────────────────────────

export interface SavedItinerary {
  itineraryId: string
  destination: string
  city: string
  budget: string
  travelDates?: { start: string; end: string }
  totalDays: number
  totalEstimatedCost: number
  days: any[]
  createdAt: number
}

/**
 * Persist a generated itinerary to Firestore (collection: itineraries).
 * Returns the itineraryId or null on failure. Never throws.
 */
export async function saveItinerary(
  data: Omit<SavedItinerary, "itineraryId" | "createdAt">
): Promise<string | null> {
  if (!isFirebaseInitialized || !firestore) {
    console.warn("[travel-firestore] Firestore not initialized — itinerary not saved")
    return null
  }

  if (!isUserAuthenticated()) {
    console.warn("[travel-firestore] User not authenticated — itinerary not saved")
    return null
  }

  const itineraryId = `itin_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const record: SavedItinerary = { itineraryId, createdAt: Date.now(), ...data }

  try {
    await setDoc(doc(firestore, "itineraries", itineraryId), record)
    console.log("[travel-firestore] Itinerary saved:", itineraryId)
    return itineraryId
  } catch (error) {
    console.error("[travel-firestore] Failed to save itinerary:", error)
    return null
  }
}
