import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../../../../shared/types/user';
import { ApiResponse } from '../../../../shared/types/api';

/**
 * Role-based authorization middleware
 */
export const requireRole = (roles: UserRole | UserRole[]) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  
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

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient privileges',
        message: `Required role(s): ${allowedRoles.join(', ')}. Current role: ${req.user.role}`,
        timestamp: new Date().toISOString()
      });
      return;
    }

    next();
  };
};

/**
 * Admin role middleware (Business Admin, Partner Admin, System Admin)
 */
export const requireAdmin = requireRole([
  UserRole.SYSTEM_ADMIN,
  UserRole.BUSINESS_ADMIN,
  UserRole.PARTNER_ADMIN
]);

/**
 * Business role middleware (Business Admin, Business User)
 */
export const requireBusinessRole = requireRole([
  UserRole.BUSINESS_ADMIN,
  UserRole.BUSINESS_USER
]);

/**
 * Client role middleware (Client Admin, Client User)
 */
export const requireClientRole = requireRole([
  UserRole.CLIENT_ADMIN,
  UserRole.CLIENT_USER
]);

/**
 * Partner role middleware (Partner Admin, Partner User)
 */
export const requirePartnerRole = requireRole([
  UserRole.PARTNER_ADMIN,
  UserRole.PARTNER_USER
]);

/**
 * System admin only middleware
 */
export const requireSystemAdmin = requireRole(UserRole.SYSTEM_ADMIN);

/**
 * Admin level middleware (any admin type)
 */
export const requireAdminLevel = requireRole([
  UserRole.SYSTEM_ADMIN,
  UserRole.BUSINESS_ADMIN,
  UserRole.CLIENT_ADMIN,
  UserRole.PARTNER_ADMIN
]);

/**
 * User level middleware (any user type)
 */
export const requireUserLevel = requireRole([
  UserRole.BUSINESS_USER,
  UserRole.CLIENT_USER,
  UserRole.PARTNER_USER
]);