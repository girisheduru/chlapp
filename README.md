# CHL App

A full-stack habit tracking application combining a FastAPI backend with MongoDB and a React frontend with Vite.

## Architecture

```
chlapp/
├── backend/          # FastAPI application
│   ├── app/         # Application code
│   ├── requirements.txt
│   └── .env         # Environment variables
├── frontend/        # React application
│   ├── src/         # Source code
│   ├── package.json
│   └── vite.config.js
└── README.md        # This file
```

## Features

### Backend (FastAPI)
- ✅ FastAPI framework with async support
- ✅ MongoDB integration using Motor
- ✅ RESTful API endpoints for habits, streaks, and reflections
- ✅ LLM service integration
- ✅ CORS enabled for frontend integration
- ✅ Comprehensive error handling

### Frontend (React)
- ✅ React 18 with Vite
- ✅ React Router for navigation
- ✅ Onboarding flow (8 steps)
- ✅ Daily check-in interface
- ✅ Reusable component library
- ✅ Design system with tokens

## Prerequisites

- **Python 3.11+** (for backend)
- **Node.js 18+** (for frontend)
- **MongoDB** (local or Atlas)

## Quick Start

### 1. Clone and Setup

```bash
cd chlapp
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env  # If exists, or create .env
# Edit .env and set:
# MONGODB_URL=mongodb://localhost:27017
# DATABASE_NAME=chl_datastore_db
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install
```

### 4. Start MongoDB

**macOS (Homebrew):**
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

**Option 1: Run separately (recommended for development)**

Terminal 1 - Backend:
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

**Option 2: Use the startup scripts**

```bash
# Make scripts executable (macOS/Linux)
chmod +x scripts/start-backend.sh
chmod +x scripts/start-frontend.sh

# Run backend
./scripts/start-backend.sh

# Run frontend (in another terminal)
./scripts/start-frontend.sh
```

## Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs (Swagger)**: http://localhost:8000/docs
- **API Docs (ReDoc)**: http://localhost:8000/redoc

## API Endpoints

### Habits
- `GET /api/v1/habits` - Get all habits
- `POST /api/v1/habits` - Create a new habit
- `GET /api/v1/habits/{habit_id}` - Get habit by ID
- `PUT /api/v1/habits/{habit_id}` - Update habit
- `DELETE /api/v1/habits/{habit_id}` - Delete habit

### Streaks
- `GET /api/v1/streaks` - Get all streaks
- `POST /api/v1/streaks` - Create a new streak
- `GET /api/v1/streaks/{streak_id}` - Get streak by ID

### Reflections
- `GET /api/v1/reflections` - Get all reflections
- `POST /api/v1/reflections` - Create a new reflection
- `GET /api/v1/reflections/{reflection_id}` - Get reflection by ID

### Health
- `GET /health` - Health check endpoint
- `GET /` - Root endpoint with API info

## Frontend Routes

- `/` or `/onboarding` - Onboarding flow (8 steps)
- `/checkin` - Daily check-in interface

## Development

### Backend Development

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

The backend will auto-reload on code changes.

### Frontend Development

```bash
cd frontend
npm run dev
```

The frontend will hot-reload on code changes.

### Building for Production

**Backend:**
No build step needed. Deploy with:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist/`.

## Environment Variables

### Backend (.env)

```env
# MongoDB
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=chl_datastore_db

# LLM (optional)
LLM_API_KEY=your_api_key_here
LLM_MODEL=gpt-4
LLM_TEMPERATURE=0.7
LLM_MAX_TOKENS=1000

# Application
APP_NAME=CHL App
APP_VERSION=1.0.0
DEBUG=false
```

### Frontend

The frontend uses Vite's proxy configuration to connect to the backend API. No environment variables needed for development.

## Project Structure

### Backend Structure
```
backend/
├── app/
│   ├── core/           # Configuration
│   ├── models/         # Database models
│   ├── routers/       # API route handlers
│   ├── services/      # Business logic
│   ├── utils/         # Utility functions
│   ├── database.py    # MongoDB connection
│   ├── main.py        # FastAPI app
│   └── schemas.py     # Pydantic models
├── requirements.txt
└── .env
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── constants/     # Design tokens
│   ├── data/          # Static data
│   ├── pages/         # Page components
│   ├── App.jsx        # Main app
│   └── main.jsx       # Entry point
├── package.json
└── vite.config.js
```

## Technology Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Motor** - Async MongoDB driver
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server

### Frontend
- **React** 18.2 - UI library
- **Vite** 5.0 - Build tool
- **React Router** 6.20 - Routing
- **ESLint** - Code linting

## Troubleshooting

### MongoDB Connection Issues

1. Verify MongoDB is running:
   ```bash
   # macOS
   brew services list
   
   # Linux
   sudo systemctl status mongod
   
   # Docker
   docker ps
   ```

2. Test connection:
   ```bash
   mongosh
   # Or: mongo (older versions)
   ```

### Port Already in Use

If port 8000 or 3000 is already in use:

**Backend:**
```bash
uvicorn app.main:app --reload --port 8001
```

**Frontend:**
Update `vite.config.js`:
```js
server: {
  port: 3001,
  // ...
}
```

### CORS Issues

If you see CORS errors, ensure:
1. Backend CORS middleware is configured (already done)
2. Frontend is using the proxy in `vite.config.js`
3. API calls use `/api` prefix (proxied to backend)

## License

MIT
