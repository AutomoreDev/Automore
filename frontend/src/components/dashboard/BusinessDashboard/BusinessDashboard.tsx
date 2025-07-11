import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Paper,
  Avatar,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Business,
  People,
  Assignment,
  TrendingUp,
  AttachMoney,
  Add,
  Support,
  Receipt
} from '@mui/icons-material';
import { useAuth } from '../../../context/auth/AuthContext';

// Partner company stats
const partnerStats = [
  { label: 'Your Clients', value: '23', icon: <People />, color: 'primary', growth: '+3 this month' },
  { label: 'Active Projects', value: '31', icon: <Assignment />, color: 'success', growth: '+7 this month' },
  { label: 'Open Support Tickets', value: '5', icon: <Support />, color: 'warning', growth: '-2 resolved' },
  { label: 'Monthly Revenue', value: 'R124,800', icon: <AttachMoney />, color: 'info', growth: '+18% vs last month' }
];

// Partner's client list
const partnerClients = [
  { name: 'Acme Corporation', projects: 3, tickets: 1, status: 'Active', lastActivity: '2 hours ago' },
  { name: 'TechStart Solutions', projects: 2, tickets: 0, status: 'Active', lastActivity: '1 day ago' },
  { name: 'Cape Verde Consulting', projects: 4, tickets: 2, status: 'Active', lastActivity: '3 hours ago' },
  { name: 'Innovation Labs', projects: 1, tickets: 0, status: 'Onboarding', lastActivity: '5 days ago' }
];

const recentActivities = [
  'New client "Acme Corporation" onboarded successfully',
  'Project "Website Redesign" completed for TechStart Solutions', 
  'Invoice #INV-045 sent to Cape Verde Consulting',
  'Support ticket resolved for Innovation Labs',
  'Monthly performance report generated'
];

export const BusinessDashboard: React.FC = () => {
  const { user } = useAuth();

  // Get company name from user context or default
  const companyName = user?.companyName || 'Your Company';

  return (
    <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh', py: 3 }}>
      <Container maxWidth="xl">
        {/* Partner Company Header */}
        <Paper sx={{ 
          p: 3, 
          mb: 3, 
          background: 'linear-gradient(135deg, #2e7d32 0%, #388e3c 100%)', 
          color: 'white' 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'white', color: 'success.main', width: 56, height: 56 }}>
              <Business fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h3" fontWeight="bold">
                {companyName}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Welcome back, {user?.firstName}! • Partner Portal Dashboard
              </Typography>
            </Box>
            <Box sx={{ ml: 'auto', textAlign: 'right' }}>
              <Chip 
                label="PARTNER COMPANY" 
                sx={{ bgcolor: 'white', color: 'success.main', fontWeight: 'bold', mb: 1 }}
              />
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Powered by Automore
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Partner Performance Stats - Using CSS Grid */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
          gap: 3,
          mb: 3 
        }}>
          {partnerStats.map((stat, index) => (
            <Card key={index}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: `${stat.color}.main`, color: 'white' }}>
                    {stat.icon}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h4" fontWeight="bold">
                      {stat.value}
                    </Typography>
                    <Typography color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {stat.growth}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Main Content - Using CSS Grid */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
          gap: 3 
        }}>
          {/* Client Management */}
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Your Clients
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  Manage and monitor your client accounts
                </Typography>
                
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Client Name</strong></TableCell>
                        <TableCell align="center"><strong>Projects</strong></TableCell>
                        <TableCell align="center"><strong>Tickets</strong></TableCell>
                        <TableCell align="center"><strong>Status</strong></TableCell>
                        <TableCell align="center"><strong>Last Activity</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {partnerClients.map((client, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            <Typography variant="body1" fontWeight="bold">
                              {client.name}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip label={client.projects} color="primary" size="small" />
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={client.tickets} 
                              color={client.tickets > 0 ? "warning" : "success"} 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={client.status} 
                              color={client.status === 'Active' ? 'success' : 'info'}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" color="text.secondary">
                              {client.lastActivity}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Recent Activities
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {recentActivities.map((activity, index) => (
                    <Paper key={index} sx={{ p: 2, bgcolor: 'success.50', borderLeft: 4, borderColor: 'success.main' }}>
                      <Typography variant="body2">
                        {activity}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Partner Tools */}
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Client Management
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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

            {/* Revenue Tracking */}
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Revenue Tracking
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">This Month</Typography>
                      <Typography variant="body2" fontWeight="bold">R124,800</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={83} sx={{ height: 8, borderRadius: 4 }} />
                    <Typography variant="caption" color="text.secondary">
                      83% of monthly target (R150,000)
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Platform Fee to Automore
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      R18,720 (15%)
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Your Net Revenue
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="success.main">
                      R106,080
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};