// frontend/src/components/common/Sidebar/Sidebar.tsx
import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Typography,
  Box,
  IconButton,
  useTheme,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ConfirmationNumber as TicketIcon,
  Folder as ProjectIcon,
  Receipt as InvoiceIcon,
  Description as DocumentIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  ChevronLeft as CollapseIcon,
  ChevronRight as ExpandIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/auth/AuthContext';
import { UserRole } from '../../../shared/types/user';

const DRAWER_WIDTH = 280;
const COLLAPSED_WIDTH = 64;

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles?: UserRole[];
}

interface SidebarProps {
  open?: boolean;
  onToggle?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  open: controlledOpen, 
  onToggle 
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [internalOpen, setInternalOpen] = useState(true);
  
  // Use controlled state if provided, otherwise use internal state
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const handleToggle = onToggle || (() => setInternalOpen(!internalOpen));

  // Navigation items based on user role
  const getNavItems = (): NavItem[] => {
    const baseItems: NavItem[] = [
      {
        label: 'Dashboard',
        path: '/dashboard',
        icon: <DashboardIcon />,
      },
    ];

    // Role-specific navigation items
    if (user?.role === UserRole.SYSTEM_ADMIN) {
      return [
        ...baseItems,
        {
          label: 'Platform Analytics',
          path: '/analytics',
          icon: <AnalyticsIcon />,
          roles: [UserRole.SYSTEM_ADMIN],
        },
        {
          label: 'Partner Management',
          path: '/partners',
          icon: <BusinessIcon />,
          roles: [UserRole.SYSTEM_ADMIN],
        },
        {
          label: 'System Settings',
          path: '/admin/settings',
          icon: <SettingsIcon />,
          roles: [UserRole.SYSTEM_ADMIN],
        },
        {
          label: 'Admin Panel',
          path: '/admin',
          icon: <AdminIcon />,
          roles: [UserRole.SYSTEM_ADMIN],
        },
      ];
    }

    if ([UserRole.BUSINESS_ADMIN, UserRole.BUSINESS_USER, UserRole.PARTNER_ADMIN, UserRole.PARTNER_USER].includes(user?.role as UserRole)) {
      return [
        ...baseItems,
        {
          label: 'Client Management',
          path: '/clients',
          icon: <PeopleIcon />,
          roles: [UserRole.BUSINESS_ADMIN, UserRole.PARTNER_ADMIN],
        },
        {
          label: 'Projects',
          path: '/projects',
          icon: <ProjectIcon />,
        },
        {
          label: 'Support Tickets',
          path: '/tickets',
          icon: <TicketIcon />,
        },
        {
          label: 'Invoices',
          path: '/invoices',
          icon: <InvoiceIcon />,
        },
        {
          label: 'Documents',
          path: '/documents',
          icon: <DocumentIcon />,
        },
      ];
    }

    // Client role navigation
    return [
      ...baseItems,
      {
        label: 'My Projects',
        path: '/projects',
        icon: <ProjectIcon />,
      },
      {
        label: 'Support',
        path: '/tickets',
        icon: <TicketIcon />,
      },
      {
        label: 'Invoices',
        path: '/invoices',
        icon: <InvoiceIcon />,
      },
      {
        label: 'Documents',
        path: '/documents',
        icon: <DocumentIcon />,
      },
    ];
  };

  const navItems = getNavItems();

  const renderNavItem = (item: NavItem) => {
    const isActive = location.pathname === item.path || 
                    (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
    
    const listItemButton = (
      <ListItemButton
        onClick={() => navigate(item.path)}
        sx={{
          mx: 1,
          borderRadius: 2,
          minHeight: 48,
          justifyContent: isOpen ? 'initial' : 'center',
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
          transition: 'all 0.2s ease-in-out',
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            mr: isOpen ? 2 : 'auto',
            justifyContent: 'center',
            color: isActive 
              ? theme.palette.primary.contrastText 
              : theme.palette.text.primary,
          }}
        >
          {item.icon}
        </ListItemIcon>
        <ListItemText 
          primary={item.label} 
          sx={{ 
            opacity: isOpen ? 1 : 0,
            transition: 'opacity 0.2s ease-in-out',
          }} 
        />
      </ListItemButton>
    );

    if (!isOpen) {
      return (
        <Tooltip key={item.path} title={item.label} placement="right">
          <ListItem disablePadding>
            {listItemButton}
          </ListItem>
        </Tooltip>
      );
    }

    return (
      <ListItem key={item.path} disablePadding>
        {listItemButton}
      </ListItem>
    );
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: isOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        '& .MuiDrawer-paper': {
          width: isOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: isOpen ? 'space-between' : 'center',
        p: 2,
        minHeight: 64,
      }}>
        {isOpen && (
          <Typography
            variant="h6"
            sx={{
              color: theme.palette.primary.main,
              fontWeight: 600,
              fontSize: '20px',
            }}
          >
            Automore
          </Typography>
        )}
        <IconButton 
          onClick={handleToggle}
          sx={{
            color: theme.palette.text.primary,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          }}
        >
          {isOpen ? <CollapseIcon /> : <ExpandIcon />}
        </IconButton>
      </Box>

      <Divider />

      {/* User Info */}
      {isOpen && user && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Welcome back,
          </Typography>
          <Typography variant="subtitle2" fontWeight="bold">
            {user.firstName} {user.lastName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user.role.replace('_', ' ')}
          </Typography>
        </Box>
      )}

      <Divider />

      {/* Navigation Items */}
      <List sx={{ flexGrow: 1, pt: 1 }}>
        {navItems.map(renderNavItem)}
      </List>
    </Drawer>
  );
};