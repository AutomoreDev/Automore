// frontend/src/services/api/projectApi.ts
import { apiClient } from './apiClient';
import { 
  Project, 
  CreateProjectForm, 
  UpdateProjectForm,
  ProjectQueryParams,
  ProjectDashboardData,
  ProjectStatistics,
  ProjectTeamMember
} from '../../types/project';
// import { ApiResponse } from '../../../../shared/types/api';

export interface ProjectsListResponse {
  projects: Project[];
  totalCount: number;
  hasNextPage: boolean;
}

export const projectApi = {
  // Get projects with filtering and pagination
  async getProjects(params?: ProjectQueryParams): Promise<ProjectsListResponse> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      if (params.search) searchParams.append('search', params.search);
      if (params.status?.length) params.status.forEach(s => searchParams.append('status', s));
      if (params.priority?.length) params.priority.forEach(p => searchParams.append('priority', p));
      if (params.type?.length) params.type.forEach(t => searchParams.append('type', t));
      if (params.phase?.length) params.phase.forEach(ph => searchParams.append('phase', ph));
      if (params.clientId) searchParams.append('clientId', params.clientId);
      if (params.projectManager) searchParams.append('projectManager', params.projectManager);
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.sortBy) searchParams.append('sortBy', params.sortBy);
      if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);
      if (params.startDate) searchParams.append('startDate', params.startDate);
      if (params.endDate) searchParams.append('endDate', params.endDate);
      if (params.budgetMin) searchParams.append('budgetMin', params.budgetMin.toString());
      if (params.budgetMax) searchParams.append('budgetMax', params.budgetMax.toString());
    }

    const query = searchParams.toString();
    const separator = query ? '&' : '?';
    const timestamp = Date.now();
    const response = await apiClient.get<ProjectsListResponse>(`/projects${query ? `?${query}` : ''}${separator}_t=${timestamp}`);
    
    if (!response.data) {
      throw new Error('Failed to load projects');
    }
    
    return response.data;
  },

  // Get project by ID
  async getProjectById(id: string): Promise<Project> {
    const response = await apiClient.get<Project>(`/projects/${id}`);
    
    if (!response.data) {
      throw new Error('Failed to load project');
    }
    
    return response.data;
  },

  // Create new project
  async createProject(projectData: CreateProjectForm): Promise<Project> {
    const response = await apiClient.post<Project>('/projects', projectData);
    
    if (!response.data) {
      throw new Error('Failed to create project');
    }
    
    return response.data;
  },

  // Update project
  async updateProject(id: string, projectData: UpdateProjectForm): Promise<Project> {
    const response = await apiClient.put<Project>(`/projects/${id}`, projectData);
    
    if (!response.data) {
      throw new Error('Failed to update project');
    }
    
    return response.data;
  },

  // Delete project (soft delete)
  async deleteProject(id: string): Promise<void> {
    await apiClient.delete(`/projects/${id}`);
  },

  // Get project dashboard data
  async getProjectDashboard(): Promise<ProjectDashboardData> {
    const timestamp = Date.now();
    const response = await apiClient.get<ProjectDashboardData>(`/projects/dashboard?_t=${timestamp}`);
    
    console.log('Raw dashboard response:', response);
    console.log('Response data:', response.data);
    
    if (!response.data) {
      throw new Error('Failed to load dashboard data');
    }
    
    return response.data;
  },

  // Get project statistics
  async getProjectStatistics(): Promise<ProjectStatistics> {
    const timestamp = Date.now();
    const response = await apiClient.get<ProjectStatistics>(`/projects/statistics?_t=${timestamp}`);
    
    console.log('Raw statistics response:', response);
    console.log('Response data:', response.data);
    
    if (!response.data) {
      throw new Error('Failed to load project statistics');
    }
    
    return response.data;
  },

  // Team management
  async assignTeamMember(projectId: string, userId: string, role: string): Promise<void> {
    await apiClient.post(`/projects/${projectId}/team-members`, {
      userId,
      role
    });
  },

  async getTeamMembers(projectId: string): Promise<ProjectTeamMember[]> {
    const response = await apiClient.get<ProjectTeamMember[]>(`/projects/${projectId}/team-members`);
    
    if (!response.data) {
      throw new Error('Failed to load team members');
    }
    
    return response.data;
  },

  async removeTeamMember(projectId: string, memberId: string): Promise<void> {
    await apiClient.delete(`/projects/${projectId}/team-members/${memberId}`);
  },

  // Update project status
  async updateProjectStatus(projectId: string, status: string): Promise<Project> {
    const response = await apiClient.put<Project>(`/projects/${projectId}/status`, { status });
    
    if (!response.data) {
      throw new Error('Failed to update project status');
    }
    
    return response.data;
  },

  // Update project phase
  async updateProjectPhase(projectId: string, phase: string): Promise<Project> {
    const response = await apiClient.put<Project>(`/projects/${projectId}/phase`, { phase });
    
    if (!response.data) {
      throw new Error('Failed to update project phase');
    }
    
    return response.data;
  }
};