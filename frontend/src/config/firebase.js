/**
 * Firebase app and auth. Configure via VITE_FIREBASE_* env vars (see .example.env).
 * Uses IndexedDB + local persistence so auth survives refreshes; pairs with getRedirectResult in AuthContext.
 */
import { initializeApp } from 'firebase/app'
import {
  getAuth,
  initializeAuth,
  browserLocalPersistence,
  indexedDBLocalPersistence,
} from 'firebase/auth'

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

if (firebaseConfig.projectId && firebaseConfig.apiKey) {
  appInstance = initializeApp(firebaseConfig)
  try {
    authInstance = initializeAuth(appInstance, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence],
    })
  } catch (e) {
    if (e?.code === 'auth/already-initialized') {
      authInstance = getAuth(appInstance)
    } else {
      throw e
    }
  }
}

export const app = appInstance
export const auth = authInstance
