#!/bin/bash

echo "🚀 Starting Oshocks Frontend"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in a Node.js project
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found!${NC}"
    echo "Please run this script from your frontend project root directory."
    exit 1
fi

# Step 1: Clear all caches
echo -e "${BLUE}📦 Clearing frontend caches...${NC}"

echo "  ↳ Clearing npm cache..."
npm cache clean --force

if [ -d "node_modules/.cache" ]; then
    echo "  ↳ Removing build cache..."
    rm -rf node_modules/.cache
fi

if [ -d ".next" ]; then
    echo "  ↳ Removing Next.js cache..."
    rm -rf .next
fi

if [ -d "dist" ]; then
    echo "  ↳ Removing dist folder..."
    rm -rf dist
fi

if [ -d "build" ]; then
    echo "  ↳ Removing build folder..."
    rm -rf build
fi

if [ -d ".vite" ]; then
    echo "  ↳ Removing Vite cache..."
    rm -rf .vite
fi

if [ -d ".turbo" ]; then
    echo "  ↳ Removing Turbo cache..."
    rm -rf .turbo
fi

echo ""
echo -e "${GREEN}✅ All caches cleared!${NC}"
echo ""

# Step 2: Check node_modules
echo -e "${BLUE}📦 Checking dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules not found. Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Dependencies found${NC}"
fi
echo ""

# Step 3: Display environment info
echo -e "${BLUE}📋 Environment Information:${NC}"
echo "  ↳ Node Version: $(node -v)"
echo "  ↳ NPM Version: $(npm -v)"

# Detect framework
if [ -f "next.config.js" ] || [ -f "next.config.mjs" ]; then
    FRAMEWORK="Next.js"
elif [ -f "vite.config.js" ] || [ -f "vite.config.ts" ]; then
    FRAMEWORK="Vite/React"
elif grep -q "react-scripts" package.json 2>/dev/null; then
    FRAMEWORK="Create React App"
elif grep -q "vue" package.json 2>/dev/null; then
    FRAMEWORK="Vue.js"
else
    FRAMEWORK="Unknown"
fi

echo "  ↳ Framework: $FRAMEWORK"

if [ -f ".env.local" ]; then
    if grep -q "NODE_ENV" .env.local; then
        echo "  ↳ Environment: $(grep NODE_ENV .env.local | cut -d '=' -f2)"
    fi
fi
echo ""

# Step 4: Start the development server
echo "======================================"
echo -e "${GREEN}🚀 Starting Development Server${NC}"
echo "======================================"
echo ""
echo -e "${BLUE}Server will be available at:${NC}"

# Detect port from package.json scripts or use defaults
if grep -q "\"dev\".*--port" package.json; then
    PORT=$(grep -o "port [0-9]*" package.json | head -1 | awk '{print $2}')
    echo "  🌐 http://localhost:${PORT:-3000}"
elif [ "$FRAMEWORK" = "Vite/React" ]; then
    echo "  🌐 http://localhost:5173"
else
    echo "  🌐 http://localhost:3000"
fi

echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""

# Start the appropriate dev server
if grep -q "\"dev\"" package.json; then
    npm run dev
elif grep -q "\"start\"" package.json; then
    npm start
else
    echo -e "${RED}❌ No dev or start script found in package.json${NC}"
    exit 1
fi