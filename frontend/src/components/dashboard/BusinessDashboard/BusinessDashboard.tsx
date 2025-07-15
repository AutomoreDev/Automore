// frontend/src/components/dashboard/BusinessDashboard/BusinessDashboard.tsx
import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Paper,
  Avatar,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Business,
  People,
  Assignment,
  TrendingUp,
  AttachMoney,
  Add,
  Support,
  Receipt,
} from '@mui/icons-material';
import { useAuth } from '../../../context/auth/AuthContext';
import { AppLayout } from '../../common/Layout/AppLayout';

// Remove dummy data - these will be loaded from API
const businessStats = [
  { label: 'Your Clients', value: '--', icon: <People />, color: 'primary' as const, trend: '--' },
  { label: 'Active Projects', value: '--', icon: <Assignment />, color: 'success' as const, trend: '--' },
  { label: 'Open Support Tickets', value: '--', icon: <Support />, color: 'warning' as const, trend: '--' },
  { label: 'Monthly Revenue', value: '--', icon: <AttachMoney />, color: 'info' as const, trend: '--' }
];

export const BusinessDashboard: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();

  // Get company name from user context or default
  const companyName = user?.companyName || 'Your Company';

  return (
    <AppLayout>
      <Box sx={{ width: '100%' }}>
        {/* Business Header */}
        <Paper sx={{ 
          p: 3, 
          mb: 3, 
          background: 'linear-gradient(135deg, #2e7d32 0%, #388e3c 100%)', 
          color: 'white',
          borderRadius: 2,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'white', color: 'success.main', width: 64, height: 64 }}>
              <Business fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                {companyName}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Welcome back, {user?.firstName}! Manage your clients and projects
              </Typography>
              <Chip 
                label={user?.role?.replace('_', ' ') || 'BUSINESS USER'} 
                sx={{ 
                  mt: 1,
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white', 
                  fontWeight: 'bold' 
                }}
              />
            </Box>
          </Box>
        </Paper>

        {/* Business Statistics */}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 3, 
          mb: 3 
        }}>
          {businessStats.map((stat, index) => (
            <Box key={index} sx={{ 
              flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' },
              minWidth: 0
            }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: `${stat.color}.main`, color: 'white' }}>
                      {stat.icon}
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h4" fontWeight="bold" color={`${stat.color}.main`}>
                        {stat.value}
                      </Typography>
                      <Typography color="text.secondary" variant="body2">
                        {stat.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {stat.trend}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>

        {/* Main Content Layout */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: 3, 
          mb: 3 
        }}>
          {/* Client Overview */}
          <Box sx={{ 
            flex: { xs: '1 1 100%', md: '1 1 66.666%' },
            minWidth: 0
          }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Client Overview
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  Overview of your clients and their project status
                </Typography>
                
                {/* Placeholder for client data */}
                <Box sx={{ 
                  height: 300, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  bgcolor: 'grey.50',
                  borderRadius: 1,
                  border: `1px dashed ${theme.palette.divider}`
                }}>
                  <Typography variant="body1" color="text.secondary">
                    Client management table will be integrated here
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Client Management Actions */}
          <Box sx={{ 
            flex: { xs: '1 1 100%', md: '1 1 33.333%' },
            minWidth: 0
          }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Client Management
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    fullWidth
                    size="large"
                    color="success"
                  >
                    Add New Client
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Assignment />}
                    fullWidth
                  >
                    Create Project
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Receipt />}
                    fullWidth
                  >
                    Generate Invoice
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Support />}
                    fullWidth
                  >
                    Support Center
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<TrendingUp />}
                    fullWidth
                  >
                    Performance Reports
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Revenue and Activity */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: 3 
        }}>
          {/* Revenue Tracking */}
          <Box sx={{ 
            flex: { xs: '1 1 100%', md: '1 1 50%' },
            minWidth: 0
          }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Revenue Tracking
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  Monthly revenue trends and projections
                </Typography>
                
                {/* Placeholder for revenue chart */}
                <Box sx={{ 
                  height: 200, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  bgcolor: 'grey.50',
                  borderRadius: 1,
                  border: `1px dashed ${theme.palette.divider}`
                }}>
                  <Typography variant="body1" color="text.secondary">
                    Revenue chart will be integrated here
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Recent Business Activity */}
          <Box sx={{ 
            flex: { xs: '1 1 100%', md: '1 1 50%' },
            minWidth: 0
          }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Recent Activity
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  Latest updates from your business operations
                </Typography>
                
                {/* Placeholder for activity feed */}
                <Box sx={{ 
                  height: 200, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  bgcolor: 'grey.50',
                  borderRadius: 1,
                  border: `1px dashed ${theme.palette.divider}`
                }}>
                  <Typography variant="body1" color="text.secondary">
                    Activity feed will be integrated here
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </AppLayout>
  );
};