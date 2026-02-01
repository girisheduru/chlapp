# Chlapp Deployment Guide

Chlapp has two parts: **frontend** (React/Vite) and **backend** (Python/FastAPI + MongoDB). They deploy to different platforms.

## Architecture

| Part | Tech | Deploy to | Notes |
|------|------|-----------|-------|
| **Frontend** | React, Vite | **Vercel** | SPA, static build |
| **Backend** | FastAPI, MongoDB | **Railway, Render, or Fly.io** | Requires DB, env vars |

Vercel does **not** run the backend. Deploy the frontend to Vercel and the backend to a service that supports Python + MongoDB.

---

## 1. Deploy Frontend to Vercel

### Import the repo

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**
2. Import your GitHub repo
3. Configure:

| Setting | Value |
|---------|--------|
| **Root Directory** | `chlapp` (or `chlapp/frontend` — see below) |
| **Framework Preset** | Other (or leave default) |
| **Build Command** | *(leave empty — uses vercel.json)* |
| **Output Directory** | *(leave empty — uses vercel.json)* |

### Root Directory options

**Option A: `chlapp`** (recommended)
- Uses `chlapp/vercel.json`
- Builds frontend from `frontend/`, outputs to `frontend/dist`

**Option B: `chlapp/frontend`**
- Uses `chlapp/frontend/vercel.json`
- Simpler layout; build runs in frontend folder

### Environment variables

Add in Vercel → **Settings** → **Environment Variables**:

| Name | Value | Notes |
|------|-------|-------|
| `VITE_API_URL` | `https://your-backend-url.railway.app` | Backend origin, no trailing slash |

Without this, the frontend will try to call `/api/v1/...` on the same domain and get 404.

### After deploy

Your frontend will be at `https://your-project.vercel.app`. Test `/`, `/checkin`, `/onboarding`.

---

## 2. Deploy Backend (Railway, Render, or Fly.io)

The backend needs:
- Python 3.10+
- MongoDB (e.g. MongoDB Atlas)
- Environment variables (see `backend/.example.env`)

### Example: Railway

1. Create a Railway project
2. Add a service from your repo, set **Root Directory** to `chlapp/backend`
3. Set environment variables (MongoDB URI, CORS, etc.)
4. Deploy and copy the public URL
5. Use that URL as `VITE_API_URL` in Vercel

### CORS

Add your Vercel URL(s) to the backend’s CORS settings:

```
CORS_ORIGINS=https://your-project.vercel.app,https://your-project-*.vercel.app
```

---

## Troubleshooting 404 on Vercel

If you get 404 on all routes:

1. **Root Directory**  
   Set to `chlapp` or `chlapp/frontend` — do not leave blank if the repo root is different.

2. **No build overrides**  
   In **Settings** → **Build & Development Settings**, ensure no overrides for Install/Build/Output. Let `vercel.json` control these.

3. **Build logs**  
   Check **Deployments** → latest build logs to confirm:
   - `npm install` and `npm run build` run successfully
   - Output includes `index.html` and `assets/`

4. **Redeploy**  
   After changing settings, redeploy (not just a new commit).
