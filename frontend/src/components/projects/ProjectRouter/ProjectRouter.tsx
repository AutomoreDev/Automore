// frontend/src/components/projects/ProjectRouter/ProjectRouter.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/auth/AuthContext';
import { ProjectsList } from '../ProjectsList/ProjectsList';
import { ProjectDetail } from '../ProjectDetail/ProjectDetail';
import { CreateProject, EditProject } from '../ProjectForm/ProjectForm';

export const ProjectRouter: React.FC = () => {
  const { user, hasRole } = useAuth();

  // Check if user has access to projects
  const canViewProjects = hasRole(['BUSINESS_ADMIN', 'BUSINESS_USER', 'CLIENT_ADMIN', 'CLIENT_USER']);
  const canCreateProjects = hasRole(['BUSINESS_ADMIN', 'BUSINESS_USER']);

  if (!canViewProjects) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <Routes>
      {/* Projects List */}
      <Route path="/" element={<ProjectsList />} />
      
      {/* Create New Project - Business users only */}
      {canCreateProjects && (
        <Route path="/new" element={<CreateProject />} />
      )}
      
      {/* Edit Project - Business users only */}
      {canCreateProjects && (
        <Route path="/:id/edit" element={<EditProject />} />
      )}
      
      {/* Project Detail */}
      <Route path="/:id" element={<ProjectDetail />} />
      
      {/* Catch all - redirect to projects list */}
      <Route path="*" element={<Navigate to="/dashboard/projects" replace />} />
    </Routes>
  );
};