"use client"

import { getApp, getApps, initializeApp } from "firebase/app"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"

const firebaseConfig = {
  apiKey:        process.env.NEXT_PUBLIC_FIREBASE_API_KEY         || "",
  authDomain:    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN     || "",
  projectId:     process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID      || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET  || "",
  appId:         process.env.NEXT_PUBLIC_FIREBASE_APP_ID          || "",
}

function getFirebaseApp() {
  return getApps().length ? getApp() : initializeApp(firebaseConfig)
}

/**
 * Uploads a file to Firebase Storage and returns the public download URL.
 * Path example: "avatars/{userId}/{filename}"
 */
export async function uploadToStorage(file: File, storagePath: string): Promise<string> {
  if (!firebaseConfig.storageBucket) {
    throw new Error(
      "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is not configured. " +
      "Add it to .env and enable Firebase Storage in the Firebase Console."
    )
  }

  const app     = getFirebaseApp()
  const storage = getStorage(app)
  const fileRef = ref(storage, storagePath)

  await uploadBytes(fileRef, file, { contentType: file.type })
  const url = await getDownloadURL(fileRef)
  return url
}

/**
 * Uploads a profile avatar for the given userId.
 * Returns the public download URL.
 */
export async function uploadAvatar(userId: number | string, file: File): Promise<string> {
  const ext  = file.name.split(".").pop()?.toLowerCase() || "jpg"
  const path = `avatars/${userId}/avatar_${Date.now()}.${ext}`
  return uploadToStorage(file, path)
}
