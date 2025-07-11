#!/usr/bin/env node
// backend/debug-adc-firebase.js
// Enhanced diagnostic script for ADC Firebase setup

require('dotenv').config();

console.log('🔐 Automore ADC Firebase Diagnostics');
console.log('====================================');
console.log(`📅 Date: ${new Date().toISOString()}`);
console.log(`📦 Node.js: ${process.version}`);

// Check environment variables
console.log('\n🌍 Environment Configuration:');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`FIREBASE_PROJECT_ID: ${process.env.FIREBASE_PROJECT_ID || 'not set'}`);
console.log(`SKIP_RATE_LIMIT: ${process.env.SKIP_RATE_LIMIT || 'not set'}`);

// Check that no service account path is set (pure ADC)
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (serviceAccountPath) {
  console.log(`⚠️  GOOGLE_APPLICATION_CREDENTIALS: ${serviceAccountPath}`);
  console.log('   WARNING: This will override ADC. Comment out for pure ADC.');
} else {
  console.log('✅ GOOGLE_APPLICATION_CREDENTIALS: not set (pure ADC mode)');
}

async function checkGoogleCloudCLI() {
  console.log('\n🔧 Google Cloud CLI Status:');
  
  const { exec } = require('child_process');
  const util = require('util');
  const execPromise = util.promisify(exec);
  
  try {
    // Check if gcloud is available
    const { stdout } = await execPromise('gcloud --version');
    console.log('✅ Google Cloud CLI available');
    
    // Check current authentication
    try {
      const { stdout: authList } = await execPromise('gcloud auth list --filter=status:ACTIVE --format="value(account)"');
      const activeAccount = authList.trim();
      if (activeAccount) {
        console.log(`✅ Active account: ${activeAccount}`);
      } else {
        console.log('❌ No active Google Cloud account');
        return false;
      }
    } catch (error) {
      console.log('❌ Could not check authentication status');
      return false;
    }
    
    // Check current project
    try {
      const { stdout: project } = await execPromise('gcloud config get-value project');
      const currentProject = project.trim();
      if (currentProject === 'automore-b9159') {
        console.log(`✅ Project: ${currentProject}`);
      } else {
        console.log(`⚠️  Project: ${currentProject} (expected: automore-b9159)`);
        console.log('   Run: gcloud config set project automore-b9159');
      }
    } catch (error) {
      console.log('❌ Could not determine current project');
      return false;
    }
    
    // Test ADC access token
    try {
      const { stdout } = await execPromise('gcloud auth application-default print-access-token');
      if (stdout.trim().length > 20) {
        console.log('✅ ADC access token available');
        return true;
      } else {
        console.log('❌ ADC access token invalid');
        return false;
      }
    } catch (error) {
      console.log('❌ ADC access token not available');
      console.log('   Run: gcloud auth application-default login');
      return false;
    }
    
  } catch (error) {
    console.log('❌ Google Cloud CLI not available');
    console.log('   Install: https://cloud.google.com/sdk/docs/install');
    return false;
  }
}

async function testFirebaseConnection() {
  console.log('\n🔥 Firebase Connection Test:');
  
  try {
    const admin = require('firebase-admin');
    
    // Check if already initialized
    let app;
    try {
      app = admin.app();
      console.log('ℹ️  Firebase already initialized');
    } catch (error) {
      console.log('🔄 Initializing Firebase with ADC...');
      
      // Pure ADC initialization
      app = admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'automore-b9159'
      });
      
      console.log('✅ Firebase Admin initialized');
    }
    
    console.log(`📊 Project ID: ${app.options.projectId}`);
    
    // Test Firestore connection
    console.log('\n🗃️  Testing Firestore...');
    const db = admin.firestore();
    
    try {
      await db.collection('_health_check').limit(1).get();
      console.log('✅ Firestore connection successful');
    } catch (error) {
      console.error('❌ Firestore failed:', error.message);
      
      // Provide specific guidance
      if (error.message.includes('invalid_grant')) {
        console.error('🔧 Fix: gcloud auth application-default login');
      } else if (error.message.includes('invalid_rapt')) {
        console.error('🔧 Fix: gcloud auth application-default revoke && gcloud auth application-default login');
      } else if (error.message.includes('PERMISSION_DENIED')) {
        console.error('🔧 Fix: Check IAM permissions in Google Cloud Console');
      }
      return false;
    }
    
    // Test Auth service
    console.log('\n🔐 Testing Firebase Auth...');
    try {
      const auth = admin.auth();
      await auth.listUsers(1);
      console.log('✅ Firebase Auth accessible');
    } catch (error) {
      console.error('❌ Firebase Auth failed:', error.message);
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Firebase setup failed:', error.message);
    return false;
  }
}

async function main() {
  const isGCloudOK = await checkGoogleCloudCLI();
  const isFirebaseOK = await testFirebaseConnection();
  
  console.log('\n📋 Summary:');
  if (isGCloudOK && isFirebaseOK) {
    console.log('🎉 ALL SYSTEMS GO! Your ADC Firebase setup is working.');
    console.log('🚀 You should be able to run your backend successfully now.');
  } else {
    console.log('❌ Issues detected. Follow the guidance above to fix them.');
    
    if (!isGCloudOK) {
      console.log('\n🔧 To fix Google Cloud CLI issues:');
      console.log('1. Install gcloud CLI if missing');
      console.log('2. Run: gcloud auth application-default login');
      console.log('3. Run: gcloud config set project automore-b9159');
    }
    
    if (!isFirebaseOK) {
      console.log('\n🔧 To fix Firebase issues:');
      console.log('1. Ensure Google Cloud CLI is working first');
      console.log('2. Check IAM permissions in Google Cloud Console');
      console.log('3. Verify billing is enabled for the project');
    }
  }
  
  console.log('\n📞 Business Account Notes:');
  console.log('• Your Google Workspace admin may need to grant access');
  console.log('• Billing must be enabled for the Firebase project');
  console.log('• You need Firebase Admin or Editor IAM role');
}

main().catch(console.error);