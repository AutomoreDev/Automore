// frontend/src/components/projects/ProjectDashboard/ProjectDashboardWidgets.tsx
import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Folder as ProjectIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ClockIcon,
  AttachMoney as MoneyIcon,
  Warning as WarningIcon,
  CheckCircle as CompletedIcon,
  CheckCircle,
  PlayArrow as ActiveIcon,
  Pause as OnHoldIcon,
  ArrowForward as ArrowIcon,
  Assignment as TaskIcon,
  Timeline as MilestoneIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useProjectDashboard, useProjectStatistics } from '../../../hooks/projects/useProjects';
import {
  Project,
  ProjectStatus,
  ProjectPriority,
} from '../../../types/project';
import {
  PROJECT_STATUS_LABELS,
  PROJECT_PRIORITY_LABELS,
  PROJECT_STATUS_COLORS,
  PROJECT_PRIORITY_COLORS,
} from '../../../shared/enums/project';
import { useAuth } from '../../../context/auth/AuthContext';

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Project Stats Card
export const ProjectStatsCard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { statistics, loading } = useProjectStatistics();

  if (loading || !statistics) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Project Statistics
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            Loading...
          </Box>
        </CardContent>
      </Card>
    );
  }

  const stats = [
    {
      label: 'Total Projects',
      value: statistics.totalProjects,
      icon: <ProjectIcon />,
      color: theme.palette.primary.main,
    },
    {
      label: 'Active Projects',
      value: statistics.activeProjects,
      icon: <ActiveIcon />,
      color: theme.palette.success.main,
    },
    {
      label: 'Completed',
      value: statistics.completedProjects,
      icon: <CompletedIcon />,
      color: theme.palette.info.main,
    },
    {
      label: 'Total Budget',
      value: formatCurrency(statistics.totalBudget),
      icon: <MoneyIcon />,
      color: theme.palette.warning.main,
    },
  ];

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Project Overview
          </Typography>
          <Button
            size="small"
            endIcon={<ArrowIcon />}
            onClick={() => navigate('/dashboard/projects')}
          >
            View All
          </Button>
        </Box>

        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: 3 
        }}>
          {stats.map((stat, index) => (
            <Box 
              key={index}
              sx={{ 
                width: { xs: 'calc(50% - 12px)', sm: 'calc(25% - 18px)' },
                textAlign: 'center'
              }}
            >
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  backgroundColor: `${stat.color}20`,
                  color: stat.color,
                  mb: 1,
                }}
              >
                {stat.icon}
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                {stat.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Progress Summary */}
        <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ 
            display: 'flex',
            gap: 2 
          }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Avg. Completion
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {Math.round(statistics.averageCompletion)}%
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Hours Logged
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {statistics.totalActualHours.toLocaleString()}h
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// Active Projects Widget
export const ActiveProjectsWidget: React.FC = () => {
  const navigate = useNavigate();
  const { dashboardData, loading } = useProjectDashboard();

  if (loading || !dashboardData) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Active Projects
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            Loading...
          </Box>
        </CardContent>
      </Card>
    );
  }

  const { activeProjects } = dashboardData;

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Active Projects
          </Typography>
          <Button
            size="small"
            endIcon={<ArrowIcon />}
            onClick={() => navigate('/dashboard/projects?status=active')}
          >
            View All
          </Button>
        </Box>

        {activeProjects.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <ProjectIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No active projects
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {activeProjects.slice(0, 5).map((project, index) => (
              <ListItem
                key={project.id}
                disablePadding
                sx={{
                  cursor: 'pointer',
                  borderRadius: 1,
                  mb: 1,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
                onClick={() => navigate(`/dashboard/projects/${project.id}`)}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <ProjectIcon />
                  </Avatar>
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {project.name}
                      </Typography>
                      <Chip
                        label={PROJECT_PRIORITY_LABELS[project.priority]}
                        color={PROJECT_PRIORITY_COLORS[project.priority]}
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
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
                        sx={{ height: 4, borderRadius: 2 }}
                      />
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

// Recent Projects Widget
export const RecentProjectsWidget: React.FC = () => {
  const navigate = useNavigate();
  const { dashboardData, loading } = useProjectDashboard();

  if (loading || !dashboardData) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Recent Projects
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            Loading...
          </Box>
        </CardContent>
      </Card>
    );
  }

  const { recentProjects } = dashboardData;

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Recent Activity
          </Typography>
          <Button
            size="small"
            endIcon={<ArrowIcon />}
            onClick={() => navigate('/dashboard/projects')}
          >
            View All
          </Button>
        </Box>

        {recentProjects.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <ProjectIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No recent activity
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {recentProjects.slice(0, 5).map((project) => (
              <ListItem
                key={project.id}
                disablePadding
                sx={{
                  cursor: 'pointer',
                  borderRadius: 1,
                  mb: 1,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
                onClick={() => navigate(`/dashboard/projects/${project.id}`)}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: PROJECT_STATUS_COLORS[project.status] + '.main' }}>
                    <ProjectIcon />
                  </Avatar>
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {project.name}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Chip
                        label={PROJECT_STATUS_LABELS[project.status]}
                        color={PROJECT_STATUS_COLORS[project.status]}
                        size="small"
                      />
                      <Typography variant="caption" color="text.secondary">
                        • Updated {format(new Date(project.updatedAt), 'MMM d')}
                      </Typography>
                    </Box>
                  }
                />
                
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/dashboard/projects/${project.id}`);
                    }}
                  >
                    <ArrowIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

// Overdue Tasks/Milestones Widget
export const OverdueItemsWidget: React.FC = () => {
  const navigate = useNavigate();
  const { dashboardData, loading } = useProjectDashboard();

  if (loading || !dashboardData) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Attention Required
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            Loading...
          </Box>
        </CardContent>
      </Card>
    );
  }

  const { overdueMilestones, pendingApprovals } = dashboardData;
  const totalItems = overdueMilestones.length + pendingApprovals.length;

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Attention Required
          </Typography>
          {totalItems > 0 && (
            <Chip
              label={totalItems}
              color="error"
              size="small"
            />
          )}
        </Box>

        {totalItems === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              All caught up!
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {/* Overdue Milestones */}
            {overdueMilestones.slice(0, 3).map((milestone) => (
              <ListItem
                key={milestone.id}
                disablePadding
                sx={{
                  cursor: 'pointer',
                  borderRadius: 1,
                  mb: 1,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
                onClick={() => navigate(`/dashboard/projects/${milestone.projectId}?tab=milestones`)}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'error.main' }}>
                    <MilestoneIcon />
                  </Avatar>
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {milestone.name}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WarningIcon sx={{ fontSize: 14, color: 'error.main' }} />
                      <Typography variant="caption" color="error.main">
                        Overdue since {format(new Date(milestone.dueDate), 'MMM d')}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}

            {/* Pending Approvals */}
            {pendingApprovals.slice(0, 3).map((milestone) => (
              <ListItem
                key={milestone.id}
                disablePadding
                sx={{
                  cursor: 'pointer',
                  borderRadius: 1,
                  mb: 1,
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
                onClick={() => navigate(`/dashboard/projects/${milestone.projectId}?tab=milestones`)}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <MilestoneIcon />
                  </Avatar>
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {milestone.name}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ClockIcon sx={{ fontSize: 14, color: 'warning.main' }} />
                      <Typography variant="caption" color="warning.main">
                        Pending approval
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

// Team Productivity Widget
export const TeamProductivityWidget: React.FC = () => {
  const { dashboardData, loading } = useProjectDashboard();

  if (loading || !dashboardData) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Team Productivity
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            Loading...
          </Box>
        </CardContent>
      </Card>
    );
  }

  const { teamProductivity } = dashboardData;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Team Productivity
        </Typography>

        {teamProductivity.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No productivity data available
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {teamProductivity.slice(0, 5).map((member) => (
              <ListItem key={member.userId} disablePadding sx={{ mb: 2 }}>
                <ListItemAvatar>
                  <Avatar>
                    {member.user.firstName?.[0]}{member.user.lastName?.[0]}
                  </Avatar>
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {member.user.firstName} {member.user.lastName}
                    </Typography>
                  }
                  secondary={
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {member.hoursLogged}h logged • {member.tasksCompleted} tasks
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {member.productivity}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={member.productivity}
                        sx={{ height: 4, borderRadius: 2 }}
                      />
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};