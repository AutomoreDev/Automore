// backend/src/middleware/project/projectMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import { getFirestore } from 'firebase-admin/firestore';
import { AuthUser } from '../../../../shared/types/auth';
import { ProjectDocument } from '../../types/project/projectTypes';

const db = getFirestore();

/**
 * Middleware to validate project access based on user permissions and action type
 */
export const validateProjectAccess = (action: 'read' | 'write' | 'delete') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user as AuthUser;
      const projectId = req.params.id;

      if (!projectId) {
        res.status(400).json({
          success: false,
          message: 'Project ID is required'
        });
        return;
      }

      // Get project document
      const projectDoc = await db.collection('projects').doc(projectId).get();
      
      if (!projectDoc.exists) {
        res.status(404).json({
          success: false,
          message: 'Project not found'
        });
        return;
      }

      const project = projectDoc.data() as ProjectDocument;

      // Check access based on action type
      const hasAccess = await checkProjectAccess(project, user, action);
      
      if (!hasAccess) {
        res.status(403).json({
          success: false,
          message: 'Access denied: Insufficient permissions for this project'
        });
        return;
      }

      // Add project data to request for use in controllers
      req.project = project;
      next();

    } catch (error: any) {
      console.error('Error in validateProjectAccess:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to validate project access'
      });
    }
  };
};

/**
 * Check if user has access to project based on action type
 */
async function checkProjectAccess(
  project: ProjectDocument, 
  user: AuthUser, 
  action: 'read' | 'write' | 'delete'
): Promise<boolean> {
  
  // Business admins have full access to all projects in their company
  if (user.role === 'BUSINESS_ADMIN' && project.companyId === user.companyId) {
    return true;
  }

  // Business team members have read/write access to projects in their company
  if (user.role === 'BUSINESS_USER' && project.companyId === user.companyId) {
    return action !== 'delete'; // Cannot delete unless admin
  }

  // Client users can only access their own company's projects
  if (['CLIENT_ADMIN', 'CLIENT_USER'].includes(user.role)) {
    if (project.clientId !== user.companyId) {
      return false;
    }
    
    // Client admins have read/write access, client users have read-only
    if (user.role === 'CLIENT_ADMIN') {
      return action !== 'delete'; // Cannot delete
    } else {
      return action === 'read'; // Read-only for client users
    }
  }

  // Partner users - check partnership relationships
  if (['PARTNER_ADMIN', 'PARTNER_USER'].includes(user.role)) {
    if (!user.companyId) return false;
    const hasPartnerAccess = await checkPartnerProjectAccess(project.clientId, user.companyId);
    if (!hasPartnerAccess) {
      return false;
    }
    
    // Partner admins have read/write access, partner users have read-only
    if (user.role === 'PARTNER_ADMIN') {
      return action !== 'delete'; // Cannot delete
    } else {
      return action === 'read'; // Read-only for partner users
    }
  }

  // Check if user is a team member on the project
  if (await isProjectTeamMember(project.id!, user.uid)) {
    return action !== 'delete'; // Team members can read/write but not delete
  }

  // Check if user is the project manager
  if (project.projectManager === user.uid) {
    return action !== 'delete'; // Project managers can read/write but not delete
  }

  return false;
}

/**
 * Check if user is a team member on the project
 */
async function isProjectTeamMember(projectId: string, userId: string): Promise<boolean> {
  try {
    const teamMemberQuery = db.collection('project_team_members')
      .where('projectId', '==', projectId)
      .where('userId', '==', userId)
      .limit(1);

    const snapshot = await teamMemberQuery.get();
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking team membership:', error);
    return false;
  }
}

/**
 * Check if partner has access to client projects
 */
async function checkPartnerProjectAccess(clientId: string, partnerCompanyId: string): Promise<boolean> {
  try {
    // Check if partner has relationship with this client
    const relationshipQuery = db.collection('partner_client_relationships')
      .where('partnerCompanyId', '==', partnerCompanyId)
      .where('clientCompanyId', '==', clientId)
      .where('status', '==', 'active')
      .limit(1);

    const snapshot = await relationshipQuery.get();
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking partner-client relationship:', error);
    return false;
  }
}

/**
 * Middleware to validate project ownership for sensitive operations
 */
export const validateProjectOwnership = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user as AuthUser;
    const projectId = req.params.id;

    // Only business admins can perform ownership-level operations
    if (user.role !== 'BUSINESS_ADMIN') {
      res.status(403).json({
        success: false,
        message: 'Access denied: Business admin privileges required'
      });
      return;
    }

    const projectDoc = await db.collection('projects').doc(projectId).get();
    
    if (!projectDoc.exists) {
      res.status(404).json({
        success: false,
        message: 'Project not found'
      });
      return;
    }

    const project = projectDoc.data() as ProjectDocument;

    // Check if user's company owns the project
    if (project.companyId !== user.companyId) {
      res.status(403).json({
        success: false,
        message: 'Access denied: Cannot modify projects from other companies'
      });
      return;
    }

    req.project = project;
    next();

  } catch (error: any) {
    console.error('Error in validateProjectOwnership:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate project ownership'
    });
  }
};

/**
 * Middleware to validate client relationship for project creation
 */
export const validateClientRelationship = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user as AuthUser;
    const { clientId } = req.body;

    if (!clientId) {
      res.status(400).json({
        success: false,
        message: 'Client ID is required'
      });
      return;
    }

    // Get client company document
    const clientDoc = await db.collection('companies').doc(clientId).get();
    
    if (!clientDoc.exists) {
      res.status(404).json({
        success: false,
        message: 'Client company not found'
      });
      return;
    }

    const client = clientDoc.data()!;

    // Validate that the client is actually a client type company
    if (client.companyType !== 'CLIENT') {
      res.status(400).json({
        success: false,
        message: 'Selected company is not a valid client'
      });
      return;
    }

    // For business users, they can create projects for any client
    // For partner users, check partnership relationships
    if (user.role === 'PARTNER_ADMIN' || user.role === 'PARTNER_USER') {
      // Check if partner has relationship with this client
      if (!user.companyId) {
        res.status(403).json({
          success: false,
          message: 'Access denied: No company associated with user'
        });
        return;
      }
      const hasRelationship = await checkPartnerProjectAccess(clientId, user.companyId);
      if (!hasRelationship) {
        res.status(403).json({
          success: false,
          message: 'Access denied: No relationship with this client'
        });
        return;
      }
    }

    next();

  } catch (error: any) {
    console.error('Error in validateClientRelationship:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate client relationship'
    });
  }
};

/**
 * Middleware to validate team member assignment permissions
 */
export const validateTeamAssignmentPermissions = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user as AuthUser;
    const { userId, role } = req.body;
    const project = req.project as ProjectDocument;

    if (!userId || !role) {
      res.status(400).json({
        success: false,
        message: 'User ID and role are required'
      });
      return;
    }

    // Check if the user being assigned exists and belongs to the same company
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const assignedUser = userDoc.data()!;

    // Business users can only assign users from their own company
    if (['BUSINESS_ADMIN', 'BUSINESS_USER'].includes(user.role)) {
      if (assignedUser.companyId !== user.companyId) {
        res.status(403).json({
          success: false,
          message: 'Cannot assign users from other companies'
        });
        return;
      }
    }

    // Project managers can assign team members but not other project managers
    if (user.uid === project.projectManager && role === 'PROJECT_MANAGER') {
      res.status(403).json({
        success: false,
        message: 'Project managers cannot assign other project managers'
      });
      return;
    }

    // Check if user is already assigned to the project
    const existingAssignment = await db.collection('project_team_members')
      .where('projectId', '==', project.id!)
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (!existingAssignment.empty) {
      res.status(409).json({
        success: false,
        message: 'User is already assigned to this project'
      });
      return;
    }

    next();

  } catch (error: any) {
    console.error('Error in validateTeamAssignmentPermissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate team assignment permissions'
    });
  }
};

/**
 * Middleware to check project status for certain operations
 */
export const validateProjectStatus = (allowedStatuses: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const project = req.project as ProjectDocument;

      if (!allowedStatuses.includes(project.status)) {
        res.status(409).json({
          success: false,
          message: `Operation not allowed for projects with status: ${project.status}`
        });
        return;
      }

      next();
    } catch (error: any) {
      console.error('Error in validateProjectStatus:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to validate project status'
      });
    }
  };
};

/**
 * Middleware to validate project phase transitions
 */
export const validatePhaseTransition = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const { phase } = req.body;
    const project = req.project as ProjectDocument;

    if (!phase) {
      next();
      return;
    }

    // Define allowed phase transitions based on your business rules
    const allowedTransitions: Record<string, string[]> = {
      'discovery': ['planning'],
      'planning': ['design', 'development'],
      'design': ['development'],
      'development': ['testing'],
      'testing': ['deployment'],
      'deployment': ['maintenance'],
      'maintenance': []
    };

    const currentPhase = project.phase;
    const allowedNextPhases = allowedTransitions[currentPhase] || [];

    if (!allowedNextPhases.includes(phase)) {
      res.status(409).json({
        success: false,
        message: `Cannot transition from ${currentPhase} to ${phase}. Allowed transitions: ${allowedNextPhases.join(', ')}`
      });
      return;
    }

    next();

  } catch (error: any) {
    console.error('Error in validatePhaseTransition:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate phase transition'
    });
  }
};

/**
 * Middleware to check if project has required milestones for completion
 */
export const validateProjectCompletion = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const { status } = req.body;
    const project = req.project as ProjectDocument;

    if (status !== 'completed') {
      next();
      return;
    }

    // Check if all milestones are completed
    const milestonesQuery = db.collection('project_milestones')
      .where('projectId', '==', project.id!)
      .where('status', '!=', 'completed');

    const incompleteMilestones = await milestonesQuery.get();

    if (!incompleteMilestones.empty) {
      res.status(409).json({
        success: false,
        message: `Cannot complete project: ${incompleteMilestones.size} milestone(s) are not completed`
      });
      return;
    }

    // Check if all tasks are completed
    const tasksQuery = db.collection('project_tasks')
      .where('projectId', '==', project.id!)
      .where('status', '!=', 'completed');

    const incompleteTasks = await tasksQuery.get();

    if (!incompleteTasks.empty) {
      res.status(409).json({
        success: false,
        message: `Cannot complete project: ${incompleteTasks.size} task(s) are not completed`
      });
      return;
    }

    next();

  } catch (error: any) {
    console.error('Error in validateProjectCompletion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate project completion'
    });
  }
};

/**
 * Middleware to validate project budget changes
 */
export const validateBudgetChange = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const { budget } = req.body;
    const project = req.project as ProjectDocument;
    const user = req.user as AuthUser;

    if (budget === undefined) {
      next();
      return;
    }

    const currentBudget = project.budget / 100; // Convert from cents to Rand
    const newBudget = budget;
    const budgetIncrease = newBudget - currentBudget;
    const percentageIncrease = (budgetIncrease / currentBudget) * 100;

    // If budget increase is more than 25%, require business admin approval
    if (percentageIncrease > 25 && user.role !== 'BUSINESS_ADMIN') {
      res.status(403).json({
        success: false,
        message: 'Budget increases over 25% require business admin approval'
      });
      return;
    }

    // If budget increase is more than 50%, require additional validation
    if (percentageIncrease > 50) {
      // Check if there's a budget change approval in the system
      const approvalQuery = db.collection('budget_approvals')
        .where('projectId', '==', project.id!)
        .where('requestedBudget', '==', newBudget * 100) // Store in cents
        .where('status', '==', 'approved')
        .limit(1);

      const approvalSnapshot = await approvalQuery.get();

      if (approvalSnapshot.empty) {
        res.status(403).json({
          success: false,
          message: 'Budget increases over 50% require pre-approval'
        });
        return;
      }
    }

    next();

  } catch (error: any) {
    console.error('Error in validateBudgetChange:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate budget change'
    });
  }
};

// Extend Express Request interface to include project data
declare global {
  namespace Express {
    interface Request {
      project?: ProjectDocument;
    }
  }
}