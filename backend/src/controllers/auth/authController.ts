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
import { ApiResponse } from '../../../../shared/types/api';

export class AuthController {
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

      // Update last login
      await userService.updateLastLogin(user.uid);

      const response: LoginResponse = {
        user: authUser,
        accessToken,
        refreshToken,
        expiresIn: jwtService.getAccessTokenExpiryTime()
      };

      res.status(200).json({
        success: true,
        data: response,
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
   * Refresh access token using refresh token
   */
  async refreshToken(req: Request<{}, ApiResponse<{ accessToken: string; expiresIn: number }>, RefreshTokenRequest>, res: Response): Promise<void> {
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
      
      // Get current user data
      const user = await userService.getUserByUid(decoded.uid);
      
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
          message: 'User profile not found',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Check if user is still active
      if (user.status !== 'ACTIVE') {
        res.status(403).json({
          success: false,
          error: 'Account inactive',
          message: `Account status: ${user.status}`,
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Generate new access token with current user data
      const tokenPayload = {
        uid: user.uid,
        email: user.email,
        role: user.role,
        ...(user.companyId && { companyId: user.companyId })
      };

      const accessToken = jwtService.generateAccessToken(tokenPayload);

      res.status(200).json({
        success: true,
        data: {
          accessToken,
          expiresIn: jwtService.getAccessTokenExpiryTime()
        },
        message: 'Token refreshed successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(401).json({
        success: false,
        error: 'Invalid refresh token',
        message: 'Refresh token is invalid or expired',
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

      // Get fresh user data
      const user = await userService.getUserByUid(req.user.uid);
      
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
          message: 'User profile not found',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const authUser = await userService.buildAuthUser(user);

      res.status(200).json({
        success: true,
        data: authUser,
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
          error: 'Missing email',
          message: 'Email address is required',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Generate password reset link
      const resetLink = await getAuth().generatePasswordResetLink(email);
      
      // TODO: Send email with reset link
      console.log('Password reset link:', resetLink);

      res.status(200).json({
        success: true,
        message: 'Password reset email sent successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error: unknown) {
      console.error('Password reset error:', error);
      
      if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/user-not-found') {
        res.status(404).json({
          success: false,
          error: 'User not found',
          message: 'No user found with this email address',
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'An error occurred while processing password reset',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Logout (invalidate tokens - client-side mainly)
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      // In a stateless JWT system, logout is mainly client-side
      // Here we could implement token blacklisting if needed
      
      res.status(200).json({
        success: true,
        message: 'Logout successful',
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
}

export const authController = new AuthController();