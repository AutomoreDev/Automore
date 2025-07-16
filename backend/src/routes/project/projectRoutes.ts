// backend/src/routes/project/projectRoutes.ts

import { Router } from 'express';
import { ProjectController } from '../../controllers/project/projectController';
// Import your existing middleware (corrected imports)
import { firebaseAuthMiddleware } from '../../middleware/auth/authMiddleware';
import { requirePermission, requireAnyPermission } from '../../middleware/auth/permissionMiddleware';
import { requireRole } from '../../middleware/auth/roleMiddleware';
import { rateLimitMiddleware } from '../../middleware/security/rateLimitMiddleware';
// Import project-specific middleware
import { validateProjectAccess } from '../../middleware/project/projectMiddleware';
import { 
  validateCreateProject, 
  validateUpdateProject,
  validateProjectQuery,
  validateTeamAssignment,
  sanitizeProjectData
} from '../../middleware/validation/projectValidationMiddleware';

const router = Router();
const projectController = new ProjectController();

// Apply authentication to all routes
router.use(firebaseAuthMiddleware);

// ==================== PROJECT CRUD ROUTES ====================

/**
 * @route   POST /api/v1/projects
 * @desc    Create a new project
 * @access  Business Admin, Business Team
 */
router.post(
  '/',
  rateLimitMiddleware(10, 1), // 10 requests per 1 minute using your rate limiter signature
  requireAnyPermission(['BUSINESS_ADMIN', 'BUSINESS_USER']),
  sanitizeProjectData,
  validateCreateProject,
  projectController.createProject
);

/**
 * @route   GET /api/v1/projects
 * @desc    Get projects with filtering and pagination
 * @access  All authenticated users (filtered by company)
 */
router.get(
  '/',
  rateLimitMiddleware(100, 1), // 100 requests per minute
  validateProjectQuery,
  projectController.getProjects
);

/**
 * @route   GET /api/v1/projects/dashboard
 * @desc    Get project dashboard data
 * @access  All authenticated users (filtered by permissions)
 */
router.get(
  '/dashboard',
  rateLimitMiddleware(30, 1), // 30 requests per minute
  projectController.getProjectDashboard
);

/**
 * @route   GET /api/v1/projects/statistics
 * @desc    Get project statistics
 * @access  Business Admin, Business Team
 */
router.get(
  '/statistics',
  rateLimitMiddleware(20, 1), // 20 requests per minute
  requireAnyPermission(['BUSINESS_ADMIN', 'BUSINESS_USER']),
  projectController.getProjectStatistics
);

/**
 * @route   GET /api/v1/projects/:id
 * @desc    Get a specific project by ID
 * @access  Project participants, Business users, Client users (own projects)
 */
router.get(
  '/:id',
  rateLimitMiddleware(60, 1), // 60 requests per minute
  validateProjectAccess('read'),
  projectController.getProjectById
);

/**
 * @route   PUT /api/v1/projects/:id
 * @desc    Update a project
 * @access  Business Admin, Business Team, Project Manager
 */
router.put(
  '/:id',
  rateLimitMiddleware(20, 1), // 20 requests per minute
  validateProjectAccess('write'),
  sanitizeProjectData,
  validateUpdateProject,
  projectController.updateProject
);

/**
 * @route   DELETE /api/v1/projects/:id
 * @desc    Delete a project (soft delete)
 * @access  Business Admin only
 */
router.delete(
  '/:id',
  rateLimitMiddleware(5, 1), // 5 requests per minute
  requirePermission('BUSINESS_ADMIN'),
  validateProjectAccess('delete'),
  projectController.deleteProject
);

// ==================== TEAM MANAGEMENT ROUTES ====================

/**
 * @route   POST /api/v1/projects/:id/team-members
 * @desc    Assign a team member to project
 * @access  Business Admin, Business Team, Project Manager
 */
router.post(
  '/:id/team-members',
  rateLimitMiddleware(30, 1), // 30 requests per minute
  validateProjectAccess('write'),
  validateTeamAssignment,
  projectController.assignTeamMember
);

/**
 * @route   GET /api/v1/projects/:id/team-members
 * @desc    Get project team members
 * @access  Project participants, Business users
 */
router.get(
  '/:id/team-members',
  rateLimitMiddleware(60, 1),
  validateProjectAccess('read'),
  // This would call a getTeamMembers method on the controller
  (req, res) => {
    res.status(501).json({
      success: false,
      message: 'Team members endpoint - to be implemented in next sprint'
    });
  }
);

/**
 * @route   PUT /api/v1/projects/:id/team-members/:memberId
 * @desc    Update team member role or status
 * @access  Business Admin, Project Manager
 */
router.put(
  '/:id/team-members/:memberId',
  rateLimitMiddleware(20, 1),
  validateProjectAccess('write'),
  requireAnyPermission(['BUSINESS_ADMIN', 'BUSINESS_USER']),
  // This would call an updateTeamMember method on the controller
  (req, res) => {
    res.status(501).json({
      success: false,
      message: 'Update team member endpoint - to be implemented in next sprint'
    });
  }
);

/**
 * @route   DELETE /api/v1/projects/:id/team-members/:memberId
 * @desc    Remove team member from project
 * @access  Business Admin, Project Manager
 */
router.delete(
  '/:id/team-members/:memberId',
  rateLimitMiddleware(10, 1),
  validateProjectAccess('write'),
  requireAnyPermission(['BUSINESS_ADMIN', 'BUSINESS_USER']),
  // This would call a removeTeamMember method on the controller
  (req, res) => {
    res.status(501).json({
      success: false,
      message: 'Remove team member endpoint - to be implemented in next sprint'
    });
  }
);

// ==================== MILESTONE ROUTES ====================

/**
 * @route   POST /api/v1/projects/:id/milestones
 * @desc    Create a milestone for project
 * @access  Business Admin, Business Team, Project Manager
 */
router.post(
  '/:id/milestones',
  rateLimitMiddleware(20, 1),
  validateProjectAccess('write'),
  // This would call a createMilestone method on the controller
  (req, res) => {
    res.status(501).json({
      success: false,
      message: 'Create milestone endpoint - to be implemented in next sprint'
    });
  }
);

/**
 * @route   GET /api/v1/projects/:id/milestones
 * @desc    Get project milestones
 * @access  Project participants, Business users
 */
router.get(
  '/:id/milestones',
  rateLimitMiddleware(60, 1),
  validateProjectAccess('read'),
  // This would call a getMilestones method on the controller
  (req, res) => {
    res.status(501).json({
      success: false,
      message: 'Get milestones endpoint - to be implemented in next sprint'
    });
  }
);

// ==================== TASK ROUTES ====================

/**
 * @route   POST /api/v1/projects/:id/tasks
 * @desc    Create a task for project
 * @access  Business Admin, Business Team, Project Manager
 */
router.post(
  '/:id/tasks',
  rateLimitMiddleware(30, 1),
  validateProjectAccess('write'),
  // This would call a createTask method on the controller
  (req, res) => {
    res.status(501).json({
      success: false,
      message: 'Create task endpoint - to be implemented in next sprint'
    });
  }
);

/**
 * @route   GET /api/v1/projects/:id/tasks
 * @desc    Get project tasks
 * @access  Project participants, Business users
 */
router.get(
  '/:id/tasks',
  rateLimitMiddleware(60, 1),
  validateProjectAccess('read'),
  // This would call a getTasks method on the controller
  (req, res) => {
    res.status(501).json({
      success: false,
      message: 'Get tasks endpoint - to be implemented in next sprint'
    });
  }
);

// ==================== TIME TRACKING ROUTES ====================

/**
 * @route   POST /api/v1/projects/:id/time-entries
 * @desc    Log time entry for project
 * @access  Project team members
 */
router.post(
  '/:id/time-entries',
  rateLimitMiddleware(50, 1),
  validateProjectAccess('write'),
  // This would call a logTimeEntry method on the controller
  (req, res) => {
    res.status(501).json({
      success: false,
      message: 'Log time entry endpoint - to be implemented in next sprint'
    });
  }
);

/**
 * @route   GET /api/v1/projects/:id/time-entries
 * @desc    Get project time entries
 * @access  Business users, Project Manager
 */
router.get(
  '/:id/time-entries',
  rateLimitMiddleware(60, 1),
  validateProjectAccess('read'),
  requireAnyPermission(['BUSINESS_ADMIN', 'BUSINESS_USER']),
  // This would call a getTimeEntries method on the controller
  (req, res) => {
    res.status(501).json({
      success: false,
      message: 'Get time entries endpoint - to be implemented in next sprint'
    });
  }
);

// ==================== DOCUMENT ROUTES ====================

/**
 * @route   POST /api/v1/projects/:id/documents
 * @desc    Upload document for project
 * @access  Project participants
 */
router.post(
  '/:id/documents',
  rateLimitMiddleware(10, 1),
  validateProjectAccess('write'),
  // This would call an uploadDocument method on the controller
  (req, res) => {
    res.status(501).json({
      success: false,
      message: 'Upload document endpoint - to be implemented in next sprint'
    });
  }
);

/**
 * @route   GET /api/v1/projects/:id/documents
 * @desc    Get project documents
 * @access  Project participants, Business users
 */
router.get(
  '/:id/documents',
  rateLimitMiddleware(60, 1),
  validateProjectAccess('read'),
  // This would call a getDocuments method on the controller
  (req, res) => {
    res.status(501).json({
      success: false,
      message: 'Get documents endpoint - to be implemented in next sprint'
    });
  }
);

// ==================== ANALYTICS & REPORTING ROUTES ====================

/**
 * @route   GET /api/v1/projects/:id/reports/progress
 * @desc    Get project progress report
 * @access  Business users, Project Manager, Client Admin
 */
router.get(
  '/:id/reports/progress',
  rateLimitMiddleware(20, 1),
  validateProjectAccess('read'),
  // This would call a getProgressReport method on the controller
  (req, res) => {
    res.status(501).json({
      success: false,
      message: 'Progress report endpoint - to be implemented in next sprint'
    });
  }
);

/**
 * @route   GET /api/v1/projects/:id/reports/financial
 * @desc    Get project financial report
 * @access  Business Admin, Project Manager
 */
router.get(
  '/:id/reports/financial',
  rateLimitMiddleware(10, 1),
  requireAnyPermission(['BUSINESS_ADMIN', 'BUSINESS_USER']),
  validateProjectAccess('read'),
  // This would call a getFinancialReport method on the controller
  (req, res) => {
    res.status(501).json({
      success: false,
      message: 'Financial report endpoint - to be implemented in next sprint'
    });
  }
);

// ==================== STATUS & PHASE MANAGEMENT ROUTES ====================

/**
 * @route   PATCH /api/v1/projects/:id/status
 * @desc    Update project status
 * @access  Business Admin, Business Team, Project Manager
 */
router.patch(
  '/:id/status',
  rateLimitMiddleware(20, 1),
  validateProjectAccess('write'),
  // This would call an updateProjectStatus method on the controller
  (req, res) => {
    res.status(501).json({
      success: false,
      message: 'Update status endpoint - to be implemented in next sprint'
    });
  }
);

/**
 * @route   PATCH /api/v1/projects/:id/phase
 * @desc    Update project phase
 * @access  Business Admin, Business Team, Project Manager
 */
router.patch(
  '/:id/phase',
  rateLimitMiddleware(20, 1),
  validateProjectAccess('write'),
  // This would call an updateProjectPhase method on the controller
  (req, res) => {
    res.status(501).json({
      success: false,
      message: 'Update phase endpoint - to be implemented in next sprint'
    });
  }
);

// ==================== COMMUNICATION ROUTES ====================

/**
 * @route   POST /api/v1/projects/:id/communications
 * @desc    Log communication for project
 * @access  Project participants
 */
router.post(
  '/:id/communications',
  rateLimitMiddleware(30, 1),
  validateProjectAccess('write'),
  // This would call a logCommunication method on the controller
  (req, res) => {
    res.status(501).json({
      success: false,
      message: 'Log communication endpoint - to be implemented in next sprint'
    });
  }
);

/**
 * @route   GET /api/v1/projects/:id/communications
 * @desc    Get project communications
 * @access  Project participants, Business users
 */
router.get(
  '/:id/communications',
  rateLimitMiddleware(60, 1),
  validateProjectAccess('read'),
  // This would call a getCommunications method on the controller
  (req, res) => {
    res.status(501).json({
      success: false,
      message: 'Get communications endpoint - to be implemented in next sprint'
    });
  }
);

export default router;