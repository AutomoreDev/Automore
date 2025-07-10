async function testAuthFlow() {
    console.log('🧪 Testing Authentication Flow...\n');
  
    try {
      // Load environment first
      require('dotenv').config();
      
      // Check if Firebase Admin is available
      let admin;
      try {
        admin = require('firebase-admin');
        console.log('✅ Firebase Admin SDK loaded');
      } catch (err) {
        console.error('❌ Firebase Admin SDK not available:', err.message);
        return;
      }
  
      // Check if our services are available
      let userService, jwtService;
      try {
        const userServiceModule = require('./dist/services/auth/userService');
        const jwtServiceModule = require('./dist/services/auth/jwtService');
        userService = userServiceModule.userService;
        jwtService = jwtServiceModule.jwtService;
        console.log('✅ Auth services loaded');
      } catch (err) {
        console.error('❌ Auth services not available:', err.message);
        console.log('Please ensure the project is built with "npm run build"');
        return;
      }
  
      // Test Firebase connection
      console.log('\n1. Testing Firebase connection...');
      const db = admin.firestore();
      
      // Simple connection test
      try {
        await db.collection('test').limit(1).get();
        console.log('✅ Firebase Firestore connected');
      } catch (err) {
        console.error('❌ Firebase connection failed:', err.message);
        return;
      }
  
      // Test user creation (simplified)
      console.log('\n2. Testing user service...');
      const testUser = {
        uid: 'test-user-' + Date.now(),
        email: 'test@example.com',
        emailVerified: true,
        displayName: 'Test User',
        phoneNumber: '+27123456789'
      };
  
      try {
        const createdUser = await userService.createOrUpdateUser(testUser, {
          role: 'CLIENT_USER',
          firstName: 'Test',
          lastName: 'User'
        });
        console.log('✅ User service working');
        
        // Clean up
        await db.collection('users').doc(testUser.uid).delete();
        console.log('✅ Test cleanup completed');
        
      } catch (err) {
        console.error('❌ User service test failed:', err.message);
      }
  
      console.log('\n🎉 Authentication flow test completed!');
  
    } catch (error) {
      console.error('❌ Authentication flow test failed:', error.message);
      console.error(error.stack);
    }
  }
  
  module.exports = { testAuthFlow };