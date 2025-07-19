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
  
  // Re-export all enums and labels from shared location
  export * from '../../shared/enums/project';
  
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
  }
  
  // ==================== TIME ENTRY INTERFACES ====================
  
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
    date: string; // Date string (YYYY-MM-DD)
    startTime: string | null; // Time string (HH:mm)
    endTime: string | null; // Time string (HH:mm)
    
    // Billing
    isBillable: boolean;
    hourlyRate: number | null;
    totalCost: number;
    
    // Metadata
    createdAt: string;
    updatedAt: string;
    
    // Populated data
    user?: ProjectUser;
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
    attachments: CommunicationAttachment[];
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
  
  // ==================== QUERY & FILTER INTERFACES ====================
  
  export interface ProjectQueryParams {
    search?: string;
    status?: ProjectStatus[];
    priority?: ProjectPriority[];
    type?: ProjectType[];
    phase?: ProjectPhase[];
    clientId?: string;
    projectManager?: string;
    page?: number;
    limit?: number;
    sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'startDate' | 'endDate' | 'budget' | 'priority';
    sortOrder?: 'asc' | 'desc';
    startDate?: string;
    endDate?: string;
    budgetMin?: number;
    budgetMax?: number;
  }
  
  // ==================== DASHBOARD & STATISTICS INTERFACES ====================
  
  export interface ProjectDashboardData {
    activeProjects: Project[];
    recentProjects: Project[];
    completedThisMonth: number;
    totalBudgetThisMonth: number;
    overdueMilestones: ProjectMilestone[];
    pendingApprovals: ProjectMilestone[];
    teamProductivity: TeamProductivityData[];
  }
  
  export interface TeamProductivityData {
    userId: string;
    user: ProjectUser;
    hoursLogged: number;
    tasksCompleted: number;
    productivity: number; // percentage
  }
  
  export interface ProjectStatistics {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalBudget: number;
    totalRevenue: number;
    averageBudget: number;
    totalEstimatedHours: number;
    totalActualHours: number;
    averageCompletion: number;
    
    // Distribution data
    projectsByType: Array<{
      type: ProjectType;
      count: number;
    }>;
    
    projectsByPriority: Array<{
      priority: ProjectPriority;
      count: number;
    }>;
    
    projectsByStatus: Array<{
      status: ProjectStatus;
      count: number;
    }>;
  }
  
  // ==================== API RESPONSE TYPES ====================
  
  export interface ProjectsApiResponse {
    projects: Project[];
    totalCount: number;
    hasNextPage: boolean;
  }