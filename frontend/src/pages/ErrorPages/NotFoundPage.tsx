import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper
} from '@mui/material';
import { SearchOff, ArrowBack, Home } from '@mui/icons-material';

export const NotFoundPage: React.FC = () => {
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
          <SearchOff sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
          
          <Typography variant="h3" fontWeight="bold" color="warning.main" gutterBottom>
            404
          </Typography>
          
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Page Not Found
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Sorry, the page you're looking for doesn't exist.
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
              startIcon={<Home />}
              component={Link}
              to="/"
            >
              Home
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};