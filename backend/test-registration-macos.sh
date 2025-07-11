#!/bin/bash
# backend/test-registration-macos.sh
# macOS-compatible test script for registration endpoint

echo "🧪 Testing Registration Endpoint (macOS Compatible)"
echo "================================================="
echo "Port: 5001"
echo "Date: $(date)"
echo ""

# Function to test endpoint with expected response (macOS compatible)
test_endpoint() {
    local method=$1
    local url=$2
    local data=$3
    local description=$4
    local expected_status=$5
    
    echo "🔍 Testing: $description"
    echo "   Method: $method"
    echo "   URL: $url"
    
    # Create temporary file for response
    local temp_file=$(mktemp)
    
    if [ -n "$data" ]; then
        curl -s -w "\n%{http_code}" -X "$method" "$url" \
            -H "Content-Type: application/json" \
            -d "$data" > "$temp_file"
    else
        curl -s -w "\n%{http_code}" -X "$method" "$url" > "$temp_file"
    fi
    
    # Extract status code (last line) and body (all but last line)
    local status_code=$(tail -n1 "$temp_file")
    local body=$(sed '$d' "$temp_file")
    
    # Clean up temp file
    rm "$temp_file"
    
    if [ "$status_code" = "$expected_status" ]; then
        echo "   ✅ Status: $status_code (Expected: $expected_status)"
    else
        echo "   ❌ Status: $status_code (Expected: $expected_status)"
    fi
    
    echo "   Response: $body"
    echo ""
}

# Test 1: Server Health
echo "📊 Phase 1: Server Health Check"
echo "==============================="

test_endpoint "GET" "http://localhost:5001/health" "" "Health Check" "200"

# Test 2: Registration validation errors
echo "📋 Phase 2: Registration Validation Testing"
echo "=========================================="

test_endpoint "POST" "http://localhost:5001/api/v1/auth/register" \
    '{"email": "invalid-email"}' \
    "Registration Validation Errors" "422"

# Test 3: Password too short
test_endpoint "POST" "http://localhost:5001/api/v1/auth/register" \
    '{"email": "test@example.com", "password": "short"}' \
    "Password Too Short" "422"

# Test 4: Valid client user registration
echo "📋 Phase 3: Valid Registration Testing"
echo "====================================="

test_endpoint "POST" "http://localhost:5001/api/v1/auth/register" \
    '{
        "email": "client-test@automore-debug.com",
        "password": "ClientPass123",
        "confirmPassword": "ClientPass123", 
        "firstName": "Debug",
        "lastName": "Client",
        "phoneNumber": "+27821234567",
        "userType": "CLIENT_USER"
    }' \
    "Valid Client Registration" "201"

# Test 5: Valid business user registration
test_endpoint "POST" "http://localhost:5001/api/v1/auth/register" \
    '{
        "email": "business-test@automore-debug.com",
        "password": "BusinessPass123",
        "confirmPassword": "BusinessPass123",
        "firstName": "Debug",
        "lastName": "Business",
        "phoneNumber": "+27827654321", 
        "userType": "BUSINESS_USER",
        "companyName": "Debug Business Solutions"
    }' \
    "Valid Business Registration" "201"

# Test 6: Duplicate registration
echo "📋 Phase 4: Duplicate Registration Testing"
echo "========================================="

test_endpoint "POST" "http://localhost:5001/api/v1/auth/register" \
    '{
        "email": "client-test@automore-debug.com",
        "password": "AnotherPass123",
        "confirmPassword": "AnotherPass123",
        "firstName": "Another",
        "lastName": "User",
        "phoneNumber": "+27829876543",
        "userType": "CLIENT_USER"
    }' \
    "Duplicate Email Registration" "409"

echo "🎉 Registration Testing Complete!"
echo "================================="
echo ""
echo "🔧 If you see 500 errors, check:"
echo "1. Backend server logs (npm run dev)"
echo "2. Firebase configuration"
echo "3. Environment variables (.env file)"
echo "4. JWT secrets are set"