// backend/src/middleware/validation/ticketValidation.ts

import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { TicketPriority, TicketCategory, TicketStatus } from '../../types/ticket/ticketTypes';

/**
 * Middleware to parse JSON fields from FormData
 */
export const parseFormDataFields = (req: Request, res: Response, next: NextFunction): void => {
  if (req.body.tags && typeof req.body.tags === 'string') {
    try {
      req.body.tags = JSON.parse(req.body.tags);
    } catch (error) {
      // Leave as string for validation to handle
    }
  }
  
  if (req.body.estimatedHours && typeof req.body.estimatedHours === 'string') {
    const parsed = parseFloat(req.body.estimatedHours);
    if (!isNaN(parsed)) {
      req.body.estimatedHours = parsed;
    }
  }
  
  next();
};

/**
 * Validation middleware for ticket creation
 */
export const validateTicketCreation = [
  // Title validation
  body('title')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters')
    .trim()
    .escape(),

  // Description validation
  body('description')
    .isLength({ min: 10, max: 5000 })
    .withMessage('Description must be between 10 and 5000 characters')
    .trim(),

  // Priority validation
  body('priority')
    .isIn(Object.values(TicketPriority))
    .withMessage(`Priority must be one of: ${Object.values(TicketPriority).join(', ')}`),

  // Category validation
  body('category')
    .isIn(Object.values(TicketCategory))
    .withMessage(`Category must be one of: ${Object.values(TicketCategory).join(', ')}`),

  // Tags validation (optional)
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Tags must be an array with maximum 10 items')
    .custom((tags: string[]) => {
      if (tags && tags.some(tag => typeof tag !== 'string' || tag.length > 50)) {
        throw new Error('Each tag must be a string with maximum 50 characters');
      }
      return true;
    }),

  // Estimated hours validation (optional)
  body('estimatedHours')
    .optional()
    .isFloat({ min: 0.5, max: 1000 })
    .withMessage('Estimated hours must be between 0.5 and 1000'),

  // Due date validation (optional)
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid ISO 8601 date')
    .custom((dueDate: string) => {
      const date = new Date(dueDate);
      const now = new Date();
      if (date <= now) {
        throw new Error('Due date must be in the future');
      }
      return true;
    }),

  // Handle validation errors
  (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(error => ({
          field: error.type === 'field' ? error.path : 'unknown',
          message: error.msg
        }))
      });
      return;
    }
    next();
  }
];

/**
 * Validation middleware for ticket updates
 */
export const validateTicketUpdate = [
  // Title validation (optional)
  body('title')
    .optional()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters')
    .trim()
    .escape(),

  // Description validation (optional)
  body('description')
    .optional()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Description must be between 10 and 5000 characters')
    .trim(),

  // Status validation (optional)
  body('status')
    .optional()
    .isIn(Object.values(TicketStatus))
    .withMessage(`Status must be one of: ${Object.values(TicketStatus).join(', ')}`),

  // Priority validation (optional)
  body('priority')
    .optional()
    .isIn(Object.values(TicketPriority))
    .withMessage(`Priority must be one of: ${Object.values(TicketPriority).join(', ')}`),

  // Category validation (optional)
  body('category')
    .optional()
    .isIn(Object.values(TicketCategory))
    .withMessage(`Category must be one of: ${Object.values(TicketCategory).join(', ')}`),

  // Assigned to validation (optional)
  body('assignedTo')
    .optional()
    .custom((value) => {
      if (value !== null && (typeof value !== 'string' || value.length < 1)) {
        throw new Error('Assigned to must be a valid user ID or null');
      }
      return true;
    }),

  // Tags validation (optional)
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Tags must be an array with maximum 10 items')
    .custom((tags: string[]) => {
      if (tags && tags.some(tag => typeof tag !== 'string' || tag.length > 50)) {
        throw new Error('Each tag must be a string with maximum 50 characters');
      }
      return true;
    }),

  // Estimated hours validation (optional)
  body('estimatedHours')
    .optional()
    .isFloat({ min: 0.5, max: 1000 })
    .withMessage('Estimated hours must be between 0.5 and 1000'),

  // Actual hours validation (optional)
  body('actualHours')
    .optional()
    .isFloat({ min: 0, max: 1000 })
    .withMessage('Actual hours must be between 0 and 1000'),

  // Resolution validation (optional)
  body('resolution')
    .optional()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Resolution must be between 10 and 2000 characters')
    .trim(),

  // Due date validation (optional)
  body('dueDate')
    .optional()
    .custom((value) => {
      if (value === null) return true; // Allow null to remove due date
      
      if (typeof value !== 'string') {
        throw new Error('Due date must be a valid ISO 8601 date string or null');
      }
      
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error('Due date must be a valid ISO 8601 date');
      }
      
      return true;
    }),

  // Business logic validation
  body()
    .custom((body) => {
      // If status is being changed to resolved/closed, resolution should be provided
      if ((body.status === TicketStatus.RESOLVED || body.status === TicketStatus.CLOSED) 
          && !body.resolution) {
        throw new Error('Resolution is required when marking ticket as resolved or closed');
      }
      
      // If actual hours are provided, status should be resolved or closed
      if (body.actualHours && body.status && 
          body.status !== TicketStatus.RESOLVED && body.status !== TicketStatus.CLOSED) {
        throw new Error('Actual hours can only be set when ticket is resolved or closed');
      }
      
      return true;
    }),

  // Handle validation errors
  (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(error => ({
          field: error.type === 'field' ? error.path : 'unknown',
          message: error.msg
        }))
      });
      return;
    }
    next();
  }
];

/**
 * Validation middleware for ticket message creation
 */
export const validateTicketMessage = [
  // Message validation
  body('message')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Message must be between 1 and 2000 characters')
    .trim(),

  // Type validation (optional)
  body('type')
    .optional()
    .isIn(['user_message', 'system_message', 'status_change'])
    .withMessage('Type must be one of: user_message, system_message, status_change'),

  // Handle validation errors
  (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(error => ({
          field: error.type === 'field' ? error.path : 'unknown',
          message: error.msg
        }))
      });
      return;
    }
    next();
  }
];

/**
 * Validate MongoDB ObjectId format
 */
export const validateObjectId = (field: string) => {
  return body(field)
    .matches(/^[0-9a-fA-F]{24}$/)
    .withMessage(`${field} must be a valid ObjectId`);
};

/**
 * Validate Firestore document ID format (more flexible than ObjectId)
 */
export const validateFirestoreId = (field: string) => {
  return body(field)
    .isLength({ min: 1, max: 1500 })
    .withMessage(`${field} must be a valid document ID`)
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage(`${field} can only contain alphanumeric characters, underscores, and hyphens`);
};