import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Typography,
  Box,
  useTheme,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import FolderIcon from '@mui/icons-material/Folder';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DocumentIcon from '@mui/icons-material/Description';
import { useNavigate, useLocation } from 'react-router-dom';

const DRAWER_WIDTH = 240;

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export const Sidebar: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: <DashboardIcon />,
    },
    {
      label: 'Support Tickets',
      path: '/tickets',
      icon: <ConfirmationNumberIcon />,
    },
    {
      label: 'Projects',
      path: '/projects',
      icon: <FolderIcon />,
    },
    {
      label: 'Invoices',
      path: '/invoices',
      icon: <ReceiptIcon />,
    },
    {
      label: 'Documents',
      path: '/documents',
      icon: <DocumentIcon />,
    },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography
          variant="h6"
          sx={{
            color: theme.palette.primary.main,
            fontWeight: 600,
            textAlign: 'center',
          }}
        >
          Automore Portal
        </Typography>
      </Box>

      <List>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  backgroundColor: isActive 
                    ? theme.palette.primary.main 
                    : 'transparent',
                  color: isActive 
                    ? theme.palette.primary.contrastText 
                    : theme.palette.text.primary,
                  '&:hover': {
                    backgroundColor: isActive 
                      ? theme.palette.primary.dark 
                      : theme.palette.action.hover,
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive 
                      ? theme.palette.primary.contrastText 
                      : theme.palette.text.primary,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
};