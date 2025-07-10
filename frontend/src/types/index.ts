// User types
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'business' | 'client' | 'partner' | 'admin';
    companyId?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }
  
  // API Response types
  export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    timestamp: string;
  }
  
  // Theme types
  export interface ThemeConfig {
    mode: 'light' | 'dark';
    primaryColor: string;
    secondaryColor: string;
  }
  
  // Navigation types
  export interface NavItem {
    label: string;
    path: string;
    icon: string;
    roles: string[];
  }