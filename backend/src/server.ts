import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';

// Import and initialize Firebase
import { initializeFirebase } from './config/firebase';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin SDK
initializeFirebase();

// Create Express application
const app = express();
const PORT = process.env.PORT || 5000;
const API_VERSION = process.env.API_VERSION || 'v1';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "*.firebase.com", "*.googleapis.com"],
      connectSrc: ["'self'", "*.firebase.com", "*.googleapis.com"]
    }
  }
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files (for uploaded documents)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes
app.get(`/api/${API_VERSION}`, (req: Request, res: Response) => {
  res.json({
    message: 'Automore Portal API',
    version: API_VERSION,
    status: 'Active',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: API_VERSION,
    services: {
      firebase: 'Connected',
      api: 'Active'
    }
  });
});

// Test Firebase connection endpoint
app.get(`/api/${API_VERSION}/test-firebase`, async (req: Request, res: Response) => {
  try {
    const { getDb } = await import('./config/firebase');
    const db = getDb();
    
    // Test Firestore connection
    const testDoc = await db.collection('test').add({
      message: 'API test successful',
      timestamp: new Date()
    });
    
    // Clean up test document
    await testDoc.delete();
    
    res.json({
      success: true,
      message: 'Firebase connection successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Firebase test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Firebase connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Global error handler:', err);
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && {
      error: err.message,
      stack: err.stack
    }),
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n🚀 ======================================');
  console.log('   AUTOMORE PORTAL BACKEND STARTED');
  console.log('  ======================================');
  console.log(`🌐 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api/${API_VERSION}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`🔥 Firebase Test: http://localhost:${PORT}/api/${API_VERSION}/test-firebase`);
  console.log(`🔥 Firebase Project: ${process.env.FIREBASE_PROJECT_ID}`);
  console.log('======================================\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;