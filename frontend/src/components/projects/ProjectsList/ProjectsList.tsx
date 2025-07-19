// frontend/src/components/projects/ProjectsList/ProjectsList.tsx
import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Pagination,
  InputAdornment,
  CircularProgress,
  Alert,
  useTheme,
  LinearProgress,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Folder as ProjectIcon,
  Person as PersonIcon,
  Schedule as ClockIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  PlayArrow as StartIcon,
  Pause as PauseIcon,
  CheckCircle as CompleteIcon,
  AttachMoney as BudgetIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { AppLayout } from '../../common/Layout/AppLayout';
import { useProjects, useProjectMutations } from '../../../hooks/projects/useProjects';
import {
  Project,
  ProjectStatus,
  ProjectPriority,
  ProjectType,
  ProjectPhase,
  ProjectQueryParams,
} from '../../../types/project';
import {
  PROJECT_STATUS_LABELS,
  PROJECT_PRIORITY_LABELS,
  PROJECT_TYPE_LABELS,
  PROJECT_PHASE_LABELS,
  PROJECT_STATUS_COLORS,
  PROJECT_PRIORITY_COLORS,
} from '../../../shared/enums/project';
import { useAuth } from '../../../context/auth/AuthContext';

// Status colors mapping
const getStatusColor = (status: ProjectStatus) => {
  return PROJECT_STATUS_COLORS[status] || 'default';
};

// Priority colors mapping  
const getPriorityColor = (priority: ProjectPriority) => {
  return PROJECT_PRIORITY_COLORS[priority] || 'default';
};

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

interface ProjectsFilters {
  search: string;
  status: ProjectStatus[];
  priority: ProjectPriority[];
  type: ProjectType[];
  phase: ProjectPhase[];
}

export const ProjectsList: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const { updateProjectStatus } = useProjectMutations();

  // Filter state
  const [filters, setFilters] = useState<ProjectsFilters>({
    search: '',
    status: [],
    priority: [],
    type: [],
    phase: [],
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const limit = 10;

  // Build query parameters (memoized to prevent infinite re-renders)
  const queryParams = useMemo(() => ({
    search: filters.search || undefined,
    status: filters.status.length > 0 ? filters.status : undefined,
    priority: filters.priority.length > 0 ? filters.priority : undefined,
    type: filters.type.length > 0 ? filters.type : undefined,
    phase: filters.phase.length > 0 ? filters.phase : undefined,
    page: currentPage,
    limit,
    sortBy: 'updatedAt' as const,
    sortOrder: 'desc' as const,
  }), [filters.search, filters.status, filters.priority, filters.type, filters.phase, currentPage, limit]);

  // Fetch projects using hook
  const { projects, totalCount, hasNextPage, loading, error, refetch } = useProjects(queryParams);

  // Handle filter changes
  const handleFilterChange = useCallback((field: keyof ProjectsFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      status: [],
      priority: [],
      type: [],
      phase: [],
    });
    setCurrentPage(1);
  }, []);

  // Handle page change
  const handlePageChange = useCallback((_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  }, []);

  // Action menu handlers
  const handleActionMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>, project: Project) => {
    setActionMenuAnchor(event.currentTarget);
    setSelectedProject(project);
  }, []);

  const handleActionMenuClose = useCallback(() => {
    setActionMenuAnchor(null);
    setSelectedProject(null);
  }, []);

  // Project actions
  const handleEditProject = useCallback(() => {
    if (selectedProject) {
      navigate(`/dashboard/projects/${selectedProject.id}/edit`);
    }
    handleActionMenuClose();
  }, [selectedProject, navigate, handleActionMenuClose]);

  const handleViewProject = useCallback((project: Project) => {
    navigate(`/dashboard/projects/${project.id}`);
  }, [navigate]);

  const handleStatusChange = useCallback(async (project: Project, newStatus: ProjectStatus) => {
    await updateProjectStatus(project.id, newStatus);
    refetch(); // Refresh the list
    handleActionMenuClose();
  }, [updateProjectStatus, refetch, handleActionMenuClose]);

  // Check if user can create projects
  const canCreateProjects = hasRole(['BUSINESS_ADMIN', 'BUSINESS_USER']);
  const canEditProjects = hasRole(['BUSINESS_ADMIN', 'BUSINESS_USER']);

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <AppLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Projects
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
              Manage and track your projects
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={refetch}
              disabled={loading}
            >
              Refresh
            </Button>
            
            {canCreateProjects && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/dashboard/projects/new')}
                sx={{
                  background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)',
                  },
                }}
              >
                New Project
              </Button>
            )}
          </Box>
        </Box>

        {/* Search and Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              {/* Search */}
              <TextField
                placeholder="Search projects..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ flexGrow: 1, minWidth: 300 }}
              />

              {/* Filter Toggle */}
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => setShowFilters(!showFilters)}
                color={showFilters ? 'primary' : 'inherit'}
              >
                Filters
              </Button>

              {/* Clear Filters */}
              {(filters.search || filters.status.length > 0 || filters.priority.length > 0 || 
                filters.type.length > 0 || filters.phase.length > 0) && (
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={clearFilters}
                  color="error"
                >
                  Clear
                </Button>
              )}
            </Box>

            {/* Advanced Filters */}
            {showFilters && (
              <Box sx={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 2 
              }}>
                {/* Status Filter */}
                <Box sx={{ 
                  minWidth: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(25% - 12px)' },
                  flex: '1 1 auto'
                }}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      multiple
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      label="Status"
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {(selected as ProjectStatus[]).map((value) => (
                            <Chip
                              key={value}
                              label={PROJECT_STATUS_LABELS[value]}
                              size="small"
                              color={getStatusColor(value)}
                            />
                          ))}
                        </Box>
                      )}
                    >
                      {Object.values(ProjectStatus).map((status) => (
                        <MenuItem key={status} value={status}>
                          {PROJECT_STATUS_LABELS[status]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Priority Filter */}
                <Box sx={{ 
                  minWidth: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(25% - 12px)' },
                  flex: '1 1 auto'
                }}>
                  <FormControl fullWidth>
                    <InputLabel>Priority</InputLabel>
                    <Select
                      multiple
                      value={filters.priority}
                      onChange={(e) => handleFilterChange('priority', e.target.value)}
                      label="Priority"
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {(selected as ProjectPriority[]).map((value) => (
                            <Chip
                              key={value}
                              label={PROJECT_PRIORITY_LABELS[value]}
                              size="small"
                              color={getPriorityColor(value)}
                            />
                          ))}
                        </Box>
                      )}
                    >
                      {Object.values(ProjectPriority).map((priority) => (
                        <MenuItem key={priority} value={priority}>
                          {PROJECT_PRIORITY_LABELS[priority]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Type Filter */}
                <Box sx={{ 
                  minWidth: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(25% - 12px)' },
                  flex: '1 1 auto'
                }}>
                  <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                      multiple
                      value={filters.type}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                      label="Type"
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {(selected as ProjectType[]).map((value) => (
                            <Chip
                              key={value}
                              label={PROJECT_TYPE_LABELS[value]}
                              size="small"
                            />
                          ))}
                        </Box>
                      )}
                    >
                      {Object.values(ProjectType).map((type) => (
                        <MenuItem key={type} value={type}>
                          {PROJECT_TYPE_LABELS[type]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Phase Filter */}
                <Box sx={{ 
                  minWidth: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(25% - 12px)' },
                  flex: '1 1 auto'
                }}>
                  <FormControl fullWidth>
                    <InputLabel>Phase</InputLabel>
                    <Select
                      multiple
                      value={filters.phase}
                      onChange={(e) => handleFilterChange('phase', e.target.value)}
                      label="Phase"
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {(selected as ProjectPhase[]).map((value) => (
                            <Chip
                              key={value}
                              label={PROJECT_PHASE_LABELS[value]}
                              size="small"
                            />
                          ))}
                        </Box>
                      )}
                    >
                      {Object.values(ProjectPhase).map((phase) => (
                        <MenuItem key={phase} value={phase}>
                          {PROJECT_PHASE_LABELS[phase]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Projects List */}
        {!loading && projects.length === 0 && (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <ProjectIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                No projects found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {filters.search || filters.status.length > 0 || filters.priority.length > 0 
                  ? 'Try adjusting your filters or search criteria'
                  : 'Get started by creating your first project'}
              </Typography>
              {canCreateProjects && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/dashboard/projects/new')}
                >
                  Create Project
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {!loading && projects.length > 0 && (
          <>
            {projects.map((project) => (
              <Card key={project.id} sx={{ mb: 2, cursor: 'pointer' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flexGrow: 1 }} onClick={() => handleViewProject(project)}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {project.name}
                        </Typography>
                        <Chip
                          label={PROJECT_STATUS_LABELS[project.status]}
                          color={getStatusColor(project.status)}
                          size="small"
                        />
                        <Chip
                          label={PROJECT_PRIORITY_LABELS[project.priority]}
                          color={getPriorityColor(project.priority)}
                          size="small"
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {project.description}
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Project #:
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {project.projectNumber}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BudgetIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {formatCurrency(project.budget)}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ClockIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {project.actualHours}h / {project.estimatedHours}h
                          </Typography>
                        </Box>

                        {project.client && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {project.client.companyName}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {/* Progress Bar */}
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            Progress
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {project.completionPercentage}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={project.completionPercentage}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 3,
                            },
                          }}
                        />
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Phase: {PROJECT_PHASE_LABELS[project.phase]}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Type: {PROJECT_TYPE_LABELS[project.type]}
                          </Typography>
                        </Box>
                        
                        <Typography variant="caption" color="text.secondary">
                          Updated: {format(new Date(project.updatedAt), 'MMM d, yyyy')}
                        </Typography>
                      </Box>
                    </Box>

                    {canEditProjects && (
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleActionMenuOpen(e, project);
                        }}
                      >
                        <MoreIcon />
                      </IconButton>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </>
        )}

        {/* Action Menu */}
        <Menu
          anchorEl={actionMenuAnchor}
          open={Boolean(actionMenuAnchor)}
          onClose={handleActionMenuClose}
        >
          <MenuItem onClick={handleEditProject}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit Project</ListItemText>
          </MenuItem>
          
          {selectedProject && selectedProject.status === ProjectStatus.PLANNING && (
            <MenuItem onClick={() => handleStatusChange(selectedProject, ProjectStatus.ACTIVE)}>
              <ListItemIcon>
                <StartIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Start Project</ListItemText>
            </MenuItem>
          )}
          
          {selectedProject && selectedProject.status === ProjectStatus.ACTIVE && (
            <MenuItem onClick={() => handleStatusChange(selectedProject, ProjectStatus.ON_HOLD)}>
              <ListItemIcon>
                <PauseIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Put On Hold</ListItemText>
            </MenuItem>
          )}
          
          {selectedProject && selectedProject.status === ProjectStatus.ACTIVE && (
            <MenuItem onClick={() => handleStatusChange(selectedProject, ProjectStatus.COMPLETED)}>
              <ListItemIcon>
                <CompleteIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Mark Complete</ListItemText>
            </MenuItem>
          )}
        </Menu>
      </Box>
    </AppLayout>
  );
};