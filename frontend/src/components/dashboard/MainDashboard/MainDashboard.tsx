// frontend/src/components/dashboard/MainDashboard/MainDashboard.tsx
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
  TrendingUp,
  Analytics,
  Add,
  Assessment,
} from '@mui/icons-material';
import { useAuth } from '../../../context/auth/AuthContext';
import { AppLayout } from '../../common/Layout/AppLayout';

// Remove dummy data - these will be loaded from API
const platformStats = [
  { label: 'Total Partners', value: '--', icon: <Business />, color: 'primary' as const, trend: '--' },
  { label: 'Total Clients', value: '--', icon: <People />, color: 'success' as const, trend: '--' },
  { label: 'Platform Revenue', value: '--', icon: <TrendingUp />, color: 'info' as const, trend: '--' },
  { label: 'Active Projects', value: '--', icon: <Assessment />, color: 'warning' as const, trend: '--' }
];

export const MainDashboard: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();

  return (
    <AppLayout>
      <Box sx={{ width: '100%' }}>
        {/* Platform Header */}
        <Paper sx={{ 
          p: 3, 
          mb: 3, 
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', 
          color: 'white',
          borderRadius: 2,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'white', color: 'primary.main', width: 64, height: 64 }}>
              <Business fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h3" fontWeight="bold" gutterBottom>
                Automore Platform
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Welcome back, {user?.firstName}! System Administrator Dashboard
              </Typography>
              <Chip 
                label="SYSTEM ADMIN" 
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

        {/* Platform Statistics */}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 3, 
          mb: 3 
        }}>
          {platformStats.map((stat, index) => (
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
          {/* Platform Overview */}
          <Box sx={{ 
            flex: { xs: '1 1 100%', md: '1 1 66.666%' },
            minWidth: 0
          }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Platform Overview
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  Real-time platform metrics and partner performance will be displayed here
                </Typography>
                
                {/* Placeholder for charts/data */}
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
                    Platform analytics chart will be integrated here
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Platform Management Actions */}
          <Box sx={{ 
            flex: { xs: '1 1 100%', md: '1 1 33.333%' },
            minWidth: 0
          }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Platform Management
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    fullWidth
                    size="large"
                    color="primary"
                  >
                    Onboard New Partner
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Business />}
                    fullWidth
                  >
                    Manage Partners
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<People />}
                    fullWidth
                  >
                    All Clients Overview
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Analytics />}
                    fullWidth
                  >
                    Platform Analytics
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Assessment />}
                    fullWidth
                  >
                    System Reports
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Recent Platform Activity */}
        <Box sx={{ width: '100%' }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Recent Platform Activity
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Latest system events and partner activities
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
                  Real-time activity feed will be integrated here
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </AppLayout>
  );
};