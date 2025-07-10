import React from 'react';
import { Box, Container, useTheme } from '@mui/material';
import { Header } from '../Header/Header';
import { Sidebar } from '../Sidebar/Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  showSidebar = false 
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      backgroundColor: theme.palette.background.default 
    }}>
      {showSidebar && <Sidebar />}
      
      <Box sx={{ 
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Header />
        
        <Container 
          maxWidth="xl" 
          sx={{ 
            flexGrow: 1, 
            py: 3,
            px: { xs: 2, sm: 3 }
          }}
        >
          {children}
        </Container>
      </Box>
    </Box>
  );
};