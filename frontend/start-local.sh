#!/bin/bash

echo "🚀 Starting Oshocks Backend (Laravel)"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in a Laravel project
if [ ! -f "artisan" ]; then
    echo -e "${RED}❌ Error: artisan file not found!${NC}"
    echo "Please run this script from your Laravel project root directory."
    exit 1
fi

# Step 1: Clear all caches
echo -e "${BLUE}📦 Clearing Laravel caches...${NC}"

echo "  ↳ Clearing application cache..."
php artisan cache:clear

echo "  ↳ Clearing config cache..."
php artisan config:clear

echo "  ↳ Clearing route cache..."
php artisan route:clear

echo "  ↳ Clearing view cache..."
php artisan view:clear

echo "  ↳ Clearing compiled classes..."
php artisan clear-compiled

echo ""
echo -e "${GREEN}✅ All caches cleared!${NC}"
echo ""

# Step 2: Optimize (optional but recommended)
echo -e "${BLUE}⚡ Optimizing application...${NC}"
php artisan optimize
echo ""

# Step 3: Check database connection
echo -e "${BLUE}🗄️  Checking database connection...${NC}"
if php artisan migrate:status > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connected${NC}"
else
    echo -e "${YELLOW}⚠️  Database connection issue (check your .env file)${NC}"
fi
echo ""

# Step 4: Display environment info
echo -e "${BLUE}📋 Environment Information:${NC}"
echo "  ↳ Laravel Version: $(php artisan --version)"
echo "  ↳ PHP Version: $(php -v | head -n 1 | cut -d ' ' -f 2)"
echo "  ↳ Environment: $(grep APP_ENV .env | cut -d '=' -f2)"
echo ""

# Step 5: Start the server
echo "======================================"
echo -e "${GREEN}🚀 Starting Laravel Development Server${NC}"
echo "======================================"
echo ""
echo -e "${BLUE}Server will be available at:${NC}"
echo "  🌐 http://localhost:8000"
echo "  🌐 http://127.0.0.1:8000"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""

# Start the server
php artisan serve