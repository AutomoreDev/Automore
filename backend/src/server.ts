import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';

// Import and initialize Firebase
import { initializeFirebase } from './config/firebase';

// Import middleware
import { errorHandler } from './middleware/error/errorHandler';
import { notFoundHandler } from './middleware/error/notFoundHandler';

// Import routes
import authRoutes from './routes/auth';

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

// Authentication routes
app.use(`/api/${API_VERSION}/auth`, authRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    firebase: 'Connected',
    version: API_VERSION
  });
});

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Automore Portal Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔥 Firebase initialized successfully`);
  console.log(`📡 API Base URL: http://localhost:${PORT}/api/${API_VERSION}`);
  console.log(`🔐 Auth endpoints available at: /api/${API_VERSION}/auth`);
});

export default app;