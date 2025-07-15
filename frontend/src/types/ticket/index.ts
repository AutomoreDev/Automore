// frontend/src/types/ticket/index.ts

// ==================== ENUMS ====================

export enum TicketStatus {
    OPEN = 'open',
    IN_PROGRESS = 'in_progress',
    RESOLVED = 'resolved',
    CLOSED = 'closed'
  }
  
  export enum TicketPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
  }
  
  export enum TicketCategory {
    TECHNICAL = 'technical',
    BILLING = 'billing',
    GENERAL = 'general',
    BUG = 'bug',
    FEATURE_REQUEST = 'feature_request'
  }
  
  export enum MessageType {
    USER_MESSAGE = 'user_message',
    SYSTEM_MESSAGE = 'system_message',
    STATUS_CHANGE = 'status_change'
  }
  
  // ==================== CORE INTERFACES ====================
  
  export interface Ticket {
    id: string;
    title: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    category: TicketCategory;
    
    // User references
    createdBy: string;
    assignedTo: string | null;
    companyId: string;
    
    // Human-readable ticket number
    ticketNumber: string;
    
    // Timestamps (ISO strings)
    createdAt: string;
    updatedAt: string;
    resolvedAt: string | null;
    dueDate: string | null;
    lastActivityAt: string;
    
    // Metadata
    attachments: TicketAttachment[];
    tags: string[];
    estimatedHours: number | null;
    actualHours: number | null;
    resolution: string | null;
    
    // Populated user data
    messages?: TicketMessage[];
    createdByUser?: TicketUser;
    assignedToUser?: TicketUser | null;
  }
  
  export interface TicketUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }
  
  export interface TicketMessage {
    id: string;
    ticketId: string;
    senderId: string;
    message: string;
    type: MessageType;
    attachments: TicketAttachment[];
    createdAt: string;
    editedAt: string | null;
    sender: TicketUser;
  }
  
  export interface TicketAttachment {
    id: string;
    ticketId: string;
    fileName: string;
    originalName: string;
    fileSize: number;
    mimeType: string;
    uploadedBy: string;
    downloadUrl: string;
    createdAt: string;
    uploadedByUser: TicketUser;
  }
  
  // ==================== FORM INTERFACES ====================
  
  export interface CreateTicketForm {
    title: string;
    description: string;
    priority: TicketPriority;
    category: TicketCategory;
    tags: string[];
    estimatedHours?: number;
    dueDate?: string;
    attachments?: File[];
  }
  
  export interface UpdateTicketForm {
    title?: string;
    description?: string;
    status?: TicketStatus;
    priority?: TicketPriority;
    category?: TicketCategory;
    assignedTo?: string | null;
    tags?: string[];
    estimatedHours?: number;
    actualHours?: number;
    resolution?: string;
    dueDate?: string | null;
  }
  
  export interface CreateMessageForm {
    message: string;
    attachments?: File[];
  }
  
  // ==================== QUERY INTERFACES ====================
  
  export interface TicketFilters {
    status?: TicketStatus[];
    priority?: TicketPriority[];
    category?: TicketCategory[];
    assignedTo?: string;
    createdBy?: string;
    tags?: string[];
    search?: string;
  }
  
  export interface TicketSortOptions {
    sortBy: 'createdAt' | 'updatedAt' | 'priority' | 'dueDate';
    sortOrder: 'asc' | 'desc';
  }
  
  export interface TicketQueryParams extends TicketFilters, TicketSortOptions {
    limit?: number;
    offset?: number;
  }
  
  export interface PaginatedTickets {
    tickets: Ticket[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }
  
  // ==================== STATISTICS INTERFACES ====================
  
  export interface TicketStatistics {
    totalTickets: number;
    openTickets: number;
    inProgressTickets: number;
    resolvedTickets: number;
    closedTickets: number;
    
    // Priority breakdown
    criticalTickets: number;
    highPriorityTickets: number;
    mediumPriorityTickets: number;
    lowPriorityTickets: number;
    
    // Performance metrics
    averageResolutionTime: number; // in hours
    overdueTickets: number;
    ticketsCreatedToday: number;
    ticketsResolvedToday: number;
  }
  
  // ==================== UI STATE INTERFACES ====================
  
  export interface TicketListState {
    tickets: Ticket[];
    loading: boolean;
    error: string | null;
    filters: TicketFilters;
    sortOptions: TicketSortOptions;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      limit: number;
    };
  }
  
  export interface TicketDetailState {
    ticket: Ticket | null;
    messages: TicketMessage[];
    loading: boolean;
    error: string | null;
    sendingMessage: boolean;
  }
  
  export interface CreateTicketState {
    loading: boolean;
    error: string | null;
    uploadingFiles: boolean;
    uploadProgress: number;
  }
  
  // ==================== API RESPONSE INTERFACES ====================
  
  export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
    errors?: Array<{
      field: string;
      message: string;
    }>;
  }
  
  // ==================== HELPER TYPES ====================
  
  export type TicketStatusColor = 'default' | 'warning' | 'info' | 'success' | 'error';
  export type TicketPriorityColor = 'default' | 'warning' | 'error' | 'success';
  
  // ==================== CONSTANTS ====================
  
  export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
    [TicketStatus.OPEN]: 'Open',
    [TicketStatus.IN_PROGRESS]: 'In Progress',
    [TicketStatus.RESOLVED]: 'Resolved',
    [TicketStatus.CLOSED]: 'Closed'
  };
  
  export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
    [TicketPriority.LOW]: 'Low',
    [TicketPriority.MEDIUM]: 'Medium',
    [TicketPriority.HIGH]: 'High',
    [TicketPriority.CRITICAL]: 'Critical'
  };
  
  export const TICKET_CATEGORY_LABELS: Record<TicketCategory, string> = {
    [TicketCategory.TECHNICAL]: 'Technical',
    [TicketCategory.BILLING]: 'Billing',
    [TicketCategory.GENERAL]: 'General',
    [TicketCategory.BUG]: 'Bug Report',
    [TicketCategory.FEATURE_REQUEST]: 'Feature Request'
  };
  
  export const TICKET_STATUS_COLORS: Record<TicketStatus, TicketStatusColor> = {
    [TicketStatus.OPEN]: 'warning',
    [TicketStatus.IN_PROGRESS]: 'info',
    [TicketStatus.RESOLVED]: 'success',
    [TicketStatus.CLOSED]: 'default'
  };
  
  export const TICKET_PRIORITY_COLORS: Record<TicketPriority, TicketPriorityColor> = {
    [TicketPriority.LOW]: 'success',
    [TicketPriority.MEDIUM]: 'warning',
    [TicketPriority.HIGH]: 'error',
    [TicketPriority.CRITICAL]: 'error'
  };
  
  // ==================== VALIDATION SCHEMAS ====================
  
  export const TICKET_VALIDATION = {
    TITLE: {
      MIN_LENGTH: 3,
      MAX_LENGTH: 200
    },
    DESCRIPTION: {
      MIN_LENGTH: 10,
      MAX_LENGTH: 5000
    },
    TAGS: {
      MAX_COUNT: 10,
      MAX_LENGTH: 50
    },
    ESTIMATED_HOURS: {
      MIN: 0.5,
      MAX: 1000
    },
    MESSAGE: {
      MIN_LENGTH: 1,
      MAX_LENGTH: 2000
    },
    RESOLUTION: {
      MIN_LENGTH: 10,
      MAX_LENGTH: 2000
    }
  };
  
  // ==================== FILE UPLOAD CONSTANTS ====================
  
  export const FILE_UPLOAD = {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: [
      'image/jpeg',
      'image/png', 
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ],
    ALLOWED_EXTENSIONS: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt']
  };