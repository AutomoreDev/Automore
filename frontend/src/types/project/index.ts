// frontend/src/types/project/index.ts

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
  } from '../../shared/enums/project';
  
  // ==================== CORE PROJECT INTERFACES ====================
  
  export interface Project {
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
    
    // Human-readable project number
    projectNumber: string; // e.g., "AUT-2025-001"
    
    // Timeline & Scheduling
    startDate: string; // ISO string
    endDate: string | null; // ISO string
    estimatedHours: number;
    actualHours: number;
    
    // Financial
    budget: number; // In South African Rand
    billingType: BillingType;
    hourlyRate: number | null;
    totalCost: number;
    
    // Progress tracking
    completionPercentage: number;
    
    // Timestamps (ISO strings)
    createdAt: string;
    updatedAt: string;
    lastActivityAt: string;
    
    // Metadata
    tags: string[];
    requirements: string | null;
    deliverables: string[];
    
    // Populated data
    client?: ProjectClient;
    projectManagerUser?: ProjectUser;
    createdByUser?: ProjectUser;
    teamMembers?: ProjectTeamMember[];
    milestones?: ProjectMilestone[];
    tasks?: ProjectTask[];
    documents?: ProjectDocument[];
    timeEntries?: ProjectTimeEntry[];
    communications?: ProjectCommunication[];
  }
  
  export interface ProjectClient {
    id: string;
    companyName: string;
    contactPerson: string;
    email: string;
    phone: string | null;
  }
  
  export interface ProjectUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: TeamRole;
    avatar?: string;
  }
  
  // ==================== TEAM MANAGEMENT INTERFACES ====================
  
  export interface ProjectTeamMember {
    id: string;
    projectId: string;
    userId: string;
    role: TeamRole;
    assignmentStatus: AssignmentStatus;
    hourlyRate: number;
    assignedAt: string;
    assignedBy: string;
    
    // Populated user data
    user: ProjectUser;
    assignedByUser: ProjectUser;
  }
  
  // ==================== MILESTONE INTERFACES ====================
  
  export interface ProjectMilestone {
    id: string;
    projectId: string;
    name: string;
    description: string;
    status: MilestoneStatus;
    
    // Timeline
    startDate: string;
    dueDate: string;
    completedAt: string | null;
    
    // Progress
    estimatedHours: number;
    actualHours: number;
    completionPercentage: number;
    
    // Dependencies
    dependencies: string[]; // Array of milestone IDs
    
    // Deliverables
    deliverables: string[];
    approvalStatus: ApprovalStatus;
    approvalNotes: string | null;
    
    // Metadata
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    
    // Populated data
    tasks?: ProjectTask[];
    createdByUser?: ProjectUser;
  }
  
  // ==================== TASK INTERFACES ====================
  
  export interface ProjectTask {
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
    
    // Timeline
    startDate: string | null;
    dueDate: string | null;
    completedAt: string | null;
    
    // Time tracking
    estimatedHours: number;
    actualHours: number;
    
    // Dependencies
    dependencies: string[]; // Array of task IDs
    blockedBy: string | null; // What's blocking this task
    
    // Metadata
    tags: string[];
    createdAt: string;
    updatedAt: string;
    
    // Populated data
    assignedToUser?: ProjectUser | null;
    createdByUser?: ProjectUser;
    milestone?: ProjectMilestone | null;
    timeEntries?: ProjectTimeEntry[];
    comments?: TaskComment[];
  }
  
  export interface TaskComment {
    id: string;
    taskId: string;
    userId: string;
    comment: string;
    createdAt: string;
    editedAt: string | null;
    
    // Populated data
    user: ProjectUser;
  }
  
  // ==================== TIME TRACKING INTERFACES ====================
  
  export interface ProjectTimeEntry {
    id: string;
    projectId: string;
    taskId: string | null;
    milestoneId: string | null;
    
    userId: string;
    type: TimeEntryType;
    description: string;
    
    // Time details
    hours: number;
    date: string; // Date only (YYYY-MM-DD)
    startTime: string | null; // Time only (HH:mm)
    endTime: string | null; // Time only (HH:mm)
    
    // Billing
    hourlyRate: number;
    billableAmount: number;
    isBillable: boolean;
    invoiced: boolean;
    invoiceId: string | null;
    
    // Metadata
    createdAt: string;
    updatedAt: string;
    
    // Populated data
    user: ProjectUser;
    task?: ProjectTask | null;
    milestone?: ProjectMilestone | null;
  }
  
  // ==================== COMMUNICATION INTERFACES ====================
  
  export interface ProjectCommunication {
    id: string;
    projectId: string;
    type: CommunicationType;
    subject: string;
    content: string;
    
    // Participants
    fromUserId: string;
    toUserIds: string[];
    
    // Meeting details (for video_call, phone, in_person)
    scheduledAt: string | null;
    duration: number | null; // In minutes
    location: string | null;
    
    // Email details
    emailMessageId: string | null;
    
    // Metadata
    createdAt: string;
    
    // Populated data
    fromUser: ProjectUser;
    toUsers: ProjectUser[];
    attachments?: CommunicationAttachment[];
  }
  
  export interface CommunicationAttachment {
    id: string;
    fileName: string;
    originalName: string;
    fileSize: number;
    mimeType: string;
    downloadUrl: string;
    uploadedAt: string;
  }
  
  // ==================== DOCUMENT INTERFACES ====================
  
  export interface ProjectDocument {
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
    parentDocumentId: string | null; // For versioning
    
    // Approval workflow
    approvalStatus: ApprovalStatus;
    approvalNotes: string | null;
    approvedBy: string | null;
    approvedAt: string | null;
    
    // Metadata
    description: string | null;
    tags: string[];
    uploadedBy: string;
    uploadedAt: string;
    
    // Populated data
    uploadedByUser: ProjectUser;
    approvedByUser?: ProjectUser | null;
  }
  
  // ==================== FORM INTERFACES ====================
  
  export interface CreateProjectForm {
    name: string;
    description: string;
    type: ProjectType;
    priority: ProjectPriority;
    clientId: string;
    
    // Timeline
    startDate: string;
    endDate?: string;
    estimatedHours: number;
    
    // Financial
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
  
  export interface UpdateProjectForm {
    name?: string;
    description?: string;
    status?: ProjectStatus;
    priority?: ProjectPriority;
    phase?: ProjectPhase;
    
    // Timeline
    startDate?: string;
    endDate?: string;
    estimatedHours?: number;
    
    // Financial
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
  
  export interface CreateMilestoneForm {
    name: string;
    description: string;
    startDate: string;
    dueDate: string;
    estimatedHours: number;
    deliverables: string[];
    dependencies?: string[];
  }
  
  export interface CreateTaskForm {
    title: string;
    description: string;
    priority: TaskPriority;
    milestoneId?: string;
    assignedTo?: string;
    
    // Timeline
    startDate?: string;
    dueDate?: string;
    estimatedHours: number;
    
    // Dependencies
    dependencies?: string[];
    tags: string[];
  }
  
  export interface CreateTimeEntryForm {
    taskId?: string;
    milestoneId?: string;
    type: TimeEntryType;
    description: string;
    
    // Time details
    hours: number;
    date: string;
    startTime?: string;
    endTime?: string;
    
    // Billing
    isBillable: boolean;
  }
  
  // ==================== QUERY & FILTER INTERFACES ====================
  
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
    startDateFrom?: string;
    startDateTo?: string;
    endDateFrom?: string;
    endDateTo?: string;
    
    // Financial filtering
    budgetMin?: number;
    budgetMax?: number;
    billingType?: BillingType[];
    
    // Search
    search?: string;
    tags?: string[];
    
    // Pagination
    page?: number;
    limit?: number;
    sortBy?: 'name' | 'startDate' | 'endDate' | 'budget' | 'priority' | 'status' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
  }
  
  export interface TaskQueryParams {
    projectId?: string;
    milestoneId?: string;
    assignedTo?: string;
    status?: TaskStatus[];
    priority?: TaskPriority[];
    
    // Date filtering
    dueDateFrom?: string;
    dueDateTo?: string;
    
    // Search
    search?: string;
    tags?: string[];
    
    // Pagination
    page?: number;
    limit?: number;
    sortBy?: 'title' | 'dueDate' | 'priority' | 'status' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
  }
  
  // ==================== API RESPONSE INTERFACES ====================
  
  export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
    errors?: Array<{
      field: string;
      message: string;
    }>;
  }
  
  export interface PaginatedResponse<T = any> {
    success: boolean;
    data: T[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }
  
  // ==================== DASHBOARD & ANALYTICS INTERFACES ====================
  
  export interface ProjectDashboardData {
    // Summary stats
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    overdueProjects: number;
    
    // Financial summary
    totalBudget: number;
    totalRevenue: number;
    totalCosts: number;
    profitMargin: number;
    
    // Time tracking summary
    totalEstimatedHours: number;
    totalActualHours: number;
    utilizationRate: number;
    
    // Recent activity
    recentProjects: Project[];
    upcomingMilestones: ProjectMilestone[];
    overdueTasks: ProjectTask[];
    
    // Charts data
    projectStatusChart: Array<{ status: ProjectStatus; count: number }>;
    monthlyRevenueChart: Array<{ month: string; revenue: number }>;
    teamUtilizationChart: Array<{ user: string; hours: number; utilization: number }>;
  }
  
  // ==================== HELPER TYPES ====================
  
  export type ProjectStatusColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  export type TaskStatusColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  export type PriorityColor = 'success' | 'info' | 'warning' | 'error';
  
  // ==================== VALIDATION SCHEMAS ====================
  
  export const PROJECT_FORM_VALIDATION = {
    NAME: {
      MIN_LENGTH: 3,
      MAX_LENGTH: 100,
      REQUIRED: true
    },
    DESCRIPTION: {
      MIN_LENGTH: 10,
      MAX_LENGTH: 2000,
      REQUIRED: true
    },
    BUDGET: {
      MIN: 0,
      MAX: 10000000,
      REQUIRED: true
    },
    ESTIMATED_HOURS: {
      MIN: 1,
      MAX: 10000,
      REQUIRED: true
    },
    DELIVERABLES: {
      MIN_COUNT: 1,
      MAX_COUNT: 20
    }
  };
  
  export const TASK_FORM_VALIDATION = {
    TITLE: {
      MIN_LENGTH: 3,
      MAX_LENGTH: 150,
      REQUIRED: true
    },
    DESCRIPTION: {
      MIN_LENGTH: 5,
      MAX_LENGTH: 1000,
      REQUIRED: true
    },
    ESTIMATED_HOURS: {
      MIN: 0.5,
      MAX: 1000,
      REQUIRED: true
    }
  };