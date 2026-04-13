import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from '../config/firebase'
import { clearUserAndHabitIds } from '../utils/userStorage'

const AuthContext = createContext(null)

/** Survives redirect better than sessionStorage; used to detect failed redirect completion. */
const REDIRECT_ATTEMPT_KEY = 'chlapp_firebase_redirect_attempt'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [signInError, setSignInError] = useState(null)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    let unsubscribe = () => {}
    let cancelled = false

    ;(async () => {
      try {
        await getRedirectResult(auth)
        try {
          localStorage.removeItem(REDIRECT_ATTEMPT_KEY)
        } catch {
          /* ignore */
        }
        if (!cancelled) setSignInError(null)
      } catch (err) {
        const msg = err?.message ?? String(err)
        const benign =
          msg.includes('missing initial state') ||
          msg.includes('Missing initial state')
        if (benign) {
          try {
            if (localStorage.getItem(REDIRECT_ATTEMPT_KEY)) {
              localStorage.removeItem(REDIRECT_ATTEMPT_KEY)
              if (!cancelled) {
                setSignInError(
                  'Google sign-in could not finish (browser blocked storage during redirect). Allow popups for this site and try again, or use a browser with less strict tracking protection.'
                )
              }
            }
          } catch {
            /* ignore */
          }
        } else {
          console.warn('[Auth] getRedirectResult:', err?.code, msg)
        }
      }

      if (cancelled) return

      unsubscribe = onAuthStateChanged(auth, (u) => {
        setUser(u)
        setLoading(false)
        if (u) setSignInError(null)
      })
    })()

    return () => {
      cancelled = true
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
      await signInWithPopup(auth, provider)
    } catch (e) {
      const code = e?.code ?? ''
      if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
        try {
          localStorage.setItem(REDIRECT_ATTEMPT_KEY, String(Date.now()))
        } catch {
          /* ignore */
        }
        await signInWithRedirect(auth, provider)
        return
      }
      if (code === 'auth/cancelled-popup-request' || code === 'auth/popup-closed-by-user') {
        return
      }
      console.error('[Auth] Google sign-in failed:', code, e?.message)
      setSignInError(
        code === 'auth/unauthorized-domain'
          ? 'This domain is not allowed in Firebase. Add it under Authentication → Settings → Authorized domains.'
          : e?.message || 'Sign-in failed. Try again or allow popups for this site.'
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
