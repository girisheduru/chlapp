# CHL App

A full-stack habit tracking application combining a FastAPI backend with MongoDB and a React frontend with Vite. The app helps users build and maintain habits through an onboarding flow and daily check-ins with streak tracking.

## Architecture

```
chlapp/
├── backend/          # FastAPI application
│   ├── app/         # Application code
│   │   ├── core/    # Configuration and logging
│   │   ├── models/  # Pydantic models (habit, streak, reflection)
│   │   ├── routers/ # API route handlers
│   │   ├── services/# Business logic layer
│   │   ├── utils/   # Utility functions (prompts)
│   │   ├── database.py    # MongoDB connection
│   │   └── main.py       # FastAPI app entry point
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
├── frontend/        # React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── constants/   # Design tokens and animations
│   │   ├── data/        # Static data (onboarding, check-in options)
│   │   ├── pages/       # Page components (Onboarding, DailyCheckIn)
│   │   ├── services/    # API service layer
│   │   ├── utils/       # Utilities (userStorage)
│   │   ├── App.jsx      # Main app component
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
- ✅ Service layer architecture (habit_service, streak_service, llm_service)
- ✅ RESTful API endpoints for habits, streaks, and reflections
- ✅ LLM service integration for generating habit options, identities, and cues
- ✅ CORS enabled for frontend integration
- ✅ Comprehensive error handling and logging
- ✅ Automatic database index creation
- ✅ Data validation with Pydantic models

### Frontend (React)
- ✅ React 18 with Vite
- ✅ React Router for navigation
- ✅ Onboarding flow (8 steps) with habit preference collection
- ✅ Daily check-in interface with streak tracking
- ✅ Reusable component library
- ✅ Design system with tokens and animations
- ✅ LocalStorage integration for user/habit IDs
- ✅ API service layer with error handling

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
cp .example.env .env  # If .example.env exists
# Edit .env and set:
# MONGODB_URL=mongodb://localhost:27017
# DATABASE_NAME=chl_datastore_db
# LLM_API_KEY=your_api_key_here (optional)
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

All API endpoints are prefixed with `/api/v1`.

### Habits

- `POST /api/v1/saveUserHabitPreference` - Save or update user habit preferences
  - Body: `HabitPreferenceCreate` (userId, habitId, preferences)
  - Returns: `HabitPreferenceResponse`

- `GET /api/v1/GetUserHabitById` - Get habit by userId and habitId
  - Query params: `userId`, `habitId`
  - Returns: `HabitPreferenceResponse` or 404

- `POST /api/v1/generateIdentities` - Generate identity options using LLM
  - Body: `IdentityGenerationRequest` (userId, habitId)
  - Returns: `IdentityGenerationResponse` (list of identities)

- `POST /api/v1/generateShortHabitOptions` - Generate short habit options using LLM
  - Body: `HabitOptionRequest` (userId, habitId)
  - Returns: `HabitOptionResponse` (list of options)

- `POST /api/v1/generateFullHabitOptions` - Generate full habit options using LLM
  - Body: `HabitOptionRequest` (userId, habitId)
  - Returns: `HabitOptionResponse` (list of options)

- `POST /api/v1/generateObviousCues` - Generate obvious cues using LLM
  - Body: `ObviousCueRequest` (userId, habitId)
  - Returns: `ObviousCueResponse` (list of cues)

### Streaks

- `GET /api/v1/getUserHabitStreakById` - Get habit streak by userId and habitId
  - Query params: `userId`, `habitId`
  - Returns: `StreakResponse` (currentStreak, longestStreak, lastCheckInDate)
  - Returns default values (0, 0, null) if streak doesn't exist

- `POST /api/v1/updateUserHabitStreakById` - Update streak with check-in date
  - Body: `StreakUpdateRequest` (userId, habitId, checkInDate: "YYYY-MM-DD")
  - Returns: `StreakResponse`
  - Logic:
    - Consecutive day: increments currentStreak
    - Missed day: resets currentStreak to 1
    - Updates longestStreak if current exceeds it
    - Creates new streak if it doesn't exist

### Reflections

- `GET /api/v1/getUserReflectionsById` - Get reflections by userId and habitId
  - Query params: `userId`, `habitId`
  - Returns: List of reflection documents

### Health

- `GET /health` - Health check endpoint
- `GET /` - Root endpoint with API info

## Frontend Routes

- `/` or `/onboarding` - Onboarding flow (8 steps)
- `/checkin` - Daily check-in interface with streak display

## Database Collections

### Habits Collection
- **Collection name**: `habits`
- **Fields**:
  - `userId` (string): Format `user_<timestamp>_<random>`
  - `habitId` (string): Format `habit_<timestamp>_<random>`
  - `preferences` (object): Contains onboarding data
    - `starting_idea`, `identity`, `enjoyment`, `starter_habit`, `full_habit`, `habit_stack`, `habit_environment`
  - `created_at` (datetime)
  - `updated_at` (datetime)

### Streaks Collection
- **Collection name**: `streaks`
- **Fields**:
  - `userId` (string): Format `user_<timestamp>_<random>` (matches habits collection)
  - `habitId` (string): Format `habit_<timestamp>_<random>` (matches habits collection)
  - `currentStreak` (int): Current consecutive days
  - `longestStreak` (int): Longest streak achieved
  - `lastCheckInDate` (datetime): Last check-in date
  - `createdAt` (datetime)
  - `updatedAt` (datetime)
- **Index**: Unique compound index on `(userId, habitId)`

### Reflections Collection
- **Collection name**: `reflections`
- **Fields**: User reflection data (structure depends on implementation)

## Services Architecture

### Backend Services

- **HabitService** (`app/services/habit_service.py`):
  - `save_habit_preference()`: Save or update habit preferences
  - `get_habit_by_id()`: Get habit by userId and habitId
  - `get_habit_context()`: Get habit context for LLM prompts

- **StreakService** (`app/services/streak_service.py`):
  - `get_streak_by_id()`: Get streak by userId and habitId (returns defaults if not found)
  - `update_streak_by_checkin()`: Update streak based on check-in date with business logic

- **LLMService** (`app/services/llm_service.py`):
  - `generate_text()`: Generate text using LLM API
  - Handles prompt formatting and API calls

### Frontend Services

- **API Service** (`src/services/api.js`):
  - Centralized API client with error handling
  - Exports: `habitsAPI`, `streaksAPI`, `reflectionsAPI`, `healthAPI`

- **User Storage** (`src/utils/userStorage.js`):
  - `getOrCreateUserAndHabitIds()`: Get or create userId/habitId in localStorage
  - `getUserId()`, `getHabitId()`: Get IDs from localStorage
  - Format: `user_<timestamp>_<random>` and `habit_<timestamp>_<random>`

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

# LLM (optional - required for LLM features)
LLM_API_KEY=your_api_key_here
LLM_MODEL=gpt-4
LLM_TEMPERATURE=0.7
LLM_MAX_TOKENS=1000
LLM_API_BASE_URL=https://api.openai.com/v1  # Optional, for custom endpoints

# Application
APP_NAME=CHL API
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
│   ├── core/
│   │   ├── config.py          # Settings and configuration
│   │   └── logging_config.py  # Logging setup
│   ├── models/
│   │   ├── habit.py           # Habit Pydantic models
│   │   ├── streak.py          # Streak Pydantic models
│   │   └── reflection.py      # Reflection Pydantic models
│   ├── routers/
│   │   ├── habits.py          # Habit API routes
│   │   ├── streaks.py         # Streak API routes
│   │   └── reflections.py    # Reflection API routes
│   ├── services/
│   │   ├── habit_service.py   # Habit business logic
│   │   ├── streak_service.py  # Streak business logic
│   │   └── llm_service.py     # LLM integration
│   ├── utils/
│   │   └── prompts.py         # LLM prompt templates
│   ├── database.py           # MongoDB connection
│   └── main.py               # FastAPI app entry point
├── requirements.txt
└── .env
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── StreakDisplay.jsx
│   │   └── ... (13 components)
│   ├── constants/
│   │   ├── designTokens.js   # Colors, fonts, spacing
│   │   └── animations.js     # CSS animations
│   ├── data/
│   │   ├── onboardingData.js # Onboarding options
│   │   └── checkinData.js    # Check-in options
│   ├── pages/
│   │   ├── Onboarding.jsx    # 8-step onboarding flow
│   │   └── DailyCheckIn.jsx  # Daily check-in interface
│   ├── services/
│   │   └── api.js            # API client
│   ├── utils/
│   │   └── userStorage.js    # localStorage utilities
│   ├── App.jsx               # Main app component
│   └── main.jsx              # Entry point
├── package.json
└── vite.config.js
```

## Technology Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Motor** - Async MongoDB driver
- **Pydantic** - Data validation and settings
- **Uvicorn** - ASGI server
- **Python-dotenv** - Environment variable management

### Frontend
- **React** 18.2 - UI library
- **Vite** 5.0 - Build tool and dev server
- **React Router** 6.20 - Client-side routing
- **ESLint** - Code linting

## Data Flow

1. **Onboarding Flow**:
   - User completes 8-step onboarding
   - Each step calls `POST /api/v1/saveUserHabitPreference`
   - Data stored in `habits` collection
   - userId and habitId generated and stored in localStorage

2. **Daily Check-In**:
   - User opens check-in page
   - Frontend loads streak: `GET /api/v1/getUserHabitStreakById`
   - User completes check-in
   - Frontend updates streak: `POST /api/v1/updateUserHabitStreakById`
   - Streak logic: consecutive days increment, missed days reset

3. **LLM Features**:
   - User requests identity/habit/cue generation
   - Backend fetches habit context from MongoDB
   - LLM service generates options using prompts
   - Results returned to frontend

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

3. Check database and collections:
   ```bash
   mongosh chl_datastore_db
   show collections
   db.streaks.find().pretty()
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
1. Backend CORS middleware is configured (already done in `main.py`)
2. Frontend is using the proxy in `vite.config.js`
3. API calls use `/api` prefix (proxied to backend)

### Streak Data Not Matching Habits

If streaks don't match habits:
1. Ensure userId and habitId formats match (both use string format: `user_<timestamp>_<random>`)
2. Check localStorage has correct IDs: `localStorage.getItem('chl_userId')`
3. Run migration script if needed: `python3 backend/migrate_streaks_to_strings.py`

### Collection Not Created

MongoDB creates collections automatically on first insert. If a collection doesn't appear:
1. Make an API call that inserts data (e.g., `POST /api/v1/updateUserHabitStreakById`)
2. Check MongoDB: `db.streaks.find()` or `db.habits.find()`
3. Verify database name in `.env`: `DATABASE_NAME=chl_datastore_db`

## Migration Scripts

### Migrate Streaks to String Format

If you have streaks with ObjectId format that need to be converted to strings:

```bash
cd backend
python3 migrate_streaks_to_strings.py
```

This script:
- Converts ObjectId userId/habitId to strings
- Merges duplicate entries
- Removes old ObjectId entries

## License

MIT

## Additional Documentation

- `backend/README.md` - Backend-specific documentation
- `frontend/README.md` - Frontend-specific documentation
- `backend/VERIFY_STREAKS.md` - Streak collection verification guide
- `SETUP.md` - Detailed setup instructions
- `GITHUB_SETUP.md` - GitHub repository setup guide
