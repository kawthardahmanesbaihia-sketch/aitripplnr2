import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteField,
  onSnapshot,
} from 'firebase/firestore';
import { firestore, isFirebaseInitialized } from './firebase-config';

// Data interfaces
export interface FirebaseSession {
  sessionId: string;
  createdAt: number;
  // Legacy host object (kept for isHost check in context)
  host: {
    userId: string;
    username: string;
  };
  // New Firestore-native fields
  hostId: string;
  users: Array<{ id: string; name: string }>;
  mode: 'duo' | 'squad';
  status: 'waiting' | 'active' | 'completed';
  expiresAt: number;
  players: Record<string, FirebasePlayer>;
  preferences: SharedPreferences;
  lastModifiedBy: string;
  analysisResults: any | null;
  groupSize?: number;
}

export interface FirebasePlayer {
  userId: string;
  username: string;
  joinedAt: number;
  isReady: boolean;
  lastUpdated: number;
}

export interface SharedImageMetadata {
  tags: string[];
  mood?: string;
  climate?: string;
  environment?: string;
  activity_level?: string;
  food_style?: string;
  category?: string;
}

export interface SharedPreferences {
  destination?: string;
  dateRange?: { start: string; end: string };
  interests?: string[];
  budget?: string;
  travelType?: string;
  selectedCountry?: string | null;
  selectedDestinationIndex?: number | null;
  exploreLoading?: boolean;
  selectedImages?: string[];
  selectedImageMetadata?: SharedImageMetadata[];
  [key: string]: any;
}

// ID generators
export function generateSessionId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 12; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

export function generateUserId(): string {
  return 'user_' + Math.random().toString(36).substring(2, 11);
}

// Session CRUD
export async function createSession(
  hostUsername: string,
  groupSize?: number,
): Promise<{ sessionId: string; userId: string }> {
  if (!isFirebaseInitialized || !firestore) {
    throw new Error('Firebase not initialized. Cannot create session.');
  }

  const sessionId = generateSessionId();
  const userId   = generateUserId();
  const now      = Date.now();
  const resolvedGroupSize = groupSize || 4;
  const mode: 'duo' | 'squad' = resolvedGroupSize <= 2 ? 'duo' : 'squad';

  console.log('[session] Creating session…', { sessionId, host: hostUsername, mode });

  const sessionData: FirebaseSession = {
    sessionId,
    createdAt: now,
    host:      { userId, username: hostUsername },
    hostId:    userId,
    users:     [{ id: userId, name: hostUsername }],
    mode,
    status:    'waiting',
    expiresAt: now + 24 * 60 * 60 * 1000,
    players: {
      [userId]: {
        userId,
        username: hostUsername,
        joinedAt: now,
        isReady: false,
        lastUpdated: now,
      },
    },
    preferences:    {},
    lastModifiedBy: userId,
    analysisResults: null,
    groupSize:      resolvedGroupSize,
  };

  const sessionRef = doc(firestore, 'sessions', sessionId);

  // 15-second hard timeout — prevents the spinner hanging forever if Firestore
  // is unreachable or the project is misconfigured.
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Firestore write timed out after 15 s — check your Firebase project config and Firestore rules.')), 15_000)
  );

  console.log('[session] Firestore write started — sessionId:', sessionId);
  try {
    await Promise.race([setDoc(sessionRef, sessionData), timeout]);
    console.log('[session] Firestore write succeeded — sessionId:', sessionId, '| userId:', userId);
  } catch (err) {
    console.error('[session] Firestore write failed:', err);
    throw err;
  }

  // setDoc resolved without error → document exists; no extra getDoc round-trip needed.
  return { sessionId, userId };
}

export async function joinSession(
  sessionId: string,
  username: string,
): Promise<{ userId: string } | null> {
  if (!isFirebaseInitialized || !firestore) {
    console.warn('[session] Firebase not initialized. Cannot join session.');
    return null;
  }

  const userId = generateUserId();
  const now = Date.now();

  const sessionRef = doc(firestore, 'sessions', sessionId);
  const snapshot = await getDoc(sessionRef);

  if (!snapshot.exists()) {
    console.error('[session] Session not found:', sessionId);
    return null;
  }

  const data = snapshot.data() as FirebaseSession;

  if (data.status === 'completed') {
    console.error('[session] Session already completed, cannot join');
    return null;
  }

  await updateDoc(sessionRef, {
    [`players.${userId}`]: {
      userId,
      username,
      joinedAt: now,
      isReady: false,
      lastUpdated: now,
    },
    users: [...(data.users || []), { id: userId, name: username }],
    status: 'active',
    lastModifiedBy: userId,
  });

  console.log('[session] Joined session:', sessionId, '| userId:', userId);
  return { userId };
}

export async function leaveSession(sessionId: string, userId: string): Promise<void> {
  if (!isFirebaseInitialized || !firestore) {
    console.warn('[session] Firebase not initialized. Cannot leave session.');
    return;
  }

  const sessionRef = doc(firestore, 'sessions', sessionId);
  const snapshot = await getDoc(sessionRef);
  if (!snapshot.exists()) return;

  const data = snapshot.data() as FirebaseSession;
  const remainingPlayers = Object.keys(data.players || {}).filter((id) => id !== userId);

  if (remainingPlayers.length === 0) {
    await updateDoc(sessionRef, { status: 'completed' });
  } else {
    await updateDoc(sessionRef, {
      [`players.${userId}`]: deleteField(),
      users: (data.users || []).filter((u) => u.id !== userId),
      lastModifiedBy: userId,
    });
  }
}

export async function updateSessionPreferences(
  sessionId: string,
  userId: string,
  preferences: Partial<SharedPreferences>,
): Promise<void> {
  if (!isFirebaseInitialized || !firestore) {
    console.warn('[session] Firebase not initialized. Cannot update preferences.');
    return;
  }

  try {
    const updates: Record<string, any> = {
      lastModifiedBy: userId,
      [`players.${userId}.lastUpdated`]: Date.now(),
    };

    Object.keys(preferences).forEach((key) => {
      updates[`preferences.${key}`] = (preferences as any)[key];
    });

    await updateDoc(doc(firestore, 'sessions', sessionId), updates);
  } catch (error) {
    console.error('[session] Error updating preferences:', error);
    throw error;
  }
}

export async function setPlayerReady(
  sessionId: string,
  userId: string,
  isReady: boolean,
): Promise<void> {
  if (!isFirebaseInitialized || !firestore) {
    console.warn('[session] Firebase not initialized. Cannot set ready status.');
    return;
  }

  try {
    await updateDoc(doc(firestore, 'sessions', sessionId), {
      [`players.${userId}.isReady`]: isReady,
      [`players.${userId}.lastUpdated`]: Date.now(),
    });
  } catch (error) {
    console.error('[session] Error setting player ready status:', error);
    throw error;
  }
}

export async function getSessionData(sessionId: string): Promise<FirebaseSession | null> {
  try {
    if (!isFirebaseInitialized || !firestore) {
      console.warn('[session] Firebase not initialized when fetching session data');
      return null;
    }

    const snapshot = await getDoc(doc(firestore, 'sessions', sessionId));

    if (!snapshot.exists()) {
      console.log('[session] Session not found:', sessionId);
      return null;
    }

    return snapshot.data() as FirebaseSession;
  } catch (error) {
    console.error('[session] Error fetching session data:', error);
    return null;
  }
}

export function onSessionChange(
  sessionId: string,
  callback: (session: FirebaseSession | null) => void,
): (() => void) | null {
  if (!isFirebaseInitialized || !firestore) {
    console.warn('[session] Firebase not initialized. Cannot subscribe to session changes.');
    return null;
  }

  return onSnapshot(
    doc(firestore, 'sessions', sessionId),
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as FirebaseSession);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('[session] Firestore snapshot error:', error);
      callback(null);
    },
  );
}

export async function updateSessionAnalysis(
  sessionId: string,
  analysisResults: any,
): Promise<void> {
  if (!isFirebaseInitialized || !firestore) {
    console.warn('[session] Firebase not initialized. Cannot update session analysis.');
    return;
  }

  try {
    await updateDoc(doc(firestore, 'sessions', sessionId), {
      analysisResults,
      status: 'completed',
    });
    console.log('[session] Analysis results saved for session:', sessionId);
  } catch (error) {
    console.error('[session] Error updating session analysis:', error);
    throw error;
  }
}
