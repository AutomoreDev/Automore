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

// Register request interface
export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  userType: 'BUSINESS_USER' | 'CLIENT_USER';
  companyName?: string;
}

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
 * Register request validation schema
 */
const registerSchema = Joi.object<RegisterRequest>({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'Password is required'
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords must match',
      'any.required': 'Please confirm your password'
    }),
  firstName: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'First name must be at least 2 characters',
      'string.max': 'First name cannot exceed 50 characters',
      'any.required': 'First name is required'
    }),
  lastName: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Last name must be at least 2 characters',
      'string.max': 'Last name cannot exceed 50 characters',
      'any.required': 'Last name is required'
    }),
  phoneNumber: Joi.string()
    .pattern(/^\+27[0-9]{9}$/)
    .required()
    .messages({
      'string.pattern.base': 'Please provide a valid South African phone number (+27xxxxxxxxx)',
      'any.required': 'Phone number is required'
    }),
  userType: Joi.string()
    .valid('BUSINESS_USER', 'CLIENT_USER')
    .required()
    .messages({
      'any.only': 'Account type must be either BUSINESS_USER or CLIENT_USER',
      'any.required': 'Please select an account type'
    }),
  companyName: Joi.string()
    .max(100)
    .when('userType', {
      is: 'BUSINESS_USER',
      then: Joi.required().messages({
        'any.required': 'Company name is required for business accounts'
      }),
      otherwise: Joi.optional()
    })
    .messages({
      'string.max': 'Company name cannot exceed 100 characters'
    })
});

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
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
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

// Export validation middleware functions
export const validateRegisterRequest = validate(registerSchema);
export const validateLoginRequest = validate(loginSchema);
export const validateRefreshTokenRequest = validate(refreshTokenSchema);
export const validateUpdateProfileRequest = validate(updateProfileSchema);
export const validateChangePasswordRequest = validate(changePasswordSchema);
export const validatePasswordResetRequest = validate(passwordResetSchema);