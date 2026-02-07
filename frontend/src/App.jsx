import { useEffect, useRef } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { setApiTokenGetter, setOnUnauthorized } from './services/api'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import { LoginGate } from './components/LoginGate'
import { CheckInRouteGuard } from './components/CheckInRouteGuard'
import { ReflectionRouteGuard } from './components/ReflectionRouteGuard'
import { colors, fonts } from './constants/designTokens'
import './App.css'

function App() {
  const navigate = useNavigate()
  const { user, loading, signInWithGoogle, signOut, getIdToken, isFirebaseConfigured } = useAuth()
  const prevUserRef = useRef(null)

  useEffect(() => {
    setApiTokenGetter(getIdToken)
  }, [getIdToken])

  useEffect(() => {
    setOnUnauthorized(() => {
      signOut()
    })
  }, [signOut])

  // After login, always land on Home (not check-in or other page)
  useEffect(() => {
    if (user && prevUserRef.current === null) {
      navigate('/', { replace: true })
    }
    prevUserRef.current = user
  }, [user, navigate])

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: colors.background,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: fonts.body,
          color: colors.textMuted,
        }}
      >
        Loading…
      </div>
    )
  }

  if (isFirebaseConfigured && !user) {
    return (
      <LoginGate
        onSignIn={async () => {
          await signInWithGoogle()
          // No navigate: when onAuthStateChanged sets user, we re-render and show the app
        }}
      />
    )
  }

  return (
    <div className="App" style={{ minHeight: '100vh', background: colors.background }}>
      <div style={{ paddingTop: 24 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/checkin" element={<CheckInRouteGuard />} />
          <Route path="/reflect" element={<ReflectionRouteGuard />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
