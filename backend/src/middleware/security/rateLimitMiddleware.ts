// backend/src/middleware/security/rateLimitMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../../../../shared/types/api';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (use Redis in production)
const rateLimitStore: RateLimitStore = {};

/**
 * Development-friendly rate limiting middleware
 */
export const rateLimitMiddleware = (maxAttempts: number, windowMinutes: number) => {
  return (req: Request, res: Response<ApiResponse>, next: NextFunction): void => {
    // Skip rate limiting in development mode if flag is set
    if (process.env.NODE_ENV === 'development' && process.env.SKIP_RATE_LIMIT === 'true') {
      console.log('🚦 Rate limiting skipped (development mode)');
      return next();
    }

    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;

    // Clean up expired entries periodically
    if (Math.random() < 0.01) {
      Object.keys(rateLimitStore).forEach(storeKey => {
        const entry = rateLimitStore[storeKey];
        if (entry && entry.resetTime < now) {
          delete rateLimitStore[storeKey];
        }
      });
    }

    // Get current rate limit data
    let rateLimit = rateLimitStore[key];

    if (!rateLimit) {
      // First request in window
      rateLimitStore[key] = {
        count: 1,
        resetTime: now + windowMs
      };
      return next();
    }

    if (rateLimit.resetTime < now) {
      // Window has expired, reset
      rateLimitStore[key] = {
        count: 1,
        resetTime: now + windowMs
      };
      return next();
    }

    if (rateLimit.count >= maxAttempts) {
      // Rate limit exceeded
      const resetIn = Math.ceil((rateLimit.resetTime - now) / 1000);
      
      console.log(`🚦 Rate limit exceeded for ${req.ip} on ${req.path}`);
      
      res.status(429).json({
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        message: `Too many requests. Try again in ${resetIn} seconds.`,
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Increment counter
    rateLimit.count++;
    
    next();
  };
};

/**
 * Create development-friendly rate limiter for specific endpoints
 */
export const createRateLimiter = (
  endpoint: string,
  maxAttempts: number,
  windowMinutes: number
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Skip rate limiting in development mode if flag is set
    if (process.env.NODE_ENV === 'development' && process.env.SKIP_RATE_LIMIT === 'true') {
      return next();
    }

    // Use user ID if available, otherwise fall back to IP
    const userId = (req.user as any)?.uid;
    const key = userId ? `${userId}:${endpoint}` : `${req.ip}:${endpoint}`;
    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;

    let rateLimit = rateLimitStore[key];

    if (!rateLimit || rateLimit.resetTime < now) {
      rateLimitStore[key] = {
        count: 1,
        resetTime: now + windowMs
      };
      return next();
    }

    if (rateLimit.count >= maxAttempts) {
      const resetIn = Math.ceil((rateLimit.resetTime - now) / 1000);
      
      res.status(429).json({
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        message: `Too many ${endpoint} requests. Try again in ${resetIn} seconds.`,
        timestamp: new Date().toISOString()
      });
      return;
    }

    rateLimit.count++;
    next();
  };
};

// More lenient rate limiters for development
const isDevelopment = process.env.NODE_ENV === 'development';

// ==================== EXISTING AUTH RATE LIMITERS ====================

export const loginRateLimit = createRateLimiter(
  'login', 
  isDevelopment ? 50 : 5,  // 50 attempts in dev, 5 in prod
  isDevelopment ? 1 : 15   // 1 minute window in dev, 15 in prod
);

export const passwordResetRateLimit = createRateLimiter(
  'password-reset', 
  isDevelopment ? 20 : 3,  // 20 attempts in dev, 3 in prod
  isDevelopment ? 1 : 60   // 1 minute window in dev, 60 in prod
);

export const changePasswordRateLimit = createRateLimiter(
  'change-password', 
  isDevelopment ? 20 : 3,  // 20 attempts in dev, 3 in prod
  isDevelopment ? 1 : 60   // 1 minute window in dev, 60 in prod
);

// ==================== NEW TICKET SYSTEM RATE LIMITERS ====================

/**
 * Rate limiter for ticket creation
 * Prevents spam ticket creation
 */
export const ticketCreationRateLimit = createRateLimiter(
  'ticket-creation',
  isDevelopment ? 50 : 10,  // 50 tickets in dev, 10 in prod
  isDevelopment ? 1 : 15    // 1 minute window in dev, 15 in prod
);

/**
 * Rate limiter for ticket messages
 * Prevents spam messaging in tickets
 */
export const ticketMessagesRateLimit = createRateLimiter(
  'ticket-messages',
  isDevelopment ? 100 : 20, // 100 messages in dev, 20 in prod
  isDevelopment ? 1 : 5     // 1 minute window in dev, 5 in prod
);

/**
 * Rate limiter for file uploads
 * Prevents excessive file upload attempts
 */
export const fileUploadRateLimit = createRateLimiter(
  'file-upload',
  isDevelopment ? 100 : 30, // 100 uploads in dev, 30 in prod
  isDevelopment ? 1 : 10    // 1 minute window in dev, 10 in prod
);

/**
 * Rate limiter for ticket updates
 * Prevents rapid ticket status changes
 */
export const ticketUpdateRateLimit = createRateLimiter(
  'ticket-update',
  isDevelopment ? 100 : 50, // 100 updates in dev, 50 in prod
  isDevelopment ? 1 : 5     // 1 minute window in dev, 5 in prod
);

/**
 * Rate limiter for ticket searches/listings
 * Prevents API abuse for ticket queries
 */
export const ticketQueryRateLimit = createRateLimiter(
  'ticket-query',
  isDevelopment ? 200 : 100, // 200 queries in dev, 100 in prod
  isDevelopment ? 1 : 1      // 1 minute window both dev and prod
);

// ==================== ADMIN OPERATION RATE LIMITERS ====================

/**
 * Strict rate limiter for sensitive admin operations
 */
export const adminOperationRateLimit = createRateLimiter(
  'admin-operation',
  isDevelopment ? 20 : 5,   // 20 operations in dev, 5 in prod
  isDevelopment ? 1 : 60    // 1 minute window in dev, 60 in prod
);

/**
 * Rate limiter for bulk operations
 */
export const bulkOperationRateLimit = createRateLimiter(
  'bulk-operation',
  isDevelopment ? 10 : 3,   // 10 operations in dev, 3 in prod
  isDevelopment ? 1 : 60    // 1 minute window in dev, 60 in prod
);

// ==================== HELPER FUNCTIONS ====================

/**
 * Skip rate limiting for system admins
 */
export const createRateLimiterWithAdminSkip = (
  endpoint: string,
  maxAttempts: number,
  windowMinutes: number
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Skip rate limiting for system admins
    const user = req.user as any;
    if (user?.role === 'SYSTEM_ADMIN') {
      return next();
    }

    // Use the existing rate limiter
    return createRateLimiter(endpoint, maxAttempts, windowMinutes)(req, res, next);
  };
};

/**
 * Clear all rate limit data (useful for testing)
 */
export const clearRateLimitStore = () => {
  Object.keys(rateLimitStore).forEach(key => {
    delete rateLimitStore[key];
  });
  console.log('🧹 Rate limit store cleared');
};

/**
 * Get current rate limit status for a key
 */
export const getRateLimitStatus = (ip: string, endpoint: string) => {
  const key = `${ip}:${endpoint}`;
  const rateLimit = rateLimitStore[key];
  
  if (!rateLimit || rateLimit.resetTime < Date.now()) {
    return { count: 0, resetTime: null, isExceeded: false };
  }
  
  return {
    count: rateLimit.count,
    resetTime: new Date(rateLimit.resetTime),
    isExceeded: false // You'd need to pass maxAttempts to determine this
  };
};

/**
 * Development helper: Log all active rate limits
 */
export const logActiveRateLimits = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🚦 Active Rate Limits:');
    Object.entries(rateLimitStore).forEach(([key, data]) => {
      const resetIn = Math.ceil((data.resetTime - Date.now()) / 1000);
      console.log(`  ${key}: ${data.count} requests, resets in ${resetIn}s`);
    });
  }
};