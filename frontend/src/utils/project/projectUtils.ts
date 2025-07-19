// frontend/src/utils/project/projectUtils.ts
import { format, differenceInDays, addDays, isAfter, isBefore } from 'date-fns';
import {
  ProjectStatus,
  ProjectPriority,
  ProjectType,
  ProjectPhase,
  PROJECT_STATUS_LABELS,
  PROJECT_PRIORITY_LABELS,
  PROJECT_TYPE_LABELS,
  PROJECT_PHASE_LABELS,
} from '../../shared/enums/project';
import { Project } from '../../types/project';

// ==================== DATE UTILITIES ====================

export const formatProjectDate = (date: string | Date, formatStr: string = 'MMM d, yyyy'): string => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, formatStr);
  } catch (error) {
    return 'Invalid date';
  }
};

export const calculateProjectDuration = (startDate: string, endDate?: string): number => {
  try {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    return differenceInDays(end, start);
  } catch (error) {
    return 0;
  }
};

export const isProjectOverdue = (endDate: string | null, status: ProjectStatus): boolean => {
  if (!endDate || status === ProjectStatus.COMPLETED || status === ProjectStatus.CANCELLED) {
    return false;
  }
  return isAfter(new Date(), new Date(endDate));
};

export const getDaysUntilDeadline = (endDate: string): number => {
  try {
    return differenceInDays(new Date(endDate), new Date());
  } catch (error) {
    return 0;
  }
};

// ==================== CURRENCY UTILITIES ====================

export const formatCurrency = (amount: number, currency: string = 'ZAR'): string => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatCurrencyCompact = (amount: number, currency: string = 'ZAR'): string => {
  if (amount >= 1000000) {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  }
  return formatCurrency(amount, currency);
};

// ==================== PROJECT STATUS UTILITIES ====================

export const getProjectStatusColor = (status: ProjectStatus): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' => {
  const statusColorMap: Record<ProjectStatus, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
    [ProjectStatus.PLANNING]: 'info',
    [ProjectStatus.ACTIVE]: 'primary',
    [ProjectStatus.ON_HOLD]: 'warning',
    [ProjectStatus.REVIEW]: 'secondary',
    [ProjectStatus.COMPLETED]: 'success',
    [ProjectStatus.CANCELLED]: 'error',
  };
  return statusColorMap[status] || 'default';
};

export const getProjectPriorityColor = (priority: ProjectPriority): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' => {
  const priorityColorMap: Record<ProjectPriority, 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = {
    [ProjectPriority.LOW]: 'success',
    [ProjectPriority.MEDIUM]: 'info',
    [ProjectPriority.HIGH]: 'warning',
    [ProjectPriority.CRITICAL]: 'error',
  };
  return priorityColorMap[priority] || 'default';
};

export const canTransitionStatus = (currentStatus: ProjectStatus, targetStatus: ProjectStatus): boolean => {
  const validTransitions: Record<ProjectStatus, ProjectStatus[]> = {
    [ProjectStatus.PLANNING]: [ProjectStatus.ACTIVE, ProjectStatus.ON_HOLD, ProjectStatus.CANCELLED],
    [ProjectStatus.ACTIVE]: [ProjectStatus.ON_HOLD, ProjectStatus.REVIEW, ProjectStatus.COMPLETED, ProjectStatus.CANCELLED],
    [ProjectStatus.ON_HOLD]: [ProjectStatus.ACTIVE, ProjectStatus.CANCELLED],
    [ProjectStatus.REVIEW]: [ProjectStatus.ACTIVE, ProjectStatus.COMPLETED, ProjectStatus.CANCELLED],
    [ProjectStatus.COMPLETED]: [], // Completed projects cannot transition
    [ProjectStatus.CANCELLED]: [], // Cancelled projects cannot transition
  };

  return validTransitions[currentStatus]?.includes(targetStatus) || false;
};

// ==================== PROJECT CALCULATIONS ====================

export const calculateProjectProgress = (project: Project): {
  timeProgress: number;
  budgetProgress: number;
  overallProgress: number;
} => {
  // Time progress
  let timeProgress = 0;
  if (project.startDate && project.endDate) {
    const totalDuration = calculateProjectDuration(project.startDate, project.endDate);
    const elapsedDuration = calculateProjectDuration(project.startDate);
    timeProgress = totalDuration > 0 ? Math.min((elapsedDuration / totalDuration) * 100, 100) : 0;
  }

  // Budget progress (hours logged vs estimated)
  const budgetProgress = project.estimatedHours > 0 
    ? (project.actualHours / project.estimatedHours) * 100 
    : 0;

  // Overall progress (from project data)
  const overallProgress = project.completionPercentage;

  return {
    timeProgress: Math.round(timeProgress),
    budgetProgress: Math.round(budgetProgress),
    overallProgress: Math.round(overallProgress),
  };
};

export const calculateProjectHealth = (project: Project): 'healthy' | 'warning' | 'critical' => {
  const { timeProgress, budgetProgress, overallProgress } = calculateProjectProgress(project);
  const isOverdue = project.endDate ? isProjectOverdue(project.endDate, project.status) : false;

  // Critical conditions
  if (isOverdue || budgetProgress > 150 || (timeProgress > 75 && overallProgress < 50)) {
    return 'critical';
  }

  // Warning conditions
  if (budgetProgress > 100 || (timeProgress > 50 && overallProgress < 25)) {
    return 'warning';
  }

  return 'healthy';
};

export const estimateProjectCompletion = (project: Project): Date | null => {
  if (project.status === ProjectStatus.COMPLETED || project.completionPercentage === 0) {
    return null;
  }

  try {
    const dailyProgress = project.completionPercentage / calculateProjectDuration(project.startDate);
    const remainingProgress = 100 - project.completionPercentage;
    const estimatedDaysRemaining = remainingProgress / dailyProgress;
    
    return addDays(new Date(), estimatedDaysRemaining);
  } catch (error) {
    return null;
  }
};

// ==================== FILTERING AND SORTING ====================

export const filterProjects = (
  projects: Project[],
  filters: {
    search?: string;
    status?: ProjectStatus[];
    priority?: ProjectPriority[];
    type?: ProjectType[];
    phase?: ProjectPhase[];
    clientId?: string;
    overdue?: boolean;
  }
): Project[] => {
  return projects.filter(project => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const searchableText = [
        project.name,
        project.description,
        project.projectNumber,
        project.client?.companyName,
        ...(project.tags || []),
      ].join(' ').toLowerCase();
      
      if (!searchableText.includes(searchTerm)) {
        return false;
      }
    }

    // Status filter
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(project.status)) {
        return false;
      }
    }

    // Priority filter
    if (filters.priority && filters.priority.length > 0) {
      if (!filters.priority.includes(project.priority)) {
        return false;
      }
    }

    // Type filter
    if (filters.type && filters.type.length > 0) {
      if (!filters.type.includes(project.type)) {
        return false;
      }
    }

    // Phase filter
    if (filters.phase && filters.phase.length > 0) {
      if (!filters.phase.includes(project.phase)) {
        return false;
      }
    }

    // Client filter
    if (filters.clientId) {
      if (project.clientId !== filters.clientId) {
        return false;
      }
    }

    // Overdue filter
    if (filters.overdue) {
      if (!isProjectOverdue(project.endDate, project.status)) {
        return false;
      }
    }

    return true;
  });
};

export const sortProjects = (
  projects: Project[],
  sortBy: 'name' | 'createdAt' | 'updatedAt' | 'startDate' | 'endDate' | 'budget' | 'priority' | 'status',
  sortOrder: 'asc' | 'desc' = 'desc'
): Project[] => {
  return [...projects].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'updatedAt':
        comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
      case 'startDate':
        comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        break;
      case 'endDate':
        const aEndDate = a.endDate ? new Date(a.endDate).getTime() : 0;
        const bEndDate = b.endDate ? new Date(b.endDate).getTime() : 0;
        comparison = aEndDate - bEndDate;
        break;
      case 'budget':
        comparison = a.budget - b.budget;
        break;
      case 'priority':
        const priorityOrder = [ProjectPriority.LOW, ProjectPriority.MEDIUM, ProjectPriority.HIGH, ProjectPriority.CRITICAL];
        comparison = priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority);
        break;
      case 'status':
        const statusOrder = [ProjectStatus.PLANNING, ProjectStatus.ACTIVE, ProjectStatus.REVIEW, ProjectStatus.ON_HOLD, ProjectStatus.COMPLETED, ProjectStatus.CANCELLED];
        comparison = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
        break;
      default:
        comparison = 0;
    }

    return sortOrder === 'desc' ? -comparison : comparison;
  });
};

// ==================== VALIDATION UTILITIES ====================

export const validateProjectDates = (startDate: string, endDate?: string): string | null => {
  try {
    const start = new Date(startDate);
    
    if (isBefore(start, new Date())) {
      return 'Start date cannot be in the past';
    }

    if (endDate) {
      const end = new Date(endDate);
      if (isBefore(end, start)) {
        return 'End date must be after start date';
      }
    }

    return null;
  } catch (error) {
    return 'Invalid date format';
  }
};

export const validateProjectBudget = (budget: number, hourlyRate?: number, estimatedHours?: number): string | null => {
  if (budget <= 0) {
    return 'Budget must be greater than zero';
  }

  if (budget > 10000000) {
    return 'Budget cannot exceed R10,000,000';
  }

  if (hourlyRate && estimatedHours) {
    const estimatedCost = hourlyRate * estimatedHours;
    if (budget < estimatedCost * 0.5) {
      return 'Budget seems too low for estimated hours and rate';
    }
  }

  return null;
};

// ==================== EXPORT UTILITIES ====================

export const exportProjectToCSV = (projects: Project[]): string => {
  const headers = [
    'Project Number',
    'Name',
    'Status',
    'Priority',
    'Type',
    'Phase',
    'Client',
    'Start Date',
    'End Date',
    'Budget',
    'Estimated Hours',
    'Actual Hours',
    'Completion %',
    'Created At'
  ];

  const rows = projects.map(project => [
    project.projectNumber,
    project.name,
    PROJECT_STATUS_LABELS[project.status],
    PROJECT_PRIORITY_LABELS[project.priority],
    PROJECT_TYPE_LABELS[project.type],
    PROJECT_PHASE_LABELS[project.phase],
    project.client?.companyName || '',
    formatProjectDate(project.startDate, 'yyyy-MM-dd'),
    project.endDate ? formatProjectDate(project.endDate, 'yyyy-MM-dd') : '',
    project.budget.toString(),
    project.estimatedHours.toString(),
    project.actualHours.toString(),
    project.completionPercentage.toString(),
    formatProjectDate(project.createdAt, 'yyyy-MM-dd HH:mm')
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  return csvContent;
};

// ==================== URL UTILITIES ====================

export const buildProjectsUrl = (filters: {
  search?: string;
  status?: ProjectStatus[];
  priority?: ProjectPriority[];
  type?: ProjectType[];
  phase?: ProjectPhase[];
  page?: number;
}): string => {
  const params = new URLSearchParams();
  
  if (filters.search) params.set('search', filters.search);
  if (filters.status?.length) filters.status.forEach(s => params.append('status', s));
  if (filters.priority?.length) filters.priority.forEach(p => params.append('priority', p));
  if (filters.type?.length) filters.type.forEach(t => params.append('type', t));
  if (filters.phase?.length) filters.phase.forEach(ph => params.append('phase', ph));
  if (filters.page && filters.page > 1) params.set('page', filters.page.toString());

  const queryString = params.toString();
  return `/dashboard/projects${queryString ? `?${queryString}` : ''}`;
};