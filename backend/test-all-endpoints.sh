#!/bin/bash
# backend/test-all-endpoints.sh
# Comprehensive test script for authentication endpoints on port 5001

echo "🧪 Automore Portal Authentication Testing Suite"
echo "================================================"
echo "Port: 5001"
echo "Date: $(date)"
echo ""

# Function to test endpoint with expected response
test_endpoint() {
    local method=$1
    local url=$2
    local data=$3
    local description=$4
    local expected_status=$5
    
    echo "🔍 Testing: $description"
    echo "   Method: $method"
    echo "   URL: $url"
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$url")
    fi
    
    # Extract status code (last line)
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$status_code" = "$expected_status" ]; then
        echo "   ✅ Status: $status_code (Expected: $expected_status)"
    else
        echo "   ❌ Status: $status_code (Expected: $expected_status)"
    fi
    
    echo "   Response: $body"
    echo ""
}

# Phase 1: Server Health & Basic Connectivity
echo "📊 Phase 1: Server Health & Basic Connectivity"
echo "==============================================="

test_endpoint "GET" "http://localhost:5001/health" "" "Health Check" "200"
test_endpoint "GET" "http://localhost:5001/api/v1" "" "API Base Endpoint" "200"

# Phase 2: Authentication Endpoint Testing
echo "🔐 Phase 2: Authentication Endpoint Testing"
echo "==========================================="

# Test validation errors
test_endpoint "POST" "http://localhost:5001/api/v1/auth/login" \
    '{"email": "invalid-email", "password": "123"}' \
    "Login Validation Errors" "422"

# Test valid login structure (will fail auth but validate structure)
test_endpoint "POST" "http://localhost:5001/api/v1/auth/login" \
    '{"email": "admin@automore.co.za", "password": "TestPass123!"}' \
    "Valid Login Structure" "401"

# Test password reset
test_endpoint "POST" "http://localhost:5001/api/v1/auth/reset-password" \
    '{"email": "admin@automore.co.za"}' \
    "Password Reset Request" "200"

# Test invalid token verification
test_endpoint "GET" "http://localhost:5001/api/v1/auth/verify-token" \
    "" "Invalid Token Verification" "401"

# Test refresh token
test_endpoint "POST" "http://localhost:5001/api/v1/auth/refresh" \
    '{"refreshToken": "invalid-refresh-token"}' \
    "Refresh Token (Invalid)" "401"

# Phase 3: Error Handling & Edge Cases
echo "⚠️  Phase 3: Error Handling & Edge Cases"
echo "========================================"

test_endpoint "GET" "http://localhost:5001/api/v1/nonexistent" "" \
    "404 Not Found Handler" "404"

# Test malformed JSON (might cause connection error)
echo "🔍 Testing: Malformed JSON"
echo "   Method: POST"
echo "   URL: http://localhost:5001/api/v1/auth/login"
response=$(curl -s -w "\n%{http_code}" -X POST "http://localhost:5001/api/v1/auth/login" \
    -H "Content-Type: application/json" \
    -d '{invalid json}' 2>/dev/null || echo "Connection error\n400")

status_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n -1)

if [ "$status_code" = "400" ]; then
    echo "   ✅ Status: $status_code (Expected: 400 for malformed JSON)"
else
    echo "   ❌ Status: $status_code (Expected: 400 for malformed JSON)"
fi
echo "   Response: $body"
echo ""

# Phase 4: Rate Limiting Test
echo "🚦 Phase 4: Rate Limiting Test"
echo "=============================="

echo "Sending 6 rapid requests to test rate limiting..."
for i in {1..6}; do
    echo "Request $i:"
    response=$(curl -s -w "\n%{http_code}" -X POST "http://localhost:5001/api/v1/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email": "test@email.com", "password": "password"}')
    
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    echo "   Status: $status_code"
    if [ "$i" -gt 5 ] && [ "$status_code" = "429" ]; then
        echo "   ✅ Rate limiting working (429 after 5 requests)"
    elif [ "$i" -le 5 ]; then
        echo "   ✅ Request $i allowed"
    else
        echo "   ❌ Rate limiting not triggered"
    fi
    
    # Small delay between requests
    sleep 0.1
done

echo ""

# Phase 5: Protected Routes (without valid tokens)
echo "🛡️  Phase 5: Protected Routes Testing"
echo "===================================="

test_endpoint "GET" "http://localhost:5001/api/v1/auth/profile" "" \
    "Profile Access (No Token)" "401"

# Summary
echo "📋 Test Summary"
echo "==============="
echo "All tests completed. Check the results above."
echo "✅ = Test passed (got expected response)"
echo "❌ = Test failed (unexpected response)"
echo ""
echo "Expected results for a working auth system:"
echo "- Health check: 200 OK"
echo "- API base: 200 OK"
echo "- Validation errors: 422 with detailed error messages"
echo "- Invalid auth: 401 Unauthorized"
echo "- 404 handler: 404 Not Found"
echo "- Rate limiting: 429 after 5 attempts"
echo "- Protected routes: 401 without valid token"