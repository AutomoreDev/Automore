// backend/src/routes/ticket/ticketRoutes.ts

import { Router } from 'express';
import multer from 'multer';
import { TicketController } from '../../controllers/ticket/ticketController';
import { jwtAuthMiddleware } from '../../middleware/auth/authMiddleware';
import { validateTicketCreation, validateTicketUpdate, validateTicketMessage, parseFormDataFields } from '../../middleware/validation/ticketValidation';
import { 
  ticketCreationRateLimit,
  ticketUpdateRateLimit,
  ticketQueryRateLimit
} from '../../middleware/security/rateLimitMiddleware';

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/tickets/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt|zip|rar/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only allowed file types are accepted'));
    }
  }
});

const router = Router();
const ticketController = new TicketController();

// ==================== TICKET CRUD ROUTES ====================

/**
 * @route   GET /api/v1/tickets/statistics
 * @desc    Get ticket statistics for dashboard
 * @access  Private (Authenticated users)
 */
router.get('/statistics', jwtAuthMiddleware, ticketQueryRateLimit, ticketController.getTicketStatistics);

/**
 * @route   GET /api/v1/tickets/available-agents
 * @desc    Get available support agents for ticket assignment
 * @access  Private (Admins only)
 */
router.get('/available-agents', jwtAuthMiddleware, ticketQueryRateLimit, ticketController.getAvailableAgents);

/**
 * @route   GET /api/v1/tickets/my-tickets
 * @desc    Get tickets assigned to current user
 * @access  Private (Authenticated users)
 */
router.get('/my-tickets', jwtAuthMiddleware, ticketQueryRateLimit, ticketController.getMyTickets);

/**
 * @route   GET /api/v1/tickets/my-created-tickets
 * @desc    Get tickets created by current user
 * @access  Private (Authenticated users)
 */
router.get('/my-created-tickets', jwtAuthMiddleware, ticketQueryRateLimit, ticketController.getMyCreatedTickets);

/**
 * @route   GET /api/v1/tickets
 * @desc    Get all tickets with filtering and pagination
 * @access  Private (Authenticated users)
 * @query   status, priority, category, assignedTo, createdBy, companyId, tags, search, sortBy, sortOrder, limit, offset
 */
router.get('/', jwtAuthMiddleware, ticketQueryRateLimit, ticketController.getTickets);

/**
 * @route   POST /api/v1/tickets
 * @desc    Create a new ticket
 * @access  Private (Authenticated users)
 * @body    { title, description, priority, category, tags?, estimatedHours?, dueDate? }
 */
router.post(
  '/', 
  jwtAuthMiddleware, 
  ticketCreationRateLimit,
  upload.array('attachments', 5), // Handle file uploads
  parseFormDataFields,
  validateTicketCreation, 
  ticketController.createTicket
);

/**
 * @route   GET /api/v1/tickets/:id
 * @desc    Get a specific ticket by ID
 * @access  Private (Authenticated users with access to ticket)
 */
router.get('/:id', jwtAuthMiddleware, ticketQueryRateLimit, ticketController.getTicketById);

/**
 * @route   GET /api/v1/tickets/:id/messages
 * @desc    Get all messages for a ticket
 * @access  Private (Authenticated users with access to ticket)
 */
router.get('/:id/messages', jwtAuthMiddleware, ticketQueryRateLimit, ticketController.getTicketMessages);

/**
 * @route   POST /api/v1/tickets/:id/messages
 * @desc    Create a new message for a ticket
 * @access  Private (Authenticated users with access to ticket)
 */
router.post('/:id/messages', jwtAuthMiddleware, ticketCreationRateLimit, upload.array('attachments', 5), validateTicketMessage, ticketController.createTicketMessage);

/**
 * @route   PUT /api/v1/tickets/:id
 * @desc    Update a ticket
 * @access  Private (Authenticated users with modify access)
 * @body    { title?, description?, status?, priority?, category?, assignedTo?, tags?, estimatedHours?, actualHours?, resolution?, dueDate? }
 */
router.put(
  '/:id', 
  jwtAuthMiddleware, 
  ticketUpdateRateLimit,
  validateTicketUpdate, 
  ticketController.updateTicket
);

/**
 * @route   PUT /api/v1/tickets/:id/assign
 * @desc    Assign or unassign a ticket to a user
 * @access  Private (Admins only)
 * @body    { assignedTo: string | null }
 */
router.put('/:id/assign', jwtAuthMiddleware, ticketUpdateRateLimit, ticketController.assignTicket);

/**
 * @route   DELETE /api/v1/tickets/:id
 * @desc    Delete a ticket (soft delete)
 * @access  Private (Admin users only)
 */
router.delete('/:id', jwtAuthMiddleware, ticketUpdateRateLimit, ticketController.deleteTicket);

export default router;