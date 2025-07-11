import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper
} from '@mui/material';
import { Lock, ArrowBack } from '@mui/icons-material';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.50'
      }}
    >
      <Container maxWidth="sm">
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Lock sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
          
          <Typography variant="h3" fontWeight="bold" color="error.main" gutterBottom>
            403
          </Typography>
          
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Access Denied
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            You don't have permission to access this page. This error was handled by your 
            backend error system and routed here automatically.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
            
            <Button
              variant="outlined"
              component={Link}
              to="/dashboard"
            >
              Dashboard
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};