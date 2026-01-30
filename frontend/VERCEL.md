# Deploy Chlapp on Vercel

## What’s configured

- **`chlapp/vercel.json`** – Build and deploy the frontend from the `chlapp` folder:
  - Install and build run in `frontend/`
  - Output is `frontend/dist`
  - SPA rewrites so `/`, `/checkin`, `/onboarding` (and any non-`/api` path) serve `index.html` and React Router works.

- **`frontend/src/services/api.js`** – Uses `VITE_API_URL` in production so the frontend can call a backend hosted elsewhere.

## Deploy steps

1. **Connect the repo**  
   In Vercel: New Project → Import your repo.  
   Set **Root Directory** to `chlapp` (or leave as repo root if the repo root is already `chlapp`).

2. **Deploy**  
   Vercel will use `chlapp/vercel.json`. No need to set Build Command or Output Directory unless you want to override.

3. **Backend (required for API)**  
   The backend is Python/FastAPI and is not run on Vercel. Host it elsewhere (e.g. Railway, Render).

   In the Vercel project:
   - **Settings → Environment Variables**
   - Add: `VITE_API_URL` = your backend origin, e.g. `https://your-app.railway.app`  
     (no trailing slash)

   Redeploy so the frontend is built with this value. The app will call `{VITE_API_URL}/api/v1/...` in production.

4. **Backend CORS**  
   On the backend (Railway, etc.), set `CORS_ORIGINS` to your Vercel URL(s), e.g.  
   `CORS_ORIGINS=https://your-app.vercel.app,https://your-app-xxx.vercel.app`  
   so the browser allows requests from the Vercel frontend.

## Optional: deploy only the frontend as root

If you set **Root Directory** to `chlapp/frontend` in Vercel:

- Build uses the frontend `package.json` (default `npm run build`, output `dist`).
- `frontend/vercel.json` applies (same SPA rewrites).
- Still set `VITE_API_URL` in Vercel if you use an external backend.
