const path = require('path');
const fs = require('fs');

async function testJWTService() {
  console.log('🧪 Testing JWT Service...\n');

  try {
    // Check if dist directory exists
    const distPath = path.join(__dirname, 'dist');
    if (!fs.existsSync(distPath)) {
      console.error('❌ Dist directory not found. Please run "npm run build" first.');
      return;
    }

    // Check if JWT service exists
    const jwtServicePath = path.join(distPath, 'services', 'auth', 'jwtService.js');
    if (!fs.existsSync(jwtServicePath)) {
      console.error('❌ JWT service not found at:', jwtServicePath);
      console.log('Available files in dist/services:');
      try {
        const servicesPath = path.join(distPath, 'services');
        if (fs.existsSync(servicesPath)) {
          const files = fs.readdirSync(servicesPath, { recursive: true });
          files.forEach(file => console.log('  -', file));
        }
      } catch (err) {
        console.log('Could not list services directory');
      }
      return;
    }

    // Import the JWT service
    const { jwtService } = require('./dist/services/auth/jwtService');

    const testPayload = {
      uid: 'test-uid-123',
      email: 'test@example.com',
      role: 'BUSINESS_ADMIN',
      companyId: 'company-123'
    };

    // Test access token generation
    console.log('1. Generating access token...');
    const accessToken = jwtService.generateAccessToken(testPayload);
    console.log('✅ Access token generated:', accessToken.substring(0, 50) + '...\n');

    // Test refresh token generation
    console.log('2. Generating refresh token...');
    const refreshToken = jwtService.generateRefreshToken(testPayload);
    console.log('✅ Refresh token generated:', refreshToken.substring(0, 50) + '...\n');

    // Test access token verification
    console.log('3. Verifying access token...');
    const decodedAccess = jwtService.verifyAccessToken(accessToken);
    console.log('✅ Access token verified:', JSON.stringify(decodedAccess, null, 2));

    // Test refresh token verification
    console.log('\n4. Verifying refresh token...');
    const decodedRefresh = jwtService.verifyRefreshToken(refreshToken);
    console.log('✅ Refresh token verified:', JSON.stringify(decodedRefresh, null, 2));

    // Test token expiry
    console.log('\n5. Checking token expiry time...');
    const expiryTime = jwtService.getAccessTokenExpiryTime();
    console.log('✅ Token expires in:', expiryTime, 'seconds');

    // Test header extraction
    console.log('\n6. Testing header extraction...');
    const extractedToken = jwtService.extractTokenFromHeader(`Bearer ${accessToken}`);
    console.log('✅ Token extracted from header:', extractedToken === accessToken);

    console.log('\n🎉 All JWT tests passed!');

  } catch (error) {
    console.error('❌ JWT test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}