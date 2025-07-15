// frontend/src/components/common/Layout/AppLayout.tsx
import React, { useState } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { Sidebar } from '../Sidebar/Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ 
  children, 
  showSidebar = true 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // On mobile, start collapsed. On desktop, start expanded.
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!showSidebar) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        p: 0
      }}>
        {children}
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      backgroundColor: theme.palette.background.default 
    }}>
      <Sidebar 
        open={sidebarOpen} 
        onToggle={handleSidebarToggle}
      />
      
      <Box sx={{ 
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        transition: theme.transitions.create(['margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        overflow: 'hidden',
      }}>
        <Box sx={{ 
          flexGrow: 1, 
          p: { xs: 2, sm: 3 },
          overflow: 'auto',
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};