// frontend/src/shared/constants/project.ts

/**
 * Project Management Constants and Validation Rules
 * Business rules and validation constants for project management features
 */

import { 
    ProjectStatus, 
    ProjectPriority, 
    TaskStatus, 
    MilestoneStatus,
    ProjectPhase,
    BillingType 
  } from '../enums/project';
  
  // ==================== VALIDATION CONSTANTS ====================
  
  export const PROJECT_VALIDATION = {
    NAME: {
      MIN_LENGTH: 3,
      MAX_LENGTH: 100,
      PATTERN: /^[a-zA-Z0-9\s\-_.,()]+$/
    },
    DESCRIPTION: {
      MIN_LENGTH: 10,
      MAX_LENGTH: 2000
    },
    BUDGET: {
      MIN: 0,
      MAX: 10000000 // R10M max project budget
    },
    DURATION: {
      MIN_DAYS: 1,
      MAX_DAYS: 365 * 2 // 2 years max
    },
    TEAM_SIZE: {
      MIN: 1,
      MAX: 50
    },
    MILESTONES: {
      MIN_COUNT: 1,
      MAX_COUNT: 20
    },
    TASKS: {
      MAX_PER_PROJECT: 500
    }
  };
  
  export const TASK_VALIDATION = {
    TITLE: {
      MIN_LENGTH: 3,
      MAX_LENGTH: 150
    },
    DESCRIPTION: {
      MIN_LENGTH: 5,
      MAX_LENGTH: 1000
    },
    ESTIMATED_HOURS: {
      MIN: 0.5,
      MAX: 1000
    },
    DEPENDENCIES: {
      MAX_COUNT: 10
    }
  };
  
  export const MILESTONE_VALIDATION = {
    NAME: {
      MIN_LENGTH: 3,
      MAX_LENGTH: 100
    },
    DESCRIPTION: {
      MIN_LENGTH: 5,
      MAX_LENGTH: 500
    }
  };
  
  // ==================== BUSINESS RULES ====================
  
  export const PROJECT_BUSINESS_RULES = {
    // Status transition rules - which statuses can change to which
    STATUS_TRANSITIONS: {
      [ProjectStatus.PLANNING]: [ProjectStatus.ACTIVE, ProjectStatus.ON_HOLD, ProjectStatus.CANCELLED],
      [ProjectStatus.ACTIVE]: [ProjectStatus.ON_HOLD, ProjectStatus.REVIEW, ProjectStatus.CANCELLED],
      [ProjectStatus.ON_HOLD]: [ProjectStatus.ACTIVE, ProjectStatus.CANCELLED],
      [ProjectStatus.REVIEW]: [ProjectStatus.ACTIVE, ProjectStatus.COMPLETED, ProjectStatus.CANCELLED],
      [ProjectStatus.COMPLETED]: [], // Final state
      [ProjectStatus.CANCELLED]: [] // Final state
    },
  
    // Phase progression rules
    PHASE_PROGRESSION: {
      [ProjectPhase.DISCOVERY]: [ProjectPhase.PLANNING],
      [ProjectPhase.PLANNING]: [ProjectPhase.DESIGN, ProjectPhase.DEVELOPMENT],
      [ProjectPhase.DESIGN]: [ProjectPhase.DEVELOPMENT],
      [ProjectPhase.DEVELOPMENT]: [ProjectPhase.TESTING],
      [ProjectPhase.TESTING]: [ProjectPhase.DEPLOYMENT],
      [ProjectPhase.DEPLOYMENT]: [ProjectPhase.MAINTENANCE],
      [ProjectPhase.MAINTENANCE]: [] // Can stay in maintenance
    },
  
    // Task status transitions
    TASK_STATUS_TRANSITIONS: {
      [TaskStatus.TODO]: [TaskStatus.IN_PROGRESS, TaskStatus.BLOCKED],
      [TaskStatus.IN_PROGRESS]: [TaskStatus.REVIEW, TaskStatus.COMPLETED, TaskStatus.BLOCKED, TaskStatus.TODO],
      [TaskStatus.REVIEW]: [TaskStatus.COMPLETED, TaskStatus.IN_PROGRESS],
      [TaskStatus.COMPLETED]: [], // Final state
      [TaskStatus.BLOCKED]: [TaskStatus.TODO, TaskStatus.IN_PROGRESS]
    },
  
    // Auto-completion rules
    AUTO_COMPLETION: {
      // Project auto-completes when all milestones are complete
      PROJECT_COMPLETION_THRESHOLD: 100, // 100% of milestones
      // Milestone auto-completes when X% of tasks are complete
      MILESTONE_COMPLETION_THRESHOLD: 100, // 100% of tasks
      // Task completion requires explicit marking
      TASK_REQUIRES_EXPLICIT_COMPLETION: true
    }
  };
  
  // ==================== DEFAULT VALUES ====================
  
  export const PROJECT_DEFAULTS = {
    PRIORITY: ProjectPriority.MEDIUM,
    STATUS: ProjectStatus.PLANNING,
    PHASE: ProjectPhase.DISCOVERY,
    BILLING_TYPE: BillingType.FIXED_PRICE,
    ESTIMATED_HOURS: 40,
    BUFFER_PERCENTAGE: 20, // 20% time buffer
    DEFAULT_TASK_HOURS: 8,
    DEFAULT_MILESTONE_DURATION_DAYS: 14
  };
  
  // ==================== TIME & SCHEDULING CONSTANTS ====================
  
  export const TIME_CONSTANTS = {
    WORKING_HOURS_PER_DAY: 8,
    WORKING_DAYS_PER_WEEK: 5,
    WORKING_WEEKS_PER_MONTH: 4.33,
    SPRINT_DURATION_DAYS: 14, // 2-week sprints
    STANDUP_FREQUENCY_DAYS: 1,
    REVIEW_FREQUENCY_DAYS: 7
  };
  
  // ==================== BILLING & PRICING CONSTANTS ====================
  
  export const BILLING_CONSTANTS = {
    HOURLY_RATES: {
      JUNIOR_DEVELOPER: 750, // R750/hour
      SENIOR_DEVELOPER: 1200, // R1200/hour
      PROJECT_MANAGER: 1000,
      DESIGNER: 800,
      QA_TESTER: 600,
      CONSULTANT: 1500
    },
    INVOICE_INTERVALS: {
      [BillingType.HOURLY]: 'weekly',
      [BillingType.MILESTONE]: 'per_milestone',
      [BillingType.FIXED_PRICE]: 'project_phases',
      [BillingType.RETAINER]: 'monthly'
    },
    PAYMENT_TERMS_DAYS: 30,
    LATE_PAYMENT_FEE_PERCENTAGE: 10
  };
  
  // ==================== NOTIFICATION & ALERT THRESHOLDS ====================
  
  export const ALERT_THRESHOLDS = {
    PROJECT_OVERDUE_DAYS: 1,
    TASK_OVERDUE_HOURS: 24,
    MILESTONE_WARNING_DAYS: 3, // Warn 3 days before milestone due
    BUDGET_WARNING_PERCENTAGE: 80, // Warn at 80% budget usage
    TIME_WARNING_PERCENTAGE: 75, // Warn at 75% time usage
    INACTIVE_PROJECT_DAYS: 7 // Alert if no activity for 7 days
  };
  
  // ==================== FILE & DOCUMENT CONSTANTS ====================
  
  export const DOCUMENT_CONSTANTS = {
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
    ALLOWED_FILE_TYPES: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain',
      'application/zip',
      'application/x-zip-compressed'
    ],
    ALLOWED_EXTENSIONS: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif', 'txt', 'zip'],
    VERSION_RETENTION_DAYS: 365,
    MAX_VERSIONS_PER_DOCUMENT: 10
  };
  
  // ==================== DASHBOARD & REPORTING CONSTANTS ====================
  
  export const DASHBOARD_CONSTANTS = {
    RECENT_PROJECTS_LIMIT: 5,
    UPCOMING_MILESTONES_LIMIT: 10,
    OVERDUE_TASKS_LIMIT: 20,
    ACTIVITY_FEED_LIMIT: 50,
    CHART_DATA_POINTS: 30, // Last 30 days for charts
    REFRESH_INTERVAL_SECONDS: 300 // 5 minutes
  };
  
  // ==================== SEARCH & FILTERING CONSTANTS ====================
  
  export const SEARCH_CONSTANTS = {
    MIN_SEARCH_LENGTH: 2,
    MAX_SEARCH_LENGTH: 100,
    SEARCH_DEBOUNCE_MS: 500,
    MAX_SEARCH_RESULTS: 50,
    SEARCH_FIELDS: [
      'name',
      'description',
      'clientName',
      'tags',
      'projectNumber'
    ]
  };
  
  // ==================== PERMISSION CONSTANTS ====================
  
  export const PROJECT_PERMISSIONS = {
    // Who can create projects
    CAN_CREATE: ['BUSINESS_ADMIN', 'BUSINESS_TEAM'],
    
    // Who can edit projects
    CAN_EDIT: ['BUSINESS_ADMIN', 'BUSINESS_TEAM'],
    
    // Who can delete projects
    CAN_DELETE: ['BUSINESS_ADMIN'],
    
    // Who can view all projects
    CAN_VIEW_ALL: ['BUSINESS_ADMIN', 'BUSINESS_TEAM'],
    
    // Who can view client projects (own company only)
    CAN_VIEW_OWN: ['CLIENT_ADMIN', 'CLIENT_USER'],
    
    // Who can assign team members
    CAN_ASSIGN_TEAM: ['BUSINESS_ADMIN', 'BUSINESS_TEAM'],
    
    // Who can update project status
    CAN_UPDATE_STATUS: ['BUSINESS_ADMIN', 'BUSINESS_TEAM'],
    
    // Who can manage project billing
    CAN_MANAGE_BILLING: ['BUSINESS_ADMIN']
  };
  
  // ==================== EXPORT ALL CONSTANTS ====================
  
  export const PROJECT_CONSTANTS = {
    VALIDATION: PROJECT_VALIDATION,
    BUSINESS_RULES: PROJECT_BUSINESS_RULES,
    DEFAULTS: PROJECT_DEFAULTS,
    TIME: TIME_CONSTANTS,
    BILLING: BILLING_CONSTANTS,
    ALERTS: ALERT_THRESHOLDS,
    DOCUMENTS: DOCUMENT_CONSTANTS,
    DASHBOARD: DASHBOARD_CONSTANTS,
    SEARCH: SEARCH_CONSTANTS,
    PERMISSIONS: PROJECT_PERMISSIONS
  };
  
  // ==================== UTILITY FUNCTIONS ====================
  
  /**
   * Check if a status transition is allowed
   */
  export const isStatusTransitionAllowed = (
    fromStatus: ProjectStatus, 
    toStatus: ProjectStatus
  ): boolean => {
    const allowedTransitions = PROJECT_BUSINESS_RULES.STATUS_TRANSITIONS[fromStatus] as ProjectStatus[];
    return allowedTransitions.includes(toStatus);
  };
  
  /**
   * Check if a phase progression is allowed
   */
  export const isPhaseProgressionAllowed = (
    fromPhase: ProjectPhase, 
    toPhase: ProjectPhase
  ): boolean => {
    const allowedProgressions = PROJECT_BUSINESS_RULES.PHASE_PROGRESSION[fromPhase] as ProjectPhase[];
    return allowedProgressions.includes(toPhase);
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
  
  /**
   * Calculate estimated project duration in days
   */
  export const calculateProjectDuration = (estimatedHours: number): number => {
    return Math.ceil(estimatedHours / TIME_CONSTANTS.WORKING_HOURS_PER_DAY);
  };
  
  /**
   * Check if project is overdue
   */
  export const isProjectOverdue = (dueDate: string): boolean => {
    const due = new Date(dueDate);
    const now = new Date();
    return due < now;
  };
  
  /**
   * Get next available project number
   */
  export const generateProjectNumber = (year: number, sequence: number): string => {
    return `AUT-${year}-${sequence.toString().padStart(3, '0')}`;
  };