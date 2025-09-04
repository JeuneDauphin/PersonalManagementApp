#!/bin/bash

# Personal Management App - Development Script
# This script starts both the backend server and frontend development server

echo "🚀 Starting Personal Management App Development Environment..."
echo "📁 Working directory: $(pwd)"
echo ""

# Check if node_modules exist in root
if [ ! -d "node_modules" ]; then
    echo "📦 Installing root dependencies..."
    npm install
    echo ""
fi

# Check if node_modules exist in backend
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
    echo ""
fi

echo "🎯 Starting development servers..."
echo "   - Frontend: http://localhost:5173"
echo "   - Backend:  http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Run the development command
npm run dev
