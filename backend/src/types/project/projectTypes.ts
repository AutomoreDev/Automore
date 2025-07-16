// backend/src/types/project/projectTypes.ts

import { Timestamp } from 'firebase-admin/firestore';
import {
  ProjectStatus,
  ProjectPriority,
  ProjectType,
  ProjectPhase,
  TaskStatus,
  TaskPriority,
  MilestoneStatus,
  TeamRole,
  BillingType,
  TimeEntryType,
  ApprovalStatus,
  CommunicationType,
  DocumentCategory,
  DocumentAccessLevel,
  AssignmentStatus
} from '../../../../frontend/src/shared/enums/project';

// ==================== FIRESTORE DOCUMENT INTERFACES ====================

// Base project interface for Firestore documents
export interface ProjectDocument {
  id?: string; // Firestore document ID
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  type: ProjectType;
  phase: ProjectPhase;
  
  // Client & Company references
  clientId: string; // Company document ID
  companyId: string; // Business company document ID
  createdBy: string; // User document ID
  projectManager: string | null; // User document ID or null
  
  // Human-readable project number
  projectNumber: string; // e.g., "AUT-2025-001"
  
  // Timeline & Scheduling
  startDate: Timestamp;
  endDate: Timestamp | null;
  estimatedHours: number;
  actualHours: number;
  
  // Financial (in South African Rand cents for precision)
  budget: number; // In cents (R1000.00 = 100000)
  billingType: BillingType;
  hourlyRate: number | null; // In cents per hour
  totalCost: number; // In cents
  
  // Progress tracking
  completionPercentage: number;
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastActivityAt: Timestamp;
  
  // Metadata
  tags: string[];
  requirements: string | null;
  deliverables: string[]; // Array of deliverable descriptions
  
  // References to related collections
  teamMemberIds: string[]; // Array of team member document IDs
  milestoneIds: string[]; // Array of milestone document IDs
  documentIds: string[]; // Array of document document IDs
}

// Team member assignment document
export interface TeamMemberDocument {
  id?: string;
  projectId: string; // Project document ID
  userId: string; // User document ID
  role: TeamRole;
  assignmentStatus: AssignmentStatus;
  hourlyRate: number; // In cents per hour
  assignedAt: Timestamp;
  assignedBy: string; // User document ID
}

// Milestone document
export interface MilestoneDocument {
  id?: string;
  projectId: string; // Project document ID
  name: string;
  description: string;
  status: MilestoneStatus;
  
  // Timeline
  startDate: Timestamp;
  dueDate: Timestamp;
  completedAt: Timestamp | null;
  
  // Progress
  estimatedHours: number;
  actualHours: number;
  completionPercentage: number;
  
  // Dependencies
  dependencies: string[]; // Array of milestone document IDs
  
  // Deliverables
  deliverables: string[];
  approvalStatus: ApprovalStatus;
  approvalNotes: string | null;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string; // User document ID
  
  // References
  taskIds: string[]; // Array of task document IDs
}

// Task document
export interface TaskDocument {
  id?: string;
  projectId: string; // Project document ID
  milestoneId: string | null; // Milestone document ID or null
  
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  
  // Assignment
  assignedTo: string | null; // User document ID or null
  createdBy: string; // User document ID
  
  // Timeline
  startDate: Timestamp | null;
  dueDate: Timestamp | null;
  completedAt: Timestamp | null;
  
  // Time tracking
  estimatedHours: number;
  actualHours: number;
  
  // Dependencies
  dependencies: string[]; // Array of task document IDs
  blockedBy: string | null; // What's blocking this task
  
  // Metadata
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // References
  timeEntryIds: string[]; // Array of time entry document IDs
  commentIds: string[]; // Array of comment document IDs
}

// Task comment document
export interface TaskCommentDocument {
  id?: string;
  taskId: string; // Task document ID
  userId: string; // User document ID
  comment: string;
  createdAt: Timestamp;
  editedAt: Timestamp | null;
}

// Time entry document
export interface TimeEntryDocument {
  id?: string;
  projectId: string; // Project document ID
  taskId: string | null; // Task document ID or null
  milestoneId: string | null; // Milestone document ID or null
  
  userId: string; // User document ID
  type: TimeEntryType;
  description: string;
  
  // Time details
  hours: number;
  date: Timestamp; // Date only
  startTime: string | null; // Time only (HH:mm)
  endTime: string | null; // Time only (HH:mm)
  
  // Billing
  hourlyRate: number; // In cents per hour
  billableAmount: number; // In cents
  isBillable: boolean;
  invoiced: boolean;
  invoiceId: string | null; // Invoice document ID
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Communication document
export interface CommunicationDocument {
  id?: string;
  projectId: string; // Project document ID
  type: CommunicationType;
  subject: string;
  content: string;
  
  // Participants
  fromUserId: string; // User document ID
  toUserIds: string[]; // Array of user document IDs
  
  // Meeting details (for video_call, phone, in_person)
  scheduledAt: Timestamp | null;
  duration: number | null; // In minutes
  location: string | null;
  
  // Email details
  emailMessageId: string | null;
  
  // Metadata
  createdAt: Timestamp;
  
  // References
  attachmentIds: string[]; // Array of attachment document IDs
}

// Communication attachment document
export interface CommunicationAttachmentDocument {
  id?: string;
  communicationId: string; // Communication document ID
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  downloadUrl: string;
  uploadedAt: Timestamp;
}

// Project document
export interface ProjectDocumentDocument {
  id?: string;
  projectId: string; // Project document ID
  taskId: string | null; // Task document ID or null
  milestoneId: string | null; // Milestone document ID or null
  
  fileName: string;
  originalName: string;
  category: DocumentCategory;
  accessLevel: DocumentAccessLevel;
  
  // File details
  fileSize: number;
  mimeType: string;
  downloadUrl: string;
  thumbnailUrl: string | null;
  
  // Version control
  version: number;
  parentDocumentId: string | null; // For versioning
  
  // Approval workflow
  approvalStatus: ApprovalStatus;
  approvalNotes: string | null;
  approvedBy: string | null; // User document ID
  approvedAt: Timestamp | null;
  
  // Metadata
  description: string | null;
  tags: string[];
  uploadedBy: string; // User document ID
  uploadedAt: Timestamp;
}

// ==================== DTO INTERFACES ====================

// DTO for creating projects (from frontend)
export interface CreateProjectDTO {
  name: string;
  description: string;
  type: ProjectType;
  priority: ProjectPriority;
  clientId: string;
  
  // Timeline
  startDate: string; // ISO string, will be converted to Timestamp
  endDate?: string; // ISO string, will be converted to Timestamp
  estimatedHours: number;
  
  // Financial (in Rand, will be converted to cents)
  budget: number;
  billingType: BillingType;
  hourlyRate?: number;
  
  // Initial setup
  requirements?: string;
  deliverables: string[];
  tags: string[];
  
  // Team assignment
  projectManager?: string;
  teamMembers?: string[];
}

// DTO for updating projects
export interface UpdateProjectDTO {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  phase?: ProjectPhase;
  
  // Timeline
  startDate?: string; // ISO string
  endDate?: string; // ISO string
  estimatedHours?: number;
  
  // Financial (in Rand)
  budget?: number;
  billingType?: BillingType;
  hourlyRate?: number;
  
  // Details
  requirements?: string;
  deliverables?: string[];
  tags?: string[];
  
  // Team
  projectManager?: string;
}

// DTO for creating milestones
export interface CreateMilestoneDTO {
  name: string;
  description: string;
  startDate: string; // ISO string
  dueDate: string; // ISO string
  estimatedHours: number;
  deliverables: string[];
  dependencies?: string[];
}

// DTO for creating tasks
export interface CreateTaskDTO {
  title: string;
  description: string;
  priority: TaskPriority;
  milestoneId?: string;
  assignedTo?: string;
  
  // Timeline
  startDate?: string; // ISO string
  dueDate?: string; // ISO string
  estimatedHours: number;
  
  // Dependencies
  dependencies?: string[];
  tags: string[];
}

// DTO for creating time entries
export interface CreateTimeEntryDTO {
  taskId?: string;
  milestoneId?: string;
  type: TimeEntryType;
  description: string;
  
  // Time details
  hours: number;
  date: string; // Date string (YYYY-MM-DD)
  startTime?: string; // Time string (HH:mm)
  endTime?: string; // Time string (HH:mm)
  
  // Billing
  isBillable: boolean;
}

// ==================== RESPONSE INTERFACES ====================

// Project response for frontend (with converted timestamps and populated data)
export interface ProjectResponse {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  type: ProjectType;
  phase: ProjectPhase;
  
  // Client & Company references
  clientId: string;
  companyId: string;
  createdBy: string;
  projectManager: string | null;
  
  projectNumber: string;
  
  // Timeline & Scheduling (converted to ISO strings)
  startDate: string;
  endDate: string | null;
  estimatedHours: number;
  actualHours: number;
  
  // Financial (converted from cents to Rand)
  budget: number;
  billingType: BillingType;
  hourlyRate: number | null;
  totalCost: number;
  
  // Progress tracking
  completionPercentage: number;
  
  // Timestamps (converted to ISO strings)
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  
  // Metadata
  tags: string[];
  requirements: string | null;
  deliverables: string[];
  
  // Populated data (optional, based on request)
  client?: ProjectClientResponse;
  projectManagerUser?: ProjectUserResponse;
  createdByUser?: ProjectUserResponse;
  teamMembers?: TeamMemberResponse[];
  milestones?: MilestoneResponse[];
  tasks?: TaskResponse[];
  documents?: ProjectDocumentResponse[];
  timeEntries?: TimeEntryResponse[];
  communications?: CommunicationResponse[];
}

export interface ProjectClientResponse {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string | null;
}

export interface ProjectUserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: TeamRole;
  avatar?: string;
}

export interface TeamMemberResponse {
  id: string;
  projectId: string;
  userId: string;
  role: TeamRole;
  assignmentStatus: AssignmentStatus;
  hourlyRate: number; // In Rand (converted from cents)
  assignedAt: string; // ISO string
  assignedBy: string;
  
  // Populated data
  user: ProjectUserResponse;
  assignedByUser: ProjectUserResponse;
}

export interface MilestoneResponse {
  id: string;
  projectId: string;
  name: string;
  description: string;
  status: MilestoneStatus;
  
  // Timeline (converted to ISO strings)
  startDate: string;
  dueDate: string;
  completedAt: string | null;
  
  // Progress
  estimatedHours: number;
  actualHours: number;
  completionPercentage: number;
  
  // Dependencies
  dependencies: string[];
  
  // Deliverables
  deliverables: string[];
  approvalStatus: ApprovalStatus;
  approvalNotes: string | null;
  
  // Metadata (converted to ISO strings)
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  
  // Populated data
  tasks?: TaskResponse[];
  createdByUser?: ProjectUserResponse;
}

export interface TaskResponse {
  id: string;
  projectId: string;
  milestoneId: string | null;
  
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  
  // Assignment
  assignedTo: string | null;
  createdBy: string;
  
  // Timeline (converted to ISO strings)
  startDate: string | null;
  dueDate: string | null;
  completedAt: string | null;
  
  // Time tracking
  estimatedHours: number;
  actualHours: number;
  
  // Dependencies
  dependencies: string[];
  blockedBy: string | null;
  
  // Metadata
  tags: string[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  
  // Populated data
  assignedToUser?: ProjectUserResponse | null;
  createdByUser?: ProjectUserResponse;
  milestone?: MilestoneResponse | null;
  timeEntries?: TimeEntryResponse[];
  comments?: TaskCommentResponse[];
}

export interface TaskCommentResponse {
  id: string;
  taskId: string;
  userId: string;
  comment: string;
  createdAt: string; // ISO string
  editedAt: string | null; // ISO string
  
  // Populated data
  user: ProjectUserResponse;
}

export interface TimeEntryResponse {
  id: string;
  projectId: string;
  taskId: string | null;
  milestoneId: string | null;
  
  userId: string;
  type: TimeEntryType;
  description: string;
  
  // Time details
  hours: number;
  date: string; // Date string (YYYY-MM-DD)
  startTime: string | null; // Time string (HH:mm)
  endTime: string | null; // Time string (HH:mm)
  
  // Billing (converted from cents to Rand)
  hourlyRate: number;
  billableAmount: number;
  isBillable: boolean;
  invoiced: boolean;
  invoiceId: string | null;
  
  // Metadata (converted to ISO strings)
  createdAt: string;
  updatedAt: string;
  
  // Populated data
  user: ProjectUserResponse;
  task?: TaskResponse | null;
  milestone?: MilestoneResponse | null;
}

export interface CommunicationResponse {
  id: string;
  projectId: string;
  type: CommunicationType;
  subject: string;
  content: string;
  
  // Participants
  fromUserId: string;
  toUserIds: string[];
  
  // Meeting details
  scheduledAt: string | null; // ISO string
  duration: number | null;
  location: string | null;
  
  // Email details
  emailMessageId: string | null;
  
  // Metadata
  createdAt: string; // ISO string
  
  // Populated data
  fromUser: ProjectUserResponse;
  toUsers: ProjectUserResponse[];
  attachments?: CommunicationAttachmentResponse[];
}

export interface CommunicationAttachmentResponse {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  downloadUrl: string;
  uploadedAt: string; // ISO string
}

export interface ProjectDocumentResponse {
  id: string;
  projectId: string;
  taskId: string | null;
  milestoneId: string | null;
  
  fileName: string;
  originalName: string;
  category: DocumentCategory;
  accessLevel: DocumentAccessLevel;
  
  // File details
  fileSize: number;
  mimeType: string;
  downloadUrl: string;
  thumbnailUrl: string | null;
  
  // Version control
  version: number;
  parentDocumentId: string | null;
  
  // Approval workflow
  approvalStatus: ApprovalStatus;
  approvalNotes: string | null;
  approvedBy: string | null;
  approvedAt: string | null; // ISO string
  
  // Metadata
  description: string | null;
  tags: string[];
  uploadedBy: string;
  uploadedAt: string; // ISO string
  
  // Populated data
  uploadedByUser: ProjectUserResponse;
  approvedByUser?: ProjectUserResponse | null;
}

// ==================== QUERY PARAMETERS ====================

export interface ProjectQueryParams {
  // Basic filtering
  status?: ProjectStatus[];
  priority?: ProjectPriority[];
  type?: ProjectType[];
  phase?: ProjectPhase[];
  
  // Client/Company filtering
  clientId?: string;
  companyId?: string;
  projectManager?: string;
  teamMember?: string;
  
  // Date filtering
  startDateFrom?: string; // ISO string
  startDateTo?: string; // ISO string
  endDateFrom?: string; // ISO string
  endDateTo?: string; // ISO string
  
  // Financial filtering
  budgetMin?: number;
  budgetMax?: number;
  billingType?: BillingType[];
  
  // Search
  search?: string;
  tags?: string[];
  
  // Include related data
  includeClient?: boolean;
  includeTeam?: boolean;
  includeMilestones?: boolean;
  includeTasks?: boolean;
  includeDocuments?: boolean;
  includeTimeEntries?: boolean;
  
  // Pagination
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'startDate' | 'endDate' | 'budget' | 'priority' | 'status' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Convert Rand amount to cents for storage
 */
export const randToCents = (rand: number): number => {
  return Math.round(rand * 100);
};

/**
 * Convert cents to Rand for display
 */
export const centsToRand = (cents: number): number => {
  return cents / 100;
};

/**
 * Generate project number
 */
export const generateProjectNumber = (year: number, sequence: number): string => {
  return `AUT-${year}-${sequence.toString().padStart(3, '0')}`;
};

/**
 * Calculate project completion percentage
 */
export const calculateProjectCompletion = (
  completedTasks: number,
  totalTasks: number
): number => {
  if (totalTasks === 0) return 0;
  return Math.round((completedTasks / totalTasks) * 100);
};