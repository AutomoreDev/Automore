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
import { useAuth } from '../../../hooks/auth/useAuth';

export const Header: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
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
                component={Link} 
                to="/auth/signup"
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