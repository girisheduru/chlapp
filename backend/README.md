# Clear Habit Lab API - FastAPI Backend

A FastAPI application with MongoDB integration for habit tracking, streak management, Firebase authentication, and LLM-powered habit generation with reflection insights.

## Features

- ✅ FastAPI framework with async support
- ✅ Motor (Async MongoDB driver)
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

## Project Structure

```
backend/
├── app/
│   ├── core/
│   │   ├── config.py          # Settings and configuration
│   │   ├── auth.py            # Firebase authentication
│   │   ├── firebase.py        # Firebase Admin SDK setup
│   │   └── logging_config.py  # Logging setup
│   ├── models/
│   │   ├── habit.py           # Habit Pydantic models
│   │   ├── streak.py          # Streak Pydantic models
│   │   └── reflection.py      # Reflection Pydantic models
│   ├── routers/
│   │   ├── habits.py          # Habit API routes
│   │   ├── streaks.py         # Streak API routes
│   │   ├── reflections.py     # Reflection API routes
│   │   └── admin.py           # Admin API routes
│   ├── services/
│   │   ├── habit_service.py   # Habit business logic
│   │   ├── streak_service.py  # Streak business logic
│   │   ├── llm_service.py     # LLM integration
│   │   └── reflection_agent_service.py  # LangChain ReAct agent
│   ├── utils/
│   │   └── prompts.py         # LLM prompt templates
│   ├── database.py            # MongoDB connection
│   └── main.py                # FastAPI app entry point
├── requirements.txt
├── .example.env
├── migrate_streaks_to_strings.py  # Migration script
├── test_streak_insert.py          # Test script
├── Procfile                       # Railway deployment
├── railway.toml                   # Railway configuration
└── README.md
```

## Installation

1. **Create a virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables:**
   ```bash
   cp .example.env .env
   ```
   
   Edit `.env` and configure (see Environment Variables section below).

## Running the Application

Start the FastAPI server using Uvicorn:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive Docs (Swagger)**: http://localhost:8000/docs
- **Alternative Docs (ReDoc)**: http://localhost:8000/redoc

## API Endpoints

All endpoints are prefixed with `/api/v1`. Most endpoints require Firebase authentication (Bearer token in Authorization header).

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
  - Returns default values (0, 0, 0, null, []) if streak doesn't exist
  - Response includes: `currentStreak`, `longestStreak`, `totalStones`, `lastCheckInDate`, `checkInHistory`
- `POST /api/v1/updateUserHabitStreakById` - Update streak with check-in date
  - Increments streak for consecutive days
  - Resets to 1 for missed days
  - Updates longest streak if exceeded
  - Tracks check-in history as array of date strings (YYYY-MM-DD)

### Reflections

- `GET /api/v1/getReflectionInputs` - Get reflection inputs using LLM
  - Requires `userId` query parameter
- `GET /api/v1/getReflectionItems` - Get reflection items for reflect screen
  - Requires `habitId` query parameter
  - Returns insights, reflection questions, and experiment suggestions
  - Uses LangChain ReAct agent with optional Tavily web search
  - Falls back to direct LLM if agent unavailable

### Admin

- `DELETE /api/v1/admin/habits/{habitId}` - Delete a habit (requires admin UID)
- `DELETE /api/v1/admin/streaks/{habitId}` - Delete a streak (requires admin UID)

### Health

- `GET /health` - Health check endpoint
- `GET /` - Root endpoint with API info

## Environment Variables

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

# Tavily (optional - for reflection agent web search / James Clear content)
# TAVILY_API_KEY=your_tavily_key

# Opik (optional - LLM observability and tracing)
# OPIK_API_KEY=your_opik_key
# OPIK_WORKSPACE=your-workspace-name
OPIK_PROJECT_NAME=2026 Hackathon Opik
OPIK_URL=https://www.comet.com/opik/api
OPIK_ENABLED=false

# Firebase (optional - if missing, auth is skipped for local dev)
# FIREBASE_PROJECT_ID=your-project-id
# Option A: path to service account JSON file (local dev)
# GOOGLE_APPLICATION_CREDENTIALS=firebase-service-account.json
# Option B: entire service account JSON as env var (production)
# GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account",...}

# Admin API: comma-separated Firebase UIDs allowed for admin endpoints
# ADMIN_UIDS=uid1,uid2

# CORS (for production - add your Vercel frontend URL)
# CORS_ORIGINS=https://your-app.vercel.app

# Application
APP_NAME=Clear Habit Lab
APP_VERSION=1.0.0
DEBUG=false
```

## Database Collections

### Habits Collection
- **Collection name**: `habits`
- **Fields**:
  - `userId` (string): Firebase UID
  - `habitId` (string): Format `habit_<timestamp>_<random>`
  - `preferences` (object): Contains onboarding data
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
  - `checkInHistory` (array of strings): Check-in dates in YYYY-MM-DD format
  - `createdAt` (datetime)
  - `updatedAt` (datetime)
- **Index**: Unique compound index on `(userId, habitId)`

### Reflections Collection
- **Collection name**: `reflections`
- **Fields**: User reflection data

## Services

### HabitService
Located in `app/services/habit_service.py`:
- `save_habit_preference()`: Save or update habit preferences
- `get_habit_by_id()`: Get habit by userId and habitId
- `get_habit_context()`: Get habit context for LLM prompts
- `get_all_user_habits()`: Get all habits for a user

### StreakService
Located in `app/services/streak_service.py`:
- `get_streak_by_id()`: Get streak by userId and habitId (returns defaults if not found)
- `update_streak_by_checkin()`: Update streak based on check-in date with business logic

### LLMService
Located in `app/services/llm_service.py`:
- `generate_text()`: Generate text using LLM API
- `generate_list()`: Generate list of items using LLM API
- `generate_json()`: Generate structured JSON using LLM API

### ReflectionAgentService
Located in `app/services/reflection_agent_service.py`:
- LangChain ReAct agent for generating reflection insights
- Optional Tavily web search tool for James Clear / Atomic Habits content
- Opik integration for LLM tracing (when enabled)
- Graceful fallback to direct LLM if LangChain/Tavily unavailable

## Models

### Habit Models (`app/models/habit.py`)
- `HabitPreferenceCreate`: For creating/updating habits
- `HabitPreferenceResponse`: Response model for habits
- `IdentityGenerationRequest/Response`: For identity generation
- `HabitOptionRequest/Response`: For habit option generation
- `ObviousCueRequest/Response`: For cue generation

### Streak Models (`app/models/streak.py`)
- `StreakCreate`: For creating streaks
- `StreakUpdateRequest`: For updating streaks with check-in date
- `StreakResponse`: Response model for streaks (includes checkInHistory)

### Reflection Models (`app/models/reflection.py`)
- `ReflectionInputResponse`: Response model for reflection inputs
- `ReflectionItemsResponse`: Response with insights, questions, experiments
- `InsightItem`: Individual insight with emoji and text
- `ReflectionQuestions`: Two reflection questions
- `ExperimentSuggestion`: Experiment suggestion with type, title, why

## Authentication

The API uses Firebase Authentication. When Firebase is configured:
- All `/api/v1/*` endpoints require a valid Firebase ID token
- Token should be passed in `Authorization: Bearer <token>` header
- The authenticated user's UID is used as `userId` for all operations

When Firebase is not configured (local development):
- Auth is skipped and requests proceed without authentication
- A warning is logged at startup

## MongoDB Setup

### Installing MongoDB Locally

#### macOS (using Homebrew)
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Linux (Ubuntu/Debian)
```bash
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

#### Docker
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Verifying MongoDB Connection

```bash
mongosh
# Or for older versions: mongo
```

Or test from Python:
```python
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

async def test_connection():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    await client.admin.command('ping')
    print("Connected successfully!")
    client.close()

asyncio.run(test_connection())
```

## Development

The application uses:
- **FastAPI**: Modern, fast web framework
- **Motor**: Async MongoDB driver
- **Pydantic**: Data validation using Python type annotations
- **Firebase Admin SDK**: Authentication
- **LangChain**: LLM orchestration and ReAct agents
- **Tavily**: Web search API (optional)
- **Opik**: LLM observability (optional)
- **Uvicorn**: ASGI server

### Running in Development Mode

```bash
uvicorn app.main:app --reload
```

The server will auto-reload on code changes.

## Deployment

### Railway

See `RAILWAY.md` for detailed Railway deployment instructions.

Quick start:
```bash
# railway.toml is already configured
railway up
```

## Migration Scripts

### Migrate Streaks to String Format

If you have streaks with ObjectId format that need to be converted to strings:

```bash
python3 migrate_streaks_to_strings.py
```

This script:
- Converts ObjectId userId/habitId to strings
- Merges duplicate entries
- Removes old ObjectId entries

## Testing

### Test Streak Insertion

```bash
python3 test_streak_insert.py
```

This script tests:
- MongoDB connection
- Streak collection creation
- Document insertion
- Data retrieval

## Troubleshooting

### MongoDB Connection Issues

1. Verify MongoDB is running:
   ```bash
   # macOS
   brew services list
   
   # Linux
   sudo systemctl status mongod
   ```

2. Check database and collections:
   ```bash
   mongosh chl_datastore_db
   show collections
   db.streaks.find().pretty()
   ```

### Firebase Auth Issues

1. Ensure Firebase project ID is set correctly
2. Check that service account credentials are valid
3. For local dev, Firebase can be disabled (auth skipped)

### LLM/Agent Issues

1. Check that LLM_API_KEY is set
2. For reflection agent, ensure LangChain dependencies are installed
3. Check logs for detailed error messages

### Collection Not Created

MongoDB creates collections automatically on first insert. If a collection doesn't appear:
1. Make an API call that inserts data
2. Check MongoDB: `db.streaks.find()` or `db.habits.find()`
3. Verify database name in `.env`: `DATABASE_NAME=chl_datastore_db`

See `VERIFY_STREAKS.md` for detailed verification steps.

## License

MIT
