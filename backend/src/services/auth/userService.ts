import { getDb, getAuth } from '../../config/firebase';
import { BaseUser, UserRole, UserStatus, Company } from '../../../../shared/types/user';
import { AuthUser } from '../../../../shared/types/auth';
import { ROLE_PERMISSIONS } from '../../../../shared/constants/permissions';
import { Timestamp } from 'firebase-admin/firestore';

export class UserService {
  private db = getDb();
  private auth = getAuth();

  /**
   * Convert Firestore timestamp to Date
   */
  private timestampToDate(timestamp: any): Date {
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    if (timestamp instanceof Date) {
      return timestamp;
    }
    if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      return new Date(timestamp);
    }
    return new Date();
  }

  /**
   * Get user by UID
   */
  async getUserByUid(uid: string): Promise<BaseUser | null> {
    try {
      const userDoc = await this.db.collection('users').doc(uid).get();
      
      if (!userDoc.exists) {
        return null;
      }

      const userData = userDoc.data() as any;
      return {
        uid: userDoc.id,
        email: userData.email,
        emailVerified: userData.emailVerified,
        displayName: userData.displayName,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
        photoURL: userData.photoURL,
        role: userData.role,
        status: userData.status,
        companyId: userData.companyId,
        createdAt: this.timestampToDate(userData.createdAt),
        updatedAt: this.timestampToDate(userData.updatedAt),
        lastLoginAt: userData.lastLoginAt ? this.timestampToDate(userData.lastLoginAt) : undefined,
        metadata: userData.metadata
      };
    } catch (error) {
      console.error('Error getting user by UID:', error);
      throw new Error('Failed to retrieve user');
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<BaseUser | null> {
    try {
      const userQuery = await this.db
        .collection('users')
        .where('email', '==', email)
        .limit(1)
        .get();

      if (userQuery.empty) {
        return null;
      }

      const userDoc = userQuery.docs[0];
      const userData = userDoc.data() as any;
      
      return {
        uid: userDoc.id,
        email: userData.email,
        emailVerified: userData.emailVerified,
        displayName: userData.displayName,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
        photoURL: userData.photoURL,
        role: userData.role,
        status: userData.status,
        companyId: userData.companyId,
        createdAt: this.timestampToDate(userData.createdAt),
        updatedAt: this.timestampToDate(userData.updatedAt),
        lastLoginAt: userData.lastLoginAt ? this.timestampToDate(userData.lastLoginAt) : undefined,
        metadata: userData.metadata
      };
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw new Error('Failed to retrieve user');
    }
  }

  /**
   * Create or update user in Firestore
   */
  async createOrUpdateUser(firebaseUser: any, additionalData?: Partial<BaseUser>): Promise<BaseUser> {
    try {
      const existingUser = await this.getUserByUid(firebaseUser.uid);
      const now = Timestamp.now();
  
      if (existingUser) {
        // Update existing user - FILTER OUT UNDEFINED VALUES
        const updateData: any = {
          email: firebaseUser.email,
          emailVerified: firebaseUser.emailVerified,
          updatedAt: now,
          lastLoginAt: now
        };
  
        // Only add fields that are not undefined
        if (firebaseUser.displayName !== undefined) {
          updateData.displayName = firebaseUser.displayName;
        }
        if (firebaseUser.photoURL !== undefined) {
          updateData.photoURL = firebaseUser.photoURL;
        }
        if (firebaseUser.phoneNumber !== undefined) {
          updateData.phoneNumber = firebaseUser.phoneNumber;
        }
  
        // Add additional data if provided, filtering undefined values
        if (additionalData) {
          Object.entries(additionalData).forEach(([key, value]) => {
            if (value !== undefined) {
              updateData[key] = value;
            }
          });
        }
  
        await this.db.collection('users').doc(firebaseUser.uid).update(updateData);
        
        return {
          ...existingUser,
          ...updateData,
          updatedAt: now.toDate(),
          lastLoginAt: now.toDate()
        };
      } else {
        // Create new user - FILTER OUT UNDEFINED VALUES
        const newUserData: any = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          emailVerified: firebaseUser.emailVerified,
          role: additionalData?.role || UserRole.CLIENT_USER,
          status: UserStatus.ACTIVE,
          createdAt: now,
          updatedAt: now,
          lastLoginAt: now
        };
  
        // Only add fields that are not undefined
        if (firebaseUser.displayName !== undefined) {
          newUserData.displayName = firebaseUser.displayName;
        }
        if (firebaseUser.phoneNumber !== undefined) {
          newUserData.phoneNumber = firebaseUser.phoneNumber;
        }
        if (firebaseUser.photoURL !== undefined) {
          newUserData.photoURL = firebaseUser.photoURL;
        }
        if (additionalData?.firstName !== undefined) {
          newUserData.firstName = additionalData.firstName;
        }
        if (additionalData?.lastName !== undefined) {
          newUserData.lastName = additionalData.lastName;
        }
        if (additionalData?.companyId !== undefined) {
          newUserData.companyId = additionalData.companyId;
        }
        if (additionalData?.metadata !== undefined) {
          newUserData.metadata = additionalData.metadata;
        }
  
        await this.db.collection('users').doc(firebaseUser.uid).set(newUserData);
        
        return {
          ...newUserData,
          createdAt: now.toDate(),
          updatedAt: now.toDate(),
          lastLoginAt: now.toDate()
        };
      }
    } catch (error) {
      console.error('Error creating/updating user:', error);
      throw new Error('Failed to create or update user');
    }
  }

  /**
   * Get company information for user
   */
  async getUserCompany(companyId: string): Promise<Company | null> {
    try {
      if (!companyId) return null;

      const companyDoc = await this.db.collection('companies').doc(companyId).get();
      
      if (!companyDoc.exists) {
        return null;
      }

      const companyData = companyDoc.data() as any;
      return {
        id: companyDoc.id,
        name: companyData.name,
        type: companyData.type,
        email: companyData.email,
        phone: companyData.phone,
        address: companyData.address,
        website: companyData.website,
        taxNumber: companyData.taxNumber,
        registrationNumber: companyData.registrationNumber,
        parentCompanyId: companyData.parentCompanyId,
        isActive: companyData.isActive,
        createdAt: this.timestampToDate(companyData.createdAt),
        updatedAt: this.timestampToDate(companyData.updatedAt),
        settings: companyData.settings,
        metadata: companyData.metadata
      };
    } catch (error) {
      console.error('Error getting user company:', error);
      return null;
    }
  }

  /**
   * Build AuthUser object for JWT and frontend
   */
  async buildAuthUser(user: BaseUser): Promise<AuthUser> {
    const company = user.companyId ? await this.getUserCompany(user.companyId) : null;
    const permissions = ROLE_PERMISSIONS[user.role] || [];

    return {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      displayName: user.displayName,
      firstName: user.firstName,
      lastName: user.lastName,
      photoURL: user.photoURL,
      role: user.role,
      status: user.status,
      companyId: user.companyId,
      companyName: company?.name,
      companyType: company?.type,
      permissions,
      lastLoginAt: user.lastLoginAt
    };
  }

  /**
   * Update user last login timestamp
   */
  async updateLastLogin(uid: string): Promise<void> {
    try {
      await this.db.collection('users').doc(uid).update({
        lastLoginAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating last login:', error);
      // Don't throw error for this non-critical operation
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(uid: string, updates: Partial<BaseUser>): Promise<BaseUser> {
    try {
      const filteredUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, value]) => value !== undefined)
      );

      const updateData = {
        ...filteredUpdates,
        updatedAt: Timestamp.now()
      };

      await this.db.collection('users').doc(uid).update(updateData);
      
      const updatedUser = await this.getUserByUid(uid);
      if (!updatedUser) {
        throw new Error('User not found after update');
      }

      return updatedUser;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update user profile');
    }
  }

  /**
   * Check if user has permission
   */
  hasPermission(user: AuthUser, permission: string): boolean {
    return user.permissions.includes(permission);
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(user: AuthUser, permissions: string[]): boolean {
    return permissions.some(permission => user.permissions.includes(permission));
  }

  /**
   * Check if user has all specified permissions
   */
  hasAllPermissions(user: AuthUser, permissions: string[]): boolean {
    return permissions.every(permission => user.permissions.includes(permission));
  }
}

export const userService = new UserService();