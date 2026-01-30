# CHL API - FastAPI Backend

A FastAPI application with MongoDB integration for habit tracking, streak management, and LLM-powered habit generation.

## Features

- ✅ FastAPI framework with async support
- ✅ Motor (Async MongoDB driver)
- ✅ Service layer architecture (habit_service, streak_service, llm_service)
- ✅ RESTful API endpoints for habits, streaks, and reflections
- ✅ LLM service integration for generating habit options, identities, and cues
- ✅ CORS enabled for frontend integration
- ✅ Comprehensive error handling and logging
- ✅ Automatic database index creation
- ✅ Data validation with Pydantic models

## Project Structure

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
├── .env.example
├── migrate_streaks_to_strings.py  # Migration script
├── test_streak_insert.py          # Test script
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
   
   Edit `.env` and set:
   ```env
   MONGODB_URL=mongodb://localhost:27017
   DATABASE_NAME=chl_datastore_db
   LLM_API_KEY=your_api_key_here  # Optional, required for LLM features
   LLM_MODEL=gpt-4
   LLM_TEMPERATURE=0.7
   LLM_MAX_TOKENS=1000
   ```

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

All endpoints are prefixed with `/api/v1`.

### Habits

- `POST /api/v1/saveUserHabitPreference` - Save or update user habit preferences
- `GET /api/v1/GetUserHabitById` - Get habit by userId and habitId
- `POST /api/v1/generateIdentities` - Generate identity options using LLM
- `POST /api/v1/generateShortHabitOptions` - Generate short habit options using LLM
- `POST /api/v1/generateFullHabitOptions` - Generate full habit options using LLM
- `POST /api/v1/generateObviousCues` - Generate obvious cues using LLM

### Streaks

- `GET /api/v1/getUserHabitStreakById` - Get habit streak by userId and habitId
  - Returns default values (0, 0, null) if streak doesn't exist
- `POST /api/v1/updateUserHabitStreakById` - Update streak with check-in date
  - Increments streak for consecutive days
  - Resets to 1 for missed days
  - Updates longest streak if exceeded

### Reflections

- `GET /api/v1/getReflectionInputs` - Get reflection inputs using LLM
  - Requires userId query parameter

### Health

- `GET /health` - Health check endpoint
- `GET /` - Root endpoint with API info

## Database Collections

### Habits Collection
- **Collection name**: `habits`
- **Fields**:
  - `userId` (string): Format `user_<timestamp>_<random>`
  - `habitId` (string): Format `habit_<timestamp>_<random>`
  - `preferences` (object): Contains onboarding data
  - `created_at` (datetime)
  - `updated_at` (datetime)

### Streaks Collection
- **Collection name**: `streaks`
- **Fields**:
  - `userId` (string): Format `user_<timestamp>_<random>` (matches habits)
  - `habitId` (string): Format `habit_<timestamp>_<random>` (matches habits)
  - `currentStreak` (int): Current consecutive days
  - `longestStreak` (int): Longest streak achieved
  - `lastCheckInDate` (datetime): Last check-in date
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

### StreakService
Located in `app/services/streak_service.py`:
- `get_streak_by_id()`: Get streak by userId and habitId (returns defaults if not found)
- `update_streak_by_checkin()`: Update streak based on check-in date with business logic

### LLMService
Located in `app/services/llm_service.py`:
- `generate_text()`: Generate text using LLM API
- `generate_list()`: Generate list of items using LLM API

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
- `StreakResponse`: Response model for streaks

### Reflection Models (`app/models/reflection.py`)
- `ReflectionInputResponse`: Response model for reflection inputs

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

Test your MongoDB connection:
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
- **Uvicorn**: ASGI server
- **Python-dotenv**: Environment variable management

### Running in Development Mode

```bash
uvicorn app.main:app --reload
```

The server will auto-reload on code changes.

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

### Collection Not Created

MongoDB creates collections automatically on first insert. If a collection doesn't appear:
1. Make an API call that inserts data
2. Check MongoDB: `db.streaks.find()` or `db.habits.find()`
3. Verify database name in `.env`: `DATABASE_NAME=chl_datastore_db`

See `VERIFY_STREAKS.md` for detailed verification steps.

## License

MIT
