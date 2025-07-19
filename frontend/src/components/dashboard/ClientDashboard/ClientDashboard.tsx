// frontend/src/components/dashboard/ClientDashboard/ClientDashboard.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { AppLayout } from '../../common/Layout/AppLayout';
import { ProjectRouter } from '../../projects/ProjectRouter/ProjectRouter';
import { TicketRouter } from '../../tickets/TicketRouter/TicketRouter';
import {
  ActiveProjectsWidget,
  RecentProjectsWidget,
  OverdueItemsWidget,
} from '../../projects/ProjectDashboard/ProjectDashboardWidgets';

// Client Dashboard Home
const ClientDashboardHome: React.FC = () => {
  return (
    <AppLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Client Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Track your projects, support tickets, and invoices
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Active Projects and Project Alerts */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            gap: 3 
          }}>
            <Box sx={{ flex: { xs: '1', md: '2' } }}>
              <ActiveProjectsWidget />
            </Box>
            <Box sx={{ flex: { xs: '1', md: '1' } }}>
              <OverdueItemsWidget />
            </Box>
          </Box>
          
          {/* Recent Activity and Support Summary */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            gap: 3 
          }}>
            <Box sx={{ flex: 1 }}>
              <RecentProjectsWidget />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Support Summary
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Support ticket overview will be implemented in future sprints.
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
          
          {/* Invoice Status and Communication Center */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            gap: 3 
          }}>
            <Box sx={{ flex: 1 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Invoice Status
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Invoice tracking will be implemented in future sprints.
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Communication Center
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Project communication tools will be implemented in future sprints.
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

export const ClientDashboard: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<ClientDashboardHome />} />
      <Route path="/projects/*" element={<ProjectRouter />} />
      <Route path="/tickets/*" element={<TicketRouter />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};