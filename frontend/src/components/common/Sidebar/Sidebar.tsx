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
  
  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalOpen(!internalOpen);
    }
  };

  // Navigation items based on user role and SaaS hierarchy
  const getNavigationItems = (): NavItem[] => {
    const commonItems: NavItem[] = [
      {
        label: 'Dashboard',
        path: '/dashboard',
        icon: <DashboardIcon />,
      },
      {
        label: 'Projects',
        path: '/dashboard/projects',
        icon: <ProjectIcon />,
      },
      {
        label: 'Support Tickets',
        path: '/dashboard/tickets',
        icon: <TicketIcon />,
      },
    ];

    // Role-specific items
    const roleSpecificItems: NavItem[] = [];

    if (user?.role === UserRole.SYSTEM_ADMIN) {
      // Automore Level - Full platform access
      roleSpecificItems.push(
        {
          label: 'Partner Management',
          path: '/dashboard/partners',
          icon: <BusinessIcon />,
          roles: [UserRole.SYSTEM_ADMIN],
        },
        {
          label: 'System Analytics',
          path: '/dashboard/analytics',
          icon: <AnalyticsIcon />,
          roles: [UserRole.SYSTEM_ADMIN],
        },
        {
          label: 'Admin Panel',
          path: '/dashboard/admin',
          icon: <AdminIcon />,
          roles: [UserRole.SYSTEM_ADMIN],
        }
      );
    } else if ([UserRole.BUSINESS_ADMIN, UserRole.BUSINESS_USER, UserRole.PARTNER_ADMIN, UserRole.PARTNER_USER].includes(user?.role || '' as UserRole)) {
      // Business/Partner Level - Manage clients and business operations
      roleSpecificItems.push(
        {
          label: 'Client Management',
          path: '/dashboard/clients',
          icon: <PeopleIcon />,
          roles: [UserRole.BUSINESS_ADMIN, UserRole.BUSINESS_USER, UserRole.PARTNER_ADMIN, UserRole.PARTNER_USER],
        },
        {
          label: 'Invoices',
          path: '/dashboard/invoices',
          icon: <InvoiceIcon />,
          roles: [UserRole.BUSINESS_ADMIN, UserRole.BUSINESS_USER, UserRole.PARTNER_ADMIN, UserRole.PARTNER_USER],
        },
        {
          label: 'Documents',
          path: '/dashboard/documents',
          icon: <DocumentIcon />,
          roles: [UserRole.BUSINESS_ADMIN, UserRole.BUSINESS_USER, UserRole.PARTNER_ADMIN, UserRole.PARTNER_USER],
        },
        {
          label: 'Analytics',
          path: '/dashboard/analytics',
          icon: <AnalyticsIcon />,
          roles: [UserRole.BUSINESS_ADMIN, UserRole.BUSINESS_USER, UserRole.PARTNER_ADMIN, UserRole.PARTNER_USER],
        }
      );
    } else if ([UserRole.CLIENT_ADMIN, UserRole.CLIENT_USER].includes(user?.role || '' as UserRole)) {
      // Client Level - View own projects and manage payments
      roleSpecificItems.push(
        {
          label: 'Invoices',
          path: '/dashboard/invoices',
          icon: <InvoiceIcon />,
          roles: [UserRole.CLIENT_ADMIN, UserRole.CLIENT_USER],
        },
        {
          label: 'Documents',
          path: '/dashboard/documents',
          icon: <DocumentIcon />,
          roles: [UserRole.CLIENT_ADMIN, UserRole.CLIENT_USER],
        }
      );
    }

    // Settings (available to all users)
    const settingsItems: NavItem[] = [
      {
        label: 'Settings',
        path: '/dashboard/settings',
        icon: <SettingsIcon />,
      },
    ];

    return [...commonItems, ...roleSpecificItems, ...settingsItems];
  };

  const navigationItems = getNavigationItems();

  // Check if current path matches nav item
  const isActiveItem = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  // Filter items based on user role
  const visibleItems = navigationItems.filter(item => {
    if (!item.roles) return true; // No role restriction
    return item.roles.includes(user?.role || '' as UserRole);
  });

  return (
    <Drawer
      variant="permanent"
      open={isOpen}
      sx={{
        width: isOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH,
        flexShrink: 0,
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        '& .MuiDrawer-paper': {
          width: isOpen ? DRAWER_WIDTH : COLLAPSED_WIDTH,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          overflowX: 'hidden',
          backgroundColor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isOpen ? 'space-between' : 'center',
          p: 2,
          minHeight: 64,
        }}
      >
        {isOpen && (
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Automore Portal
          </Typography>
        )}
        
        <IconButton
          onClick={handleToggle}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          {isOpen ? <CollapseIcon /> : <ExpandIcon />}
        </IconButton>
      </Box>

      <Divider />

      {/* User Info */}
      {isOpen && user && (
        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: 'action.hover',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user.role.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Navigation Items */}
      <List sx={{ flexGrow: 1, px: 1 }}>
        {visibleItems.map((item) => {
          const isActive = isActiveItem(item.path);
          
          const listItem = (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  backgroundColor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'primary.contrastText' : 'text.primary',
                  '&:hover': {
                    backgroundColor: isActive ? 'primary.dark' : 'action.hover',
                  },
                  justifyContent: isOpen ? 'initial' : 'center',
                  px: isOpen ? 2 : 1,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: isOpen ? 2 : 'auto',
                    justifyContent: 'center',
                    color: 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                
                {isOpen && (
                  <ListItemText
                    primary={item.label}
                    sx={{
                      opacity: isOpen ? 1 : 0,
                      '& .MuiListItemText-primary': {
                        fontWeight: isActive ? 600 : 400,
                      },
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );

          // Wrap in tooltip when collapsed
          if (!isOpen) {
            return (
              <Tooltip
                key={item.path}
                title={item.label}
                placement="right"
                arrow
              >
                {listItem}
              </Tooltip>
            );
          }

          return listItem;
        })}
      </List>
    </Drawer>
  );
};