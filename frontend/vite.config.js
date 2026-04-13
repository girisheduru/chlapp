import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Always resolve to the frontend/ folder (this file lives here), not process.cwd().
// Otherwise `vite build` from another directory loads the wrong .env and embeds an empty VITE_API_URL in Capacitor.
const frontendDir = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  root: frontendDir,
  envDir: frontendDir,
  // Relative base so Capacitor WebView loads JS/CSS from bundled assets (web + Vercel still work).
  base: './',
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
