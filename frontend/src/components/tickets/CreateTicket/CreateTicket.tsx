// frontend/src/components/tickets/CreateTicket/CreateTicket.tsx
import React, { useState, useCallback, useMemo } from 'react';
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
import { useCreateTicket } from '../../../hooks/tickets/useTickets';
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
  const navigate = useNavigate();
  const { createTicket, loading, error } = useCreateTicket();
  
  const [attachments, setAttachments] = useState<File[]>([]);
  const [newTag, setNewTag] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(ticketSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      priority: TicketPriority.MEDIUM,
      category: TicketCategory.GENERAL,
      tags: [],
      estimatedHours: null,
      dueDate: '',
    },
  });

  const watchedTags = watch('tags');
  
  // Memoize tags to prevent dependency issues
  const tags = useMemo(() => {
    return (watchedTags || []).filter((tag): tag is string => Boolean(tag));
  }, [watchedTags]);

  const handleBack = useCallback(() => {
    navigate('/tickets');
  }, [navigate]);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    const maxFiles = 5;
    
    const validFiles = Array.from(files).filter(file => {
      if (file.size > maxSize) {
        alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    const totalFiles = attachments.length + validFiles.length;
    if (totalFiles > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed.`);
      return;
    }

    setAttachments(prev => [...prev, ...validFiles]);
  }, [attachments.length]);

  const handleRemoveAttachment = useCallback((index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleAddTag = useCallback(() => {
    if (!newTag.trim() || tags.includes(newTag.trim())) return;
    
    if (tags.length >= 10) {
      alert('Maximum 10 tags allowed');
      return;
    }

    const updatedTags = [...tags, newTag.trim()];
    setValue('tags', updatedTags);
    setNewTag('');
  }, [newTag, tags, setValue]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setValue('tags', updatedTags);
  }, [tags, setValue]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  }, [handleAddTag]);

  const onSubmit = useCallback(async (data: FormData) => {
    try {
      const ticketData: CreateTicketForm = {
        title: data.title,
        description: data.description,
        priority: data.priority as TicketPriority,
        category: data.category as TicketCategory,
        tags: tags,
        estimatedHours: data.estimatedHours || undefined,
        dueDate: data.dueDate || undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
      };

      const newTicket = await createTicket(ticketData);
      navigate(`/tickets/${newTicket.id}`);
    } catch (error) {
      console.error('Failed to create ticket:', error);
    }
  }, [createTicket, navigate, tags, attachments]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <AppLayout>
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={handleBack} sx={{ mr: 2 }}>
            <BackIcon />
          </IconButton>
          <Typography variant="h4" fontWeight="bold">
            Create New Ticket
          </Typography>
        </Box>

        {/* Loading indicator */}
        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {/* Error display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Card>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit as any)}>
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
                      multiline
                      rows={4}
                      fullWidth
                      required
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  )}
                />

                {/* Priority and Category */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Controller
                    name="priority"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth required>
                        <InputLabel>Priority</InputLabel>
                        <Select {...field} label="Priority">
                          {Object.values(TicketPriority).map((priority) => (
                            <MenuItem key={priority} value={priority}>
                              {priority.charAt(0).toUpperCase() + priority.slice(1)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />

                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth required>
                        <InputLabel>Category</InputLabel>
                        <Select {...field} label="Category">
                          {Object.values(TicketCategory).map((category) => (
                            <MenuItem key={category} value={category}>
                              {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Box>

                {/* Tags */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Tags
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    {tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        onDelete={() => handleRemoveTag(tag)}
                        deleteIcon={<CloseIcon />}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Add tag"
                      size="small"
                      sx={{ flex: 1 }}
                    />
                    <Button
                      onClick={handleAddTag}
                      variant="outlined"
                      startIcon={<AddIcon />}
                      disabled={!newTag.trim() || tags.length >= 10}
                    >
                      Add
                    </Button>
                  </Box>
                </Box>

                {/* Estimated Hours and Due Date */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Controller
                    name="estimatedHours"
                    control={control}
                    render={({ field: { value, onChange, ...field } }) => (
                      <TextField
                        {...field}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
                        label="Estimated Hours"
                        type="number"
                        fullWidth
                        inputProps={{ min: 0.5, step: 0.5 }}
                        error={!!errors.estimatedHours}
                        helperText={errors.estimatedHours?.message}
                      />
                    )}
                  />

                  <Controller
                    name="dueDate"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Due Date"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.dueDate}
                        helperText={errors.dueDate?.message}
                      />
                    )}
                  />
                </Box>

                {/* File Attachments */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Attachments ({attachments.length}/5)
                  </Typography>
                  
                  {attachments.length > 0 && (
                    <Box sx={{ mb: 2 }}>
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
                            mb: 1,
                          }}
                        >
                          <FileIcon />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2">{file.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatFileSize(file.size)}
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveAttachment(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  )}

                  <Button
                    variant="outlined"
                    startIcon={<UploadIcon />}
                    component="label"
                    disabled={attachments.length >= 5}
                  >
                    Upload Files
                    <input
                      type="file"
                      hidden
                      multiple
                      onChange={(e) => handleFileSelect(e.target.files)}
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
                    />
                  </Button>
                </Box>

                {/* Submit Buttons */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={handleBack}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Ticket'}
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