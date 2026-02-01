# Deploy Backend to Railway

## 1. Create Railway Project

1. Go to [railway.app](https://railway.app) and sign in (GitHub recommended)
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your `CTCHack` repo
4. When prompted, set **Root Directory** to `chlapp/backend`

## 2. Add MongoDB (Railway Plugin - Recommended)

Using Railway's built-in MongoDB avoids SSL/TLS issues with external providers.

1. In your Railway project, click **+ New** → **Database** → **MongoDB**
2. Railway creates a MongoDB instance and provides connection variables
3. In your backend service → **Variables** → **Add Reference**:
   - Reference `MONGO_URL` from the MongoDB service as `MONGODB_URL`
   - Or copy the connection string directly

The connection string looks like:
```
mongodb://mongo:password@mongodb.railway.internal:27017
```

## 3. Set Other Environment Variables

In Railway → your backend service → **Variables** tab, add:

| Variable | Value | Required |
|----------|-------|----------|
| `MONGODB_URL` | (reference from MongoDB service or paste directly) | ✅ |
| `DATABASE_NAME` | `chl_datastore_db` (or your preferred name) | ✅ |
| `LLM_API_KEY` | Your OpenAI API key | ✅ |
| `LLM_MODEL` | `gpt-4` or `gpt-3.5-turbo` | Optional |
| `CORS_ORIGINS` | `https://chlapp.vercel.app` (your Vercel URL) | ✅ |

### MongoDB: Local vs Railway

| Environment | MONGODB_URL | Where to set |
|-------------|-------------|--------------|
| **Local** | `mongodb://localhost:27017` | `.env` (or default) |
| **Railway** | Railway MongoDB URL | Railway → Variables (reference) |

### Alternative: MongoDB Atlas

If you prefer MongoDB Atlas over Railway's MongoDB:

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) → Create free cluster
2. Create a database user (username + password)
3. Network Access → Add `0.0.0.0/0` (allow from anywhere)
4. Connect → Drivers → Copy the connection string
5. Add as `MONGODB_URL` in Railway Variables

**Note:** Atlas may have SSL/TLS compatibility issues with some container environments.

## 3. Deploy

Railway auto-deploys when you push to your repo. After the first deploy:

1. Go to **Settings** → **Networking** → **Generate Domain**
2. Copy the public URL (e.g. `https://chlapp-backend.up.railway.app`)

## 4. Update Vercel Frontend

1. Go to Vercel → your project → **Settings** → **Environment Variables**
2. Set `VITE_API_URL` to your Railway URL (no trailing slash):
   ```
   https://chlapp-backend.up.railway.app
   ```
3. **Redeploy** the frontend

## 5. Verify

Visit your Railway URL:
- `https://your-app.up.railway.app/` → Should show welcome message
- `https://your-app.up.railway.app/health` → Should show `{"status": "healthy"}`
- `https://your-app.up.railway.app/docs` → FastAPI Swagger docs

## Troubleshooting

### Health check fails ("service unavailable")

The app now starts even if MongoDB fails, so the deployment should succeed. Check **Logs** in Railway:

- **"Failed to connect to MongoDB"** → Fix `MONGODB_URL` in Variables:
  - MongoDB Atlas: Add `0.0.0.0/0` under Network Access
  - Check connection string format and password (URL-encode special chars)
  - Redeploy after fixing

- **"Detected Node"** → Set Root Directory to `chlapp/backend` in Settings → Source

### Build fails
- Check Railway build logs for errors
- Ensure `requirements.txt` has all dependencies

### App crashes on start
- Check **Logs** in Railway dashboard
- Verify `MONGODB_URL` is correct and accessible
- Verify `LLM_API_KEY` is set if your app requires it at startup

### CORS errors in browser
- Add your Vercel URL to `CORS_ORIGINS` in Railway
- Include both production and preview URLs:
  ```
  https://chlapp.vercel.app,https://chlapp-*.vercel.app
  ```

### Database connection fails
- MongoDB Atlas: ensure Network Access allows `0.0.0.0/0`
- Check the connection string format (especially the password)
