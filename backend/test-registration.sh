#!/bin/bash
# backend/test-registration.sh
# Test script for the new registration endpoint

echo "🧪 Testing Registration Endpoint"
echo "================================"
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
    
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" \
        -H "Content-Type: application/json" \
        -d "$data")
    
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

# Test 1: Registration validation errors
echo "📋 Phase 1: Validation Testing"
echo "=============================="

test_endpoint "POST" "http://localhost:5001/api/v1/auth/register" \
    '{"email": "invalid-email"}' \
    "Registration Validation Errors" "422"

# Test 2: Missing required fields
test_endpoint "POST" "http://localhost:5001/api/v1/auth/register" \
    '{"email": "test@example.com", "password": "short"}' \
    "Password Too Short" "422"

# Test 3: Invalid phone number
test_endpoint "POST" "http://localhost:5001/api/v1/auth/register" \
    '{
        "email": "test@example.com",
        "password": "ValidPass123",
        "confirmPassword": "ValidPass123",
        "firstName": "Test",
        "lastName": "User",
        "phoneNumber": "invalid-phone",
        "userType": "CLIENT_USER"
    }' \
    "Invalid Phone Number" "422"

# Test 4: Password mismatch
test_endpoint "POST" "http://localhost:5001/api/v1/auth/register" \
    '{
        "email": "test@example.com",
        "password": "ValidPass123",
        "confirmPassword": "DifferentPass123",
        "firstName": "Test",
        "lastName": "User",
        "phoneNumber": "+27821234567",
        "userType": "CLIENT_USER"
    }' \
    "Password Mismatch" "422"

# Test 5: Business user without company name
test_endpoint "POST" "http://localhost:5001/api/v1/auth/register" \
    '{
        "email": "business@example.com",
        "password": "ValidPass123",
        "confirmPassword": "ValidPass123",
        "firstName": "Business",
        "lastName": "User",
        "phoneNumber": "+27821234567",
        "userType": "BUSINESS_USER"
    }' \
    "Business User Without Company Name" "422"

echo "📋 Phase 2: Successful Registration Testing"
echo "==========================================="

# Test 6: Valid client user registration
test_endpoint "POST" "http://localhost:5001/api/v1/auth/register" \
    '{
        "email": "client@automore-test.com",
        "password": "ClientPass123",
        "confirmPassword": "ClientPass123", 
        "firstName": "John",
        "lastName": "Client",
        "phoneNumber": "+27821234567",
        "userType": "CLIENT_USER"
    }' \
    "Valid Client Registration" "201"

# Test 7: Valid business user registration
test_endpoint "POST" "http://localhost:5001/api/v1/auth/register" \
    '{
        "email": "business@automore-test.com",
        "password": "BusinessPass123",
        "confirmPassword": "BusinessPass123",
        "firstName": "Jane",
        "lastName": "Business",
        "phoneNumber": "+27827654321", 
        "userType": "BUSINESS_USER",
        "companyName": "Test Business Solutions"
    }' \
    "Valid Business Registration" "201"

echo "📋 Phase 3: Duplicate Registration Testing"
echo "=========================================="

# Test 8: Duplicate email registration
test_endpoint "POST" "http://localhost:5001/api/v1/auth/register" \
    '{
        "email": "client@automore-test.com",
        "password": "AnotherPass123",
        "confirmPassword": "AnotherPass123",
        "firstName": "Another",
        "lastName": "User",
        "phoneNumber": "+27829876543",
        "userType": "CLIENT_USER"
    }' \
    "Duplicate Email Registration" "409"

echo "📋 Phase 4: Test Login with New Users"
echo "====================================="

# Test 9: Login with newly created client user
test_endpoint "POST" "http://localhost:5001/api/v1/auth/login" \
    '{
        "email": "client@automore-test.com",
        "password": "ClientPass123"
    }' \
    "Login with New Client User" "200"

# Test 10: Login with newly created business user
test_endpoint "POST" "http://localhost:5001/api/v1/auth/login" \
    '{
        "email": "business@automore-test.com", 
        "password": "BusinessPass123"
    }' \
    "Login with New Business User" "200"

echo "🎉 Registration Testing Complete!"
echo "================================="
echo ""
echo "Summary:"
echo "✅ = Test passed"
echo "❌ = Test failed"
echo ""
echo "Next steps:"
echo "1. Run 'chmod +x test-registration.sh' to make executable"
echo "2. Run './test-registration.sh' to execute tests"
echo "3. Check that both registrations and logins work correctly"
echo "4. Verify users are created in Firebase Console"