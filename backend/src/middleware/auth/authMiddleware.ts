import { Request, Response, NextFunction } from 'express';
import { getAuth } from '../../config/firebase';
import { jwtService } from '../../services/auth/jwtService';
import { userService } from '../../services/auth/userService';
import { AuthUser } from '../../../../shared/types/auth';
import { ApiResponse } from '../../../../shared/types/api';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      firebaseUser?: any;
    }
  }
}

/**
 * Firebase Authentication Middleware
 * Verifies Firebase ID tokens
 */
export const firebaseAuthMiddleware = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Access token required',
        message: 'Authorization header with Bearer token required',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const idToken = authHeader.substring(7);

    // Verify Firebase ID token
    const decodedToken = await getAuth().verifyIdToken(idToken);
    
    // Get user from Firestore
    const user = await userService.getUserByUid(decodedToken.uid);
    
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'User profile not found in database',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      res.status(403).json({
        success: false,
        error: 'Account inactive',
        message: `Account status: ${user.status}`,
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Build AuthUser object
    const authUser = await userService.buildAuthUser(user);

    // Attach user info to request
    req.user = authUser;
    req.firebaseUser = decodedToken;

    // Update last login (async, don't wait)
    userService.updateLastLogin(user.uid).catch(console.error);

    next();
  } catch (error: unknown) {
    console.error('Firebase auth middleware error:', error);
    
    let message = 'Invalid or expired token';
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        message = 'Token has expired';
      } else if (error.message.includes('invalid')) {
        message = 'Invalid token format';
      }
    }

    res.status(403).json({
      success: false,
      error: 'Authentication failed',
      message,
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * JWT Authentication Middleware
 * Verifies JWT access tokens (alternative to Firebase)
 */
export const jwtAuthMiddleware = async (
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtService.extractTokenFromHeader(authHeader);
    
    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access token required',
        message: 'Authorization header with Bearer token required',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Verify JWT token
    const decoded = jwtService.verifyAccessToken(token);
    
    // Get user from Firestore
    const user = await userService.getUserByUid(decoded.uid);
    
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'User profile not found in database',
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      res.status(403).json({
        success: false,
        error: 'Account inactive',
        message: `Account status: ${user.status}`,
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Build AuthUser object
    const authUser = await userService.buildAuthUser(user);

    // Attach user info to request
    req.user = authUser;

    next();
  } catch (error) {
    console.error('JWT auth middleware error:', error);
    
    res.status(403).json({
      success: false,
      error: 'Authentication failed',
      message: 'Invalid or expired access token',
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't require it
 */
export const optionalAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const idToken = authHeader.substring(7);
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const user = await userService.getUserByUid(decodedToken.uid);
    
    if (user && user.status === 'ACTIVE') {
      const authUser = await userService.buildAuthUser(user);
      req.user = authUser;
      req.firebaseUser = decodedToken;
    }
  } catch (error) {
    // Silently fail for optional auth
    console.debug('Optional auth failed:', error instanceof Error ? error.message : 'Unknown error');
  }
  
  next();
};