// frontend/src/components/dashboard/ClientDashboard/ClientDashboard.tsx
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
  Person,
  Assignment,
  Support,
  Payment,
  Add,
  CheckCircle,
  ContactSupport,
  Receipt,
} from '@mui/icons-material';
import { useAuth } from '../../../context/auth/AuthContext';
import { AppLayout } from '../../common/Layout/AppLayout';

// Remove dummy data - these will be loaded from API
const clientStats = [
  { label: 'Active Projects', value: '--', icon: <Assignment />, color: 'primary' as const },
  { label: 'Open Support Tickets', value: '--', icon: <Support />, color: 'warning' as const },
  { label: 'Pending Invoices', value: '--', icon: <Payment />, color: 'error' as const },
  { label: 'Completed Milestones', value: '--', icon: <CheckCircle />, color: 'success' as const }
];

export const ClientDashboard: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();

  // Get service provider - determine based on user's company context
  const getServiceProvider = () => {
    // For client users, they might be serviced by a business/partner or directly by Automore
    if (user?.companyName) {
      // If they have a company name but are CLIENT role, they're likely serviced by that company
      if (user.role === 'CLIENT_ADMIN' || user.role === 'CLIENT_USER') {
        return user.companyName;
      }
      return user.companyName;
    }
    // Default fallback
    return 'Automore';
  };

  const serviceProvider = getServiceProvider();

  return (
    <AppLayout>
      <Box sx={{ width: '100%' }}>
        {/* Client Header */}
        <Paper sx={{ 
          p: 3, 
          mb: 3, 
          background: 'linear-gradient(135deg, #7b1fa2 0%, #8e24aa 100%)', 
          color: 'white',
          borderRadius: 2,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'white', color: 'primary.main', width: 64, height: 64 }}>
                <Person fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h3" fontWeight="bold" gutterBottom>
                  Welcome, {user?.firstName}!
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Track your projects and support
                </Typography>
              </Box>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Chip 
                label="CLIENT" 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white', 
                  fontWeight: 'bold', 
                  mb: 1 
                }}
              />
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Serviced by {serviceProvider}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Client Statistics */}
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 3, 
          mb: 3 
        }}>
          {clientStats.map((stat, index) => (
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
          {/* Projects Overview */}
          <Box sx={{ 
            flex: { xs: '1 1 100%', md: '1 1 66.666%' },
            minWidth: 0
          }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Your Projects
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  Track the progress of your ongoing projects
                </Typography>
                
                {/* Placeholder for projects list */}
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
                    Project tracking interface will be integrated here
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Client Actions */}
          <Box sx={{ 
            flex: { xs: '1 1 100%', md: '1 1 33.333%' },
            minWidth: 0
          }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    fullWidth
                    size="large"
                    color="primary"
                  >
                    New Support Request
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Assignment />}
                    fullWidth
                  >
                    View All Projects
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Receipt />}
                    fullWidth
                  >
                    View Invoices
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ContactSupport />}
                    fullWidth
                  >
                    Contact Support
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Updates and Invoice Status */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: 3 
        }}>
          {/* Recent Updates */}
          <Box sx={{ 
            flex: { xs: '1 1 100%', md: '1 1 50%' },
            minWidth: 0
          }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Recent Updates
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  Latest updates from your projects and support requests
                </Typography>
                
                {/* Placeholder for updates list */}
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
                    Recent updates feed will be integrated here
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Invoice Status */}
          <Box sx={{ 
            flex: { xs: '1 1 100%', md: '1 1 50%' },
            minWidth: 0
          }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Invoice Status
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  Outstanding invoices and payment history
                </Typography>
                
                {/* Placeholder for invoice status */}
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
                    Invoice status dashboard will be integrated here
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