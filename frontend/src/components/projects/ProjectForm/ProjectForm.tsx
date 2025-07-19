// frontend/src/components/projects/ProjectForm/ProjectForm.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  InputAdornment,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  AttachMoney as MoneyIcon,
  Schedule as ClockIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { format } from 'date-fns';
import { AppLayout } from '../../common/Layout/AppLayout';
import { useProject, useProjectMutations } from '../../../hooks/projects/useProjects';
import {
  ProjectType,
  ProjectPriority,
  BillingType,
  CreateProjectForm,
} from '../../../types/project';
import {
  PROJECT_TYPE_LABELS,
  PROJECT_PRIORITY_LABELS,
} from '../../../shared/enums/project';

// Validation schema
const projectValidationSchema = Yup.object({
  name: Yup.string()
    .min(3, 'Project name must be at least 3 characters')
    .max(100, 'Project name must not exceed 100 characters')
    .required('Project name is required'),
  description: Yup.string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must not exceed 2000 characters')
    .required('Description is required'),
  type: Yup.string()
    .oneOf(Object.values(ProjectType), 'Invalid project type')
    .required('Project type is required'),
  priority: Yup.string()
    .oneOf(Object.values(ProjectPriority), 'Invalid priority')
    .required('Priority is required'),
  clientId: Yup.string().required('Client is required'),
  startDate: Yup.date().required('Start date is required'),
  endDate: Yup.date().nullable().min(Yup.ref('startDate'), 'End date must be after start date'),
  estimatedHours: Yup.number()
    .min(0.5, 'Estimated hours must be at least 0.5')
    .max(10000, 'Estimated hours must not exceed 10,000')
    .required('Estimated hours is required'),
  budget: Yup.number()
    .min(0, 'Budget must be positive')
    .max(10000000, 'Budget must not exceed R10,000,000')
    .required('Budget is required'),
  billingType: Yup.string()
    .oneOf(Object.values(BillingType), 'Invalid billing type')
    .required('Billing type is required'),
  hourlyRate: Yup.number().when('billingType', {
    is: (val: string) => val === BillingType.HOURLY,
    then: () => Yup.number()
      .min(50, 'Hourly rate must be at least R50')
      .max(5000, 'Hourly rate must not exceed R5,000')
      .required('Hourly rate is required for hourly billing'),
    otherwise: () => Yup.number().nullable(),
  }),
});

interface ProjectFormProps {
  mode: 'create' | 'edit';
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { createProject, updateProject, loading: mutationLoading } = useProjectMutations();

  const [newDeliverable, setNewDeliverable] = useState('');
  const [newTag, setNewTag] = useState('');

  // Fetch existing project data for edit mode
  const { project, loading: projectLoading, error } = useProject(mode === 'edit' ? id || null : null);

  // Form state
  const formik = useFormik<CreateProjectForm>({
    initialValues: {
      name: '',
      description: '',
      type: ProjectType.WEB_DEVELOPMENT,
      priority: ProjectPriority.MEDIUM,
      clientId: '', // This would be populated from a client selector
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: '',
      estimatedHours: 40,
      budget: 10000,
      billingType: BillingType.FIXED_PRICE,
      hourlyRate: 0,
      requirements: '',
      deliverables: [],
      tags: [],
      projectManager: '',
    },
    validationSchema: projectValidationSchema,
    onSubmit: async (values) => {
      try {
        if (mode === 'create') {
          const result = await createProject(values);
          if (result) {
            navigate(`/dashboard/projects/${result.id}`);
          }
        } else if (mode === 'edit' && id) {
          // Convert to UpdateProjectForm by only including defined fields
          const updateData = Object.entries(values).reduce((acc, [key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              acc[key as keyof CreateProjectForm] = value;
            }
            return acc;
          }, {} as any);
          const result = await updateProject(id, updateData);
          if (result) {
            navigate(`/dashboard/projects/${id}`);
          }
        }
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    },
  });

  // Populate form with existing project data
  useEffect(() => {
    if (mode === 'edit' && project) {
      formik.setValues({
        name: project.name,
        description: project.description,
        type: project.type,
        priority: project.priority,
        clientId: project.clientId,
        startDate: format(new Date(project.startDate), 'yyyy-MM-dd'),
        endDate: project.endDate ? format(new Date(project.endDate), 'yyyy-MM-dd') : '',
        estimatedHours: project.estimatedHours,
        budget: project.budget,
        billingType: project.billingType,
        hourlyRate: project.hourlyRate || 0,
        requirements: project.requirements || '',
        deliverables: project.deliverables || [],
        tags: project.tags || [],
        projectManager: project.projectManager || '',
      });
    }
  }, [mode, project, formik]);

  // Handle deliverable management
  const addDeliverable = () => {
    if (newDeliverable.trim()) {
      formik.setFieldValue('deliverables', [...(formik.values.deliverables || []), newDeliverable.trim()]);
      setNewDeliverable('');
    }
  };

  const removeDeliverable = (index: number) => {
    const deliverables = [...(formik.values.deliverables || [])];
    deliverables.splice(index, 1);
    formik.setFieldValue('deliverables', deliverables);
  };

  // Handle tag management
  const addTag = () => {
    if (newTag.trim() && !(formik.values.tags || []).includes(newTag.trim())) {
      formik.setFieldValue('tags', [...(formik.values.tags || []), newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    const tags = [...(formik.values.tags || [])];
    tags.splice(index, 1);
    formik.setFieldValue('tags', tags);
  };

  if (projectLoading) {
    return (
      <AppLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </AppLayout>
    );
  }

  if (mode === 'edit' && error) {
    return (
      <AppLayout>
        <Box sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={() => navigate('/dashboard/projects')}
          >
            Back to Projects
          </Button>
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/dashboard/projects')} sx={{ mr: 2 }}>
            <BackIcon />
          </IconButton>
          
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              {mode === 'create' ? 'Create New Project' : 'Edit Project'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {mode === 'create' 
                ? 'Set up a new project with all necessary details'
                : 'Update project information and settings'
              }
            </Typography>
          </Box>
        </Box>

        <form onSubmit={formik.handleSubmit}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            gap: 3 
          }}>
            {/* Main Content */}
            <Box sx={{ flex: { xs: '1', md: '2' } }}>
              {/* Basic Information */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Basic Information
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                      fullWidth
                      name="name"
                      label="Project Name"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      error={formik.touched.name && Boolean(formik.errors.name)}
                      helperText={formik.touched.name && formik.errors.name}
                      required
                    />
                    
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      name="description"
                      label="Description"
                      value={formik.values.description}
                      onChange={formik.handleChange}
                      error={formik.touched.description && Boolean(formik.errors.description)}
                      helperText={formik.touched.description && formik.errors.description}
                      required
                    />
                    
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' }, 
                      gap: 3 
                    }}>
                      <FormControl fullWidth required>
                        <InputLabel>Project Type</InputLabel>
                        <Select
                          name="type"
                          value={formik.values.type}
                          onChange={formik.handleChange}
                          label="Project Type"
                          error={formik.touched.type && Boolean(formik.errors.type)}
                        >
                          {Object.values(ProjectType).map((type) => (
                            <MenuItem key={type} value={type}>
                              {PROJECT_TYPE_LABELS[type]}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      
                      <FormControl fullWidth required>
                        <InputLabel>Priority</InputLabel>
                        <Select
                          name="priority"
                          value={formik.values.priority}
                          onChange={formik.handleChange}
                          label="Priority"
                          error={formik.touched.priority && Boolean(formik.errors.priority)}
                        >
                          {Object.values(ProjectPriority).map((priority) => (
                            <MenuItem key={priority} value={priority}>
                              {PROJECT_PRIORITY_LABELS[priority]}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                    
                    <TextField
                      fullWidth
                      name="clientId"
                      label="Client ID"
                      value={formik.values.clientId}
                      onChange={formik.handleChange}
                      error={formik.touched.clientId && Boolean(formik.errors.clientId)}
                      helperText={(formik.touched.clientId && formik.errors.clientId) || 'In production, this would be a client selector'}
                      required
                      placeholder="Enter client ID (temporary - will be replaced with client selector)"
                    />
                  </Box>
                </CardContent>
              </Card>

              {/* Timeline & Budget */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Timeline & Budget
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' }, 
                      gap: 3 
                    }}>
                      <TextField
                        fullWidth
                        type="date"
                        name="startDate"
                        label="Start Date"
                        value={formik.values.startDate}
                        onChange={formik.handleChange}
                        error={formik.touched.startDate && Boolean(formik.errors.startDate)}
                        helperText={formik.touched.startDate && formik.errors.startDate}
                        slotProps={{ inputLabel: { shrink: true } }}
                        required
                      />
                      
                      <TextField
                        fullWidth
                        type="date"
                        name="endDate"
                        label="End Date (Optional)"
                        value={formik.values.endDate}
                        onChange={formik.handleChange}
                        error={formik.touched.endDate && Boolean(formik.errors.endDate)}
                        helperText={formik.touched.endDate && formik.errors.endDate}
                        slotProps={{ inputLabel: { shrink: true } }}
                      />
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' }, 
                      gap: 3 
                    }}>
                      <TextField
                        fullWidth
                        type="number"
                        name="estimatedHours"
                        label="Estimated Hours"
                        value={formik.values.estimatedHours}
                        onChange={formik.handleChange}
                        error={formik.touched.estimatedHours && Boolean(formik.errors.estimatedHours)}
                        helperText={formik.touched.estimatedHours && formik.errors.estimatedHours}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <ClockIcon />
                              </InputAdornment>
                            ),
                          },
                        }}
                        required
                      />
                      
                      <TextField
                        fullWidth
                        type="number"
                        name="budget"
                        label="Budget (ZAR)"
                        value={formik.values.budget}
                        onChange={formik.handleChange}
                        error={formik.touched.budget && Boolean(formik.errors.budget)}
                        helperText={formik.touched.budget && formik.errors.budget}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <MoneyIcon />
                              </InputAdornment>
                            ),
                          },
                        }}
                        required
                      />
                    </Box>
                    
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' }, 
                      gap: 3 
                    }}>
                      <FormControl fullWidth required>
                        <InputLabel>Billing Type</InputLabel>
                        <Select
                          name="billingType"
                          value={formik.values.billingType}
                          onChange={formik.handleChange}
                          label="Billing Type"
                          error={formik.touched.billingType && Boolean(formik.errors.billingType)}
                        >
                          {Object.values(BillingType).map((type) => (
                            <MenuItem key={type} value={type}>
                              {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      
                      {formik.values.billingType === BillingType.HOURLY && (
                        <TextField
                          fullWidth
                          type="number"
                          name="hourlyRate"
                          label="Hourly Rate (ZAR)"
                          value={formik.values.hourlyRate}
                          onChange={formik.handleChange}
                          error={formik.touched.hourlyRate && Boolean(formik.errors.hourlyRate)}
                          helperText={formik.touched.hourlyRate && formik.errors.hourlyRate}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <MoneyIcon />
                              </InputAdornment>
                            ),
                          }}
                          required
                        />
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Additional Details */}
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Additional Details
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      name="requirements"
                      label="Requirements (Optional)"
                      value={formik.values.requirements}
                      onChange={formik.handleChange}
                      error={formik.touched.requirements && Boolean(formik.errors.requirements)}
                      helperText={formik.touched.requirements && formik.errors.requirements}
                    />
                    
                    {/* Deliverables */}
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        Deliverables
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <TextField
                          fullWidth
                          placeholder="Add deliverable"
                          value={newDeliverable}
                          onChange={(e) => setNewDeliverable(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addDeliverable();
                            }
                          }}
                        />
                        <Button
                          variant="outlined"
                          onClick={addDeliverable}
                          startIcon={<AddIcon />}
                        >
                          Add
                        </Button>
                      </Box>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {(formik.values.deliverables || []).map((deliverable, index) => (
                          <Chip
                            key={index}
                            label={deliverable}
                            onDelete={() => removeDeliverable(index)}
                            deleteIcon={<DeleteIcon />}
                          />
                        ))}
                      </Box>
                    </Box>
                    
                    {/* Tags */}
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        Tags
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <TextField
                          fullWidth
                          placeholder="Add tag"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addTag();
                            }
                          }}
                        />
                        <Button
                          variant="outlined"
                          onClick={addTag}
                          startIcon={<AddIcon />}
                        >
                          Add
                        </Button>
                      </Box>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {(formik.values.tags || []).map((tag, index) => (
                          <Chip
                            key={index}
                            label={tag}
                            onDelete={() => removeTag(index)}
                            deleteIcon={<DeleteIcon />}
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Sidebar */}
            <Box sx={{ flex: { xs: '1', md: '1' } }}>
              <Card sx={{ position: 'sticky', top: 24 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    Actions
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={mutationLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                      disabled={mutationLoading || !formik.isValid}
                      fullWidth
                      sx={{
                        background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)',
                        },
                      }}
                    >
                      {mode === 'create' ? 'Create Project' : 'Update Project'}
                    </Button>
                    
                    <Button
                      variant="outlined"
                      onClick={() => navigate('/dashboard/projects')}
                      fullWidth
                    >
                      Cancel
                    </Button>
                  </Box>

                  {/* Form Summary */}
                  {formik.values.budget && formik.values.budget > 0 && (
                    <>
                      <Typography variant="h6" sx={{ mt: 4, mb: 2, fontWeight: 600 }}>
                        Summary
                      </Typography>
                      
                      <Box sx={{ space: 2 }}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Budget
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {new Intl.NumberFormat('en-ZA', {
                              style: 'currency',
                              currency: 'ZAR',
                            }).format(Number(formik.values.budget))}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Estimated Hours
                          </Typography>
                          <Typography variant="body1">
                            {formik.values.estimatedHours} hours
                          </Typography>
                        </Box>
                        
                        {formik.values.billingType === BillingType.HOURLY && formik.values.hourlyRate && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                              Estimated Revenue
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {new Intl.NumberFormat('en-ZA', {
                                style: 'currency',
                                currency: 'ZAR',
                              }).format(Number(formik.values.estimatedHours) * Number(formik.values.hourlyRate))}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Box>
        </form>
      </Box>
    </AppLayout>
  );
};

// Export both create and edit variants
export const CreateProject: React.FC = () => <ProjectForm mode="create" />;
export const EditProject: React.FC = () => <ProjectForm mode="edit" />;