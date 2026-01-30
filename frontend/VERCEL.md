# Deploy Chlapp on Vercel

## If you get 404 / NOT_FOUND on all routes

1. **Check Root Directory** (Settings → General)
   - Set to **`chlapp/frontend`** (recommended) — Vercel will use this folder’s `vercel.json`.
   - Or set to **`chlapp`** — Vercel will use `chlapp/vercel.json`.
   - Or leave **blank** (repo root) — Vercel will use the root `vercel.json`.

2. **Reset build overrides** (Settings → Build & Development Settings)
   - Turn OFF any override for:
     - Install Command
     - Build Command  
     - Output Directory
   - Let the `vercel.json` in use control these.

3. **Confirm deployment**
   - Redeploy and inspect the latest build logs.
   - If the build fails or shows warnings, fix those first.

## Configuration by Root Directory

| Root Directory     | Config used            | Output location        |
|--------------------|------------------------|------------------------|
| `chlapp/frontend`  | `chlapp/frontend/vercel.json` | `dist`          |
| `chlapp`           | `chlapp/vercel.json`   | `frontend/dist`        |
| (blank)            | root `vercel.json`     | `chlapp/frontend/dist` |

## Backend (required for API)

- Host the backend elsewhere (e.g. Railway, Render).
- Add `VITE_API_URL` in Vercel (Settings → Environment Variables), e.g. `https://your-api.railway.app`.
- Ensure backend CORS includes your Vercel URL.
