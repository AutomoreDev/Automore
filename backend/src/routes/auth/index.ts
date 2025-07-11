import { Router } from 'express';
import { authController } from '../../controllers/auth/authController';
import { firebaseAuthMiddleware, jwtAuthMiddleware } from '../../middleware/auth/authMiddleware';
import { 
  validateLoginRequest, 
  validateRegisterRequest,  // ADD THIS
  validateRefreshTokenRequest, 
  validateUpdateProfileRequest, 
  validateChangePasswordRequest, 
  validatePasswordResetRequest 
} from '../../middleware/validation/authValidation';
import { rateLimitMiddleware } from '../../middleware/security/rateLimitMiddleware';

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register new user and return JWT tokens
 * @access  Public
 */
router.post('/register',
  rateLimitMiddleware(3, 60), // 3 attempts per hour (stricter than login)
  validateRegisterRequest,
  authController.register
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user and return JWT tokens
 * @access  Public
 */
router.post('/login', 
  rateLimitMiddleware(5, 15), // 5 attempts per 15 minutes
  validateLoginRequest,
  authController.login
);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post('/refresh',
  rateLimitMiddleware(10, 15), // 10 attempts per 15 minutes
  validateRefreshTokenRequest,
  authController.refreshToken
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user (client-side token cleanup)
 * @access  Private
 */
router.post('/logout',
  firebaseAuthMiddleware, // Use Firebase auth for logout
  authController.logout
);

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile',
  firebaseAuthMiddleware, // Use Firebase auth for profile
  authController.getProfile
);

/**
 * @route   PUT /api/v1/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile',
  firebaseAuthMiddleware, // Use Firebase auth for profile updates
  validateUpdateProfileRequest,
  authController.updateProfile
);

/**
 * @route   POST /api/v1/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password',
  firebaseAuthMiddleware, // Use Firebase auth for password change
  rateLimitMiddleware(3, 60), // 3 attempts per hour
  validateChangePasswordRequest,
  authController.changePassword
);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/reset-password',
  rateLimitMiddleware(3, 60), // 3 attempts per hour
  validatePasswordResetRequest,
  authController.requestPasswordReset
);

/**
 * @route   GET /api/v1/auth/verify-token
 * @desc    Verify if token is valid (for frontend token validation)
 * @access  Private
 */
router.get('/verify-token',
  firebaseAuthMiddleware,
  (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        valid: true,
        user: req.user
      },
      message: 'Token is valid',
      timestamp: new Date().toISOString()
    });
  }
);

export default router;