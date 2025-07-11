import admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

let isInitialized = false;

/**
 * Initialize Firebase Admin SDK using Application Default Credentials
 * Perfect for Google business accounts
 */
export const initializeFirebase = () => {
  try {
    if (!admin.apps.length && !isInitialized) {
      // Pure ADC initialization - no credential object needed
      const initOptions = {
        projectId: process.env.FIREBASE_PROJECT_ID || 'automore-b9159'
        // Firebase will automatically use Application Default Credentials
      };

      admin.initializeApp(initOptions);
      
      isInitialized = true;
      console.log('🔥 Firebase Admin SDK initialized with ADC');
      console.log(`📊 Project ID: ${process.env.FIREBASE_PROJECT_ID}`);
      console.log('🔐 Using Application Default Credentials');
    }
    
    return admin;
  } catch (error: any) {
    console.error('❌ Firebase ADC initialization failed:', error.message);
    
    // Provide specific ADC troubleshooting guidance
    if (error.message.includes('invalid_grant')) {
      console.error('\n🔧 ADC Issue: Credentials expired or invalid');
      console.error('   Solution: gcloud auth application-default login');
    } else if (error.message.includes('invalid_rapt')) {
      console.error('\n🔧 ADC Issue: Reauthentication required');
      console.error('   Solution 1: gcloud auth application-default revoke');
      console.error('   Solution 2: gcloud auth application-default login');
    } else if (error.message.includes('PERMISSION_DENIED')) {
      console.error('\n🔧 ADC Issue: Insufficient permissions');
      console.error('   Solution: Check IAM roles in Google Cloud Console');
    } else if (error.message.includes('time')) {
      console.error('\n🔧 ADC Issue: Time synchronization');
      console.error('   Solution: Sync your system time');
    }
    
    throw new Error('Failed to initialize Firebase with ADC');
  }
};

/**
 * Test ADC connection with detailed diagnostics
 */
export const testADCConnection = async () => {
  try {
    console.log('🧪 Testing ADC Firebase connection...');
    
    if (!isInitialized) {
      initializeFirebase();
    }
    
    // Test Firestore connection
    const db = admin.firestore();
    await db.collection('_health_check').limit(1).get();
    
    console.log('✅ ADC Firestore connection successful');
    
    // Test Auth service
    const auth = admin.auth();
    await auth.listUsers(1);
    
    console.log('✅ ADC Auth service accessible');
    
    return true;
  } catch (error: any) {
    console.error('❌ ADC connection test failed:', error.message);
    
    // Provide specific error guidance
    if (error.message.includes('invalid_grant')) {
      console.error('\n🔧 Run: gcloud auth application-default login');
    } else if (error.message.includes('invalid_rapt')) {
      console.error('\n🔧 Run: gcloud auth application-default revoke && gcloud auth application-default login');
    }
    
    return false;
  }
};

/**
 * Get Firestore database instance (lazy loaded)
 */
export const getDb = () => {
  if (!isInitialized) {
    initializeFirebase();
  }
  return admin.firestore();
};

/**
 * Get Firebase Auth instance (lazy loaded)
 */
export const getAuth = () => {
  if (!isInitialized) {
    initializeFirebase();
  }
  return admin.auth();
};

/**
 * Get Firebase Storage instance (lazy loaded)
 */
export const getStorage = () => {
  if (!isInitialized) {
    initializeFirebase();
  }
  return admin.storage();
};

/**
 * Get Firebase Messaging instance (lazy loaded)
 */
export const getMessaging = () => {
  if (!isInitialized) {
    initializeFirebase();
  }
  return admin.messaging();
};

// Export FieldValue for timestamps
export { FieldValue };

export default admin;