import { useEffect, useRef } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { createNewHabitId } from './utils/userStorage'
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
  const location = useLocation()
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
    <div className="App">
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #e0e0e0',
        padding: '12px 20px',
        zIndex: 1000,
        display: 'flex',
        gap: '12px',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <Link
          to="/"
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            textDecoration: 'none',
            background: location.pathname === '/' ? '#4A7C59' : 'transparent',
            color: location.pathname === '/' ? 'white' : '#3D3229',
            fontWeight: location.pathname === '/' ? 600 : 400,
            transition: 'all 0.2s'
          }}
        >
          Home
        </Link>
        <Link
          to={`/onboarding?habitId=${encodeURIComponent(createNewHabitId())}`}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            textDecoration: 'none',
            background: location.pathname === '/onboarding' ? '#4A7C59' : 'transparent',
            color: location.pathname === '/onboarding' ? 'white' : '#3D3229',
            fontWeight: location.pathname === '/onboarding' ? 600 : 400,
            transition: 'all 0.2s'
          }}
        >
          Add habit
        </Link>
        {isFirebaseConfigured && !loading && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
            {user ? (
              <>
                <span style={{ fontSize: '14px', color: '#3D3229' }}>
                  {user.displayName ?? user.email ?? user.uid}
                </span>
                <button
                  type="button"
                  onClick={() => signOut()}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0',
                    background: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#3D3229'
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => signInWithGoogle()}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1px solid #4A7C59',
                  background: '#4A7C59',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Sign in with Google
              </button>
            )}
          </div>
        )}
      </nav>

      <div style={{ marginTop: '60px' }}>
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
