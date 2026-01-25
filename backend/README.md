# CHL API - FastAPI with MongoDB

A FastAPI application that connects to MongoDB using Motor (async MongoDB driver) for storing and retrieving data.

## Features

- ✅ FastAPI framework
- ✅ Motor (Async MongoDB driver)
- ✅ Environment variable configuration
- ✅ Pydantic models with 8 fields and validation
- ✅ POST endpoint to create records
- ✅ GET endpoints to retrieve records
- ✅ Comprehensive error handling
- ✅ Async/await support
- ✅ Clean project structure

## Project Structure

```
chlapi/
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI application entry point
│   ├── database.py      # MongoDB connection using Motor
│   ├── schemas.py       # Pydantic models with 8 fields
│   └── routes.py        # API endpoints (POST, GET)
├── requirements.txt     # Python dependencies
├── .env.example         # Environment variables template
└── README.md           # This file
```

## Installation

> **Note for macOS users:** macOS uses zsh as the default shell. All commands below work in both zsh and bash.

1. **Clone the repository** (if applicable)

2. **Create a virtual environment:**
   ```zsh
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```zsh
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```zsh
   cp .env.example .env
   ```
   
   Edit `.env` and set your MongoDB connection string:
   ```
   MONGODB_URL=mongodb://localhost:27017
   DATABASE_NAME=chl_datastore_db
   ```

## Running the Application

Start the FastAPI server using Uvicorn:

```zsh
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive Docs (Swagger)**: http://localhost:8000/docs
- **Alternative Docs (ReDoc)**: http://localhost:8000/redoc

## API Endpoints

### POST /api/v1/data
Create a new data record.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "age": 30,
  "status": "active",
  "score": 85.5,
  "is_active": true,
  "tags": ["user", "premium"],
  "metadata": {
    "department": "Engineering",
    "level": "senior"
  }
}
```

**Response:** 201 Created
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "age": 30,
  "status": "active",
  "score": 85.5,
  "is_active": true,
  "tags": ["user", "premium"],
  "metadata": {
    "department": "Engineering",
    "level": "senior"
  },
  "created_at": "2024-01-01T12:00:00"
}
```

### GET /api/v1/data
Retrieve all data records with pagination.

**Query Parameters:**
- `skip` (optional): Number of records to skip (default: 0)
- `limit` (optional): Maximum records to return (default: 100, max: 1000)

**Response:** 200 OK
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    ...
  }
]
```

### GET /api/v1/data/{record_id}
Retrieve a specific record by ID.

**Response:** 200 OK or 404 Not Found

## Data Model

The Pydantic model includes exactly 8 fields:

1. **name** (str): Name of the record (1-100 characters)
2. **email** (EmailStr): Valid email address
3. **age** (int): Age between 0 and 150
4. **status** (str): Status string
5. **score** (float): Score between 0.0 and 100.0
6. **is_active** (bool): Active status flag
7. **tags** (list[str]): List of tags
8. **metadata** (dict): Additional metadata dictionary

## Error Handling

The API includes comprehensive error handling:
- **400 Bad Request**: Invalid input data or ObjectId format
- **404 Not Found**: Record not found
- **500 Internal Server Error**: Database or server errors

## MongoDB Setup

### Installing MongoDB Locally

#### macOS (using Homebrew)

> **Note:** macOS uses zsh as the default shell. All commands below work in zsh (and bash).

1. **Install Homebrew** (if not already installed):
   ```zsh
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
   
   Or if you prefer to use zsh directly:
   ```zsh
   curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh | /bin/bash
   ```
   
   After installation, you may need to add Homebrew to your PATH. Add this to your `~/.zshrc`:
   ```zsh
   echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
   eval "$(/opt/homebrew/bin/brew shellenv)"
   ```
 > **Note:** Restart the terminal completely
  
   For Intel Macs, use:
   ```zsh
   echo 'eval "$(/usr/local/bin/brew shellenv)"' >> ~/.zshrc
   eval "$(/usr/local/bin/brew shellenv)"
   ```

2. **Install MongoDB Community Edition**:
   ```zsh
   brew tap mongodb/brew
   brew install mongodb-community
   ```

3. **Start MongoDB service**:
   ```zsh
   brew services start mongodb-community
   ```

4. **Verify MongoDB is running**:
   ```zsh
   brew services list
   # Or check the process
   ps aux | grep mongod
   ```

5. **Test MongoDB connection** (optional):
   ```zsh
   mongosh
   # Or if using older version: mongo
   ```

#### Linux (Ubuntu/Debian)

1. **Import MongoDB public GPG key**:
   ```bash
   curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
   ```

2. **Create MongoDB list file**:
   ```bash
   echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
   ```

3. **Update package database**:
   ```bash
   sudo apt-get update
   ```

4. **Install MongoDB**:
   ```bash
   sudo apt-get install -y mongodb-org
   ```

5. **Start MongoDB service**:
   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod  # Enable auto-start on boot
   ```

6. **Verify MongoDB is running**:
   ```bash
   sudo systemctl status mongod
   ```

#### Windows

1. **Download MongoDB Community Edition**:
   - Visit: https://www.mongodb.com/try/download/community
   - Select Windows as the platform
   - Download the MSI installer

2. **Run the installer**:
   - Run the downloaded `.msi` file
   - Choose "Complete" installation
   - Select "Install MongoDB as a Service"
   - Choose "Run service as Network Service user"
   - Keep "Install MongoDB Compass" checked (optional GUI tool)

3. **Verify installation**:
   - MongoDB should start automatically as a Windows service
   - Check Services (services.msc) for "MongoDB" service

4. **Add MongoDB to PATH** (if needed):
   - Default installation path: `C:\Program Files\MongoDB\Server\<version>\bin`
   - Add this path to your system PATH environment variable

#### Using Docker (Cross-platform)

1. **Pull MongoDB Docker image**:
   ```bash
   docker pull mongo:latest
   ```

2. **Run MongoDB container**:
   ```bash
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

3. **Verify container is running**:
   ```bash
   docker ps
   ```

4. **Stop MongoDB container** (when needed):
   ```bash
   docker stop mongodb
   ```

5. **Start MongoDB container again**:
   ```bash
   docker start mongodb
   ```

### Starting MongoDB Service

After installation, ensure MongoDB is running:

- **macOS**: `brew services start mongodb-community`
- **Linux**: `sudo systemctl start mongod`
- **Windows**: MongoDB runs as a service automatically
- **Docker**: `docker start mongodb`

### Verifying MongoDB Connection

Test your MongoDB connection:

```zsh
# Using mongosh (MongoDB Shell)
mongosh
# Or for older versions: mongo

# In the MongoDB shell, run:
show dbs
exit
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

### MongoDB Atlas (Cloud)
1. Create a cluster on MongoDB Atlas
2. Get your connection string
3. Update `.env` with: `MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/`

## Development

The application uses:
- **FastAPI**: Modern, fast web framework
- **Motor**: Async MongoDB driver
- **Pydantic**: Data validation using Python type annotations
- **Uvicorn**: ASGI server

## License

MIT
