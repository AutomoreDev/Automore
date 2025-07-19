// frontend/src/components/dashboard/BusinessDashboard/BusinessDashboard.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent } from '@mui/material';
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

// Business Dashboard Home
const BusinessDashboardHome: React.FC = () => {
  return (
    <AppLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Business Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your clients, projects, and business operations
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Project Overview */}
          <Box sx={{ width: '100%' }}>
            <ProjectStatsCard />
          </Box>
          
          {/* Active Projects and Attention Required */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', lg: 'row' }, 
            gap: 3 
          }}>
            <Box sx={{ flex: { xs: '1', lg: '2' } }}>
              <ActiveProjectsWidget />
            </Box>
            <Box sx={{ flex: { xs: '1', lg: '1' } }}>
              <OverdueItemsWidget />
            </Box>
          </Box>
          
          {/* Recent Activity and Team Productivity */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            gap: 3 
          }}>
            <Box sx={{ flex: 1 }}>
              <RecentProjectsWidget />
            </Box>
            <Box sx={{ flex: 1 }}>
              <TeamProductivityWidget />
            </Box>
          </Box>
          
          {/* Client Management and Revenue Overview */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            gap: 3 
          }}>
            <Box sx={{ flex: 1 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Client Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Client management features will be implemented in future sprints.
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Revenue Overview
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Revenue tracking and financial reports will be implemented in future sprints.
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>
      </Box>
    </AppLayout>
  );
};

export const BusinessDashboard: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<BusinessDashboardHome />} />
      <Route path="/projects/*" element={<ProjectRouter />} />
      <Route path="/tickets/*" element={<TicketRouter />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};