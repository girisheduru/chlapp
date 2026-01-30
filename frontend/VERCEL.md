# Vercel deployment

## Fix for NOT_FOUND (404) on client routes

`vercel.json` in this folder configures **rewrites** so that paths like `/checkin` and `/onboarding` are served `index.html` instead of returning 404. The React app then loads and React Router shows the correct page.

- **Rewrite used:** `/((?!api/).*)` → `/index.html`  
  So any path that does **not** start with `api/` is served the SPA shell; `/api/*` is left for your backend or future serverless functions.

## Vercel project settings

If the Vercel project root is this repo (e.g. `CTCHack` or `chlapp`):

1. **Root Directory:** `frontend` (or `chlapp/frontend` if deploying from `CTCHack`).
2. **Build Command:** `npm run build`
3. **Output Directory:** `dist` (Vite default)

If the project root is already set to `frontend`, the defaults are usually correct.

## Backend / API in production

The app uses relative URLs like `/api/v1/...`. On Vercel you only deploy the frontend, so:

- Either host the backend elsewhere (e.g. Railway) and set an env var such as `VITE_API_URL` and use it in `api.js` as the base URL in production.
- Or add a rewrite in `vercel.json` to proxy `/api` to your backend (add it **before** the SPA rewrite).
