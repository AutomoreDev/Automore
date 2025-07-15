// frontend/src/components/tickets/CreateTicket/CreateTicket.tsx
import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  IconButton,
  Alert,
  LinearProgress,
  useTheme,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Add as AddIcon,
  Close as CloseIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AppLayout } from '../../common/Layout/AppLayout';
import { useCreateTicket } from '../../../hooks/ticket/useTickets';
import {
  CreateTicketForm,
  TicketPriority,
  TicketCategory,
} from '../../../types/ticket';

// Validation schema
const ticketSchema = yup.object({
  title: yup
    .string()
    .required('Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters'),
  description: yup
    .string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description must not exceed 5000 characters'),
  priority: yup
    .string()
    .oneOf(Object.values(TicketPriority))
    .required('Priority is required'),
  category: yup
    .string()
    .oneOf(Object.values(TicketCategory))
    .required('Category is required'),
  tags: yup.array().of(yup.string()).max(10, 'Maximum 10 tags allowed'),
  estimatedHours: yup
    .number()
    .nullable()
    .min(0.5, 'Estimated hours must be at least 0.5')
    .max(1000, 'Estimated hours must not exceed 1000'),
  dueDate: yup.string().nullable(),
});

type FormData = yup.InferType<typeof ticketSchema>;

export const CreateTicket: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { createTicket, loading, error } = useCreateTicket();

  const [attachments, setAttachments] = useState<File[]>([]);
  const [tagInput, setTagInput] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
  } = useForm<FormData>({
    resolver: yupResolver(ticketSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: TicketPriority.MEDIUM,
      category: TicketCategory.GENERAL,
      tags: [],
      estimatedHours: null,
      dueDate: null,
    },
  });

  const tags = watch('tags') || [];

  // Handle form submission
  const onSubmit = useCallback(async (data: FormData) => {
    try {
      const ticketData: CreateTicketForm = {
        title: data.title,
        description: data.description,
        priority: data.priority as TicketPriority,
        category: data.category as TicketCategory,
        tags: data.tags || [],
        estimatedHours: data.estimatedHours || undefined,
        dueDate: data.dueDate || undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
      };

      const newTicket = await createTicket(ticketData);
      navigate(`/tickets/${newTicket.id}`);
    } catch (err) {
      // Error handling is done in the hook
    }
  }, [createTicket, attachments, navigate]);

  // Handle file attachments
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate file size (max 10MB per file)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    setAttachments(prev => [...prev, ...validFiles]);
  }, []);

  const removeAttachment = useCallback((index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Handle tags
  const addTag = useCallback(() => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setValue('tags', [...tags, tag]);
      setTagInput('');
    }
  }, [tagInput, tags, setValue]);

  const removeTag = useCallback((tagToRemove: string) => {
    setValue('tags', tags.filter(tag => tag !== tagToRemove));
  }, [tags, setValue]);

  const handleTagKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addTag();
    }
  }, [addTag]);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <AppLayout>
      <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton onClick={() => navigate(-1)}>
            <BackIcon />
          </IconButton>
          <Typography variant="h4" fontWeight="bold">
            Create Support Ticket
          </Typography>
        </Box>

        {/* Form */}
        <Card>
          <CardContent sx={{ p: 4 }}>
            {loading && <LinearProgress sx={{ mb: 2 }} />}
            
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Title */}
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Title"
                      fullWidth
                      required
                      error={!!errors.title}
                      helperText={errors.title?.message}
                      placeholder="Brief description of your issue"
                    />
                  )}
                />

                {/* Description */}
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Description"
                      fullWidth
                      required
                      multiline
                      rows={6}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                      placeholder="Provide detailed information about your issue..."
                    />
                  )}
                />

                {/* Priority and Category */}
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <Controller
                    name="priority"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth required error={!!errors.priority}>
                        <InputLabel>Priority</InputLabel>
                        <Select {...field} label="Priority">
                          <MenuItem value={TicketPriority.LOW}>Low</MenuItem>
                          <MenuItem value={TicketPriority.MEDIUM}>Medium</MenuItem>
                          <MenuItem value={TicketPriority.HIGH}>High</MenuItem>
                          <MenuItem value={TicketPriority.CRITICAL}>Critical</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />

                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth required error={!!errors.category}>
                        <InputLabel>Category</InputLabel>
                        <Select {...field} label="Category">
                          <MenuItem value={TicketCategory.GENERAL}>General</MenuItem>
                          <MenuItem value={TicketCategory.TECHNICAL}>Technical</MenuItem>
                          <MenuItem value={TicketCategory.BILLING}>Billing</MenuItem>
                          <MenuItem value={TicketCategory.BUG}>Bug Report</MenuItem>
                          <MenuItem value={TicketCategory.FEATURE_REQUEST}>Feature Request</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Box>

                {/* Estimated Hours and Due Date */}
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <Controller
                    name="estimatedHours"
                    control={control}
                    render={({ field: { value, onChange, ...field } }) => (
                      <TextField
                        {...field}
                        label="Estimated Hours (Optional)"
                        type="number"
                        fullWidth
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
                        error={!!errors.estimatedHours}
                        helperText={errors.estimatedHours?.message}
                        inputProps={{ min: 0.5, max: 1000, step: 0.5 }}
                      />
                    )}
                  />

                  <Controller
                    name="dueDate"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Due Date (Optional)"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={field.value || ''}
                      />
                    )}
                  />
                </Box>

                {/* Tags */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Tags (Optional)
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                    <TextField
                      size="small"
                      placeholder="Add tag..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleTagKeyPress}
                      disabled={tags.length >= 10}
                    />
                    <Button
                      size="small"
                      onClick={addTag}
                      disabled={!tagInput.trim() || tags.includes(tagInput.trim()) || tags.length >= 10}
                    >
                      Add
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        onDelete={() => removeTag(tag)}
                        deleteIcon={<CloseIcon />}
                      />
                    ))}
                  </Box>
                  {tags.length >= 10 && (
                    <Typography variant="caption" color="warning.main">
                      Maximum 10 tags allowed
                    </Typography>
                  )}
                </Box>

                {/* File Attachments */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Attachments (Optional)
                  </Typography>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    sx={{ mb: 2 }}
                  >
                    Upload Files
                    <input
                      type="file"
                      hidden
                      multiple
                      onChange={handleFileUpload}
                      accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip"
                    />
                  </Button>
                  
                  {attachments.length > 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {attachments.map((file, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            p: 1,
                            border: 1,
                            borderColor: 'divider',
                            borderRadius: 1,
                          }}
                        >
                          <FileIcon color="primary" />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2">{file.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatFileSize(file.size)}
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => removeAttachment(index)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  )}
                  
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    Supported formats: JPG, PNG, GIF, PDF, DOC, DOCX, TXT, ZIP (Max 10MB per file)
                  </Typography>
                </Box>

                {/* Submit Buttons */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(-1)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? undefined : <AddIcon />}
                  >
                    {loading ? 'Creating...' : 'Create Ticket'}
                  </Button>
                </Box>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
    </AppLayout>
  );
};