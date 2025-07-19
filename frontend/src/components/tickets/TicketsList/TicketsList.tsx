// frontend/src/components/tickets/TicketsList/TicketsList.tsx
import React, { useState, useCallback, useMemo } from 'react';
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
  Avatar,
  IconButton,
  Pagination,
  InputAdornment,
  CircularProgress,
  Alert,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Assignment as TicketIcon,
  Person as PersonIcon,
  Schedule as ClockIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { AppLayout } from '../../common/Layout/AppLayout';
import { useTickets } from '../../../hooks/tickets/useTickets';
import {
  Ticket,
  TicketStatus,
  TicketPriority,
  TicketCategory,
  TicketQueryParams,
} from '../../../types/ticket';
import { useAuth } from '../../../context/auth/AuthContext';

// Priority colors mapping
const getPriorityColor = (priority: TicketPriority) => {
  switch (priority) {
    case TicketPriority.CRITICAL:
      return 'error';
    case TicketPriority.HIGH:
      return 'warning';
    case TicketPriority.MEDIUM:
      return 'info';
    case TicketPriority.LOW:
      return 'success';
    default:
      return 'default';
  }
};

// Status colors mapping
const getStatusColor = (status: TicketStatus) => {
  switch (status) {
    case TicketStatus.OPEN:
      return 'error';
    case TicketStatus.IN_PROGRESS:
      return 'warning';
    case TicketStatus.RESOLVED:
      return 'info';
    case TicketStatus.CLOSED:
      return 'success';
    default:
      return 'default';
  }
};

interface TicketsFilters {
  search: string;
  status: TicketStatus[];
  priority: TicketPriority[];
  category: TicketCategory[];
}

export const TicketsList: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // Filter state
  const [filters, setFilters] = useState<TicketsFilters>({
    search: '',
    status: [],
    priority: [],
    category: [],
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const limit = 10;

  // Build query parameters
  const queryParams: TicketQueryParams = useMemo(() => ({
    search: filters.search || undefined,
    status: filters.status.length > 0 ? filters.status : undefined,
    priority: filters.priority.length > 0 ? filters.priority : undefined,
    category: filters.category.length > 0 ? filters.category : undefined,
    limit,
    offset: (currentPage - 1) * limit,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  }), [filters.search, filters.status, filters.priority, filters.category, limit, currentPage]);

  const { tickets, loading, error, totalPages, refetch } = useTickets(queryParams);

  // Handle filter changes
  const handleSearchChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
    setCurrentPage(1);
  }, []);

  const handleFilterChange = useCallback((filterType: keyof TicketsFilters, value: any) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      status: [],
      priority: [],
      category: [],
    });
    setCurrentPage(1);
  }, []);

  const showClosedTickets = useCallback(() => {
    setFilters({
      search: '',
      status: [TicketStatus.CLOSED],
      priority: [],
      category: [],
    });
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  }, []);

  const handleTicketClick = useCallback((ticketId: string) => {
    navigate(`/dashboard/tickets/${ticketId}`);
  }, [navigate]);

  const handleCreateTicket = useCallback(() => {
    navigate('/dashboard/tickets/create');
  }, [navigate]);

  // Render ticket card
  const renderTicketCard = (ticket: Ticket) => (
    <Card
      key={ticket.id}
      sx={{
        mb: 2,
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        },
      }}
      onClick={() => handleTicketClick(ticket.id)}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                #{ticket.ticketNumber}
              </Typography>
              <Chip
                label={ticket.status.replace('_', ' ')}
                size="small"
                color={getStatusColor(ticket.status) as any}
                variant="outlined"
              />
              <Chip
                label={ticket.priority}
                size="small"
                color={getPriorityColor(ticket.priority) as any}
              />
            </Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {ticket.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {ticket.description.length > 150
                ? `${ticket.description.substring(0, 150)}...`
                : ticket.description}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <PersonIcon fontSize="small" color="disabled" />
              <Typography variant="caption" color="text.secondary">
                {ticket.createdByUser?.firstName} {ticket.createdByUser?.lastName}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ClockIcon fontSize="small" color="disabled" />
              <Typography variant="caption" color="text.secondary">
                {format(new Date(ticket.createdAt), 'MMM dd, yyyy')}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={ticket.category.replace('_', ' ')}
              size="small"
              variant="outlined"
            />
            {ticket.assignedToUser && (
              <Avatar sx={{ width: 24, height: 24 }}>
                {ticket.assignedToUser.firstName[0]}{ticket.assignedToUser.lastName[0]}
              </Avatar>
            )}
          </Box>
        </Box>

        {ticket.tags && ticket.tags.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
            {ticket.tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem', height: 20 }}
              />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <AppLayout>
      <Box sx={{ width: '100%' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TicketIcon color="primary" />
            <Typography variant="h4" fontWeight="bold">
              Support Tickets
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={refetch} disabled={loading}>
              <RefreshIcon />
            </IconButton>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateTicket}
            >
              Create Ticket
            </Button>
          </Box>
        </Box>

        {/* Search and Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <TextField
                placeholder="Search tickets..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                sx={{ flex: 1, minWidth: 300 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: filters.search && (
                    <InputAdornment position="end">
                      <IconButton onClick={() => handleSearchChange('')} size="small">
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters
              </Button>
              <Button
                variant={filters.status.length === 1 && filters.status[0] === TicketStatus.CLOSED ? "contained" : "outlined"}
                onClick={showClosedTickets}
              >
                Closed Tickets
              </Button>
              {(filters.status.length > 0 || filters.priority.length > 0 || filters.category.length > 0) && (
                <Button variant="outlined" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </Box>

            {showFilters && (
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    multiple
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    renderValue={(selected) => `${selected.length} selected`}
                  >
                    {Object.values(TicketStatus).map((status) => (
                      <MenuItem key={status} value={status}>
                        {status.replace('_', ' ')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    multiple
                    value={filters.priority}
                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                    renderValue={(selected) => `${selected.length} selected`}
                  >
                    {Object.values(TicketPriority).map((priority) => (
                      <MenuItem key={priority} value={priority}>
                        {priority}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    multiple
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    renderValue={(selected) => `${selected.length} selected`}
                  >
                    {Object.values(TicketCategory).map((category) => (
                      <MenuItem key={category} value={category}>
                        {category.replace('_', ' ')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Empty State */}
        {!loading && !error && tickets.length === 0 && (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <TicketIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No tickets found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {filters.search || filters.status.length > 0 || filters.priority.length > 0 || filters.category.length > 0
                  ? 'Try adjusting your filters or search terms'
                  : 'Create your first support ticket to get started'}
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateTicket}
              >
                Create Ticket
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tickets List */}
        {!loading && !error && tickets.length > 0 && (
          <Box sx={{ mb: 3 }}>
            {tickets.map(renderTicketCard)}
          </Box>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
            />
          </Box>
        )}
      </Box>
    </AppLayout>
  );
};