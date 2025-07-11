import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/auth/AuthContext';
import { UserRole } from '../../../shared/types/user';

// Your actual dashboard components
import { MainDashboard } from '../MainDashboard/MainDashboard';
import { BusinessDashboard } from '../BusinessDashboard/BusinessDashboard';  
import { ClientDashboard } from '../ClientDashboard/ClientDashboard';

export const DashboardRouter: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  // Route based on your SaaS hierarchy
  const getDashboardComponent = () => {
    switch (user.role) {
      // AUTOMORE LEVEL - Full platform access
      case UserRole.SYSTEM_ADMIN:
        return <MainDashboard />;
      
      // PARTNER/3RD PARTY LEVEL - Platform resellers with their own clients
      case UserRole.BUSINESS_ADMIN:
      case UserRole.BUSINESS_USER:
      case UserRole.PARTNER_ADMIN:
      case UserRole.PARTNER_USER:
        return <BusinessDashboard />;
      
      // END CLIENT LEVEL - Customers of either Automore or Partners
      case UserRole.CLIENT_ADMIN:
      case UserRole.CLIENT_USER:
        return <ClientDashboard />;
      
      default:
        return <Navigate to="/unauthorized" replace />;
    }
  };

  return (
    <Routes>
      <Route path="/*" element={getDashboardComponent()} />
    </Routes>
  );
};