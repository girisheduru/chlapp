# CHL App Setup Guide

This guide will help you set up and run the CHL App full-stack application.

## Prerequisites Checklist

- [ ] Python 3.11 or higher installed
- [ ] Node.js 18 or higher installed
- [ ] MongoDB installed and running (or MongoDB Atlas account)
- [ ] Git installed

## Step-by-Step Setup

### 1. Verify Prerequisites

**Check Python:**
```bash
python3 --version
# Should show Python 3.11 or higher
```

**Check Node.js:**
```bash
node --version
# Should show v18 or higher
npm --version
```

**Check MongoDB:**
```bash
# macOS
brew services list | grep mongodb

# Linux
sudo systemctl status mongod

# Or test connection
mongosh
```

### 2. Backend Setup

```bash
cd chlapp/backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=chl_datastore_db
APP_NAME=CHL App
APP_VERSION=1.0.0
DEBUG=false
EOF

# Edit .env if needed (e.g., for MongoDB Atlas)
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install
```

### 4. Start MongoDB

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Docker:**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 5. Run the Application

**Option A: Using Scripts (Recommended)**

```bash
# Terminal 1 - Backend
cd chlapp
./scripts/start-backend.sh

# Terminal 2 - Frontend
cd chlapp
./scripts/start-frontend.sh
```

**Option B: Manual Start**

```bash
# Terminal 1 - Backend
cd chlapp/backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd chlapp/frontend
npm run dev
```

**Option C: Start All (macOS/Linux with GUI)**

```bash
cd chlapp
./scripts/start-all.sh
```

### 6. Verify Installation

1. **Backend Health Check:**
   - Open: http://localhost:8000/health
   - Should return: `{"status": "healthy", "service": "CHL App"}`

2. **Backend API Docs:**
   - Open: http://localhost:8000/docs
   - Should show Swagger UI

3. **Frontend:**
   - Open: http://localhost:3000
   - Should show the React application

## Troubleshooting

### MongoDB Connection Issues

**Problem:** Backend can't connect to MongoDB

**Solutions:**
1. Verify MongoDB is running:
   ```bash
   mongosh
   # Should connect successfully
   ```

2. Check MongoDB URL in `.env`:
   ```env
   MONGODB_URL=mongodb://localhost:27017
   ```

3. For MongoDB Atlas, use:
   ```env
   MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/
   ```

### Port Already in Use

**Problem:** Port 8000 or 3000 is already in use

**Solutions:**

**Backend (change port):**
```bash
uvicorn app.main:app --reload --port 8001
```

**Frontend (update vite.config.js):**
```js
server: {
  port: 3001,
  // ...
}
```

### Python Virtual Environment Issues

**Problem:** `source venv/bin/activate` doesn't work

**Solutions:**
1. Make sure you're in the backend directory
2. Verify venv exists: `ls -la venv/`
3. On Windows, use: `venv\Scripts\activate`

### Node Modules Issues

**Problem:** Frontend dependencies not installing

**Solutions:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors

**Problem:** Frontend can't connect to backend API

**Solutions:**
1. Verify backend CORS is configured (already done in `app/main.py`)
2. Check Vite proxy configuration in `vite.config.js`
3. Ensure API calls use `/api` prefix (proxied automatically)

## Development Workflow

### Making Backend Changes

1. Backend auto-reloads with `--reload` flag
2. Check terminal for errors
3. Test endpoints at http://localhost:8000/docs

### Making Frontend Changes

1. Frontend hot-reloads automatically
2. Check browser console for errors
3. Changes appear immediately in browser

### API Integration

Use the API service in `frontend/src/services/api.js`:

```js
import { habitsAPI } from '../services/api';

// Get all habits
const habits = await habitsAPI.getAll();

// Create a habit
const newHabit = await habitsAPI.create({
  name: 'Exercise',
  description: 'Daily workout'
});
```

## Next Steps

- [ ] Review API endpoints at http://localhost:8000/docs
- [ ] Explore the frontend routes
- [ ] Integrate API calls in frontend components
- [ ] Set up MongoDB Atlas for production
- [ ] Configure environment variables for production

## Getting Help

- Check the main [README.md](./README.md) for detailed documentation
- Review API documentation at http://localhost:8000/docs
- Check backend logs in terminal
- Check browser console for frontend errors
