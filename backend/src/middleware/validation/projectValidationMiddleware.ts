// backend/src/middleware/validation/projectValidationMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import { body, query, validationResult } from 'express-validator';
import {
  ProjectStatus,
  ProjectPriority,
  ProjectType,
  ProjectPhase,
  BillingType,
  TeamRole
} from '../../../../frontend/src/shared/enums/project';
import { PROJECT_CONSTANTS } from '../../../../frontend/src/shared/constants/project';

/**
 * Validation middleware for creating projects
 */
export const validateCreateProject = [
  // Project name validation
  body('name')
    .trim()
    .isLength({ min: PROJECT_CONSTANTS.VALIDATION.NAME.MIN_LENGTH })
    .withMessage(`Project name must be at least ${PROJECT_CONSTANTS.VALIDATION.NAME.MIN_LENGTH} characters long`)
    .isLength({ max: PROJECT_CONSTANTS.VALIDATION.NAME.MAX_LENGTH })
    .withMessage(`Project name must not exceed ${PROJECT_CONSTANTS.VALIDATION.NAME.MAX_LENGTH} characters`)
    .matches(PROJECT_CONSTANTS.VALIDATION.NAME.PATTERN)
    .withMessage('Project name contains invalid characters'),

  // Project description validation
  body('description')
    .trim()
    .isLength({ min: PROJECT_CONSTANTS.VALIDATION.DESCRIPTION.MIN_LENGTH })
    .withMessage(`Description must be at least ${PROJECT_CONSTANTS.VALIDATION.DESCRIPTION.MIN_LENGTH} characters long`)
    .isLength({ max: PROJECT_CONSTANTS.VALIDATION.DESCRIPTION.MAX_LENGTH })
    .withMessage(`Description must not exceed ${PROJECT_CONSTANTS.VALIDATION.DESCRIPTION.MAX_LENGTH} characters`),

  // Project type validation
  body('type')
    .isIn(Object.values(ProjectType))
    .withMessage(`Invalid project type. Must be one of: ${Object.values(ProjectType).join(', ')}`),

  // Project priority validation
  body('priority')
    .isIn(Object.values(ProjectPriority))
    .withMessage(`Invalid priority. Must be one of: ${Object.values(ProjectPriority).join(', ')}`),

  // Client ID validation
  body('clientId')
    .notEmpty()
    .withMessage('Client ID is required')
    .isString()
    .withMessage('Client ID must be a string')
    .isLength({ min: 1 })
    .withMessage('Client ID cannot be empty'),

  // Start date validation
  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date')
    .custom((value) => {
      const startDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        throw new Error('Start date cannot be in the past');
      }
      return true;
    }),

  // End date validation (optional)
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      if (value && req.body.startDate) {
        const startDate = new Date(req.body.startDate);
        const endDate = new Date(value);
        
        if (endDate <= startDate) {
          throw new Error('End date must be after start date');
        }
        
        const maxDuration = PROJECT_CONSTANTS.VALIDATION.DURATION.MAX_DAYS;
        const durationDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (durationDays > maxDuration) {
          throw new Error(`Project duration cannot exceed ${maxDuration} days`);
        }
      }
      return true;
    }),

  // Estimated hours validation
  body('estimatedHours')
    .isFloat({ min: PROJECT_CONSTANTS.VALIDATION.DURATION.MIN_DAYS })
    .withMessage(`Estimated hours must be at least ${PROJECT_CONSTANTS.VALIDATION.DURATION.MIN_DAYS}`)
    .isFloat({ max: PROJECT_CONSTANTS.VALIDATION.DURATION.MAX_DAYS * 24 })
    .withMessage(`Estimated hours cannot exceed ${PROJECT_CONSTANTS.VALIDATION.DURATION.MAX_DAYS * 24} hours`),

  // Budget validation
  body('budget')
    .isFloat({ min: PROJECT_CONSTANTS.VALIDATION.BUDGET.MIN })
    .withMessage(`Budget must be at least R${PROJECT_CONSTANTS.VALIDATION.BUDGET.MIN}`)
    .isFloat({ max: PROJECT_CONSTANTS.VALIDATION.BUDGET.MAX })
    .withMessage(`Budget cannot exceed R${PROJECT_CONSTANTS.VALIDATION.BUDGET.MAX.toLocaleString()}`),

  // Billing type validation
  body('billingType')
    .isIn(Object.values(BillingType))
    .withMessage(`Invalid billing type. Must be one of: ${Object.values(BillingType).join(', ')}`),

  // Hourly rate validation (optional, required for hourly billing)
  body('hourlyRate')
    .optional()
    .isFloat({ min: 50 })
    .withMessage('Hourly rate must be at least R50')
    .isFloat({ max: 5000 })
    .withMessage('Hourly rate cannot exceed R5,000')
    .custom((value, { req }) => {
      if (req.body.billingType === BillingType.HOURLY && !value) {
        throw new Error('Hourly rate is required for hourly billing projects');
      }
      return true;
    }),

  // Requirements validation (optional)
  body('requirements')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Requirements cannot exceed 5,000 characters'),

  // Deliverables validation
  body('deliverables')
    .isArray({ min: PROJECT_CONSTANTS.VALIDATION.MILESTONES.MIN_COUNT })
    .withMessage(`At least ${PROJECT_CONSTANTS.VALIDATION.MILESTONES.MIN_COUNT} deliverable is required`)
    .isArray({ max: PROJECT_CONSTANTS.VALIDATION.MILESTONES.MAX_COUNT })
    .withMessage(`Cannot have more than ${PROJECT_CONSTANTS.VALIDATION.MILESTONES.MAX_COUNT} deliverables`),

  body('deliverables.*')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Each deliverable must be at least 3 characters long')
    .isLength({ max: 200 })
    .withMessage('Each deliverable cannot exceed 200 characters'),

  // Tags validation (optional)
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Cannot have more than 10 tags'),

  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Each tag must be between 2 and 50 characters'),

  // Project manager validation (optional)
  body('projectManager')
    .optional()
    .isString()
    .withMessage('Project manager must be a valid user ID'),

  // Team members validation (optional)
  body('teamMembers')
    .optional()
    .isArray({ max: PROJECT_CONSTANTS.VALIDATION.TEAM_SIZE.MAX })
    .withMessage(`Cannot assign more than ${PROJECT_CONSTANTS.VALIDATION.TEAM_SIZE.MAX} team members`),

  body('teamMembers.*')
    .optional()
    .isString()
    .withMessage('Each team member must be a valid user ID'),

  // Handle validation errors
  handleValidationErrors
];

/**
 * Validation middleware for updating projects
 */
export const validateUpdateProject = [
  // All fields are optional for updates, but if provided must be valid

  body('name')
    .optional()
    .trim()
    .isLength({ min: PROJECT_CONSTANTS.VALIDATION.NAME.MIN_LENGTH })
    .withMessage(`Project name must be at least ${PROJECT_CONSTANTS.VALIDATION.NAME.MIN_LENGTH} characters long`)
    .isLength({ max: PROJECT_CONSTANTS.VALIDATION.NAME.MAX_LENGTH })
    .withMessage(`Project name must not exceed ${PROJECT_CONSTANTS.VALIDATION.NAME.MAX_LENGTH} characters`)
    .matches(PROJECT_CONSTANTS.VALIDATION.NAME.PATTERN)
    .withMessage('Project name contains invalid characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ min: PROJECT_CONSTANTS.VALIDATION.DESCRIPTION.MIN_LENGTH })
    .withMessage(`Description must be at least ${PROJECT_CONSTANTS.VALIDATION.DESCRIPTION.MIN_LENGTH} characters long`)
    .isLength({ max: PROJECT_CONSTANTS.VALIDATION.DESCRIPTION.MAX_LENGTH })
    .withMessage(`Description must not exceed ${PROJECT_CONSTANTS.VALIDATION.DESCRIPTION.MAX_LENGTH} characters`),

  body('status')
    .optional()
    .isIn(Object.values(ProjectStatus))
    .withMessage(`Invalid status. Must be one of: ${Object.values(ProjectStatus).join(', ')}`),

  body('priority')
    .optional()
    .isIn(Object.values(ProjectPriority))
    .withMessage(`Invalid priority. Must be one of: ${Object.values(ProjectPriority).join(', ')}`),

  body('phase')
    .optional()
    .isIn(Object.values(ProjectPhase))
    .withMessage(`Invalid phase. Must be one of: ${Object.values(ProjectPhase).join(', ')}`),

  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),

  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      if (value && req.body.startDate) {
        const startDate = new Date(req.body.startDate);
        const endDate = new Date(value);
        
        if (endDate <= startDate) {
          throw new Error('End date must be after start date');
        }
      }
      return true;
    }),

  body('estimatedHours')
    .optional()
    .isFloat({ min: PROJECT_CONSTANTS.VALIDATION.DURATION.MIN_DAYS })
    .withMessage(`Estimated hours must be at least ${PROJECT_CONSTANTS.VALIDATION.DURATION.MIN_DAYS}`)
    .isFloat({ max: PROJECT_CONSTANTS.VALIDATION.DURATION.MAX_DAYS * 24 })
    .withMessage(`Estimated hours cannot exceed ${PROJECT_CONSTANTS.VALIDATION.DURATION.MAX_DAYS * 24} hours`),

  body('budget')
    .optional()
    .isFloat({ min: PROJECT_CONSTANTS.VALIDATION.BUDGET.MIN })
    .withMessage(`Budget must be at least R${PROJECT_CONSTANTS.VALIDATION.BUDGET.MIN}`)
    .isFloat({ max: PROJECT_CONSTANTS.VALIDATION.BUDGET.MAX })
    .withMessage(`Budget cannot exceed R${PROJECT_CONSTANTS.VALIDATION.BUDGET.MAX.toLocaleString()}`),

  body('billingType')
    .optional()
    .isIn(Object.values(BillingType))
    .withMessage(`Invalid billing type. Must be one of: ${Object.values(BillingType).join(', ')}`),

  body('hourlyRate')
    .optional()
    .isFloat({ min: 50 })
    .withMessage('Hourly rate must be at least R50')
    .isFloat({ max: 5000 })
    .withMessage('Hourly rate cannot exceed R5,000'),

  body('requirements')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Requirements cannot exceed 5,000 characters'),

  body('deliverables')
    .optional()
    .isArray({ min: PROJECT_CONSTANTS.VALIDATION.MILESTONES.MIN_COUNT })
    .withMessage(`At least ${PROJECT_CONSTANTS.VALIDATION.MILESTONES.MIN_COUNT} deliverable is required`)
    .isArray({ max: PROJECT_CONSTANTS.VALIDATION.MILESTONES.MAX_COUNT })
    .withMessage(`Cannot have more than ${PROJECT_CONSTANTS.VALIDATION.MILESTONES.MAX_COUNT} deliverables`),

  body('deliverables.*')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Each deliverable must be at least 3 characters long')
    .isLength({ max: 200 })
    .withMessage('Each deliverable cannot exceed 200 characters'),

  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Cannot have more than 10 tags'),

  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Each tag must be between 2 and 50 characters'),

  body('projectManager')
    .optional()
    .isString()
    .withMessage('Project manager must be a valid user ID'),

  // Handle validation errors
  handleValidationErrors
];

/**
 * Validation middleware for project query parameters
 */
export const validateProjectQuery = [
  // Status filter
  query('status')
    .optional()
    .custom((value) => {
      const statuses = Array.isArray(value) ? value : [value];
      const validStatuses = Object.values(ProjectStatus);
      
      for (const status of statuses) {
        if (!validStatuses.includes(status)) {
          throw new Error(`Invalid status filter: ${status}`);
        }
      }
      return true;
    }),

  // Priority filter
  query('priority')
    .optional()
    .custom((value) => {
      const priorities = Array.isArray(value) ? value : [value];
      const validPriorities = Object.values(ProjectPriority);
      
      for (const priority of priorities) {
        if (!validPriorities.includes(priority)) {
          throw new Error(`Invalid priority filter: ${priority}`);
        }
      }
      return true;
    }),

  // Type filter
  query('type')
    .optional()
    .custom((value) => {
      const types = Array.isArray(value) ? value : [value];
      const validTypes = Object.values(ProjectType);
      
      for (const type of types) {
        if (!validTypes.includes(type)) {
          throw new Error(`Invalid type filter: ${type}`);
        }
      }
      return true;
    }),

  // Phase filter
  query('phase')
    .optional()
    .custom((value) => {
      const phases = Array.isArray(value) ? value : [value];
      const validPhases = Object.values(ProjectPhase);
      
      for (const phase of phases) {
        if (!validPhases.includes(phase)) {
          throw new Error(`Invalid phase filter: ${phase}`);
        }
      }
      return true;
    }),

  // Date filters
  query('startDateFrom')
    .optional()
    .isISO8601()
    .withMessage('Start date from must be a valid ISO 8601 date'),

  query('startDateTo')
    .optional()
    .isISO8601()
    .withMessage('Start date to must be a valid ISO 8601 date'),

  query('endDateFrom')
    .optional()
    .isISO8601()
    .withMessage('End date from must be a valid ISO 8601 date'),

  query('endDateTo')
    .optional()
    .isISO8601()
    .withMessage('End date to must be a valid ISO 8601 date'),

  // Budget filters
  query('budgetMin')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Budget minimum must be a positive number'),

  query('budgetMax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Budget maximum must be a positive number')
    .custom((value, { req }) => {
      if (value && req.query && req.query.budgetMin && parseFloat(value) < parseFloat(req.query.budgetMin as string)) {
        throw new Error('Budget maximum must be greater than budget minimum');
      }
      return true;
    }),

  // Search
  query('search')
    .optional()
    .trim()
    .isLength({ min: PROJECT_CONSTANTS.SEARCH.MIN_SEARCH_LENGTH })
    .withMessage(`Search query must be at least ${PROJECT_CONSTANTS.SEARCH.MIN_SEARCH_LENGTH} characters long`)
    .isLength({ max: PROJECT_CONSTANTS.SEARCH.MAX_SEARCH_LENGTH })
    .withMessage(`Search query cannot exceed ${PROJECT_CONSTANTS.SEARCH.MAX_SEARCH_LENGTH} characters`),

  // Pagination
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  // Sorting
  query('sortBy')
    .optional()
    .isIn(['name', 'startDate', 'endDate', 'budget', 'priority', 'status', 'updatedAt'])
    .withMessage('Invalid sort field'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be "asc" or "desc"'),

  // Boolean flags for including related data
  query('includeClient')
    .optional()
    .isBoolean()
    .withMessage('Include client must be a boolean'),

  query('includeTeam')
    .optional()
    .isBoolean()
    .withMessage('Include team must be a boolean'),

  query('includeMilestones')
    .optional()
    .isBoolean()
    .withMessage('Include milestones must be a boolean'),

  query('includeTasks')
    .optional()
    .isBoolean()
    .withMessage('Include tasks must be a boolean'),

  query('includeDocuments')
    .optional()
    .isBoolean()
    .withMessage('Include documents must be a boolean'),

  query('includeTimeEntries')
    .optional()
    .isBoolean()
    .withMessage('Include time entries must be a boolean'),

  // Handle validation errors
  handleValidationErrors
];

/**
 * Validation middleware for team assignment
 */
export const validateTeamAssignment = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isString()
    .withMessage('User ID must be a string')
    .isLength({ min: 1 })
    .withMessage('User ID cannot be empty'),

  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(Object.values(TeamRole))
    .withMessage(`Invalid role. Must be one of: ${Object.values(TeamRole).join(', ')}`),

  body('hourlyRate')
    .optional()
    .isFloat({ min: 50 })
    .withMessage('Hourly rate must be at least R50')
    .isFloat({ max: 5000 })
    .withMessage('Hourly rate cannot exceed R5,000'),

  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),

  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      if (value && req.body.startDate) {
        const startDate = new Date(req.body.startDate);
        const endDate = new Date(value);
        
        if (endDate <= startDate) {
          throw new Error('End date must be after start date');
        }
      }
      return true;
    }),

  // Handle validation errors
  handleValidationErrors
];

/**
 * Central error handler for validation results
 */
function handleValidationErrors(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.type === 'field' ? (error as any).path : 'unknown',
      message: error.msg
    }));

    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
    return;
  }
  
  next();
}

/**
 * Sanitize and normalize project data
 */
export const sanitizeProjectData = (req: Request, res: Response, next: NextFunction): void => {
  if (req.body.name) {
    req.body.name = req.body.name.trim().replace(/\s+/g, ' ');
  }
  
  if (req.body.description) {
    req.body.description = req.body.description.trim().replace(/\s+/g, ' ');
  }
  
  if (req.body.tags && Array.isArray(req.body.tags)) {
    req.body.tags = req.body.tags
      .map((tag: string) => tag.trim().toLowerCase())
      .filter((tag: string) => tag.length > 0)
      .filter((tag: string, index: number, array: string[]) => array.indexOf(tag) === index); // Remove duplicates
  }
  
  if (req.body.deliverables && Array.isArray(req.body.deliverables)) {
    req.body.deliverables = req.body.deliverables
      .map((deliverable: string) => deliverable.trim())
      .filter((deliverable: string) => deliverable.length > 0);
  }
  
  next();
};