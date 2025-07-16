// backend/src/controllers/project/projectController.ts

import { Request, Response } from 'express';
import { ProjectService } from '../../services/project/projectService';
import { 
  CreateProjectDTO, 
  UpdateProjectDTO, 
  ProjectQueryParams
} from '../../types/project/projectTypes';
import {
  ProjectStatus,
  ProjectPriority,
  ProjectType,
  TeamRole
} from '../../../../frontend/src/shared/enums/project';
import { AuthUser } from '../../../../shared/types/auth';

export class ProjectController {
  private projectService = new ProjectService();

  /**
   * Create a new project
   * POST /api/v1/projects
   */
  createProject = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as AuthUser;
      const projectData: CreateProjectDTO = req.body;

      // Validate required fields
      if (!projectData.name || !projectData.description) {
        res.status(400).json({
          success: false,
          message: 'Title and description are required'
        });
        return;
      }

      // Validate enums
      if (!Object.values(ProjectPriority).includes(projectData.priority)) {
        res.status(400).json({
          success: false,
          message: 'Invalid priority value'
        });
        return;
      }

      if (!Object.values(ProjectType).includes(projectData.type)) {
        res.status(400).json({
          success: false,
          message: 'Invalid type value'
        });
        return;
      }

      const project = await this.projectService.createProject(projectData, user);

      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: project
      });
    } catch (error: any) {
      console.error('Error in createProject:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create project'
      });
    }
  };

  /**
   * Get a specific project by ID
   * GET /api/v1/projects/:id
   */
  getProjectById = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as AuthUser;
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Project ID is required'
        });
        return;
      }

      const project = await this.projectService.getProjectById(id, user);

      res.status(200).json({
        success: true,
        data: project
      });
    } catch (error: any) {
      console.error('Error in getProjectById:', error);
      
      if (error.message === 'Project not found') {
        res.status(404).json({
          success: false,
          message: 'Project not found'
        });
        return;
      }
      
      if (error.message.includes('Access denied')) {
        res.status(403).json({
          success: false,
          message: 'Access denied'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get project'
      });
    }
  };

  // ... rest of the controller methods remain the same
  // (I'm not including all methods to keep this manageable, but the pattern is the same)

  /**
   * Update a project
   * PUT /api/v1/projects/:id
   */
  updateProject = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as AuthUser;
      const { id } = req.params;
      const updateData: UpdateProjectDTO = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Project ID is required'
        });
        return;
      }

      const project = await this.projectService.updateProject(id, updateData, user);

      res.status(200).json({
        success: true,
        message: 'Project updated successfully',
        data: project
      });
    } catch (error: any) {
      console.error('Error in updateProject:', error);
      
      if (error.message === 'Project not found') {
        res.status(404).json({
          success: false,
          message: 'Project not found'
        });
        return;
      }
      
      if (error.message.includes('Access denied')) {
        res.status(403).json({
          success: false,
          message: 'Access denied'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update project'
      });
    }
  };

  /**
   * Get projects with filtering and pagination
   * GET /api/v1/projects
   */
  getProjects = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as AuthUser;
      const queryParams: ProjectQueryParams = this.parseQueryParams(req.query);

      const result = await this.projectService.getProjects(queryParams, user);

      res.status(200).json({
        success: true,
        data: result.projects,
        pagination: {
          currentPage: queryParams.page || 1,
          totalItems: result.totalCount,
          itemsPerPage: queryParams.limit || 20,
          hasNextPage: result.hasNextPage,
          hasPreviousPage: (queryParams.page || 1) > 1
        }
      });
    } catch (error: any) {
      console.error('Error in getProjects:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get projects'
      });
    }
  };

  /**
   * Delete a project (soft delete)
   * DELETE /api/v1/projects/:id
   */
  deleteProject = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as AuthUser;
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Project ID is required'
        });
        return;
      }

      await this.projectService.deleteProject(id, user);

      res.status(200).json({
        success: true,
        message: 'Project deleted successfully'
      });
    } catch (error: any) {
      console.error('Error in deleteProject:', error);
      
      if (error.message === 'Project not found') {
        res.status(404).json({
          success: false,
          message: 'Project not found'
        });
        return;
      }
      
      if (error.message.includes('Access denied')) {
        res.status(403).json({
          success: false,
          message: 'Access denied'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete project'
      });
    }
  };

  /**
   * Assign team member to project
   * POST /api/v1/projects/:id/team-members
   */
  assignTeamMember = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as AuthUser;
      const { id } = req.params;
      const { userId, role } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Project ID is required'
        });
        return;
      }

      if (!userId || !role) {
        res.status(400).json({
          success: false,
          message: 'User ID and role are required'
        });
        return;
      }

      // Validate role
      if (!Object.values(TeamRole).includes(role)) {
        res.status(400).json({
          success: false,
          message: 'Invalid team role'
        });
        return;
      }

      await this.projectService.assignTeamMember(id, userId, role, user);

      res.status(200).json({
        success: true,
        message: 'Team member assigned successfully'
      });
    } catch (error: any) {
      console.error('Error in assignTeamMember:', error);
      
      if (error.message === 'Project not found' || error.message === 'User not found') {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }
      
      if (error.message.includes('Access denied')) {
        res.status(403).json({
          success: false,
          message: 'Access denied'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to assign team member'
      });
    }
  };

  /**
   * Get project dashboard data
   * GET /api/v1/projects/dashboard
   */
  getProjectDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as AuthUser;

      // Get active projects
      const activeProjectsQuery: ProjectQueryParams = {
        status: [ProjectStatus.ACTIVE, ProjectStatus.PLANNING],
        limit: 10,
        sortBy: 'updatedAt',
        sortOrder: 'desc'
      };
      const activeProjects = await this.projectService.getProjects(activeProjectsQuery, user);

      // Get completed projects count
      const completedProjectsQuery: ProjectQueryParams = {
        status: [ProjectStatus.COMPLETED],
        limit: 1
      };
      const completedProjects = await this.projectService.getProjects(completedProjectsQuery, user);

      // Calculate summary statistics
      const dashboardData = {
        totalProjects: activeProjects.totalCount + completedProjects.totalCount,
        activeProjects: activeProjects.totalCount,
        completedProjects: completedProjects.totalCount,
        
        // Recent projects
        recentProjects: activeProjects.projects.slice(0, 5),
        
        // Projects by status
        projectsByStatus: [
          { status: ProjectStatus.PLANNING, count: 0 }, // Would calculate from data
          { status: ProjectStatus.ACTIVE, count: activeProjects.totalCount },
          { status: ProjectStatus.COMPLETED, count: completedProjects.totalCount },
          { status: ProjectStatus.ON_HOLD, count: 0 },
          { status: ProjectStatus.CANCELLED, count: 0 }
        ]
      };

      res.status(200).json({
        success: true,
        data: dashboardData
      });
    } catch (error: any) {
      console.error('Error in getProjectDashboard:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get dashboard data'
      });
    }
  };

  /**
   * Get project statistics
   * GET /api/v1/projects/statistics
   */
  getProjectStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as AuthUser;
      const { startDate, endDate } = req.query;

      // This would typically involve more complex aggregation queries
      const allProjectsQuery: ProjectQueryParams = {
        limit: 1000, // Get all projects for statistics
        startDateFrom: startDate as string,
        startDateTo: endDate as string
      };
      
      const allProjects = await this.projectService.getProjects(allProjectsQuery, user);
      
      // Calculate statistics
      const statistics = {
        totalProjects: allProjects.totalCount,
        totalBudget: allProjects.projects.reduce((sum, p) => sum + p.budget, 0),
        averageBudget: allProjects.projects.length > 0 
          ? allProjects.projects.reduce((sum, p) => sum + p.budget, 0) / allProjects.projects.length 
          : 0,
        totalEstimatedHours: allProjects.projects.reduce((sum, p) => sum + p.estimatedHours, 0),
        totalActualHours: allProjects.projects.reduce((sum, p) => sum + p.actualHours, 0),
        averageCompletion: allProjects.projects.length > 0
          ? allProjects.projects.reduce((sum, p) => sum + p.completionPercentage, 0) / allProjects.projects.length
          : 0,
        
        // Distribution by type
        projectsByType: Object.values(ProjectType).map(type => ({
          type,
          count: allProjects.projects.filter(p => p.type === type).length
        })),
        
        // Distribution by priority
        projectsByPriority: Object.values(ProjectPriority).map(priority => ({
          priority,
          count: allProjects.projects.filter(p => p.priority === priority).length
        }))
      };

      res.status(200).json({
        success: true,
        data: statistics
      });
    } catch (error: any) {
      console.error('Error in getProjectStatistics:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get project statistics'
      });
    }
  };

  // ==================== PRIVATE VALIDATION METHODS ====================
  // (Same validation methods from the original controller)

  /**
   * Parse query parameters for filtering
   */
  private parseQueryParams(query: any): ProjectQueryParams {
    const params: ProjectQueryParams = {};

    // Parse status filter
    if (query.status) {
      const statuses = Array.isArray(query.status) ? query.status : [query.status];
      params.status = statuses.filter((s: string) => Object.values(ProjectStatus).includes(s as ProjectStatus));
    }

    // Parse priority filter
    if (query.priority) {
      const priorities = Array.isArray(query.priority) ? query.priority : [query.priority];
      params.priority = priorities.filter((p: string) => Object.values(ProjectPriority).includes(p as ProjectPriority));
    }

    // Parse type filter
    if (query.type) {
      const types = Array.isArray(query.type) ? query.type : [query.type];
      params.type = types.filter((t: string) => Object.values(ProjectType).includes(t as ProjectType));
    }

    // Parse other filters
    if (query.clientId) params.clientId = query.clientId as string;
    if (query.projectManager) params.projectManager = query.projectManager as string;
    if (query.teamMember) params.teamMember = query.teamMember as string;

    // Parse date filters
    if (query.startDateFrom) params.startDateFrom = query.startDateFrom as string;
    if (query.startDateTo) params.startDateTo = query.startDateTo as string;
    if (query.endDateFrom) params.endDateFrom = query.endDateFrom as string;
    if (query.endDateTo) params.endDateTo = query.endDateTo as string;

    // Parse financial filters
    if (query.budgetMin) params.budgetMin = parseInt(query.budgetMin as string);
    if (query.budgetMax) params.budgetMax = parseInt(query.budgetMax as string);

    // Parse search
    if (query.search) params.search = query.search as string;
    if (query.tags) {
      params.tags = Array.isArray(query.tags) ? query.tags : [query.tags];
    }

    // Parse include flags
    if (query.includeClient === 'true') params.includeClient = true;
    if (query.includeTeam === 'true') params.includeTeam = true;
    if (query.includeMilestones === 'true') params.includeMilestones = true;
    if (query.includeTasks === 'true') params.includeTasks = true;
    if (query.includeDocuments === 'true') params.includeDocuments = true;
    if (query.includeTimeEntries === 'true') params.includeTimeEntries = true;

    // Parse pagination
    if (query.page) params.page = Math.max(1, parseInt(query.page as string));
    if (query.limit) params.limit = Math.min(100, Math.max(1, parseInt(query.limit as string)));

    // Parse sorting
    if (query.sortBy) params.sortBy = query.sortBy as any;
    if (query.sortOrder) params.sortOrder = query.sortOrder as 'asc' | 'desc';

    return params;
  }
}