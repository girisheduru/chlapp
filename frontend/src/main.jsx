import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Capacitor } from '@capacitor/core'
import { AuthProvider } from './contexts/AuthContext'
import App from './App.jsx'
import './index.css'

if (Capacitor.isNativePlatform()) {
  void import('@capacitor/app').then(({ App }) => {
    void App.addListener('backButton', () => {
      window.history.back()
    })
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
)
