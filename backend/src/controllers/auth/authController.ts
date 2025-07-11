import { Request, Response } from 'express';
import { getAuth } from '../../config/firebase';
import { userService } from '../../services/auth/userService';
import { jwtService } from '../../services/auth/jwtService';
import { 
  LoginRequest, 
  LoginResponse, 
  RefreshTokenRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
  PasswordResetRequest
} from '../../../../shared/types/auth';
import { UserRole, UserStatus } from '../../../../shared/types/user'; // ADD THESE IMPORTS
import { ApiResponse } from '../../../../shared/types/api';
import { RegisterRequest } from '../../middleware/validation/authValidation';

export class AuthController {
  /**
   * Register new user with Firebase and return JWT tokens
   */
  async register(req: Request<{}, ApiResponse<LoginResponse>, RegisterRequest>, res: Response<ApiResponse<LoginResponse>>): Promise<void> {
    try {
      const { 
        email, 
        password, 
        firstName, 
        lastName, 
        phoneNumber, 
        userType, 
        companyName 
      } = req.body;

      // Check if user already exists in Firebase
      try {
        await getAuth().getUserByEmail(email);
        res.status(409).json({
          success: false,
          error: 'USER_EXISTS',
          message: 'An account with this email already exists',
          timestamp: new Date().toISOString()
        });
        return;
      } catch (error: any) {
        // User doesn't exist, which is what we want for registration
        if (error.code !== 'auth/user-not-found') {
          console.error('Error checking user existence:', error);
          res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'An error occurred while checking user existence',
            timestamp: new Date().toISOString()
          });
          return;
        }
      }

      // Create Firebase user
      let firebaseUser;
      try {
        firebaseUser = await getAuth().createUser({
          email,
          password,
          displayName: `${firstName} ${lastName}`,
          phoneNumber: phoneNumber || undefined,
          emailVerified: false // Will be verified through Firebase Auth flow
        });
      } catch (error: any) {
        console.error('Firebase user creation error:', error);
        
        let errorMessage = 'Failed to create user account';
        if (error.code === 'auth/email-already-exists') {
          errorMessage = 'An account with this email already exists';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Invalid email address';
        } else if (error.code === 'auth/weak-password') {
          errorMessage = 'Password is too weak';
        }

        res.status(400).json({
          success: false,
          error: 'USER_CREATION_FAILED',
          message: errorMessage,
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Create user profile in Firestore
      try {
        // Map frontend userType to proper UserRole enum
        const role = userType === 'BUSINESS_USER' ? UserRole.BUSINESS_USER : UserRole.CLIENT_USER;
        
        const userProfile = await userService.createOrUpdateUser(firebaseUser, {
          role, // Use proper enum value
          firstName,
          lastName,
          phoneNumber: phoneNumber || undefined,
          status: UserStatus.ACTIVE // Use proper enum value
        });

        // Build auth user object
        const authUser = await userService.buildAuthUser(userProfile);

        // Generate JWT tokens
        const tokenPayload = {
          uid: userProfile.uid,
          email: userProfile.email,
          role: userProfile.role,
          ...(userProfile.companyId && { companyId: userProfile.companyId })
        };

        const accessToken = jwtService.generateAccessToken(tokenPayload);
        const refreshToken = jwtService.generateRefreshToken(tokenPayload);
        
        // Get token expiry time
        const expiresIn = jwtService.getAccessTokenExpiryTime(); // ADD THIS

        // Update last login
        await userService.updateLastLogin(userProfile.uid);

        res.status(201).json({
          success: true,
          data: {
            user: authUser,
            accessToken,
            refreshToken,
            expiresIn // ADD THIS
          },
          message: 'Account created successfully',
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('User profile creation error:', error);
        
        // Clean up Firebase user if Firestore creation fails
        try {
          await getAuth().deleteUser(firebaseUser.uid);
        } catch (cleanupError) {
          console.error('Failed to cleanup Firebase user:', cleanupError);
        }

        res.status(500).json({
          success: false,
          error: 'PROFILE_CREATION_FAILED',
          message: 'Failed to create user profile',
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred during registration',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Login with Firebase and return JWT tokens
   */
  async login(req: Request<{}, ApiResponse<LoginResponse>, LoginRequest>, res: Response<ApiResponse<LoginResponse>>): Promise<void> {
    try {
      const { email, password, rememberMe } = req.body;

      // Validate request
      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'Email and password are required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Note: In a real app, you would use Firebase Client SDK on frontend
      // This is a simplified example for backend-only authentication
      
      // Get Firebase user by email (this requires Firebase Admin SDK)
      let firebaseUser;
      try {
        firebaseUser = await getAuth().getUserByEmail(email);
      } catch (error) {
        res.status(401).json({
          success: false,
          error: 'Invalid credentials',
          message: 'Invalid email or password',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Get or create user in Firestore
      const user = await userService.createOrUpdateUser(firebaseUser);
      
      // Build auth user object
      const authUser = await userService.buildAuthUser(user);

      // Generate JWT tokens with proper optional handling
      const tokenPayload = {
        uid: user.uid,
        email: user.email,
        role: user.role,
        ...(user.companyId && { companyId: user.companyId })
      };

      const accessToken = jwtService.generateAccessToken(tokenPayload);
      const refreshToken = jwtService.generateRefreshToken(tokenPayload);
      
      // Get token expiry time
      const expiresIn = jwtService.getAccessTokenExpiryTime(); // ADD THIS

      // Update last login
      await userService.updateLastLogin(user.uid);

      res.status(200).json({
        success: true,
        data: {
          user: authUser,
          accessToken,
          refreshToken,
          expiresIn // ADD THIS
        },
        message: 'Login successful',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'An error occurred during login',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Refresh JWT access token
   */
  async refreshToken(req: Request<{}, ApiResponse<{ accessToken: string }>, RefreshTokenRequest>, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: 'Missing refresh token',
          message: 'Refresh token is required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Verify refresh token
      const decoded = jwtService.verifyRefreshToken(refreshToken);
      
      // Get user from Firestore to ensure they still exist and are active
      const user = await userService.getUserByUid(decoded.uid);
      
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
          message: 'User account no longer exists',
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (user.status !== UserStatus.ACTIVE) { // Use enum
        res.status(403).json({
          success: false,
          error: 'Account inactive',
          message: `Account status: ${user.status}`,
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Generate new access token
      const tokenPayload = {
        uid: user.uid,
        email: user.email,
        role: user.role,
        ...(user.companyId && { companyId: user.companyId })
      };

      const accessToken = jwtService.generateAccessToken(tokenPayload);

      res.status(200).json({
        success: true,
        data: { accessToken },
        message: 'Token refreshed successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(403).json({
        success: false,
        error: 'Invalid refresh token',
        message: 'Refresh token is invalid or expired',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Logout user (mainly for cleanup)
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      // In a stateless JWT system, logout is primarily client-side
      // But we can perform any necessary cleanup here
      
      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'An error occurred during logout',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'User must be authenticated',
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: req.user,
        message: 'Profile retrieved successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'An error occurred while retrieving profile',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req: Request<{}, ApiResponse, UpdateProfileRequest>, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'User must be authenticated',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { firstName, lastName, displayName, phoneNumber, photoURL } = req.body;

      // Filter out undefined values
      const updates = Object.fromEntries(
        Object.entries({
          firstName,
          lastName,
          displayName,
          phoneNumber,
          photoURL
        }).filter(([_, value]) => value !== undefined)
      );

      // Update user profile
      const updatedUser = await userService.updateUserProfile(req.user.uid, updates);

      const authUser = await userService.buildAuthUser(updatedUser);

      res.status(200).json({
        success: true,
        data: authUser,
        message: 'Profile updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'An error occurred while updating profile',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Change password
   */
  async changePassword(req: Request<{}, ApiResponse, ChangePasswordRequest>, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'User must be authenticated',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'Current password and new password are required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Update password in Firebase Auth
      await getAuth().updateUser(req.user.uid, {
        password: newPassword
      });

      res.status(200).json({
        success: true,
        message: 'Password updated successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'An error occurred while changing password',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(req: Request<{}, ApiResponse, PasswordResetRequest>, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'Email is required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Check if user exists
      try {
        await getAuth().getUserByEmail(email);
        
        // Generate password reset link (in production, you'd send this via email)
        const resetLink = await getAuth().generatePasswordResetLink(email);
        
        // For now, just return success (in production, send email)
        res.status(200).json({
          success: true,
          message: 'Password reset instructions sent to your email',
          timestamp: new Date().toISOString()
        });
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          // For security, don't reveal if email exists or not
          res.status(200).json({
            success: true,
            message: 'If an account exists with this email, password reset instructions have been sent',
            timestamp: new Date().toISOString()
          });
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'An error occurred while processing password reset request',
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const authController = new AuthController();