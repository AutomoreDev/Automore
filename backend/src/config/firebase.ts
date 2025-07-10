import admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

let isInitialized = false;

/**
 * Initialize Firebase Admin SDK
 * Using Application Default Credentials for authentication
 */
export const initializeFirebase = () => {
  try {
    if (!admin.apps.length && !isInitialized) {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'automore-b9159',
        // Using Application Default Credentials - no credential object needed
      });
      
      isInitialized = true;
      console.log('🔥 Firebase Admin SDK initialized successfully');
      console.log(`📊 Project ID: ${process.env.FIREBASE_PROJECT_ID}`);
    }
    
    return admin;
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    throw new Error('Failed to initialize Firebase Admin SDK');
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