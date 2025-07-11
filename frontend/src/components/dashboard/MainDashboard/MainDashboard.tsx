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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Dashboard,
  Business,
  People,
  TrendingUp,
  AttachMoney,
  Add,
  Analytics,
  Settings
} from '@mui/icons-material';
import { useAuth } from '../../../context/auth/AuthContext';

// Automore platform-wide statistics
const platformStats = [
  { label: 'Partner Companies', value: '47', icon: <Business />, color: 'primary', growth: '+12%' },
  { label: 'Total End Clients', value: '312', icon: <People />, color: 'success', growth: '+28%' },
  { label: 'Monthly Recurring Revenue', value: 'R485,200', icon: <AttachMoney />, color: 'info', growth: '+15%' },
  { label: 'Platform Health', value: '99.2%', icon: <TrendingUp />, color: 'warning', growth: '+0.1%' }
];

// Top partner companies by revenue
const topPartners = [
  { name: 'Digital Solutions SA', clients: 23, revenue: 'R45,600', growth: '+18%' },
  { name: 'Cape Town Consulting', clients: 18, revenue: 'R38,200', growth: '+22%' },
  { name: 'JHB Tech Partners', clients: 15, revenue: 'R32,100', growth: '+8%' },
  { name: 'Innovation Hub', clients: 12, revenue: 'R28,800', growth: '+35%' }
];

const systemActivity = [
  'New partner "Stellenbosch Solutions" onboarded',
  'Monthly revenue target exceeded by 15%',
  'System upgraded - improved performance by 12%',
  'Partner "Digital Solutions SA" added 3 new clients',
  'Payment gateway integration optimized'
];

export const MainDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh', py: 3 }}>
      <Container maxWidth="xl">
        {/* Automore Header */}
        <Paper sx={{ 
          p: 3, 
          mb: 3, 
          background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)', 
          color: 'white' 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'white', color: 'primary.main', width: 56, height: 56 }}>
              <Dashboard fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h3" fontWeight="bold">
                Automore Platform
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Welcome back, {user?.firstName}! • SaaS Platform Administration
              </Typography>
            </Box>
            <Box sx={{ ml: 'auto', textAlign: 'right' }}>
              <Chip 
                label="PLATFORM ADMIN" 
                sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 'bold', mb: 1 }}
              />
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {new Date().toLocaleDateString('en-ZA', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Platform KPIs - Using CSS Grid */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
          gap: 3,
          mb: 3 
        }}>
          {platformStats.map((stat, index) => (
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
                <Chip 
                  label={stat.growth} 
                  color="success" 
                  size="small" 
                  sx={{ fontWeight: 'bold' }}
                />
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
          {/* Top Partners Performance */}
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Top Partner Companies
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  Revenue performance of your B2B partners this month
                </Typography>
                
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Partner Company</strong></TableCell>
                        <TableCell align="center"><strong>Clients</strong></TableCell>
                        <TableCell align="center"><strong>Monthly Revenue</strong></TableCell>
                        <TableCell align="center"><strong>Growth</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {topPartners.map((partner, index) => (
                        <TableRow key={index} hover>
                          <TableCell>
                            <Typography variant="body1" fontWeight="bold">
                              {partner.name}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip label={partner.clients} color="primary" size="small" />
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body1" fontWeight="bold" color="success.main">
                              {partner.revenue}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={partner.growth} 
                              color="success" 
                              size="small" 
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>

            {/* System Activity */}
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Platform Activity
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {systemActivity.map((activity, index) => (
                    <Paper key={index} sx={{ p: 2, bgcolor: 'primary.50', borderLeft: 4, borderColor: 'primary.main' }}>
                      <Typography variant="body2">
                        {activity}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Platform Administration */}
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Platform Management
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    fullWidth
                    size="large"
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
                    Revenue Analytics
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Settings />}
                    fullWidth
                  >
                    Platform Settings
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Revenue Breakdown */}
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Revenue Sources
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Partner Subscriptions</Typography>
                      <Typography variant="body2" fontWeight="bold">R324,800</Typography>
                    </Box>
                    <Box sx={{ bgcolor: 'grey.200', height: 8, borderRadius: 4 }}>
                      <Box sx={{ bgcolor: 'primary.main', height: 8, width: '67%', borderRadius: 4 }} />
                    </Box>
                  </Box>
                  
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Direct Clients</Typography>
                      <Typography variant="body2" fontWeight="bold">R160,400</Typography>
                    </Box>
                    <Box sx={{ bgcolor: 'grey.200', height: 8, borderRadius: 4 }}>
                      <Box sx={{ bgcolor: 'success.main', height: 8, width: '33%', borderRadius: 4 }} />
                    </Box>
                  </Box>

                  <Typography variant="h6" fontWeight="bold" color="primary" sx={{ mt: 1 }}>
                    Total: R485,200/month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};