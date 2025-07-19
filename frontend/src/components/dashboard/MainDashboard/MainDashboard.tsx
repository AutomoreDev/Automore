// frontend/src/components/dashboard/MainDashboard/MainDashboard.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { AppLayout } from '../../common/Layout/AppLayout';
import { ProjectRouter } from '../../projects/ProjectRouter/ProjectRouter';
import { TicketRouter } from '../../tickets/TicketRouter/TicketRouter';
import {
  ProjectStatsCard,
  ActiveProjectsWidget,
  RecentProjectsWidget,
  OverdueItemsWidget,
  TeamProductivityWidget
} from '../../projects/ProjectDashboard/ProjectDashboardWidgets';

// Main Dashboard Home
const MainDashboardHome: React.FC = () => {
  return (
    <AppLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            System Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Platform-wide overview and management
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Project Overview */}
          <Box sx={{ width: '100%' }}>
            <ProjectStatsCard />
          </Box>
          
          {/* Active Projects and Recent Activity */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            gap: 3 
          }}>
            <Box sx={{ flex: 1 }}>
              <ActiveProjectsWidget />
            </Box>
            <Box sx={{ flex: 1 }}>
              <RecentProjectsWidget />
            </Box>
          </Box>
          
          {/* Attention Required and Team Productivity */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            gap: 3 
          }}>
            <Box sx={{ flex: 1 }}>
              <OverdueItemsWidget />
            </Box>
            <Box sx={{ flex: 1 }}>
              <TeamProductivityWidget />
            </Box>
          </Box>
          
          {/* System Stats */}
          <Box sx={{ width: '100%' }}>
            <Box sx={{
              p: 3,
              textAlign: 'center',
              bgcolor: 'background.paper',
              borderRadius: 2,
              border: 1,
              borderColor: 'divider'
            }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                System Administration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Partner management, user administration, and system settings will be added in future sprints.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </AppLayout>
  );
};

export const MainDashboard: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<MainDashboardHome />} />
      <Route path="/projects/*" element={<ProjectRouter />} />
      <Route path="/tickets/*" element={<TicketRouter />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};