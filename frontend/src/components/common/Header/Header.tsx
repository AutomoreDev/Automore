// frontend/src/components/common/Header/Header.tsx
import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  useTheme,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/auth/AuthContext'; // Updated import

export const Header: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Updated to use logout instead of signOut

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  const handleGetStarted = () => {
    navigate('/auth/signup');
  };

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        boxShadow: 'none'
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: theme.palette.primary.main,
            fontWeight: 600,
            fontSize: '24px'
          }}
        >
          Automore
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          {user ? (
            <>
              <Button 
                color="inherit" 
                component={Link} 
                to="/dashboard"
              >
                Dashboard
              </Button>
              <Button 
                color="inherit" 
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button 
                color="inherit" 
                component={Link} 
                to="/auth/login"
              >
                Login
              </Button>
              <Button 
                variant="contained" 
                onClick={handleGetStarted}
                sx={{
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: theme.shadows[4],
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                Get Started
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};