#!/bin/bash

# Personal Management App - Development Script
# This script starts the frontend development server

echo "🚀 Starting Personal Management App..."
echo "📁 Working directory: $(pwd)"
echo ""

# Check if node_modules exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

echo "🎯 Starting development server..."
echo "   - App: http://localhost:5173"
echo ""
echo "ℹ️  This app uses localStorage for data persistence."
echo "   All your data is stored locally in your browser."
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Run the development command
npm run dev
