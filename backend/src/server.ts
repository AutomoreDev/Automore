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
// Tickets
import ticketRoutes from './routes/ticket/ticketRoutes';
// Projects (NEW)
import projectRoutes from './routes/project/projectRoutes';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin SDK
initializeFirebase();

// Create Express application
const app = express();
const PORT = process.env.PORT || 5001;
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
    environment: process.env.NODE_ENV || 'development',
    features: {
      authentication: 'enabled',
      tickets: 'enabled',
      projects: 'enabled',
      timeTracking: process.env.TIME_TRACKING_ENABLED === 'true',
      budgetTracking: process.env.ENABLE_BUDGET_TRACKING === 'true',
      payments: 'coming-soon'
    }
  });
});

// Authentication routes
app.use(`/api/${API_VERSION}/auth`, authRoutes);

// Ticket routes
app.use(`/api/${API_VERSION}/tickets`, ticketRoutes);

// Project routes (NEW)
app.use(`/api/${API_VERSION}/projects`, projectRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    firebase: 'Connected',
    version: API_VERSION,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    services: {
      database: 'Firebase Firestore',
      storage: 'Firebase Storage',
      authentication: 'Firebase Auth',
      websockets: process.env.SOCKET_IO_PORT ? 'Enabled' : 'Disabled'
    }
  });
});

// Development-only routes
if (process.env.NODE_ENV === 'development' && process.env.ENABLE_DEBUG_ROUTES === 'true') {
  app.get('/debug/env', (req: Request, res: Response) => {
    const safeEnv = {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      API_VERSION: process.env.API_VERSION,
      FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
      TIME_TRACKING_ENABLED: process.env.TIME_TRACKING_ENABLED,
      ENABLE_BUDGET_TRACKING: process.env.ENABLE_BUDGET_TRACKING,
      DEFAULT_CURRENCY: process.env.DEFAULT_CURRENCY,
      DEFAULT_TIMEZONE: process.env.DEFAULT_TIMEZONE
    };
    res.json(safeEnv);
  });

  app.get('/debug/routes', (req: Request, res: Response) => {
    const routes = [
      { method: 'GET', path: `/api/${API_VERSION}`, description: 'API info' },
      { method: 'GET', path: '/health', description: 'Health check' },
      { method: 'POST', path: `/api/${API_VERSION}/auth/login`, description: 'User login' },
      { method: 'POST', path: `/api/${API_VERSION}/auth/register`, description: 'User registration' },
      { method: 'GET', path: `/api/${API_VERSION}/tickets`, description: 'Get tickets' },
      { method: 'POST', path: `/api/${API_VERSION}/tickets`, description: 'Create ticket' },
      { method: 'GET', path: `/api/${API_VERSION}/projects`, description: 'Get projects' },
      { method: 'POST', path: `/api/${API_VERSION}/projects`, description: 'Create project' },
      { method: 'GET', path: `/api/${API_VERSION}/projects/dashboard`, description: 'Project dashboard' },
      { method: 'GET', path: `/api/${API_VERSION}/projects/statistics`, description: 'Project statistics' }
    ];
    res.json(routes);
  });
}

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Automore Portal Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔥 Firebase initialized successfully`);
  console.log(`📡 API Base URL: http://localhost:${PORT}/api/${API_VERSION}`);
  console.log(`🔐 Auth endpoints available at: /api/${API_VERSION}/auth`);
  console.log(`🎫 Ticket endpoints available at: /api/${API_VERSION}/tickets`);
  console.log(`📁 Project endpoints available at: /api/${API_VERSION}/projects`);
  
  if (process.env.ENABLE_DEBUG_ROUTES === 'true') {
    console.log(`🐛 Debug routes enabled at: /debug/*`);
  }
  
  if (process.env.SOCKET_IO_PORT) {
    console.log(`🔌 WebSocket server on port: ${process.env.SOCKET_IO_PORT}`);
  }
  
  console.log(`💾 Uploads directory: uploads/`);
  console.log(`📈 Rate limiting: ${process.env.SKIP_RATE_LIMIT === 'true' ? 'DISABLED' : 'ENABLED'}`);
});

export default app;