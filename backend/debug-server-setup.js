#!/usr/bin/env node
// backend/debug-server-setup.js
// Debug script to check server configuration

require('dotenv').config();

console.log('🔧 Automore Portal Server Debug');
console.log('===============================');

// Check Node.js version
console.log(`📦 Node.js version: ${process.version}`);

// Check environment variables
console.log('\n🔐 Environment Variables:');
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`PORT: ${process.env.PORT || 'not set (will use 5001)'}`);
console.log(`API_VERSION: ${process.env.API_VERSION || 'not set (will use v1)'}`);

// Check JWT secrets
console.log('\n🔑 JWT Configuration:');
const jwtSecret = process.env.JWT_SECRET;
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
console.log(`JWT_SECRET: ${jwtSecret ? '✅ Set (' + jwtSecret.length + ' chars)' : '❌ Missing'}`);
console.log(`JWT_REFRESH_SECRET: ${jwtRefreshSecret ? '✅ Set (' + jwtRefreshSecret.length + ' chars)' : '❌ Missing'}`);
console.log(`JWT_EXPIRES_IN: ${process.env.JWT_EXPIRES_IN || 'not set (will use 15m)'}`);
console.log(`JWT_REFRESH_EXPIRES_IN: ${process.env.JWT_REFRESH_EXPIRES_IN || 'not set (will use 7d)'}`);

// Check Firebase configuration
console.log('\n🔥 Firebase Configuration:');
const gcpProject = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT;
const firebaseProject = process.env.FIREBASE_PROJECT_ID;
console.log(`GOOGLE_CLOUD_PROJECT: ${gcpProject || 'not set'}`);
console.log(`FIREBASE_PROJECT_ID: ${firebaseProject || 'not set'}`);

// Check if we're using ADC or service account
const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS;
console.log(`GOOGLE_APPLICATION_CREDENTIALS: ${serviceAccount || 'not set (using ADC)'}`);

// Test Firebase Admin SDK
console.log('\n🔥 Testing Firebase Admin SDK...');
try {
  const admin = require('firebase-admin');
  
  // Check if already initialized
  try {
    const app = admin.app();
    console.log('✅ Firebase Admin already initialized');
    console.log(`   Project ID: ${app.options.projectId || 'not set'}`);
  } catch (error) {
    console.log('🔄 Initializing Firebase Admin...');
    
    // Initialize with ADC (recommended) or service account
    let initOptions = {};
    
    if (gcpProject || firebaseProject) {
      initOptions.projectId = gcpProject || firebaseProject;
    }
    
    const app = admin.initializeApp(initOptions);
    console.log('✅ Firebase Admin initialized successfully');
    console.log(`   Project ID: ${app.options.projectId || 'not set'}`);
  }
  
  // Test Firestore connection
  console.log('🔥 Testing Firestore connection...');
  const db = admin.firestore();
  
  // Simple connection test
  db.collection('test').limit(1).get()
    .then(() => {
      console.log('✅ Firestore connection successful');
    })
    .catch((error) => {
      console.log('❌ Firestore connection failed:', error.message);
    });
    
} catch (error) {
  console.log('❌ Firebase Admin SDK error:', error.message);
}

// Check required dependencies
console.log('\n📦 Checking Dependencies...');
const requiredDeps = [
  'express',
  'firebase-admin', 
  'jsonwebtoken',
  'joi',
  'cors',
  'helmet',
  'morgan',
  'compression',
  'dotenv'
];

requiredDeps.forEach(dep => {
  try {
    require(dep);
    console.log(`✅ ${dep}`);
  } catch (error) {
    console.log(`❌ ${dep} - ${error.message}`);
  }
});

// Check if compiled JavaScript exists
console.log('\n🏗️  Build Status:');
const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, 'dist');
const serverJsPath = path.join(distPath, 'server.js');

if (fs.existsSync(distPath)) {
  console.log('✅ dist/ directory exists');
  
  if (fs.existsSync(serverJsPath)) {
    console.log('✅ dist/server.js exists');
  } else {
    console.log('❌ dist/server.js missing - run "npm run build"');
  }
  
  // Check if key files are built
  const keyFiles = [
    'controllers/auth/authController.js',
    'middleware/validation/authValidation.js',
    'routes/auth/index.js',
    'services/auth/userService.js',
    'services/auth/jwtService.js'
  ];
  
  keyFiles.forEach(file => {
    const filePath = path.join(distPath, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} missing`);
    }
  });
  
} else {
  console.log('❌ dist/ directory missing - run "npm run build"');
}

console.log('\n🚀 Recommendations:');

if (!jwtSecret) {
  console.log('❌ Add JWT_SECRET to your .env file');
  console.log('   Example: JWT_SECRET=your-super-secret-jwt-key-here');
}

if (!jwtRefreshSecret) {
  console.log('❌ Add JWT_REFRESH_SECRET to your .env file'); 
  console.log('   Example: JWT_REFRESH_SECRET=your-super-secret-refresh-key-here');
}

if (!gcpProject && !firebaseProject) {
  console.log('❌ Add GOOGLE_CLOUD_PROJECT to your .env file');
  console.log('   Example: GOOGLE_CLOUD_PROJECT=your-firebase-project-id');
}

if (!fs.existsSync(distPath)) {
  console.log('❌ Run "npm run build" to compile TypeScript');
}

console.log('\n✅ Debug complete!');