// backend/src/services/project/projectService.ts

import { 
    getFirestore, 
    CollectionReference, 
    DocumentReference, 
    Timestamp, 
    FieldValue,
    Query,
    QuerySnapshot,
    DocumentSnapshot
  } from 'firebase-admin/firestore';
  import {
    ProjectDocument,
    CreateProjectDTO,
    UpdateProjectDTO,
    ProjectResponse,
    ProjectQueryParams,
    TeamMemberDocument,
    MilestoneDocument,
    ProjectUserResponse,
    ProjectClientResponse,
    randToCents,
    centsToRand,
    generateProjectNumber,
    calculateProjectCompletion
  } from '../../types/project/projectTypes';
  import {
    ProjectStatus,
    ProjectPriority,
    ProjectPhase,
    BillingType,
    TeamRole,
    AssignmentStatus
  } from '../../../../frontend/src/shared/enums/project';
  import { AuthUser } from '../../../../shared/types/auth';
  
  export class ProjectService {
    private db = getFirestore();
    private projectsCollection = this.db.collection('projects') as CollectionReference<ProjectDocument>;
    private teamMembersCollection = this.db.collection('project_team_members') as CollectionReference<TeamMemberDocument>;
    private milestonesCollection = this.db.collection('project_milestones') as CollectionReference<MilestoneDocument>;
    private usersCollection = this.db.collection('users');
    private companiesCollection = this.db.collection('companies');
  
    /**
     * Create a new project
     */
    async createProject(projectData: CreateProjectDTO, user: AuthUser): Promise<ProjectResponse> {
      try {
        // Validate user permissions
        this.validateCreatePermissions(user);
  
        // Validate client exists and user has access
        await this.validateClientAccess(projectData.clientId, user);
  
        // Generate project number
        const currentYear = new Date().getFullYear();
        const projectNumber = await this.generateUniqueProjectNumber(currentYear);
  
        // Prepare project document
        const now = Timestamp.now();
        const projectDoc: ProjectDocument = {
          name: projectData.name.trim(),
          description: projectData.description.trim(),
          status: ProjectStatus.PLANNING,
          priority: projectData.priority,
          type: projectData.type,
          phase: ProjectPhase.DISCOVERY,
          
          // References
          clientId: projectData.clientId,
          companyId: user.companyId || '',
          createdBy: user.uid,
          projectManager: projectData.projectManager || user.uid,
          
          projectNumber,
          
          // Timeline
          startDate: Timestamp.fromDate(new Date(projectData.startDate)),
          endDate: projectData.endDate ? Timestamp.fromDate(new Date(projectData.endDate)) : null,
          estimatedHours: projectData.estimatedHours,
          actualHours: 0,
          
          // Financial (convert to cents)
          budget: randToCents(projectData.budget),
          billingType: projectData.billingType,
          hourlyRate: projectData.hourlyRate ? randToCents(projectData.hourlyRate) : null,
          totalCost: 0,
          
          // Progress
          completionPercentage: 0,
          
          // Timestamps
          createdAt: now,
          updatedAt: now,
          lastActivityAt: now,
          
          // Metadata
          tags: projectData.tags || [],
          requirements: projectData.requirements || null,
          deliverables: projectData.deliverables || [],
          
          // References
          teamMemberIds: [],
          milestoneIds: [],
          documentIds: []
        };
  
        // Create project document
        const projectRef = await this.projectsCollection.add(projectDoc);
        const projectId = projectRef.id;
  
        // Assign project manager as team member
        if (projectData.projectManager) {
          await this.assignTeamMember(projectId, projectData.projectManager, TeamRole.PROJECT_MANAGER, user);
        }
  
        // Assign additional team members
        if (projectData.teamMembers && projectData.teamMembers.length > 0) {
          for (const memberId of projectData.teamMembers) {
            await this.assignTeamMember(projectId, memberId, TeamRole.DEVELOPER, user);
          }
        }
  
        // Create audit log entry
        await this.createAuditLog(projectId, user.uid, 'PROJECT_CREATED', {
          projectName: projectData.name,
          projectNumber
        });
  
        // Return populated project response
        return await this.getProjectById(projectId, user);
  
      } catch (error: any) {
        console.error('Error creating project:', error);
        throw new Error(`Failed to create project: ${error.message}`);
      }
    }
  
    /**
     * Get project by ID with populated data
     */
    async getProjectById(projectId: string, user: AuthUser): Promise<ProjectResponse> {
      try {
        const projectDoc = await this.projectsCollection.doc(projectId).get();
        
        if (!projectDoc.exists) {
          throw new Error('Project not found');
        }
  
        const project = projectDoc.data()!;
        
        // Validate access permissions
        this.validateProjectAccess(project, user);
  
        // Convert to response format
        return await this.convertToProjectResponse(projectId, project, true);
  
      } catch (error: any) {
        console.error('Error getting project:', error);
        throw new Error(error.message || 'Failed to get project');
      }
    }
  
    /**
     * Update project
     */
    async updateProject(projectId: string, updateData: UpdateProjectDTO, user: AuthUser): Promise<ProjectResponse> {
      try {
        const projectRef = this.projectsCollection.doc(projectId);
        const projectDoc = await projectRef.get();
  
        if (!projectDoc.exists) {
          throw new Error('Project not found');
        }
  
        const project = projectDoc.data()!;
        
        // Validate permissions
        this.validateUpdatePermissions(project, user);
  
        // Prepare update data
        const updateFields: Partial<ProjectDocument> = {
          updatedAt: Timestamp.now(),
          lastActivityAt: Timestamp.now()
        };
  
        // Update specific fields
        if (updateData.name !== undefined) {
          updateFields.name = updateData.name.trim();
        }
        if (updateData.description !== undefined) {
          updateFields.description = updateData.description.trim();
        }
        if (updateData.status !== undefined) {
          updateFields.status = updateData.status;
        }
        if (updateData.priority !== undefined) {
          updateFields.priority = updateData.priority;
        }
        if (updateData.phase !== undefined) {
          updateFields.phase = updateData.phase;
        }
        if (updateData.startDate !== undefined) {
          updateFields.startDate = Timestamp.fromDate(new Date(updateData.startDate));
        }
        if (updateData.endDate !== undefined) {
          updateFields.endDate = updateData.endDate ? Timestamp.fromDate(new Date(updateData.endDate)) : null;
        }
        if (updateData.estimatedHours !== undefined) {
          updateFields.estimatedHours = updateData.estimatedHours;
        }
        if (updateData.budget !== undefined) {
          updateFields.budget = randToCents(updateData.budget);
        }
        if (updateData.billingType !== undefined) {
          updateFields.billingType = updateData.billingType;
        }
        if (updateData.hourlyRate !== undefined) {
          updateFields.hourlyRate = updateData.hourlyRate ? randToCents(updateData.hourlyRate) : null;
        }
        if (updateData.requirements !== undefined) {
          updateFields.requirements = updateData.requirements;
        }
        if (updateData.deliverables !== undefined) {
          updateFields.deliverables = updateData.deliverables;
        }
        if (updateData.tags !== undefined) {
          updateFields.tags = updateData.tags;
        }
        if (updateData.projectManager !== undefined) {
          updateFields.projectManager = updateData.projectManager;
        }
  
        // Update project document
        await projectRef.update(updateFields);
  
        // Create audit log entry
        await this.createAuditLog(projectId, user.uid, 'PROJECT_UPDATED', updateData);
  
        // Return updated project
        return await this.getProjectById(projectId, user);
  
      } catch (error: any) {
        console.error('Error updating project:', error);
        throw new Error(error.message || 'Failed to update project');
      }
    }
  
    /**
     * Get projects with filtering and pagination
     */
    async getProjects(queryParams: ProjectQueryParams, user: AuthUser): Promise<{
      projects: ProjectResponse[];
      totalCount: number;
      hasNextPage: boolean;
    }> {
      try {
        let query: Query<ProjectDocument> = this.projectsCollection;
  
        // Apply company filter based on user role
        if (this.isClientUser(user)) {
          // Client users can only see their own projects
          if (user.companyId) {
            query = query.where('clientId', '==', user.companyId);
          }
        } else {
          // Business users see projects in their company
          if (user.companyId) {
            query = query.where('companyId', '==', user.companyId);
          }
        }
  
        // Apply filters
        if (queryParams.status && queryParams.status.length > 0) {
          query = query.where('status', 'in', queryParams.status);
        }
  
        if (queryParams.priority && queryParams.priority.length > 0) {
          query = query.where('priority', 'in', queryParams.priority);
        }
  
        if (queryParams.type && queryParams.type.length > 0) {
          query = query.where('type', 'in', queryParams.type);
        }
  
        if (queryParams.phase && queryParams.phase.length > 0) {
          query = query.where('phase', 'in', queryParams.phase);
        }
  
        if (queryParams.clientId) {
          query = query.where('clientId', '==', queryParams.clientId);
        }
  
        if (queryParams.projectManager) {
          query = query.where('projectManager', '==', queryParams.projectManager);
        }
  
        if (queryParams.startDateFrom) {
          query = query.where('startDate', '>=', Timestamp.fromDate(new Date(queryParams.startDateFrom)));
        }
  
        if (queryParams.startDateTo) {
          query = query.where('startDate', '<=', Timestamp.fromDate(new Date(queryParams.startDateTo)));
        }
  
        // Apply sorting
        const sortBy = queryParams.sortBy || 'updatedAt';
        const sortOrder = queryParams.sortOrder || 'desc';
        query = query.orderBy(sortBy, sortOrder);
  
        // Apply pagination
        const limit = Math.min(queryParams.limit || 20, 100);
        const offset = ((queryParams.page || 1) - 1) * limit;
  
        if (offset > 0) {
          const offsetQuery = query.limit(offset);
          const offsetSnapshot = await offsetQuery.get();
          if (!offsetSnapshot.empty) {
            const lastDoc = offsetSnapshot.docs[offsetSnapshot.docs.length - 1];
            query = query.startAfter(lastDoc);
          }
        }
  
        query = query.limit(limit + 1); // Get one extra to check if there's a next page
  
        // Execute query
        const snapshot = await query.get();
        const hasNextPage = snapshot.docs.length > limit;
        const projectDocs = hasNextPage ? snapshot.docs.slice(0, limit) : snapshot.docs;
  
        // Convert to response format
        const projects: ProjectResponse[] = [];
        for (const doc of projectDocs) {
          const project = await this.convertToProjectResponse(doc.id, doc.data(), queryParams.includeTeam || false);
          projects.push(project);
        }
  
        // Get total count (this could be cached for better performance)
        let countQuery: Query<ProjectDocument> = this.projectsCollection;
        if (user.companyId) {
          countQuery = countQuery.where('companyId', '==', user.companyId);
        }
        const countSnapshot = await countQuery.count().get();
        const totalCount = countSnapshot.data().count;
  
        return {
          projects,
          totalCount,
          hasNextPage
        };
  
      } catch (error: any) {
        console.error('Error getting projects:', error);
        throw new Error(`Failed to get projects: ${error.message}`);
      }
    }
  
    /**
     * Delete project (soft delete by changing status)
     */
    async deleteProject(projectId: string, user: AuthUser): Promise<void> {
      try {
        const projectRef = this.projectsCollection.doc(projectId);
        const projectDoc = await projectRef.get();
  
        if (!projectDoc.exists) {
          throw new Error('Project not found');
        }
  
        const project = projectDoc.data()!;
        
        // Validate permissions (only business admins can delete)
        this.validateDeletePermissions(user);
  
        // Update project status to cancelled
        await projectRef.update({
          status: ProjectStatus.CANCELLED,
          updatedAt: Timestamp.now(),
          lastActivityAt: Timestamp.now()
        });
  
        // Create audit log entry
        await this.createAuditLog(projectId, user.uid, 'PROJECT_DELETED', {
          projectName: project.name,
          projectNumber: project.projectNumber
        });
  
      } catch (error: any) {
        console.error('Error deleting project:', error);
        throw new Error(error.message || 'Failed to delete project');
      }
    }
  
    /**
     * Assign team member to project
     */
    async assignTeamMember(projectId: string, userId: string, role: TeamRole, assigner: AuthUser): Promise<void> {
      try {
        // Validate user exists
        const userDoc = await this.usersCollection.doc(userId).get();
        if (!userDoc.exists) {
          throw new Error('User not found');
        }
  
        const userData = userDoc.data()!;
  
        // Get default hourly rate based on role
        const hourlyRate = this.getDefaultHourlyRate(role);
  
        // Create team member document
        const teamMemberDoc: TeamMemberDocument = {
          projectId,
          userId,
          role,
          assignmentStatus: AssignmentStatus.ASSIGNED,
          hourlyRate: randToCents(hourlyRate),
          assignedAt: Timestamp.now(),
          assignedBy: assigner.uid
        };
  
        const teamMemberRef = await this.teamMembersCollection.add(teamMemberDoc);
  
        // Update project with team member reference
        await this.projectsCollection.doc(projectId).update({
          teamMemberIds: FieldValue.arrayUnion(teamMemberRef.id),
          updatedAt: Timestamp.now(),
          lastActivityAt: Timestamp.now()
        });
  
        // Create audit log entry
        await this.createAuditLog(projectId, assigner.uid, 'TEAM_MEMBER_ASSIGNED', {
          assignedUserId: userId,
          role,
          assignedUserName: `${userData.firstName} ${userData.lastName}`
        });
  
      } catch (error: any) {
        console.error('Error assigning team member:', error);
        throw new Error(`Failed to assign team member: ${error.message}`);
      }
    }
  
    // ==================== PRIVATE HELPER METHODS ====================
  
    /**
     * Convert Firestore document to ProjectResponse
     */
    private async convertToProjectResponse(
      projectId: string, 
      project: ProjectDocument, 
      includePopulatedData: boolean = false
    ): Promise<ProjectResponse> {
      const response: ProjectResponse = {
        id: projectId,
        name: project.name,
        description: project.description,
        status: project.status,
        priority: project.priority,
        type: project.type,
        phase: project.phase,
        
        clientId: project.clientId,
        companyId: project.companyId,
        createdBy: project.createdBy,
        projectManager: project.projectManager,
        
        projectNumber: project.projectNumber,
        
        // Convert timestamps to ISO strings
        startDate: project.startDate.toDate().toISOString(),
        endDate: project.endDate ? project.endDate.toDate().toISOString() : null,
        estimatedHours: project.estimatedHours,
        actualHours: project.actualHours,
        
        // Convert financial data from cents to Rand
        budget: centsToRand(project.budget),
        billingType: project.billingType,
        hourlyRate: project.hourlyRate ? centsToRand(project.hourlyRate) : null,
        totalCost: centsToRand(project.totalCost),
        
        completionPercentage: project.completionPercentage,
        
        createdAt: project.createdAt.toDate().toISOString(),
        updatedAt: project.updatedAt.toDate().toISOString(),
        lastActivityAt: project.lastActivityAt.toDate().toISOString(),
        
        tags: project.tags,
        requirements: project.requirements,
        deliverables: project.deliverables
      };
  
      // Populate additional data if requested
      if (includePopulatedData) {
        // Populate client data
        if (project.clientId) {
          response.client = await this.getClientData(project.clientId);
        }
  
        // Populate project manager data
        if (project.projectManager) {
          response.projectManagerUser = await this.getUserData(project.projectManager);
        }
  
        // Populate created by user data
        response.createdByUser = await this.getUserData(project.createdBy);
  
        // Populate team members
        if (project.teamMemberIds.length > 0) {
          response.teamMembers = await this.getTeamMembersData(project.teamMemberIds);
        }
      }
  
      return response;
    }
  
    /**
     * Get client data for population
     */
    private async getClientData(clientId: string): Promise<ProjectClientResponse> {
      const clientDoc = await this.companiesCollection.doc(clientId).get();
      if (!clientDoc.exists) {
        throw new Error('Client company not found');
      }
  
      const client = clientDoc.data()!;
      return {
        id: clientId,
        companyName: client.companyName,
        contactPerson: client.contactPerson || '',
        email: client.email || '',
        phone: client.phone || null
      };
    }
  
    /**
     * Get user data for population
     */
    private async getUserData(userId: string): Promise<ProjectUserResponse> {
      const userDoc = await this.usersCollection.doc(userId).get();
      if (!userDoc.exists) {
        throw new Error('User not found');
      }
  
      const user = userDoc.data()!;
      return {
        id: userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role || TeamRole.DEVELOPER,
        avatar: user.avatar || undefined
      };
    }
  
    /**
     * Get team members data
     */
    private async getTeamMembersData(teamMemberIds: string[]): Promise<any[]> {
      const teamMembers = [];
      for (const memberId of teamMemberIds) {
        const memberDoc = await this.teamMembersCollection.doc(memberId).get();
        if (memberDoc.exists) {
          const member = memberDoc.data()!;
          const userData = await this.getUserData(member.userId);
          const assignerData = await this.getUserData(member.assignedBy);
          
          teamMembers.push({
            id: memberId,
            projectId: member.projectId,
            userId: member.userId,
            role: member.role,
            assignmentStatus: member.assignmentStatus,
            hourlyRate: centsToRand(member.hourlyRate),
            assignedAt: member.assignedAt.toDate().toISOString(),
            assignedBy: member.assignedBy,
            user: userData,
            assignedByUser: assignerData
          });
        }
      }
      return teamMembers;
    }
  
    /**
     * Generate unique project number
     */
    private async generateUniqueProjectNumber(year: number): Promise<string> {
      const query = this.projectsCollection
        .where('projectNumber', '>=', `AUT-${year}-000`)
        .where('projectNumber', '<', `AUT-${year + 1}-000`)
        .orderBy('projectNumber', 'desc')
        .limit(1);
  
      const snapshot = await query.get();
      let sequence = 1;
  
      if (!snapshot.empty) {
        const lastProject = snapshot.docs[0].data();
        const lastNumber = lastProject.projectNumber;
        const lastSequence = parseInt(lastNumber.split('-')[2]);
        sequence = lastSequence + 1;
      }
  
      return generateProjectNumber(year, sequence);
    }
  
    /**
     * Get default hourly rate based on role
     */
    private getDefaultHourlyRate(role: TeamRole): number {
      const rates = {
        [TeamRole.PROJECT_MANAGER]: 1000,
        [TeamRole.DEVELOPER]: 750,
        [TeamRole.DESIGNER]: 800,
        [TeamRole.QA_TESTER]: 600,
        [TeamRole.CLIENT_CONTACT]: 500,
        [TeamRole.CONSULTANT]: 1500
      };
      return rates[role] || 750;
    }
  
    /**
     * Create audit log entry
     */
    private async createAuditLog(projectId: string, userId: string, action: string, details: any): Promise<void> {
      try {
        await this.db.collection('audit_logs').add({
          entityType: 'project',
          entityId: projectId,
          userId,
          action,
          details,
          createdAt: Timestamp.now()
        });
      } catch (error) {
        console.error('Error creating audit log:', error);
        // Don't throw error for audit log failures
      }
    }
  
    // ==================== VALIDATION METHODS ====================
  
    private validateCreatePermissions(user: AuthUser): void {
      const allowedRoles = ['BUSINESS_ADMIN', 'BUSINESS_USER'];
      if (!allowedRoles.includes(user.role)) {
        throw new Error('Access denied: Insufficient permissions to create projects');
      }
    }
  
    private validateUpdatePermissions(project: ProjectDocument, user: AuthUser): void {
      const allowedRoles = ['BUSINESS_ADMIN', 'BUSINESS_USER'];
      if (!allowedRoles.includes(user.role)) {
        throw new Error('Access denied: Insufficient permissions to update projects');
      }
  
      // Check if user belongs to the same company
      if (project.companyId !== user.companyId) {
        throw new Error('Access denied: Cannot update projects from other companies');
      }
    }
  
    private validateDeletePermissions(user: AuthUser): void {
      if (user.role !== 'BUSINESS_ADMIN') {
        throw new Error('Access denied: Only business admins can delete projects');
      }
    }
  
    private validateProjectAccess(project: ProjectDocument, user: AuthUser): void {
      if (this.isClientUser(user)) {
        // Client users can only access their own projects
        if (project.clientId !== user.companyId) {
          throw new Error('Access denied: Cannot access projects from other companies');
        }
      } else {
        // Business users can access projects in their company
        if (project.companyId !== user.companyId) {
          throw new Error('Access denied: Cannot access projects from other companies');
        }
      }
    }
  
    private async validateClientAccess(clientId: string, user: AuthUser): Promise<void> {
      const clientDoc = await this.companiesCollection.doc(clientId).get();
      if (!clientDoc.exists) {
        throw new Error('Client company not found');
      }
  
      // Business users should only create projects for valid clients
      // Additional validation can be added here based on business rules
    }
  
    private isClientUser(user: AuthUser): boolean {
      return ['CLIENT_ADMIN', 'CLIENT_USER'].includes(user.role);
    }
  }