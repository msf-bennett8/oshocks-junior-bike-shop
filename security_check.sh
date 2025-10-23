#!/bin/bash

echo "🔒 Security Scan for Oshocks Junior Bike Shop"
echo "=============================================="
echo ""

FRONTEND="https://oshocks-junior-bike-shop.vercel.app"
BACKEND="https://oshocks-junior-bike-shop-backend.onrender.com"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. SSL/TLS Check
echo "1️⃣  Checking SSL/TLS..."
if curl -s -I $FRONTEND | grep -q "HTTP/2 200"; then
    echo -e "${GREEN}✅ HTTPS is working${NC}"
else
    echo -e "${RED}❌ HTTPS issue detected${NC}"
fi
echo ""

# 2. Security Headers
echo "2️⃣  Checking Security Headers..."
HEADERS=$(curl -sI $FRONTEND)

check_header() {
    if echo "$HEADERS" | grep -qi "$1"; then
        echo -e "${GREEN}✅ $1 present${NC}"
    else
        echo -e "${YELLOW}⚠️  $1 missing${NC}"
    fi
}

check_header "Strict-Transport-Security"
check_header "X-Frame-Options"
check_header "X-Content-Type-Options"
check_header "Content-Security-Policy"
echo ""

# 3. CORS Check
echo "3️⃣  Checking CORS Configuration..."
CORS=$(curl -sI -X OPTIONS $BACKEND/api/v1/products \
  -H "Origin: $FRONTEND" \
  -H "Access-Control-Request-Method: POST")

if echo "$CORS" | grep -q "Access-Control-Allow-Origin"; then
    echo -e "${GREEN}✅ CORS configured${NC}"
    echo "$CORS" | grep "Access-Control-Allow"
else
    echo -e "${RED}❌ CORS not configured${NC}"
fi
echo ""

# 4. Authentication Check
echo "4️⃣  Checking Authentication..."
AUTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND/api/v1/auth/me)

if [ "$AUTH_STATUS" = "401" ]; then
    echo -e "${GREEN}✅ Protected routes require authentication${NC}"
else
    echo -e "${RED}❌ Protected routes accessible without auth (Status: $AUTH_STATUS)${NC}"
fi
echo ""

# 5. Server Information Disclosure
echo "5️⃣  Checking Information Disclosure..."
SERVER_INFO=$(curl -sI $BACKEND/api/v1/products | grep -iE "(Server:|X-Powered-By:)")

if [ -z "$SERVER_INFO" ]; then
    echo -e "${GREEN}✅ Server information hidden${NC}"
else
    echo -e "${YELLOW}⚠️  Server information exposed:${NC}"
    echo "$SERVER_INFO"
fi
echo ""

# 6. HTTP Methods
echo "6️⃣  Checking HTTP Methods..."
TRACE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X TRACE $BACKEND/api/v1/products)

if [ "$TRACE_STATUS" = "405" ] || [ "$TRACE_STATUS" = "403" ]; then
    echo -e "${GREEN}✅ Dangerous methods blocked${NC}"
else
    echo -e "${RED}❌ TRACE method allowed (Status: $TRACE_STATUS)${NC}"
fi
echo ""

# 7. XSS Test
echo "7️⃣  Testing XSS Protection..."
XSS_TEST=$(curl -s "$BACKEND/api/v1/products?search=<script>alert('XSS')</script>" | grep -o "<script>")

if [ -z "$XSS_TEST" ]; then
    echo -e "${GREEN}✅ XSS protection working${NC}"
else
    echo -e "${RED}❌ Potential XSS vulnerability${NC}"
fi
echo ""

# 8. Rate Limiting
echo "8️⃣  Testing Rate Limiting..."
echo "Sending 20 rapid requests..."
RATE_LIMIT_COUNT=0
for i in {1..20}; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" $BACKEND/api/v1/products)
    if [ "$STATUS" = "429" ]; then
        RATE_LIMIT_COUNT=$((RATE_LIMIT_COUNT + 1))
    fi
done

if [ $RATE_LIMIT_COUNT -gt 0 ]; then
    echo -e "${GREEN}✅ Rate limiting active ($RATE_LIMIT_COUNT/20 requests blocked)${NC}"
else
    echo -e "${YELLOW}⚠️  No rate limiting detected${NC}"
fi
echo ""

# 9. OAuth Security
echo "9️⃣  Checking OAuth Endpoints..."
OAUTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BACKEND/api/v1/auth/strava -d '{}')

if [ "$OAUTH_STATUS" = "422" ] || [ "$OAUTH_STATUS" = "400" ]; then
    echo -e "${GREEN}✅ OAuth validation working${NC}"
else
    echo -e "${YELLOW}⚠️  Unexpected OAuth response (Status: $OAUTH_STATUS)${NC}"
fi
echo ""

# Summary
echo "=============================================="
echo "🎯 Security Scan Complete!"
echo "=============================================="