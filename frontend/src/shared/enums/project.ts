// frontend/src/shared/enums/project.ts

/**
 * Project Management Enums for Automore Portal
 * Used across both frontend and backend for consistent project status tracking
 */

// ==================== PROJECT STATUS ENUMS ====================

export enum ProjectStatus {
    PLANNING = 'planning',           // Initial planning phase
    ACTIVE = 'active',              // Currently in development/execution
    ON_HOLD = 'on_hold',            // Temporarily paused
    REVIEW = 'review',              // Under review/testing
    COMPLETED = 'completed',        // Successfully completed
    CANCELLED = 'cancelled'         // Project cancelled
  }
  
  export enum ProjectPriority {
    LOW = 'low',                    // Low priority, flexible timeline
    MEDIUM = 'medium',              // Standard priority
    HIGH = 'high',                  // High priority, expedited
    CRITICAL = 'critical'           // Critical/urgent project
  }
  
  export enum ProjectType {
    WEB_DEVELOPMENT = 'web_development',
    MOBILE_APP = 'mobile_app',
    DIGITAL_MARKETING = 'digital_marketing',
    SEO_OPTIMIZATION = 'seo_optimization',
    MAINTENANCE = 'maintenance',
    CONSULTATION = 'consultation',
    CUSTOM = 'custom'
  }
  
  // ==================== TASK & MILESTONE ENUMS ====================
  
  export enum TaskStatus {
    TODO = 'todo',                  // Not started
    IN_PROGRESS = 'in_progress',    // Currently being worked on
    REVIEW = 'review',              // Ready for review
    COMPLETED = 'completed',        // Task completed
    BLOCKED = 'blocked'             // Cannot proceed (dependency/issue)
  }
  
  export enum TaskPriority {
    LOW = 'low',
    MEDIUM = 'medium', 
    HIGH = 'high',
    CRITICAL = 'critical'
  }
  
  export enum MilestoneStatus {
    UPCOMING = 'upcoming',          // Not yet started
    IN_PROGRESS = 'in_progress',    // Currently active
    COMPLETED = 'completed',        // Successfully completed
    OVERDUE = 'overdue',           // Past due date
    CANCELLED = 'cancelled'         // Milestone cancelled
  }
  
  // ==================== PROJECT PHASE ENUMS ====================
  
  export enum ProjectPhase {
    DISCOVERY = 'discovery',        // Requirements gathering
    PLANNING = 'planning',          // Project planning
    DESIGN = 'design',             // Design phase
    DEVELOPMENT = 'development',    // Development/implementation
    TESTING = 'testing',           // Testing and QA
    DEPLOYMENT = 'deployment',      // Go-live
    MAINTENANCE = 'maintenance'     // Post-launch support
  }
  
  // ==================== TEAM & ASSIGNMENT ENUMS ====================
  
  export enum TeamRole {
    PROJECT_MANAGER = 'project_manager',
    DEVELOPER = 'developer',
    DESIGNER = 'designer',
    QA_TESTER = 'qa_tester',
    CLIENT_CONTACT = 'client_contact',
    CONSULTANT = 'consultant'
  }
  
  export enum AssignmentStatus {
    ASSIGNED = 'assigned',          // Assigned to team member
    ACCEPTED = 'accepted',          // Team member accepted
    IN_PROGRESS = 'in_progress',    // Work in progress
    COMPLETED = 'completed',        // Assignment completed
    DECLINED = 'declined'           // Team member declined
  }
  
  // ==================== BILLING & TIME TRACKING ENUMS ====================
  
  export enum BillingType {
    FIXED_PRICE = 'fixed_price',    // Fixed project cost
    HOURLY = 'hourly',             // Hourly billing
    MILESTONE = 'milestone',        // Milestone-based billing
    RETAINER = 'retainer'          // Monthly retainer
  }
  
  export enum TimeEntryType {
    DEVELOPMENT = 'development',
    DESIGN = 'design',
    TESTING = 'testing',
    MEETING = 'meeting',
    RESEARCH = 'research',
    DOCUMENTATION = 'documentation',
    SUPPORT = 'support'
  }
  
  // ==================== COMMUNICATION & APPROVAL ENUMS ====================
  
  export enum ApprovalStatus {
    PENDING = 'pending',            // Awaiting approval
    APPROVED = 'approved',          // Approved by client
    REJECTED = 'rejected',          // Rejected by client
    REVISION_REQUESTED = 'revision_requested' // Changes requested
  }
  
  export enum CommunicationType {
    EMAIL = 'email',
    PHONE = 'phone',
    VIDEO_CALL = 'video_call',
    IN_PERSON = 'in_person',
    CHAT = 'chat',
    SYSTEM_UPDATE = 'system_update'
  }
  
  // ==================== DOCUMENT & FILE ENUMS ====================
  
  export enum DocumentCategory {
    REQUIREMENTS = 'requirements',
    DESIGN = 'design',
    CONTRACTS = 'contracts',
    ASSETS = 'assets',
    REPORTS = 'reports',
    TESTING = 'testing',
    DEPLOYMENT = 'deployment'
  }
  
  export enum DocumentAccessLevel {
    PRIVATE = 'private',            // Only uploader can access
    TEAM = 'team',                 // Team members can access
    CLIENT = 'client',             // Client can access
    PUBLIC = 'public'              // Anyone in company can access
  }
  
  // ==================== LABEL/COLOR MAPPINGS ====================
  
  export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
    [ProjectStatus.PLANNING]: 'Planning',
    [ProjectStatus.ACTIVE]: 'Active',
    [ProjectStatus.ON_HOLD]: 'On Hold',
    [ProjectStatus.REVIEW]: 'Under Review',
    [ProjectStatus.COMPLETED]: 'Completed',
    [ProjectStatus.CANCELLED]: 'Cancelled'
  };
  
  export const PROJECT_PRIORITY_LABELS: Record<ProjectPriority, string> = {
    [ProjectPriority.LOW]: 'Low Priority',
    [ProjectPriority.MEDIUM]: 'Medium Priority',
    [ProjectPriority.HIGH]: 'High Priority',
    [ProjectPriority.CRITICAL]: 'Critical'
  };
  
  export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
    [ProjectType.WEB_DEVELOPMENT]: 'Web Development',
    [ProjectType.MOBILE_APP]: 'Mobile App',
    [ProjectType.DIGITAL_MARKETING]: 'Digital Marketing',
    [ProjectType.SEO_OPTIMIZATION]: 'SEO Optimization',
    [ProjectType.MAINTENANCE]: 'Maintenance',
    [ProjectType.CONSULTATION]: 'Consultation',
    [ProjectType.CUSTOM]: 'Custom Project'
  };
  
  export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
    [TaskStatus.TODO]: 'To Do',
    [TaskStatus.IN_PROGRESS]: 'In Progress',
    [TaskStatus.REVIEW]: 'Under Review',
    [TaskStatus.COMPLETED]: 'Completed',
    [TaskStatus.BLOCKED]: 'Blocked'
  };
  
  export const PROJECT_PHASE_LABELS: Record<ProjectPhase, string> = {
    [ProjectPhase.DISCOVERY]: 'Discovery',
    [ProjectPhase.PLANNING]: 'Planning',
    [ProjectPhase.DESIGN]: 'Design',
    [ProjectPhase.DEVELOPMENT]: 'Development',
    [ProjectPhase.TESTING]: 'Testing',
    [ProjectPhase.DEPLOYMENT]: 'Deployment',
    [ProjectPhase.MAINTENANCE]: 'Maintenance'
  };
  
  // ==================== COLOR MAPPINGS FOR UI ====================
  
  export type StatusColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  
  export const PROJECT_STATUS_COLORS: Record<ProjectStatus, StatusColor> = {
    [ProjectStatus.PLANNING]: 'info',
    [ProjectStatus.ACTIVE]: 'primary',
    [ProjectStatus.ON_HOLD]: 'warning',
    [ProjectStatus.REVIEW]: 'secondary',
    [ProjectStatus.COMPLETED]: 'success',
    [ProjectStatus.CANCELLED]: 'error'
  };
  
  export const TASK_STATUS_COLORS: Record<TaskStatus, StatusColor> = {
    [TaskStatus.TODO]: 'default',
    [TaskStatus.IN_PROGRESS]: 'primary',
    [TaskStatus.REVIEW]: 'warning',
    [TaskStatus.COMPLETED]: 'success',
    [TaskStatus.BLOCKED]: 'error'
  };
  
  export const PROJECT_PRIORITY_COLORS: Record<ProjectPriority, StatusColor> = {
    [ProjectPriority.LOW]: 'success',
    [ProjectPriority.MEDIUM]: 'info',
    [ProjectPriority.HIGH]: 'warning',
    [ProjectPriority.CRITICAL]: 'error'
  };