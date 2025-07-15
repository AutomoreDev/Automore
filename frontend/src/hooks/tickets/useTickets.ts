// frontend/src/hooks/ticket/useTickets.ts
import { useState, useEffect, useCallback } from 'react';
import { ticketApi } from '../../services/api/ticketApi';
import {
  Ticket,
  CreateTicketForm,
  UpdateTicketForm,
  CreateMessageForm,
  TicketQueryParams,
  PaginatedTickets,
  TicketStatistics,
  TicketMessage,
  TicketFilters,
  TicketSortOptions
} from '../../types/ticket';
import { toast } from 'react-toastify';

// ==================== TICKET LIST HOOK ====================

export interface UseTicketsReturn {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  fetchTickets: (params?: TicketQueryParams) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useTickets = (initialParams?: TicketQueryParams): UseTicketsReturn => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    totalCount: 0,
    currentPage: 1,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const fetchTickets = useCallback(async (params?: TicketQueryParams) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await ticketApi.getTickets(params);
      
      setTickets(result.tickets);
      setPagination({
        totalCount: result.totalCount,
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tickets');
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    return fetchTickets(initialParams);
  }, [fetchTickets, initialParams]);

  useEffect(() => {
    fetchTickets(initialParams);
  }, [fetchTickets, initialParams]);

  return {
    tickets,
    loading,
    error,
    totalCount: pagination.totalCount,
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    hasNextPage: pagination.hasNextPage,
    hasPreviousPage: pagination.hasPreviousPage,
    fetchTickets,
    refetch,
  };
};

// ==================== SINGLE TICKET HOOK ====================

export interface UseTicketReturn {
  ticket: Ticket | null;
  messages: TicketMessage[];
  loading: boolean;
  error: string | null;
  updateTicket: (updates: UpdateTicketForm) => Promise<void>;
  deleteTicket: () => Promise<void>;
  refetch: () => Promise<void>;
}

export const useTicket = (ticketId: string): UseTicketReturn => {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTicket = useCallback(async () => {
    if (!ticketId) return;

    try {
      setLoading(true);
      setError(null);
      
      const [ticketData, messagesData] = await Promise.all([
        ticketApi.getTicketById(ticketId),
        ticketApi.getTicketMessages(ticketId),
      ]);
      
      setTicket(ticketData);
      setMessages(messagesData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch ticket');
      toast.error('Failed to load ticket');
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  const updateTicket = useCallback(async (updates: UpdateTicketForm) => {
    if (!ticket) return;

    try {
      const updatedTicket = await ticketApi.updateTicket(ticket.id, updates);
      setTicket(updatedTicket);
      toast.success('Ticket updated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update ticket');
      throw err;
    }
  }, [ticket]);

  const deleteTicket = useCallback(async () => {
    if (!ticket) return;

    try {
      await ticketApi.deleteTicket(ticket.id);
      toast.success('Ticket deleted successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete ticket');
      throw err;
    }
  }, [ticket]);

  const refetch = useCallback(() => {
    return fetchTicket();
  }, [fetchTicket]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  return {
    ticket,
    messages,
    loading,
    error,
    updateTicket,
    deleteTicket,
    refetch,
  };
};

// ==================== CREATE TICKET HOOK ====================

export interface UseCreateTicketReturn {
  createTicket: (ticketData: CreateTicketForm) => Promise<Ticket>;
  loading: boolean;
  error: string | null;
}

export const useCreateTicket = (): UseCreateTicketReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTicket = useCallback(async (ticketData: CreateTicketForm): Promise<Ticket> => {
    try {
      setLoading(true);
      setError(null);
      
      const newTicket = await ticketApi.createTicket(ticketData);
      toast.success('Ticket created successfully');
      return newTicket;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create ticket';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createTicket,
    loading,
    error,
  };
};

// ==================== TICKET MESSAGING HOOK ====================

export interface UseTicketMessagingReturn {
  messages: TicketMessage[];
  sendMessage: (messageData: CreateMessageForm) => Promise<void>;
  loading: boolean;
  sendingMessage: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useTicketMessaging = (ticketId: string): UseTicketMessagingReturn => {
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!ticketId) return;

    try {
      setLoading(true);
      setError(null);
      
      const messagesData = await ticketApi.getTicketMessages(ticketId);
      setMessages(messagesData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch messages');
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  const sendMessage = useCallback(async (messageData: CreateMessageForm) => {
    if (!ticketId) return;

    try {
      setSendingMessage(true);
      
      const newMessage = await ticketApi.createTicketMessage(ticketId, messageData);
      setMessages(prev => [...prev, newMessage]);
      toast.success('Message sent successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send message');
      throw err;
    } finally {
      setSendingMessage(false);
    }
  }, [ticketId]);

  const refetch = useCallback(() => {
    return fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return {
    messages,
    sendMessage,
    loading,
    sendingMessage,
    error,
    refetch,
  };
};

// ==================== TICKET STATISTICS HOOK ====================

export interface UseTicketStatisticsReturn {
  statistics: TicketStatistics | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useTicketStatistics = (): UseTicketStatisticsReturn => {
  const [statistics, setStatistics] = useState<TicketStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const stats = await ticketApi.getTicketStatistics();
      setStatistics(stats);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch statistics');
      toast.error('Failed to load ticket statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    return fetchStatistics();
  }, [fetchStatistics]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return {
    statistics,
    loading,
    error,
    refetch,
  };
};

// ==================== MY TICKETS HOOKS ====================

export const useMyTickets = (params?: TicketQueryParams): UseTicketsReturn => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    totalCount: 0,
    currentPage: 1,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const fetchTickets = useCallback(async (queryParams?: TicketQueryParams) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await ticketApi.getMyTickets(queryParams);
      
      setTickets(result.tickets);
      setPagination({
        totalCount: result.totalCount,
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tickets');
      toast.error('Failed to load my tickets');
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    return fetchTickets(params);
  }, [fetchTickets, params]);

  useEffect(() => {
    fetchTickets(params);
  }, [fetchTickets, params]);

  return {
    tickets,
    loading,
    error,
    totalCount: pagination.totalCount,
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    hasNextPage: pagination.hasNextPage,
    hasPreviousPage: pagination.hasPreviousPage,
    fetchTickets,
    refetch,
  };
};

export const useMyCreatedTickets = (params?: TicketQueryParams): UseTicketsReturn => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    totalCount: 0,
    currentPage: 1,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const fetchTickets = useCallback(async (queryParams?: TicketQueryParams) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await ticketApi.getMyCreatedTickets(queryParams);
      
      setTickets(result.tickets);
      setPagination({
        totalCount: result.totalCount,
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tickets');
      toast.error('Failed to load my created tickets');
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    return fetchTickets(params);
  }, [fetchTickets, params]);

  useEffect(() => {
    fetchTickets(params);
  }, [fetchTickets, params]);

  return {
    tickets,
    loading,
    error,
    totalCount: pagination.totalCount,
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    hasNextPage: pagination.hasNextPage,
    hasPreviousPage: pagination.hasPreviousPage,
    fetchTickets,
    refetch,
  };
};