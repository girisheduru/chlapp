/**
 * Firebase app and auth. Configure via VITE_FIREBASE_* env vars (see .example.env).
 * Uses getAuth (default browser persistence). Custom initializeAuth + persistence caused auth/argument-error
 * with getRedirectResult in some environments.
 */
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
}

let appInstance = null
let authInstance = null

if (
  firebaseConfig.projectId &&
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain?.trim()
) {
  appInstance = initializeApp(firebaseConfig)
  authInstance = getAuth(appInstance)
}

export const app = appInstance
export const auth = authInstance
