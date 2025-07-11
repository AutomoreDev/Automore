// shared/constants/permissions.ts
// Fixed to resolve circular dependency issues

// Shared permission constants
export const PERMISSIONS = {
    // User management
    USERS_READ: 'users:read',
    USERS_CREATE: 'users:create',
    USERS_UPDATE: 'users:update',
    USERS_DELETE: 'users:delete',
    
    // Company management
    COMPANIES_READ: 'companies:read',
    COMPANIES_CREATE: 'companies:create',
    COMPANIES_UPDATE: 'companies:update',
    COMPANIES_DELETE: 'companies:delete',
    
    // Project management
    PROJECTS_READ: 'projects:read',
    PROJECTS_CREATE: 'projects:create',
    PROJECTS_UPDATE: 'projects:update',
    PROJECTS_DELETE: 'projects:delete',
    
    // Ticket management
    TICKETS_READ: 'tickets:read',
    TICKETS_CREATE: 'tickets:create',
    TICKETS_UPDATE: 'tickets:update',
    TICKETS_DELETE: 'tickets:delete',
    TICKETS_ASSIGN: 'tickets:assign',
    
    // Invoice management
    INVOICES_READ: 'invoices:read',
    INVOICES_CREATE: 'invoices:create',
    INVOICES_UPDATE: 'invoices:update',
    INVOICES_DELETE: 'invoices:delete',
    INVOICES_SEND: 'invoices:send',
    INVOICES_PAY: 'invoices:pay',
    
    // Document management
    DOCUMENTS_READ: 'documents:read',
    DOCUMENTS_UPLOAD: 'documents:upload',
    DOCUMENTS_UPDATE: 'documents:update',
    DOCUMENTS_DELETE: 'documents:delete',
    DOCUMENTS_DOWNLOAD: 'documents:download',
    
    // Admin functions
    ADMIN_PANEL: 'admin:panel',
    ADMIN_USERS: 'admin:users',
    ADMIN_COMPANIES: 'admin:companies',
    ADMIN_SETTINGS: 'admin:settings',
    ADMIN_REPORTS: 'admin:reports'
} as const;

// Helper function to get all permission values
export const getAllPermissions = (): string[] => {
    return Object.values(PERMISSIONS);
};

// Role-based permission mapping using string literals to avoid circular dependency
export const ROLE_PERMISSIONS: Record<string, string[]> = {
    'SYSTEM_ADMIN': getAllPermissions(), // All permissions
    
    'BUSINESS_ADMIN': [
        PERMISSIONS.USERS_READ,
        PERMISSIONS.USERS_CREATE,
        PERMISSIONS.USERS_UPDATE,
        PERMISSIONS.COMPANIES_READ,
        PERMISSIONS.COMPANIES_UPDATE,
        PERMISSIONS.PROJECTS_READ,
        PERMISSIONS.PROJECTS_CREATE,
        PERMISSIONS.PROJECTS_UPDATE,
        PERMISSIONS.PROJECTS_DELETE,
        PERMISSIONS.TICKETS_READ,
        PERMISSIONS.TICKETS_CREATE,
        PERMISSIONS.TICKETS_UPDATE,
        PERMISSIONS.TICKETS_ASSIGN,
        PERMISSIONS.INVOICES_READ,
        PERMISSIONS.INVOICES_CREATE,
        PERMISSIONS.INVOICES_UPDATE,
        PERMISSIONS.INVOICES_SEND,
        PERMISSIONS.DOCUMENTS_READ,
        PERMISSIONS.DOCUMENTS_UPLOAD,
        PERMISSIONS.DOCUMENTS_UPDATE,
        PERMISSIONS.DOCUMENTS_DELETE,
        PERMISSIONS.DOCUMENTS_DOWNLOAD
    ],
    
    'BUSINESS_USER': [
        PERMISSIONS.PROJECTS_READ,
        PERMISSIONS.TICKETS_READ,
        PERMISSIONS.TICKETS_CREATE,
        PERMISSIONS.TICKETS_UPDATE,
        PERMISSIONS.INVOICES_READ,
        PERMISSIONS.DOCUMENTS_READ,
        PERMISSIONS.DOCUMENTS_UPLOAD,
        PERMISSIONS.DOCUMENTS_DOWNLOAD
    ],
    
    'CLIENT_ADMIN': [
        PERMISSIONS.USERS_READ,
        PERMISSIONS.USERS_CREATE,
        PERMISSIONS.USERS_UPDATE,
        PERMISSIONS.COMPANIES_READ,
        PERMISSIONS.COMPANIES_UPDATE,
        PERMISSIONS.PROJECTS_READ,
        PERMISSIONS.TICKETS_READ,
        PERMISSIONS.TICKETS_CREATE,
        PERMISSIONS.TICKETS_UPDATE,
        PERMISSIONS.INVOICES_READ,
        PERMISSIONS.INVOICES_PAY,
        PERMISSIONS.DOCUMENTS_READ,
        PERMISSIONS.DOCUMENTS_UPLOAD,
        PERMISSIONS.DOCUMENTS_DOWNLOAD
    ],
    
    'CLIENT_USER': [
        PERMISSIONS.PROJECTS_READ,
        PERMISSIONS.TICKETS_READ,
        PERMISSIONS.TICKETS_CREATE,
        PERMISSIONS.INVOICES_READ,
        PERMISSIONS.DOCUMENTS_READ,
        PERMISSIONS.DOCUMENTS_UPLOAD,
        PERMISSIONS.DOCUMENTS_DOWNLOAD
    ],
    
    'PARTNER_ADMIN': [
        PERMISSIONS.USERS_READ,
        PERMISSIONS.USERS_CREATE,
        PERMISSIONS.USERS_UPDATE,
        PERMISSIONS.COMPANIES_READ,
        PERMISSIONS.COMPANIES_CREATE,
        PERMISSIONS.COMPANIES_UPDATE,
        PERMISSIONS.PROJECTS_READ,
        PERMISSIONS.PROJECTS_CREATE,
        PERMISSIONS.PROJECTS_UPDATE,
        PERMISSIONS.TICKETS_READ,
        PERMISSIONS.TICKETS_CREATE,
        PERMISSIONS.TICKETS_UPDATE,
        PERMISSIONS.INVOICES_READ,
        PERMISSIONS.INVOICES_CREATE,
        PERMISSIONS.INVOICES_UPDATE,
        PERMISSIONS.DOCUMENTS_READ,
        PERMISSIONS.DOCUMENTS_UPLOAD,
        PERMISSIONS.DOCUMENTS_UPDATE,
        PERMISSIONS.DOCUMENTS_DOWNLOAD
    ],
    
    'PARTNER_USER': [
        PERMISSIONS.PROJECTS_READ,
        PERMISSIONS.TICKETS_READ,
        PERMISSIONS.TICKETS_CREATE,
        PERMISSIONS.INVOICES_READ,
        PERMISSIONS.DOCUMENTS_READ,
        PERMISSIONS.DOCUMENTS_UPLOAD,
        PERMISSIONS.DOCUMENTS_DOWNLOAD
    ]
};

// Type-safe permission getter
export const getPermissionsForRole = (role: string): string[] => {
    return ROLE_PERMISSIONS[role] || [];
};