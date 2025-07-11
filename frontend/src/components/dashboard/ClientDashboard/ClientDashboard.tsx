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
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Person,
  Assignment,
  Support,
  Payment,
  Add,
  CheckCircle,
  Schedule,
  Warning
} from '@mui/icons-material';
import { useAuth } from '../../../context/auth/AuthContext';

const clientStats = [
  { label: 'Active Projects', value: '3', icon: <Assignment />, color: 'primary' },
  { label: 'Open Support Tickets', value: '1', icon: <Support />, color: 'warning' },
  { label: 'Pending Invoices', value: '2', icon: <Payment />, color: 'error' },
  { label: 'Completed Milestones', value: '12', icon: <CheckCircle />, color: 'success' }
];

const clientProjects = [
  { 
    name: 'Website Development', 
    progress: 75, 
    status: 'In Progress', 
    dueDate: '2025-02-15',
    provider: 'Digital Solutions SA'
  },
  { 
    name: 'Mobile App Design', 
    progress: 40, 
    status: 'In Progress', 
    dueDate: '2025-03-01',
    provider: 'Digital Solutions SA'
  },
  { 
    name: 'Brand Guidelines', 
    progress: 100, 
    status: 'Completed', 
    dueDate: '2024-12-20',
    provider: 'Automore Direct'
  }
];

const recentUpdates = [
  { 
    type: 'project', 
    message: 'Website Development: New mockups uploaded by Digital Solutions SA', 
    time: '2 hours ago' 
  },
  { 
    type: 'ticket', 
    message: 'Support Ticket #T-456: Response received from your provider', 
    time: '1 day ago' 
  },
  { 
    type: 'invoice', 
    message: 'Invoice #INV-002: Payment reminder - Due in 3 days', 
    time: '2 days ago' 
  },
  { 
    type: 'project', 
    message: 'Mobile App Design: Milestone completed ahead of schedule', 
    time: '3 days ago' 
  }
];

export const ClientDashboard: React.FC = () => {
  const { user } = useAuth();

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case 'project': return <Assignment color="primary" />;
      case 'ticket': return <Support color="warning" />;
      case 'invoice': return <Payment color="error" />;
      default: return <Schedule color="action" />;
    }
  };

  // Determine service provider (could be Automore direct or a partner)
  const serviceProvider = user?.companyName || 'Automore';

  return (
    <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh', py: 3 }}>
      <Container maxWidth="lg">
        {/* Client Header */}
        <Paper sx={{ 
          p: 3, 
          mb: 3, 
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', 
          color: 'white' 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'white', color: 'primary.main', width: 56, height: 56 }}>
              <Person fontSize="large" />
            </Avatar>
            <Box>
              <Typography variant="h3" fontWeight="bold">
                Client Portal
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Welcome, {user?.firstName}! • Track your projects and support
              </Typography>
            </Box>
            <Box sx={{ ml: 'auto', textAlign: 'right' }}>
              <Chip 
                label="CLIENT" 
                sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 'bold', mb: 1 }}
              />
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Serviced by {serviceProvider}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Client Stats - Using CSS Grid */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
          gap: 3,
          mb: 3 
        }}>
          {clientStats.map((stat, index) => (
            <Card key={index}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: `${stat.color}.main`, color: 'white' }}>
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stat.value}
                    </Typography>
                    <Typography color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Box>
                </Box>
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
          {/* Projects & Updates */}
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Your Projects
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  Track the progress of your ongoing projects
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {clientProjects.map((project, index) => (
                    <Box key={index}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box>
                          <Typography variant="body1" fontWeight="bold">
                            {project.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Due: {new Date(project.dueDate).toLocaleDateString('en-ZA')} • 
                            Provider: {project.provider}
                          </Typography>
                        </Box>
                        <Chip 
                          label={project.status} 
                          color={project.status === 'Completed' ? 'success' : 'primary'}
                          size="small"
                          icon={project.status === 'Completed' ? <CheckCircle /> : <Schedule />}
                        />
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={project.progress} 
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {project.progress}% Complete
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Recent Updates */}
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Recent Updates
                </Typography>
                <List>
                  {recentUpdates.map((update, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        {getUpdateIcon(update.type)}
                      </ListItemIcon>
                      <ListItemText 
                        primary={update.message}
                        secondary={update.time}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Box>

          {/* Client Actions */}
          <Box>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    fullWidth
                    size="large"
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
                    startIcon={<Payment />}
                    fullWidth
                  >
                    Pay Outstanding Invoices
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Support />}
                    fullWidth
                  >
                    Support History
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Outstanding Invoices Alert */}
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Warning color="error" />
                  <Typography variant="h6" fontWeight="bold">
                    Payment Required
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  You have outstanding invoices requiring payment
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {[
                    { id: 'INV-002', amount: 'R12,500', due: '2025-01-15', provider: 'Digital Solutions SA' },
                    { id: 'INV-003', amount: 'R8,200', due: '2025-01-22', provider: 'Automore Direct' }
                  ].map((invoice, index) => (
                    <Paper key={index} sx={{ p: 2, bgcolor: 'error.50', border: 1, borderColor: 'error.200' }}>
                      <Typography variant="body2" fontWeight="bold">
                        {invoice.id} - {invoice.amount}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Due: {invoice.due} • {invoice.provider}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
                <Button 
                  variant="contained" 
                  color="error" 
                  fullWidth 
                  sx={{ mt: 2 }}
                  startIcon={<Payment />}
                >
                  Pay Now - R20,700
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};