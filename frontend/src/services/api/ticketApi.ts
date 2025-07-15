// frontend/src/services/api/ticketApi.ts
import { apiClient } from './apiClient';
import {
  Ticket,
  CreateTicketForm,
  UpdateTicketForm,
  CreateMessageForm,
  TicketQueryParams,
  PaginatedTickets,
  TicketStatistics,
  TicketMessage,
} from '../../types/ticket';
import { ApiResponse } from '../../shared/types/api';

export class TicketApiService {
  
  // ==================== TICKET CRUD OPERATIONS ====================
  
  /**
   * Get all tickets with filtering and pagination
   */
  async getTickets(params?: TicketQueryParams): Promise<PaginatedTickets> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, v.toString()));
          } else {
            searchParams.append(key, value.toString());
          }
        }
      });
    }
    
    const response = await apiClient.get<ApiResponse<PaginatedTickets>>(
      `/tickets?${searchParams.toString()}`
    );
    
    if (!response.data?.data) {
      throw new Error('No data received from server');
    }
    
    return response.data.data;
  }

  /**
   * Get tickets assigned to current user
   */
  async getMyTickets(params?: TicketQueryParams): Promise<PaginatedTickets> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, v.toString()));
          } else {
            searchParams.append(key, value.toString());
          }
        }
      });
    }
    
    const response = await apiClient.get<ApiResponse<PaginatedTickets>>(
      `/tickets/my-tickets?${searchParams.toString()}`
    );
    
    if (!response.data?.data) {
      throw new Error('No data received from server');
    }
    
    return response.data.data;
  }

  /**
   * Get tickets created by current user
   */
  async getMyCreatedTickets(params?: TicketQueryParams): Promise<PaginatedTickets> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, v.toString()));
          } else {
            searchParams.append(key, value.toString());
          }
        }
      });
    }
    
    const response = await apiClient.get<ApiResponse<PaginatedTickets>>(
      `/tickets/my-created-tickets?${searchParams.toString()}`
    );
    
    if (!response.data?.data) {
      throw new Error('No data received from server');
    }
    
    return response.data.data;
  }

  /**
   * Get a specific ticket by ID
   */
  async getTicketById(id: string): Promise<Ticket> {
    const response = await apiClient.get<ApiResponse<Ticket>>(`/tickets/${id}`);
    
    if (!response.data?.data) {
      throw new Error('Ticket not found');
    }
    
    return response.data.data;
  }

  /**
   * Create a new ticket
   */
  async createTicket(ticketData: CreateTicketForm): Promise<Ticket> {
    const formData = new FormData();
    
    // Add ticket data
    formData.append('title', ticketData.title);
    formData.append('description', ticketData.description);
    formData.append('priority', ticketData.priority);
    formData.append('category', ticketData.category);
    formData.append('tags', JSON.stringify(ticketData.tags));
    
    if (ticketData.estimatedHours) {
      formData.append('estimatedHours', ticketData.estimatedHours.toString());
    }
    
    if (ticketData.dueDate) {
      formData.append('dueDate', ticketData.dueDate);
    }
    
    // Add attachments
    if (ticketData.attachments) {
      ticketData.attachments.forEach((file, index) => {
        formData.append(`attachments`, file);
      });
    }
    
    const response = await apiClient.post<ApiResponse<Ticket>>('/tickets', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (!response.data?.data) {
      throw new Error('Failed to create ticket');
    }
    
    return response.data.data;
  }

  /**
   * Update an existing ticket
   */
  async updateTicket(id: string, updates: UpdateTicketForm): Promise<Ticket> {
    const response = await apiClient.put<ApiResponse<Ticket>>(`/tickets/${id}`, updates);
    
    if (!response.data?.data) {
      throw new Error('Failed to update ticket');
    }
    
    return response.data.data;
  }

  /**
   * Delete a ticket
   */
  async deleteTicket(id: string): Promise<void> {
    await apiClient.delete(`/tickets/${id}`);
  }

  // ==================== TICKET MESSAGING ====================

  /**
   * Get all messages for a ticket
   */
  async getTicketMessages(ticketId: string): Promise<TicketMessage[]> {
    const response = await apiClient.get<ApiResponse<TicketMessage[]>>(`/tickets/${ticketId}/messages`);
    
    if (!response.data?.data) {
      throw new Error('Failed to load messages');
    }
    
    return response.data.data;
  }

  /**
   * Send a message to a ticket
   */
  async createTicketMessage(ticketId: string, messageData: CreateMessageForm): Promise<TicketMessage> {
    const formData = new FormData();
    formData.append('message', messageData.message);
    
    // Add attachments
    if (messageData.attachments) {
      messageData.attachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }
    
    const response = await apiClient.post<ApiResponse<TicketMessage>>(
      `/tickets/${ticketId}/messages`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    if (!response.data?.data) {
      throw new Error('Failed to send message');
    }
    
    return response.data.data;
  }

  // ==================== TICKET ATTACHMENTS ====================

  /**
   * Download a ticket attachment
   */
  async downloadAttachment(ticketId: string, attachmentId: string): Promise<Blob> {
    const response = await apiClient.get(`/tickets/${ticketId}/attachments/${attachmentId}`, {
      responseType: 'blob',
    });
    
    // Type assertion since we know responseType is blob
    return response.data as Blob;
  }

  /**
   * Delete a ticket attachment
   */
  async deleteAttachment(ticketId: string, attachmentId: string): Promise<void> {
    await apiClient.delete(`/tickets/${ticketId}/attachments/${attachmentId}`);
  }

  // ==================== TICKET STATISTICS ====================

  /**
   * Get ticket statistics
   */
  async getTicketStatistics(): Promise<TicketStatistics> {
    const response = await apiClient.get<ApiResponse<TicketStatistics>>('/tickets/statistics');
    
    if (!response.data?.data) {
      throw new Error('Failed to load statistics');
    }
    
    return response.data.data;
  }

  /**
   * Get ticket statistics for a specific user
   */
  async getUserTicketStatistics(userId: string): Promise<TicketStatistics> {
    const response = await apiClient.get<ApiResponse<TicketStatistics>>(`/tickets/statistics/user/${userId}`);
    
    if (!response.data?.data) {
      throw new Error('Failed to load user statistics');
    }
    
    return response.data.data;
  }

  /**
   * Get ticket statistics for a company
   */
  async getCompanyTicketStatistics(companyId: string): Promise<TicketStatistics> {
    const response = await apiClient.get<ApiResponse<TicketStatistics>>(`/tickets/statistics/company/${companyId}`);
    
    if (!response.data?.data) {
      throw new Error('Failed to load company statistics');
    }
    
    return response.data.data;
  }
}

// Export singleton instance
export const ticketApi = new TicketApiService();