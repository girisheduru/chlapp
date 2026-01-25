#!/bin/bash

# Start both backend and frontend in separate terminals
# This script opens new terminal windows/tabs for each service

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CHLAPP_DIR="$(dirname "$SCRIPT_DIR")"

# Function to open terminal and run command (macOS)
open_terminal() {
    local dir=$1
    local cmd=$2
    local title=$3
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        osascript -e "tell application \"Terminal\" to do script \"cd '$dir' && $cmd\""
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        gnome-terminal --tab --title "$title" -- bash -c "cd '$dir' && $cmd; exec bash"
    else
        echo "Unsupported OS. Please run backend and frontend manually."
        exit 1
    fi
}

echo "Starting CHL App..."
echo "Backend will start in a new terminal..."
echo "Frontend will start in a new terminal..."

# Start backend
open_terminal "$CHLAPP_DIR/backend" "./scripts/start-backend.sh" "CHL Backend"

# Wait a moment
sleep 2

# Start frontend
open_terminal "$CHLAPP_DIR/frontend" "./scripts/start-frontend.sh" "CHL Frontend"

echo ""
echo "Both services are starting in separate terminals."
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
