import jwt from 'jsonwebtoken';
import { TokenPayload } from '../../../../shared/types/auth';
import { UserRole } from '../../../../shared/types/user';

export class JWTService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiry: string;
  private readonly refreshTokenExpiry: string;

  constructor() {
    this.accessTokenSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
    this.accessTokenExpiry = process.env.JWT_EXPIRES_IN || '15m';
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  }

  /**
   * Generate access token
   */
  generateAccessToken(payload: {
    uid: string;
    email: string;
    role: UserRole;
    companyId?: string;
  }): string {
    const tokenPayload = {
      uid: payload.uid,
      email: payload.email,
      role: payload.role,
      ...(payload.companyId && { companyId: payload.companyId }),
      type: 'access'
    };

    const options = {
      expiresIn: this.getAccessTokenExpiryTime(),
      issuer: 'automore-portal',
      audience: 'automore-users'
    };
    
    return jwt.sign(tokenPayload, this.accessTokenSecret, options);
  }

  /**
   * Generate refresh token
   */
  generateRefreshToken(payload: {
    uid: string;
    email: string;
    role: UserRole;
    companyId?: string;
  }): string {
    const tokenPayload = {
      uid: payload.uid,
      email: payload.email,
      role: payload.role,
      ...(payload.companyId && { companyId: payload.companyId }),
      type: 'refresh'
    };

    const options = {
      expiresIn: this.getRefreshTokenExpiryTime(),
      issuer: 'automore-portal',
      audience: 'automore-users'
    };
    
    return jwt.sign(tokenPayload, this.refreshTokenSecret, options);
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret, {
        issuer: 'automore-portal',
        audience: 'automore-users'
      }) as TokenPayload;

      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.refreshTokenSecret, {
        issuer: 'automore-portal',
        audience: 'automore-users'
      }) as TokenPayload;

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Get token expiry time in seconds
   */
  getAccessTokenExpiryTime(): number {
    const expiry = this.accessTokenExpiry;
    if (expiry.endsWith('m')) {
      return parseInt(expiry) * 60;
    } else if (expiry.endsWith('h')) {
      return parseInt(expiry) * 3600;
    } else if (expiry.endsWith('d')) {
      return parseInt(expiry) * 86400;
    }
    return 900; // 15 minutes default
  }

  /**
   * Get refresh token expiry time in seconds
   */
  getRefreshTokenExpiryTime(): number {
    const expiry = this.refreshTokenExpiry;
    if (expiry.endsWith('m')) {
      return parseInt(expiry) * 60;
    } else if (expiry.endsWith('h')) {
      return parseInt(expiry) * 3600;
    } else if (expiry.endsWith('d')) {
      return parseInt(expiry) * 86400;
    }
    return 604800; // 7 days default
  }

  /**
   * Extract token from Authorization header
   */
  extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}

export const jwtService = new JWTService();