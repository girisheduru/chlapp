import { Routes, Route, Link, useLocation } from 'react-router-dom'
import DailyCheckIn from './pages/DailyCheckIn'
import Onboarding from './pages/Onboarding'
import './App.css'

function App() {
  const location = useLocation()

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
        justifyContent: 'center'
      }}>
        <Link
          to="/onboarding"
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
          Onboarding
        </Link>
        <Link
          to="/checkin"
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            textDecoration: 'none',
            background: location.pathname === '/checkin' ? '#4A7C59' : 'transparent',
            color: location.pathname === '/checkin' ? 'white' : '#3D3229',
            fontWeight: location.pathname === '/checkin' ? 600 : 400,
            transition: 'all 0.2s'
          }}
        >
          Daily Check-In
        </Link>
      </nav>

      <div style={{ marginTop: '60px' }}>
        <Routes>
          <Route path="/" element={<Onboarding />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/checkin" element={<DailyCheckIn />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
