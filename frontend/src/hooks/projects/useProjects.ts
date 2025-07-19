// frontend/src/hooks/projects/useProjects.ts
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { projectApi } from '../../services/api/projectsApi';
import { 
  Project, 
  ProjectQueryParams, 
  CreateProjectForm,
  UpdateProjectForm,
  ProjectDashboardData,
  ProjectStatistics 
} from '../../types/project';

// ==================== PROJECTS LIST HOOK ====================

export const useProjects = (params?: ProjectQueryParams) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await projectApi.getProjects(params);
      
      setProjects(response.projects);
      setTotalCount(response.totalCount);
      setHasNextPage(response.hasNextPage);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch projects';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const refetch = useCallback(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    totalCount,
    hasNextPage,
    loading,
    error,
    refetch
  };
};

// ==================== SINGLE PROJECT HOOK ====================

export const useProject = (projectId: string | null) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await projectApi.getProjectById(projectId);
      
      setProject(response);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch project';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const refetch = useCallback(() => {
    fetchProject();
  }, [fetchProject]);

  return {
    project,
    loading,
    error,
    refetch
  };
};

// ==================== PROJECT MUTATIONS HOOK ====================

export const useProjectMutations = () => {
  const [loading, setLoading] = useState(false);

  const createProject = useCallback(async (projectData: CreateProjectForm): Promise<Project | null> => {
    try {
      setLoading(true);
      
      const project = await projectApi.createProject(projectData);
      toast.success('Project created successfully');
      return project;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create project';
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProject = useCallback(async (projectId: string, projectData: UpdateProjectForm): Promise<Project | null> => {
    try {
      setLoading(true);
      
      const project = await projectApi.updateProject(projectId, projectData);
      toast.success('Project updated successfully');
      return project;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update project';
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProject = useCallback(async (projectId: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      await projectApi.deleteProject(projectId);
      toast.success('Project deleted successfully');
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete project';
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProjectStatus = useCallback(async (projectId: string, status: string): Promise<Project | null> => {
    try {
      setLoading(true);
      
      const project = await projectApi.updateProjectStatus(projectId, status);
      toast.success('Project status updated successfully');
      return project;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update project status';
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProjectPhase = useCallback(async (projectId: string, phase: string): Promise<Project | null> => {
    try {
      setLoading(true);
      
      const project = await projectApi.updateProjectPhase(projectId, phase);
      toast.success('Project phase updated successfully');
      return project;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update project phase';
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createProject,
    updateProject,
    deleteProject,
    updateProjectStatus,
    updateProjectPhase,
    loading
  };
};

// ==================== PROJECT DASHBOARD HOOK ====================

export const useProjectDashboard = () => {
  const [dashboardData, setDashboardData] = useState<ProjectDashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await projectApi.getProjectDashboard();
      console.log('Dashboard response:', response);
      
      setDashboardData(response);
    } catch (err: any) {
      console.error('Dashboard error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch dashboard data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const refetch = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    dashboardData,
    loading,
    error,
    refetch
  };
};

// ==================== PROJECT STATISTICS HOOK ====================

export const useProjectStatistics = () => {
  const [statistics, setStatistics] = useState<ProjectStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await projectApi.getProjectStatistics();
      console.log('Statistics response:', response);
      
      setStatistics(response);
    } catch (err: any) {
      console.error('Statistics error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch statistics';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  const refetch = useCallback(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return {
    statistics,
    loading,
    error,
    refetch
  };
};

// ==================== TEAM MANAGEMENT HOOK ====================

export const useProjectTeam = (projectId: string | null) => {
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTeamMembers = useCallback(async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await projectApi.getTeamMembers(projectId);
      
      setTeamMembers(response);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch team members';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  const assignTeamMember = useCallback(async (userId: string, role: string): Promise<boolean> => {
    if (!projectId) return false;
    
    try {
      await projectApi.assignTeamMember(projectId, userId, role);
      toast.success('Team member assigned successfully');
      fetchTeamMembers(); // Refetch team members
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to assign team member';
      toast.error(errorMessage);
      return false;
    }
  }, [projectId, fetchTeamMembers]);

  const removeTeamMember = useCallback(async (memberId: string): Promise<boolean> => {
    if (!projectId) return false;
    
    try {
      await projectApi.removeTeamMember(projectId, memberId);
      toast.success('Team member removed successfully');
      fetchTeamMembers(); // Refetch team members
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to remove team member';
      toast.error(errorMessage);
      return false;
    }
  }, [projectId, fetchTeamMembers]);

  return {
    teamMembers,
    loading,
    error,
    assignTeamMember,
    removeTeamMember,
    refetch: fetchTeamMembers
  };
};