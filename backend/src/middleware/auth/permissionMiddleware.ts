import { Request, Response, NextFunction } from 'express';
import { userService } from '../../services/auth/userService';
import { ApiResponse } from '../../../../shared/types/api';

/**
 * Permission-based authorization middleware
 */
export const requirePermission = (permission: string) => {
  return (req: Request, res: Response<ApiResponse>, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'User must be authenticated to access this resource',
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!userService.hasPermission(req.user, permission)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        message: `Required permission: ${permission}`,
        timestamp: new Date().toISOString()
      });
      return;
    }

    next();
  };
};

/**
 * Require any of the specified permissions
 */
export const requireAnyPermission = (permissions: string[]) => {
  return (req: Request, res: Response<ApiResponse>, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'User must be authenticated to access this resource',
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!userService.hasAnyPermission(req.user, permissions)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        message: `Required permissions (any): ${permissions.join(', ')}`,
        timestamp: new Date().toISOString()
      });
      return;
    }

    next();
  };
};

/**
 * Require all of the specified permissions
 */
export const requireAllPermissions = (permissions: string[]) => {
  return (req: Request, res: Response<ApiResponse>, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'User must be authenticated to access this resource',
        timestamp: new Date().toISOString()
      });
      return;
    }

    if (!userService.hasAllPermissions(req.user, permissions)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        message: `Required permissions (all): ${permissions.join(', ')}`,
        timestamp: new Date().toISOString()
      });
      return;
    }

    next();
  };
};

/**
 * Company ownership middleware
 * Ensures user can only access resources from their company
 */
export const requireCompanyAccess = (companyIdParam: string = 'companyId') => {
  return (req: Request, res: Response<ApiResponse>, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'User must be authenticated to access this resource',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const requestedCompanyId = req.params[companyIdParam] || req.body.companyId || req.query.companyId;
    
    // System admins can access any company
    if (req.user.role === 'SYSTEM_ADMIN') {
      return next();
    }

    // Business admins can access their company and client companies
    if (req.user.role === 'BUSINESS_ADMIN' || req.user.role === 'PARTNER_ADMIN') {
      // TODO: Add logic to check if requested company is a client of user's company
      if (req.user.companyId === requestedCompanyId) {
        return next();
      }
    }

    // All other users can only access their own company
    if (req.user.companyId !== requestedCompanyId) {
      res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only access resources from your own company',
        timestamp: new Date().toISOString()
      });
      return;
    }

    next();
  };
};

/**
 * Self-access middleware
 * Ensures user can only access their own profile/resources
 */
export const requireSelfAccess = (userIdParam: string = 'userId') => {
  return (req: Request, res: Response<ApiResponse>, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'User must be authenticated to access this resource',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const requestedUserId = req.params[userIdParam] || req.body.userId || req.query.userId;
    
    // System admins and business admins can access any user in their company
    if (req.user.role === 'SYSTEM_ADMIN' || 
        req.user.role === 'BUSINESS_ADMIN' || 
        req.user.role === 'PARTNER_ADMIN') {
      return next();
    }

    // Users can only access their own resources
    if (req.user.uid !== requestedUserId) {
      res.status(403).json({
        success: false,
        error: 'Access denied',
        message: 'You can only access your own resources',
        timestamp: new Date().toISOString()
      });
      return;
    }

    next();
  };
};