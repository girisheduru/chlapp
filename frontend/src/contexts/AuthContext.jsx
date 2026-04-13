import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { Capacitor } from '@capacitor/core'
import { auth } from '../config/firebase'
import { clearUserAndHabitIds } from '../utils/userStorage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [signInError, setSignInError] = useState(null)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }
    getRedirectResult(auth).catch(() => {})

    const safetyMs = 15000
    const safety = globalThis.setTimeout(() => {
      setLoading(false)
      if (import.meta.env.DEV) {
        console.debug(
          '[Auth] Unblocking loading before Firebase auth resolved (slow in some WebViews). Session still applies when ready.'
        )
      }
    }, safetyMs)
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      globalThis.clearTimeout(safety)
      setUser(u)
      setLoading(false)
      if (u) setSignInError(null)
    })
    return () => {
      globalThis.clearTimeout(safety)
      unsubscribe()
    }
  }, [])

  const clearSignInError = useCallback(() => setSignInError(null), [])

  const signInWithGoogle = useCallback(async () => {
    if (!auth) {
      setSignInError('Firebase auth is not configured (missing VITE_FIREBASE_* in .env).')
      return
    }
    setSignInError(null)
    const provider = new GoogleAuthProvider()
    try {
      if (Capacitor.isNativePlatform()) {
        await signInWithRedirect(auth, provider)
        return
      }
      try {
        await signInWithPopup(auth, provider)
      } catch (e) {
        if (e?.code === 'auth/popup-blocked' || e?.code === 'auth/operation-not-supported-in-this-environment') {
          await signInWithRedirect(auth, provider)
          return
        }
        throw e
      }
    } catch (e) {
      const code = e?.code ?? ''
      const msg = e?.message ?? String(e)
      console.error('[Auth] Google sign-in failed:', code, msg)
      setSignInError(
        code === 'auth/unauthorized-domain'
          ? 'This domain is not allowed in Firebase. Add it under Authentication → Settings → Authorized domains.'
          : msg || 'Sign-in failed. Check the browser console or try again.'
      )
    }
  }, [])

  const signOut = useCallback(async () => {
    if (!auth) return
    await firebaseSignOut(auth)
    clearUserAndHabitIds()
  }, [])

  const getIdToken = useCallback(async (forceRefresh = false) => {
    if (!user) return null
    return user.getIdToken(forceRefresh)
  }, [user])

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut,
    getIdToken,
    isFirebaseConfigured: !!auth,
    signInError,
    clearSignInError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
