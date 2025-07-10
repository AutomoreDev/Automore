import { UserRole, UserStatus, CompanyType } from './user';

// Shared authentication types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  role: UserRole;
  status: UserStatus;
  companyId?: string;
  companyName?: string;
  companyType?: CompanyType;
  permissions: string[];
  lastLoginAt?: Date;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface TokenPayload {
  uid: string;
  email: string;
  role: UserRole;
  companyId?: string;
  iat: number;
  exp: number;
  type: 'access' | 'refresh';
}

export interface PasswordResetRequest {
  email: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phoneNumber?: string;
  photoURL?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Re-export from user types
export { UserRole, UserStatus, CompanyType } from './user';