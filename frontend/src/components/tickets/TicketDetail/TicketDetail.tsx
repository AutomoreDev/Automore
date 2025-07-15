// frontend/src/components/tickets/TicketDetail/TicketDetail.tsx
import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignIcon,
  Schedule as ClockIcon,
  Person as PersonIcon,
  Tag as TagIcon,
  CalendarToday as CalendarIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AppLayout } from '../../common/Layout/AppLayout';
import { useTicket } from '../../../hooks/tickets/useTickets';
import { MessageThread } from '../TicketMessaging/MessageThread';
import { MessageComposer } from '../TicketMessaging/MessageComposer';
import {
  TicketStatus,
  TicketPriority,
  TicketCategory,
} from '../../../types/ticket';
import { useAuth } from '../../../context/auth/AuthContext';
import { UserRole } from '../../../shared/types/auth';

// Validation schema for ticket updates
const updateTicketSchema = yup.object({
  title: yup.string().required('Title is required').max(200),
  description: yup.string().required('Description is required').max(5000),
  status: yup.string().oneOf(Object.values(TicketStatus)).required(),
  priority: yup.string().oneOf(Object.values(TicketPriority)).required(),
  category: yup.string().oneOf(Object.values(TicketCategory)).required(),
  estimatedHours: yup.number().nullable().min(0.5).max(1000),
  actualHours: yup.number().nullable().min(0).max(1000),
  resolution: yup.string().max(2000),
});

type UpdateFormData = yup.InferType<typeof updateTicketSchema>;

// Helper functions for colors
const getPriorityColor = (priority: TicketPriority) => {
  switch (priority) {
    case TicketPriority.CRITICAL: return 'error';
    case TicketPriority.HIGH: return 'warning';
    case TicketPriority.MEDIUM: return 'info';
    case TicketPriority.LOW: return 'success';
    default: return 'default';
  }
};

const getStatusColor = (status: TicketStatus) => {
  switch (status) {
    case TicketStatus.OPEN: return 'error';
    case TicketStatus.IN_PROGRESS: return 'warning';
    case TicketStatus.RESOLVED: return 'info';
    case TicketStatus.CLOSED: return 'success';
    default: return 'default';
  }
};

export const TicketDetail: React.FC = () => {
  const navigate = useNavigate();
  const { ticketId } = useParams<{ ticketId: string }>();
  const { user } = useAuth();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { ticket, messages, loading, error, updateTicket, deleteTicket, refetch } = useTicket(ticketId!);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UpdateFormData>({
    resolver: yupResolver(updateTicketSchema) as any,
    defaultValues: {
      title: ticket?.title || '',
      description: ticket?.description || '',
      status: ticket?.status || TicketStatus.OPEN,
      priority: ticket?.priority || TicketPriority.MEDIUM,
      category: ticket?.category || TicketCategory.GENERAL,
      estimatedHours: ticket?.estimatedHours || null,
      actualHours: ticket?.actualHours || null,
      resolution: ticket?.resolution || '',
    },
  });

  // Update form when ticket data loads
  React.useEffect(() => {
    if (ticket) {
      reset({
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        category: ticket.category,
        estimatedHours: ticket.estimatedHours,
        actualHours: ticket.actualHours,
        resolution: ticket.resolution || '',
      });
    }
  }, [ticket, reset]);

  const handleBack = useCallback(() => {
    navigate('/tickets');
  }, [navigate]);

  const handleEdit = useCallback(() => {
    setEditDialogOpen(true);
  }, []);

  const handleEditSubmit = useCallback(async (data: UpdateFormData) => {
    try {
      await updateTicket({
        title: data.title,
        description: data.description,
        status: data.status as TicketStatus,
        priority: data.priority as TicketPriority,
        category: data.category as TicketCategory,
        estimatedHours: data.estimatedHours || undefined,
        actualHours: data.actualHours || undefined,
        resolution: data.resolution || undefined,
      });
      setEditDialogOpen(false);
      refetch();
    } catch (error) {
      console.error('Failed to update ticket:', error);
    }
  }, [updateTicket, refetch]);

  const handleDelete = useCallback(async () => {
    try {
      await deleteTicket();
      navigate('/tickets');
    } catch (error) {
      console.error('Failed to delete ticket:', error);
    }
  }, [deleteTicket, navigate]);

  const handleMessageSent = useCallback(() => {
    refetch();
  }, [refetch]);

  const canEdit = user && (
    user.uid === ticket?.createdBy || 
    user.uid === ticket?.assignedTo ||
    user.role === UserRole.SYSTEM_ADMIN ||
    user.role === UserRole.BUSINESS_ADMIN
  );

  if (loading) {
    return (
      <AppLayout>
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress />
        </Box>
      </AppLayout>
    );
  }

  if (error || !ticket) {
    return (
      <AppLayout>
        <Alert severity="error" sx={{ m: 2 }}>
          {error || 'Ticket not found'}
        </Alert>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={handleBack} sx={{ mr: 2 }}>
            <BackIcon />
          </IconButton>
          <Typography variant="h4" fontWeight="bold" sx={{ flex: 1 }}>
            Ticket #{ticket.ticketNumber}
          </Typography>
          {canEdit && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEdit}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete
              </Button>
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
          {/* Main Content */}
          <Box sx={{ flex: 2 }}>
            {/* Ticket Info Card */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h5" fontWeight="bold">
                    {ticket.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      label={ticket.status.replace('_', ' ')}
                      color={getStatusColor(ticket.status) as any}
                      variant="outlined"
                    />
                    <Chip
                      label={ticket.priority}
                      color={getPriorityColor(ticket.priority) as any}
                    />
                  </Box>
                </Box>

                <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
                  {ticket.description}
                </Typography>

                {/* Tags */}
                {ticket.tags && ticket.tags.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap' }}>
                    {ticket.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        variant="outlined"
                        icon={<TagIcon />}
                      />
                    ))}
                  </Box>
                )}

                {/* Resolution */}
                {ticket.resolution && (
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                      Resolution:
                    </Typography>
                    <Typography variant="body2">
                      {ticket.resolution}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Messages */}
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Messages
                </Typography>
                <MessageThread ticketId={ticket.id} messages={messages} />
                <Divider sx={{ my: 3 }} />
                <MessageComposer ticketId={ticket.id} onMessageSent={handleMessageSent} />
              </CardContent>
            </Card>
          </Box>

          {/* Sidebar */}
          <Box sx={{ flex: 1 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Ticket Details
                </Typography>

                {/* Created By */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Created by
                    </Typography>
                    <Typography variant="body2">
                      {ticket.createdByUser?.firstName} {ticket.createdByUser?.lastName}
                    </Typography>
                  </Box>
                </Box>

                {/* Assigned To */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AssignIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Assigned to
                    </Typography>
                    <Typography variant="body2">
                      {ticket.assignedToUser
                        ? `${ticket.assignedToUser.firstName} ${ticket.assignedToUser.lastName}`
                        : 'Unassigned'
                      }
                    </Typography>
                  </Box>
                </Box>

                {/* Category */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CategoryIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Category
                    </Typography>
                    <Typography variant="body2">
                      {ticket.category.replace('_', ' ')}
                    </Typography>
                  </Box>
                </Box>

                {/* Created Date */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Created
                    </Typography>
                    <Typography variant="body2">
                      {format(new Date(ticket.createdAt), 'MMM dd, yyyy HH:mm')}
                    </Typography>
                  </Box>
                </Box>

                {/* Due Date */}
                {ticket.dueDate && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ClockIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Due Date
                      </Typography>
                      <Typography variant="body2">
                        {format(new Date(ticket.dueDate), 'MMM dd, yyyy')}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Time Tracking */}
                {(ticket.estimatedHours || ticket.actualHours) && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Time Tracking
                    </Typography>
                    {ticket.estimatedHours && (
                      <Typography variant="body2" color="text.secondary">
                        Estimated: {ticket.estimatedHours}h
                      </Typography>
                    )}
                    {ticket.actualHours && (
                      <Typography variant="body2" color="text.secondary">
                        Actual: {ticket.actualHours}h
                      </Typography>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Edit Dialog */}
        <Dialog 
          open={editDialogOpen} 
          onClose={() => setEditDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Edit Ticket</DialogTitle>
          <form onSubmit={handleSubmit(handleEditSubmit as any)}>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Title"
                      fullWidth
                      error={!!errors.title}
                      helperText={errors.title?.message}
                    />
                  )}
                />

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
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  )}
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select {...field} label="Status">
                          {Object.values(TicketStatus).map((status) => (
                            <MenuItem key={status} value={status}>
                              {status.replace('_', ' ')}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />

                  <Controller
                    name="priority"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Priority</InputLabel>
                        <Select {...field} label="Priority">
                          {Object.values(TicketPriority).map((priority) => (
                            <MenuItem key={priority} value={priority}>
                              {priority}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Box>

                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>Category</InputLabel>
                      <Select {...field} label="Category">
                        {Object.values(TicketCategory).map((category) => (
                          <MenuItem key={category} value={category}>
                            {category.replace('_', ' ')}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />

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
                    name="actualHours"
                    control={control}
                    render={({ field: { value, onChange, ...field } }) => (
                      <TextField
                        {...field}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
                        label="Actual Hours"
                        type="number"
                        fullWidth
                        inputProps={{ min: 0, step: 0.5 }}
                        error={!!errors.actualHours}
                        helperText={errors.actualHours?.message}
                      />
                    )}
                  />
                </Box>

                <Controller
                  name="resolution"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Resolution"
                      multiline
                      rows={3}
                      fullWidth
                      error={!!errors.resolution}
                      helperText={errors.resolution?.message}
                    />
                  )}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete Ticket</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this ticket? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AppLayout>
  );
};