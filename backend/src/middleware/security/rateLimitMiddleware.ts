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

    const key = `${req.ip}:${endpoint}`;
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

/**
 * Clear all rate limit data (useful for testing)
 */
export const clearRateLimitStore = () => {
  Object.keys(rateLimitStore).forEach(key => {
    delete rateLimitStore[key];
  });
  console.log('🧹 Rate limit store cleared');
};