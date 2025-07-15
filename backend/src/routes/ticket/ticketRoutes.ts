// backend/src/routes/ticket/ticketRoutes.ts

import { Router } from 'express';
import { TicketController } from '../../controllers/ticket/ticketController';
import { firebaseAuthMiddleware } from '../../middleware/auth/authMiddleware';
import { validateTicketCreation, validateTicketUpdate } from '../../middleware/validation/ticketValidation';
import { 
  ticketCreationRateLimit,
  ticketUpdateRateLimit,
  ticketQueryRateLimit
} from '../../middleware/security/rateLimitMiddleware';

const router = Router();
const ticketController = new TicketController();

// ==================== TICKET CRUD ROUTES ====================

/**
 * @route   GET /api/v1/tickets/statistics
 * @desc    Get ticket statistics for dashboard
 * @access  Private (Authenticated users)
 */
router.get('/statistics', firebaseAuthMiddleware, ticketQueryRateLimit, ticketController.getTicketStatistics);

/**
 * @route   GET /api/v1/tickets/my-tickets
 * @desc    Get tickets assigned to current user
 * @access  Private (Authenticated users)
 */
router.get('/my-tickets', firebaseAuthMiddleware, ticketQueryRateLimit, ticketController.getMyTickets);

/**
 * @route   GET /api/v1/tickets/my-created-tickets
 * @desc    Get tickets created by current user
 * @access  Private (Authenticated users)
 */
router.get('/my-created-tickets', firebaseAuthMiddleware, ticketQueryRateLimit, ticketController.getMyCreatedTickets);

/**
 * @route   GET /api/v1/tickets
 * @desc    Get all tickets with filtering and pagination
 * @access  Private (Authenticated users)
 * @query   status, priority, category, assignedTo, createdBy, companyId, tags, search, sortBy, sortOrder, limit, offset
 */
router.get('/', firebaseAuthMiddleware, ticketQueryRateLimit, ticketController.getTickets);

/**
 * @route   POST /api/v1/tickets
 * @desc    Create a new ticket
 * @access  Private (Authenticated users)
 * @body    { title, description, priority, category, tags?, estimatedHours?, dueDate? }
 */
router.post(
  '/', 
  firebaseAuthMiddleware, 
  ticketCreationRateLimit,
  validateTicketCreation, 
  ticketController.createTicket
);

/**
 * @route   GET /api/v1/tickets/:id
 * @desc    Get a specific ticket by ID
 * @access  Private (Authenticated users with access to ticket)
 */
router.get('/:id', firebaseAuthMiddleware, ticketQueryRateLimit, ticketController.getTicketById);

/**
 * @route   PUT /api/v1/tickets/:id
 * @desc    Update a ticket
 * @access  Private (Authenticated users with modify access)
 * @body    { title?, description?, status?, priority?, category?, assignedTo?, tags?, estimatedHours?, actualHours?, resolution?, dueDate? }
 */
router.put(
  '/:id', 
  firebaseAuthMiddleware, 
  ticketUpdateRateLimit,
  validateTicketUpdate, 
  ticketController.updateTicket
);

/**
 * @route   DELETE /api/v1/tickets/:id
 * @desc    Delete a ticket (soft delete)
 * @access  Private (Admin users only)
 */
router.delete('/:id', firebaseAuthMiddleware, ticketUpdateRateLimit, ticketController.deleteTicket);

export default router;