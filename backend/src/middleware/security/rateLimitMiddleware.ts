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
 * Rate limiting middleware
 */
export const rateLimitMiddleware = (maxAttempts: number, windowMinutes: number) => {
  return (req: Request, res: Response<ApiResponse>, next: NextFunction): void => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;

    // Clean up expired entries
    Object.keys(rateLimitStore).forEach(storeKey => {
      const entry = rateLimitStore[storeKey];
      if (entry && entry.resetTime < now) {
        delete rateLimitStore[storeKey];
      }
    });

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
 * Create rate limiter for specific endpoints
 */
export const createRateLimiter = (
  endpoint: string,
  maxAttempts: number,
  windowMinutes: number
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
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

// Pre-configured rate limiters
export const loginRateLimit = createRateLimiter('login', 5, 15);
export const passwordResetRateLimit = createRateLimiter('password-reset', 3, 60);
export const changePasswordRateLimit = createRateLimiter('change-password', 3, 60);