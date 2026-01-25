#!/bin/bash

# Start the FastAPI backend server

cd "$(dirname "$0")/../backend"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Virtual environment not found. Creating..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies if needed
if [ ! -f "venv/.installed" ]; then
    echo "Installing dependencies..."
    pip install -r requirements.txt
    touch venv/.installed
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "Warning: .env file not found. Creating from template..."
    cat > .env << EOF
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=chl_datastore_db
APP_NAME=CHL App
APP_VERSION=1.0.0
DEBUG=false
EOF
    echo ".env file created. Please update with your settings."
fi

# Start the server
echo "Starting FastAPI backend on http://localhost:8000"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
