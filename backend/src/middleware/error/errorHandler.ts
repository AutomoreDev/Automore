import { Request, Response, NextFunction } from 'express';
import { ApiResponse, ApiError } from '../../../../shared/types/api';

interface CustomError extends Error {
  statusCode?: number;
  code?: string | number;
  details?: Record<string, any>;
}

/**
 * Global error handling middleware
 */
export const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): void => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal Server Error';
  let code = error.code?.toString() || 'INTERNAL_ERROR';

  // Firebase Auth errors
  if (typeof error.code === 'string' && error.code.startsWith('auth/')) {
    statusCode = 401;
    switch (error.code) {
      case 'auth/user-not-found':
        message = 'User not found';
        code = 'USER_NOT_FOUND';
        break;
      case 'auth/wrong-password':
        message = 'Invalid password';
        code = 'INVALID_PASSWORD';
        break;
      case 'auth/email-already-in-use':
        message = 'Email already in use';
        code = 'EMAIL_IN_USE';
        statusCode = 409;
        break;
      case 'auth/weak-password':
        message = 'Password is too weak';
        code = 'WEAK_PASSWORD';
        statusCode = 400;
        break;
      case 'auth/invalid-email':
        message = 'Invalid email address';
        code = 'INVALID_EMAIL';
        statusCode = 400;
        break;
      case 'auth/id-token-expired':
        message = 'Token has expired';
        code = 'TOKEN_EXPIRED';
        break;
      case 'auth/id-token-revoked':
        message = 'Token has been revoked';
        code = 'TOKEN_REVOKED';
        break;
      default:
        message = 'Authentication error';
        code = 'AUTH_ERROR';
    }
  }

  // Firestore errors
  if (typeof error.code === 'string' && error.code.startsWith('firestore/')) {
    statusCode = 500;
    message = 'Database error';
    code = 'DATABASE_ERROR';
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    code = 'INVALID_TOKEN';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired';
    code = 'TOKEN_EXPIRED';
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    statusCode = 422;
    code = 'VALIDATION_ERROR';
  }

  // Cast errors (database)
  if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource ID';
    code = 'INVALID_ID';
  }

  // Duplicate key error
  if (typeof error.code === 'number' && error.code === 11000) {
    statusCode = 409;
    message = 'Duplicate resource';
    code = 'DUPLICATE_RESOURCE';
  }

  // Log error for debugging (in development)
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack,
      statusCode: error.statusCode,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }

  // Log error for monitoring (in production)
  if (process.env.NODE_ENV === 'production' && statusCode >= 500) {
    console.error('Production Error:', {
      message: error.message,
      code: error.code,
      path: req.path,
      method: req.method,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
  }

  const errorResponse: ApiResponse = {
    success: false,
    error: code,
    message,
    timestamp: new Date().toISOString()
  };

  // Add error details in development
  if (process.env.NODE_ENV === 'development' && error.details) {
    errorResponse.errors = [
      {
        field: 'general',
        message: error.message,
        code: code
      }
    ];
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Async error wrapper
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Create custom error
 */
export const createError = (
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: Record<string, any>
): CustomError => {
  const error = new Error(message) as CustomError;
  error.statusCode = statusCode;
  if (code) error.code = code;
  if (details) error.details = details;
  return error;
};