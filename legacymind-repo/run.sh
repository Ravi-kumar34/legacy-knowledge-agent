#!/bin/bash

echo "🚀 Setting up LegacyMind AI (Hackathon Edition)..."

# Exit on error
set -e

# Step 1: Virtual Environment setup
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
else
    echo "✅ Virtual environment already exists."
fi

# Activate virtual environment
source venv/bin/activate

# Step 2: Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Step 3: Environment Variables setup
if [ ! -f ".env" ]; then
    echo "⚙️ Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update your .env file with actual API keys if needed!"
else
    echo "✅ .env file already exists."
fi

# Step 4: Run the backend server
echo "🌟 Starting FastAPI server from /backend silo..."
echo "API will be available at http://127.0.0.1:8000"
echo "------------------------------------------------------"
uvicorn backend.main:app --reload
