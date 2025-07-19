// frontend/src/components/projects/ProjectDetail/ProjectDetail.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Divider,
  LinearProgress,
  Tab,
  Tabs,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Alert,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  MoreVert as MoreIcon,
  Person as PersonIcon,
  AttachMoney as BudgetIcon,
  Schedule as ClockIcon,
  CalendarToday as CalendarIcon,
  Assignment as TaskIcon,
  Timeline as MilestoneIcon,
  Description as DocumentIcon,
  PlayArrow as StartIcon,
  Pause as PauseIcon,
  CheckCircle as CompleteIcon,
  Business as ClientIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { AppLayout } from '../../common/Layout/AppLayout';
import { useProject, useProjectMutations } from '../../../hooks/projects/useProjects';
import {
  ProjectStatus,
  ProjectPriority,
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

// Tab panel component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
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

export const ProjectDetail: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, hasRole } = useAuth();
  const { updateProjectStatus } = useProjectMutations();

  const [currentTab, setCurrentTab] = useState(0);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);

  // Fetch project data
  const { project, loading, error, refetch } = useProject(id || null);

  // Action menu handlers
  const handleActionMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setActionMenuAnchor(event.currentTarget);
  };

  const handleActionMenuClose = () => {
    setActionMenuAnchor(null);
  };

  // Handle tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  // Project actions
  const handleEditProject = () => {
    if (project) {
      navigate(`/dashboard/projects/${project.id}/edit`);
    }
    handleActionMenuClose();
  };

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    if (project) {
      await updateProjectStatus(project.id, newStatus);
      refetch(); // Refresh project data
    }
    handleActionMenuClose();
  };

  // Check permissions
  const canEditProjects = hasRole(['BUSINESS_ADMIN', 'BUSINESS_USER']);

  if (loading) {
    return (
      <AppLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </AppLayout>
    );
  }

  if (error || !project) {
    return (
      <AppLayout>
        <Box sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || 'Project not found'}
          </Alert>
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={() => navigate('/dashboard/projects')}
          >
            Back to Projects
          </Button>
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/dashboard/projects')} sx={{ mr: 2 }}>
            <BackIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {project.name}
              </Typography>
              <Chip
                label={PROJECT_STATUS_LABELS[project.status]}
                color={PROJECT_STATUS_COLORS[project.status]}
                size="small"
              />
              <Chip
                label={PROJECT_PRIORITY_LABELS[project.priority]}
                color={PROJECT_PRIORITY_COLORS[project.priority]}
                size="small"
              />
            </Box>
            
            <Typography variant="body1" color="text.secondary">
              {project.description}
            </Typography>
          </Box>

          {canEditProjects && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEditProject}
              >
                Edit
              </Button>
              
              <IconButton onClick={handleActionMenuOpen}>
                <MoreIcon />
              </IconButton>
            </Box>
          )}
        </Box>

        {/* Project Overview Cards */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: 3, 
          mb: 4 
        }}>
          {/* Basic Info */}
          <Box sx={{ flex: { xs: '1', md: '2' } }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Project Information
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' }, 
                  gap: 3 
                }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Project Number
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {project.projectNumber}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Type
                      </Typography>
                      <Typography variant="body1">
                        {PROJECT_TYPE_LABELS[project.type]}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Phase
                      </Typography>
                      <Typography variant="body1">
                        {PROJECT_PHASE_LABELS[project.phase]}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Start Date
                      </Typography>
                      <Typography variant="body1">
                        {format(new Date(project.startDate), 'MMM d, yyyy')}
                      </Typography>
                    </Box>
                    
                    {project.endDate && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          End Date
                        </Typography>
                        <Typography variant="body1">
                          {format(new Date(project.endDate), 'MMM d, yyyy')}
                        </Typography>
                      </Box>
                    )}
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Last Updated
                      </Typography>
                      <Typography variant="body1">
                        {format(new Date(project.updatedAt), 'MMM d, yyyy HH:mm')}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {project.requirements && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Requirements
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 0.5 }}>
                        {project.requirements}
                      </Typography>
                    </Box>
                  </>
                )}

                {project.deliverables && project.deliverables.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Deliverables
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        {project.deliverables.map((deliverable, index) => (
                          <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                            • {deliverable}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  </>
                )}

                {project.tags && project.tags.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                        Tags
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {project.tags.map((tag, index) => (
                          <Chip key={index} label={tag} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* Progress & Stats */}
          <Box sx={{ flex: { xs: '1', md: '1' } }}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Progress
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Completion
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {project.completionPercentage}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={project.completionPercentage}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BudgetIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Budget
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {formatCurrency(project.budget)}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ClockIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Time Logged
                    </Typography>
                    <Typography variant="body1">
                      {project.actualHours}h / {project.estimatedHours}h
                    </Typography>
                  </Box>
                </Box>

                {project.client && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ClientIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Client
                      </Typography>
                      <Typography variant="body1">
                        {project.client.companyName}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Project Manager */}
            {project.projectManagerUser && (
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Project Manager
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2 }}>
                      {project.projectManagerUser.firstName?.[0]}{project.projectManagerUser.lastName?.[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {project.projectManagerUser.firstName} {project.projectManagerUser.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {project.projectManagerUser.email}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        </Box>

        {/* Tabs Section */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={currentTab} onChange={handleTabChange}>
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TaskIcon fontSize="small" />
                    Tasks
                  </Box>
                }
              />
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MilestoneIcon fontSize="small" />
                    Milestones
                  </Box>
                }
              />
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon fontSize="small" />
                    Team
                  </Box>
                }
              />
              <Tab
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DocumentIcon fontSize="small" />
                    Documents
                  </Box>
                }
              />
            </Tabs>
          </Box>

          <TabPanel value={currentTab} index={0}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Tasks
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Task management will be implemented in the next sprint.
              </Typography>
            </Box>
          </TabPanel>

          <TabPanel value={currentTab} index={1}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Milestones
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Milestone tracking will be implemented in the next sprint.
              </Typography>
            </Box>
          </TabPanel>

          <TabPanel value={currentTab} index={2}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Team Members
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Team management will be implemented in the next sprint.
              </Typography>
            </Box>
          </TabPanel>

          <TabPanel value={currentTab} index={3}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Documents
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Document management will be implemented in the next sprint.
              </Typography>
            </Box>
          </TabPanel>
        </Card>

        {/* Action Menu */}
        <Menu
          anchorEl={actionMenuAnchor}
          open={Boolean(actionMenuAnchor)}
          onClose={handleActionMenuClose}
        >
          {project.status === ProjectStatus.PLANNING && (
            <MenuItem onClick={() => handleStatusChange(ProjectStatus.ACTIVE)}>
              <ListItemIcon>
                <StartIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Start Project</ListItemText>
            </MenuItem>
          )}
          
          {project.status === ProjectStatus.ACTIVE && (
            <MenuItem onClick={() => handleStatusChange(ProjectStatus.ON_HOLD)}>
              <ListItemIcon>
                <PauseIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Put On Hold</ListItemText>
            </MenuItem>
          )}
          
          {project.status === ProjectStatus.ACTIVE && (
            <MenuItem onClick={() => handleStatusChange(ProjectStatus.COMPLETED)}>
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