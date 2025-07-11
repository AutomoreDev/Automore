import { apiClient } from './apiClient';
import { AuthUser, LoginRequest, LoginResponse } from '../../../../shared/types/auth';

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  companyName?: string;
  userType: 'BUSINESS_USER' | 'CLIENT_USER';
}

export const authApi = {
  // Login with your backend
  async login(credentials: LoginRequest) {
    return apiClient.post<LoginResponse>('/auth/login', credentials);
  },

  // Register new user
  async register(userData: RegisterRequest) {
    return apiClient.post<LoginResponse>('/auth/register', userData);
  },

  // Get current user profile
  async getProfile() {
    return apiClient.get<AuthUser>('/auth/profile');
  },

  // Update user profile
  async updateProfile(updates: Partial<AuthUser>) {
    return apiClient.put<AuthUser>('/auth/profile', updates);
  },

  // Refresh token
  async refreshToken(refreshToken: string) {
    return apiClient.post<{ accessToken: string }>('/auth/refresh', { refreshToken });
  },

  // Logout
  async logout() {
    return apiClient.post('/auth/logout');
  },

  // Change password
  async changePassword(currentPassword: string, newPassword: string) {
    return apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword
    });
  },

  // Reset password request
  async requestPasswordReset(email: string) {
    return apiClient.post('/auth/forgot-password', { email });
  }
};