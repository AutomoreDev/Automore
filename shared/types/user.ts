// Shared user types for both frontend and backend
export enum UserRole {
    BUSINESS_ADMIN = 'BUSINESS_ADMIN',
    BUSINESS_USER = 'BUSINESS_USER',
    CLIENT_ADMIN = 'CLIENT_ADMIN',
    CLIENT_USER = 'CLIENT_USER',
    PARTNER_ADMIN = 'PARTNER_ADMIN',
    PARTNER_USER = 'PARTNER_USER',
    SYSTEM_ADMIN = 'SYSTEM_ADMIN'
  }
  
  export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED',
    PENDING_VERIFICATION = 'PENDING_VERIFICATION'
  }
  
  export enum CompanyType {
    BUSINESS = 'BUSINESS',
    CLIENT = 'CLIENT',
    PARTNER = 'PARTNER'
  }
  
  export interface BaseUser {
    uid: string;
    email: string;
    emailVerified: boolean;
    displayName?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    photoURL?: string;
    role: UserRole;
    status: UserStatus;
    companyId?: string;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date;
    metadata?: Record<string, any>;
  }
  
  export interface Company {
    id: string;
    name: string;
    type: CompanyType;
    email: string;
    phone?: string;
    address?: Address;
    website?: string;
    taxNumber?: string;
    registrationNumber?: string;
    parentCompanyId?: string; // For client companies under business
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    settings?: CompanySettings;
    metadata?: Record<string, any>;
  }
  
  export interface Address {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  }
  
  export interface CompanySettings {
    allowClientRegistration: boolean;
    requireEmailVerification: boolean;
    enableTwoFactorAuth: boolean;
    notificationPreferences: NotificationPreferences;
  }
  
  export interface NotificationPreferences {
    email: boolean;
    sms: boolean;
    push: boolean;
    ticketUpdates: boolean;
    projectUpdates: boolean;
    invoiceAlerts: boolean;
  }