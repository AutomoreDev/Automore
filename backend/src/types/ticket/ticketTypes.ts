// backend/src/types/ticket/ticketTypes.ts

import { Timestamp } from 'firebase-admin/firestore';

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

// Base ticket interface for Firestore documents
export interface TicketDocument {
  id?: string; // Firestore document ID
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  
  // User references
  createdBy: string; // User document ID
  assignedTo: string | null; // User document ID or null
  companyId: string; // Company document ID
  
  // Human-readable ticket number
  ticketNumber: string; // e.g., "AUT-2025-001"
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  resolvedAt: Timestamp | null;
  dueDate: Timestamp | null;
  lastActivityAt: Timestamp;
  
  // Metadata
  attachments: string[]; // Array of attachment document IDs
  tags: string[]; // Searchable tags
  estimatedHours: number | null;
  actualHours: number | null;
  resolution: string | null; // Resolution notes when resolved
}

// DTO for creating tickets (from frontend)
export interface CreateTicketDTO {
  title: string;
  description: string;
  priority: TicketPriority;
  category: TicketCategory;
  tags?: string[];
  attachments?: File[]; // Files to upload
  estimatedHours?: number;
  dueDate?: string; // ISO string, will be converted to Timestamp
}

// DTO for updating tickets
export interface UpdateTicketDTO {
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

// Ticket response for frontend (with converted timestamps)
export interface TicketResponse {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  
  // User references (will be populated with user data)
  createdBy: string;
  assignedTo: string | null;
  companyId: string;
  
  ticketNumber: string;
  
  // Converted to ISO strings for frontend
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  dueDate: string | null;
  lastActivityAt: string;
  
  attachments: TicketAttachmentResponse[];
  tags: string[];
  estimatedHours: number | null;
  actualHours: number | null;
  resolution: string | null;
  
  // Additional populated fields
  messages?: TicketMessageResponse[];
  createdByUser?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignedToUser?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

// Ticket message interfaces
export interface TicketMessageDocument {
  id?: string;
  ticketId: string; // Reference to parent ticket
  senderId: string; // User document ID
  message: string;
  type: MessageType;
  attachments: string[]; // Array of attachment document IDs
  createdAt: Timestamp;
  editedAt: Timestamp | null;
}

export interface CreateTicketMessageDTO {
  message: string;
  type?: MessageType; // Defaults to USER_MESSAGE
  attachments?: File[];
}

export interface TicketMessageResponse {
  id: string;
  ticketId: string;
  senderId: string;
  message: string;
  type: MessageType;
  attachments: TicketAttachmentResponse[];
  createdAt: string;
  editedAt: string | null;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// Ticket attachment interfaces
export interface TicketAttachmentDocument {
  id?: string;
  ticketId: string; // Reference to parent ticket
  fileName: string; // Sanitized filename for storage
  originalName: string; // Original filename from user
  fileSize: number; // Size in bytes
  mimeType: string;
  uploadedBy: string; // User document ID
  downloadUrl: string; // Firebase Storage URL
  createdAt: Timestamp;
}

export interface TicketAttachmentResponse {
  id: string;
  ticketId: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  downloadUrl: string;
  createdAt: string;
  uploadedByUser: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

// Query interfaces for filtering tickets
export interface TicketQueryParams {
  status?: TicketStatus | TicketStatus[];
  priority?: TicketPriority | TicketPriority[];
  category?: TicketCategory | TicketCategory[];
  assignedTo?: string;
  createdBy?: string;
  companyId?: string;
  tags?: string | string[];
  search?: string; // Text search in title/description
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'dueDate';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// Paginated response interface
export interface PaginatedTicketsResponse {
  tickets: TicketResponse[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Ticket statistics interface
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