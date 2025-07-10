import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { 
  LoginRequest, 
  RefreshTokenRequest, 
  UpdateProfileRequest, 
  ChangePasswordRequest, 
  PasswordResetRequest 
} from '../../../../shared/types/auth';
import { ApiResponse } from '../../../../shared/types/api';

/**
 * Validation middleware wrapper
 */
const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response<ApiResponse>, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        code: detail.type
      }));

      res.status(422).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Validation failed',
        errors,
        timestamp: new Date().toISOString()
      });
      return;
    }

    next();
  };
};

/**
 * Login request validation schema
 */
const loginSchema = Joi.object<LoginRequest>({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters long',
      'any.required': 'Password is required'
    }),
  rememberMe: Joi.boolean().optional()
});

/**
 * Refresh token request validation schema
 */
const refreshTokenSchema = Joi.object<RefreshTokenRequest>({
  refreshToken: Joi.string()
    .required()
    .messages({
      'any.required': 'Refresh token is required'
    })
});

/**
 * Update profile request validation schema
 */
const updateProfileSchema = Joi.object<UpdateProfileRequest>({
  firstName: Joi.string()
    .max(50)
    .optional()
    .messages({
      'string.max': 'First name cannot exceed 50 characters'
    }),
  lastName: Joi.string()
    .max(50)
    .optional()
    .messages({
      'string.max': 'Last name cannot exceed 50 characters'
    }),
  displayName: Joi.string()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Display name cannot exceed 100 characters'
    }),
  phoneNumber: Joi.string()
    .pattern(/^(\+27|0)[0-9]{9}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Please provide a valid South African phone number'
    }),
  photoURL: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'Photo URL must be a valid URL'
    })
});

/**
 * Change password request validation schema
 */
const changePasswordSchema = Joi.object<ChangePasswordRequest>({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required'
    }),
  newPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'New password must be at least 8 characters long',
      'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'New password is required'
    })
});

/**
 * Password reset request validation schema
 */
const passwordResetSchema = Joi.object<PasswordResetRequest>({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    })
});

// Export validation middleware
export const validateLoginRequest = validate(loginSchema);
export const validateRefreshTokenRequest = validate(refreshTokenSchema);
export const validateUpdateProfileRequest = validate(updateProfileSchema);
export const validateChangePasswordRequest = validate(changePasswordSchema);
export const validatePasswordResetRequest = validate(passwordResetSchema);