# Clear Habit Lab

A full-stack habit tracking application combining a FastAPI backend with MongoDB and a React frontend with Vite. The app helps users build and maintain habits through an onboarding flow, daily check-ins with streak tracking, and AI-powered reflection insights.

## Architecture

```
chlapp/
├── backend/          # FastAPI application
│   ├── app/         # Application code
│   │   ├── core/    # Configuration, auth, Firebase, logging
│   │   ├── models/  # Pydantic models (habit, streak, reflection)
│   │   ├── routers/ # API route handlers
│   │   ├── services/# Business logic layer
│   │   ├── utils/   # Utility functions (prompts)
│   │   ├── database.py    # MongoDB connection
│   │   └── main.py       # FastAPI app entry point
│   ├── requirements.txt
│   ├── .example.env
│   └── README.md
├── frontend/        # React application
│   ├── src/
│   │   ├── components/  # Reusable UI components (21 components)
│   │   ├── config/      # Firebase configuration
│   │   ├── constants/   # Design tokens and animations
│   │   ├── contexts/    # React contexts (AuthContext)
│   │   ├── data/        # Static data (onboarding, check-in options)
│   │   ├── pages/       # Page components (Home, Onboarding, DailyCheckIn, Reflection)
│   │   ├── services/    # API service layer
│   │   ├── utils/       # Utilities (userStorage, dateUtils)
│   │   ├── App.jsx      # Main app component with routing
│   │   └── main.jsx     # Entry point
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
├── scripts/         # Startup scripts
│   ├── start-backend.sh
│   ├── start-frontend.sh
│   └── start-all.sh
└── README.md        # This file
```

## Features

### Backend (FastAPI)
- ✅ FastAPI framework with async support
- ✅ MongoDB integration using Motor (async driver)
- ✅ Firebase Authentication (optional - skipped for local dev)
- ✅ Service layer architecture (habit_service, streak_service, llm_service, reflection_agent_service)
- ✅ RESTful API endpoints for habits, streaks, and reflections
- ✅ LLM service integration for generating habit options, identities, cues, and reflection insights
- ✅ LangChain ReAct agent with optional Tavily web search for James Clear / Atomic Habits content
- ✅ Opik integration for LLM observability and tracing (optional)
- ✅ CORS enabled for frontend integration (supports Vercel preview URLs)
- ✅ Comprehensive error handling and logging
- ✅ Automatic database index creation
- ✅ Data validation with Pydantic models
- ✅ Admin API endpoints with UID-based access control

### Frontend (React)
- ✅ React 18 with Vite
- ✅ React Router for navigation
- ✅ Firebase Authentication with Google Sign-In
- ✅ Home page with habit tiles and progress overview
- ✅ Onboarding flow (8 steps) with habit preference collection
- ✅ Daily check-in interface with streak tracking and stone jar visualization
- ✅ Reflection flow with AI-generated insights and experiment suggestions
- ✅ Route guards (CheckInRouteGuard, ReflectionRouteGuard)
- ✅ Reusable component library (21 components)
- ✅ Design system with tokens and animations
- ✅ LocalStorage integration for user/habit IDs
- ✅ API service layer with error handling and auth token injection

## Prerequisites

- **Python 3.11+** (for backend)
- **Node.js 18+** (for frontend)
- **MongoDB** (local or Atlas)
- **Firebase Project** (optional - for authentication)

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
cp .example.env .env
# Edit .env - see Environment Variables section below
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Set up environment variables (optional - for Firebase auth)
cp .example.env .env
# Edit .env with your Firebase config
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

All API endpoints are prefixed with `/api/v1`. Most endpoints require Firebase authentication (Bearer token).

### Habits

- `POST /api/v1/saveUserHabitPreference` - Save or update user habit preferences
- `GET /api/v1/GetUserHabitById` - Get habit by userId and habitId
- `GET /api/v1/getAllUserHabits` - Get all habits for authenticated user
- `POST /api/v1/generateIdentities` - Generate identity options using LLM
- `POST /api/v1/generateShortHabitOptions` - Generate short habit options using LLM
- `POST /api/v1/generateFullHabitOptions` - Generate full habit options using LLM
- `POST /api/v1/generateObviousCues` - Generate obvious cues using LLM

### Streaks

- `GET /api/v1/getUserHabitStreakById` - Get habit streak by userId and habitId
  - Returns: `StreakResponse` (currentStreak, longestStreak, totalStones, lastCheckInDate, checkInHistory)
- `POST /api/v1/updateUserHabitStreakById` - Update streak with check-in date
  - Increments streak for consecutive days, resets for missed days
  - Tracks check-in history as array of date strings

### Reflections

- `GET /api/v1/getReflectionInputs` - Get reflection inputs using LLM
- `GET /api/v1/getReflectionItems` - Get reflection items (insights, questions, experiment suggestions)
  - Uses LangChain ReAct agent with optional Tavily web search
  - Falls back to direct LLM if agent unavailable

### Admin

- `DELETE /api/v1/admin/habits/{habitId}` - Delete a habit (admin only)
- `DELETE /api/v1/admin/streaks/{habitId}` - Delete a streak (admin only)

### Health

- `GET /health` - Health check endpoint
- `GET /` - Root endpoint with API info

## Frontend Routes

- `/` or `/home` - Home page with habit tiles
- `/onboarding` - Onboarding flow (8 steps) with `?habitId=` query param
- `/checkin` - Daily check-in interface with `?habitId=` query param
- `/reflect` - Reflection flow with `?habitId=` query param

## Database Collections

### Habits Collection
- **Collection name**: `habits`
- **Fields**:
  - `userId` (string): Firebase UID
  - `habitId` (string): Format `habit_<timestamp>_<random>`
  - `preferences` (object): Contains onboarding data
    - `starting_idea`, `identity`, `enjoyment`, `starter_habit`, `full_habit`, `habit_stack`, `habit_environment`
  - `created_at` (datetime)
  - `updated_at` (datetime)

### Streaks Collection
- **Collection name**: `streaks`
- **Fields**:
  - `userId` (string): Firebase UID
  - `habitId` (string): Format `habit_<timestamp>_<random>`
  - `currentStreak` (int): Current consecutive days
  - `longestStreak` (int): Longest streak achieved
  - `totalStones` (int): Total stones collected
  - `lastCheckInDate` (datetime): Last check-in date
  - `checkInHistory` (array of strings): List of check-in dates in YYYY-MM-DD format
  - `createdAt` (datetime)
  - `updatedAt` (datetime)
- **Index**: Unique compound index on `(userId, habitId)`

### Reflections Collection
- **Collection name**: `reflections`
- **Fields**: User reflection data

## Services Architecture

### Backend Services

- **HabitService** (`app/services/habit_service.py`):
  - `save_habit_preference()`: Save or update habit preferences
  - `get_habit_by_id()`: Get habit by userId and habitId
  - `get_habit_context()`: Get habit context for LLM prompts
  - `get_all_user_habits()`: Get all habits for a user

- **StreakService** (`app/services/streak_service.py`):
  - `get_streak_by_id()`: Get streak by userId and habitId (returns defaults if not found)
  - `update_streak_by_checkin()`: Update streak based on check-in date with business logic

- **LLMService** (`app/services/llm_service.py`):
  - `generate_text()`: Generate text using LLM API
  - `generate_list()`: Generate list of items using LLM API
  - `generate_json()`: Generate structured JSON using LLM API

- **ReflectionAgentService** (`app/services/reflection_agent_service.py`):
  - LangChain ReAct agent for generating reflection insights
  - Optional Tavily web search for James Clear / Atomic Habits content
  - Falls back to direct LLM if dependencies unavailable

### Frontend Services

- **API Service** (`src/services/api.js`):
  - Centralized API client with error handling
  - Auth token injection via `setApiTokenGetter()`
  - Exports: `habitsAPI`, `streaksAPI`, `reflectionsAPI`, `healthAPI`

- **Auth Context** (`src/contexts/AuthContext.jsx`):
  - Firebase authentication state management
  - Google Sign-In integration
  - Token retrieval for API calls

- **User Storage** (`src/utils/userStorage.js`):
  - `createNewHabitId()`: Create new habitId
  - `getUserId()`, `getHabitId()`: Get IDs from localStorage
  - `clearUserAndHabitIds()`: Clear stored IDs on sign out

## Environment Variables

### Backend (.env)

```env
# MongoDB
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=chl_datastore_db

# LLM (OpenAI or compatible API)
LLM_API_KEY=your_api_key_here
LLM_MODEL=gpt-4
LLM_TEMPERATURE=0.7
LLM_MAX_TOKENS=1000
# LLM_API_BASE_URL=https://api.openai.com/v1  # Optional, for custom endpoints

# Tavily (optional - for reflection agent web search)
# TAVILY_API_KEY=your_tavily_key

# Opik (optional - LLM observability)
# OPIK_API_KEY=your_opik_key
# OPIK_WORKSPACE=your-workspace
OPIK_PROJECT_NAME=2026 Hackathon Opik
OPIK_ENABLED=false

# Firebase (optional - if missing, auth is skipped for local dev)
# FIREBASE_PROJECT_ID=your-project-id
# GOOGLE_APPLICATION_CREDENTIALS=firebase-service-account.json
# Or for production:
# GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account",...}

# Admin API
# ADMIN_UIDS=uid1,uid2

# CORS (for production)
# CORS_ORIGINS=https://your-app.vercel.app

# Application
APP_NAME=Clear Habit Lab
APP_VERSION=1.0.0
DEBUG=false
```

### Frontend (.env)

```env
# Firebase (optional - if not set, auth is disabled)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

## Frontend Components

### Pages (`src/pages/`)
- **Home** - Dashboard with habit tiles and progress overview
- **Onboarding** - 8-step onboarding flow for setting up habits
- **DailyCheckIn** - Daily habit check-in interface with streak display
- **Reflection** - AI-powered reflection flow with insights and experiments

### Components (`src/components/`)
- **ActionOption** - Selectable action option for check-in
- **AddHabitButton** - Button to add new habit
- **Button** - Styled button with variants
- **Card** - Container component with optional glow effect
- **CheckInRouteGuard** - Route guard for check-in page
- **Confetti** - Celebration confetti animation
- **HabitTile** - Habit card for home page
- **HeaderJarIcon** - Stone jar icon for header
- **InfoBox** - Information box with color variants
- **LoginGate** - Login screen component
- **MiniStoneJar** - Compact stone jar visualization
- **ProgressBar** - Progress indicator for multi-step flows
- **Quote** - Quote display component
- **ReflectionRouteGuard** - Route guard for reflection page
- **SelectableOption** - Generic selectable option component
- **SelectChip** - Multi-select chip component
- **StoneJar** - Visual stone jar component
- **StreakDisplay** - Streak counter display
- **SummaryRow** - Summary row for reflection
- **TodaysStone** - Today's stone indicator

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

## Deployment

- **Backend**: Railway (see `backend/RAILWAY.md`)
- **Frontend**: Vercel (see `frontend/VERCEL.md`)

## Technology Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Motor** - Async MongoDB driver
- **Pydantic** - Data validation and settings
- **Firebase Admin SDK** - Authentication
- **LangChain** - LLM orchestration
- **Tavily** - Web search API (optional)
- **Opik** - LLM observability (optional)
- **Uvicorn** - ASGI server

### Frontend
- **React** 18.2 - UI library
- **Vite** 5.0 - Build tool and dev server
- **React Router** 6.20 - Client-side routing
- **Firebase** - Authentication
- **ESLint** - Code linting

## Troubleshooting

See individual README files for detailed troubleshooting:
- `backend/README.md` - Backend-specific documentation
- `frontend/README.md` - Frontend-specific documentation
- `frontend/TROUBLESHOOTING.md` - Frontend troubleshooting guide

## License

MIT

## Additional Documentation

- `backend/README.md` - Backend-specific documentation
- `backend/RAILWAY.md` - Railway deployment guide
- `backend/VERIFY_STREAKS.md` - Streak collection verification guide
- `frontend/README.md` - Frontend-specific documentation
- `frontend/VERCEL.md` - Vercel deployment guide
- `frontend/GETTING_STARTED.md` - Getting started guide
- `frontend/STRUCTURE.md` - Frontend structure documentation
- `SETUP.md` - Detailed setup instructions
- `DEPLOYMENT.md` - Deployment documentation
- `CONTRIBUTING.md` - Contribution guidelines
