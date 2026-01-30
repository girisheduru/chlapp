# Deploy Chlapp on Vercel

## If you get NOT_FOUND (404)

Vercel’s **NOT_FOUND** means the requested resource doesn’t exist on the deployment. For this app, it usually comes from one of two places:

| Cause | What you see | Fix |
|-------|----------------|-----|
| **SPA routes** | 404 on `/checkin`, `/onboarding` (or any path except `/`) | Set **Root Directory** and ensure rewrites in `vercel.json` (see below). |
| **API calls** | 404 on `/api/v1/*` or “NOT_FOUND” in network/console when the app loads data | Set **VITE_API_URL** in Vercel env to your backend URL (e.g. `https://your-api.railway.app`). |

Check the browser **Network** tab: if the failing request is to your Vercel domain (e.g. `your-app.vercel.app/api/v1/...`), the API fix applies. If the failing request is a page navigation (e.g. opening `your-app.vercel.app/checkin`), the SPA fix applies.

---

## If you get 404 / NOT_FOUND on all routes (SPA)

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
