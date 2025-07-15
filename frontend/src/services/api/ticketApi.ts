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
  TicketAttachment
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
    return response.data.data!;
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
    return response.data.data!;
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
    return response.data.data!;
  }

  /**
   * Get a specific ticket by ID
   */
  async getTicketById(id: string): Promise<Ticket> {
    const response = await apiClient.get<ApiResponse<Ticket>>(`/tickets/${id}`);
    return response.data.data!;
  }

  /**
   * Create a new ticket
   */
  async createTicket(ticketData: CreateTicketForm): Promise<Ticket> {
    // Convert form data to FormData if attachments are present
    if (ticketData.attachments && ticketData.attachments.length > 0) {
      const formData = new FormData();
      
      // Add text fields
      formData.append('title', ticketData.title);
      formData.append('description', ticketData.description);
      formData.append('priority', ticketData.priority);
      formData.append('category', ticketData.category);
      
      if (ticketData.tags && ticketData.tags.length > 0) {
        formData.append('tags', JSON.stringify(ticketData.tags));
      }
      
      if (ticketData.estimatedHours) {
        formData.append('estimatedHours', ticketData.estimatedHours.toString());
      }
      
      if (ticketData.dueDate) {
        formData.append('dueDate', ticketData.dueDate);
      }
      
      // Add attachments
      ticketData.attachments.forEach((file, index) => {
        formData.append(`attachments`, file);
      });
      
      const response = await apiClient.post<ApiResponse<Ticket>>('/tickets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data!;
    } else {
      // Send as JSON if no attachments
      const response = await apiClient.post<ApiResponse<Ticket>>('/tickets', ticketData);
      return response.data.data!;
    }
  }

  /**
   * Update an existing ticket
   */
  async updateTicket(id: string, updates: UpdateTicketForm): Promise<Ticket> {
    const response = await apiClient.put<ApiResponse<Ticket>>(`/tickets/${id}`, updates);
    return response.data.data!;
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
    return response.data.data!;
  }

  /**
   * Add a message to a ticket
   */
  async createTicketMessage(ticketId: string, messageData: CreateMessageForm): Promise<TicketMessage> {
    if (messageData.attachments && messageData.attachments.length > 0) {
      const formData = new FormData();
      formData.append('message', messageData.message);
      
      messageData.attachments.forEach((file) => {
        formData.append('attachments', file);
      });
      
      const response = await apiClient.post<ApiResponse<TicketMessage>>(
        `/tickets/${ticketId}/messages`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.data!;
    } else {
      const response = await apiClient.post<ApiResponse<TicketMessage>>(
        `/tickets/${ticketId}/messages`, 
        messageData
      );
      return response.data.data!;
    }
  }

  // ==================== TICKET ATTACHMENTS ====================

  /**
   * Get all attachments for a ticket
   */
  async getTicketAttachments(ticketId: string): Promise<TicketAttachment[]> {
    const response = await apiClient.get<ApiResponse<TicketAttachment[]>>(`/tickets/${ticketId}/attachments`);
    return response.data.data!;
  }

  /**
   * Download an attachment
   */
  async downloadAttachment(ticketId: string, attachmentId: string): Promise<Blob> {
    const response = await apiClient.get(`/tickets/${ticketId}/attachments/${attachmentId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Delete an attachment
   */
  async deleteAttachment(ticketId: string, attachmentId: string): Promise<void> {
    await apiClient.delete(`/tickets/${ticketId}/attachments/${attachmentId}`);
  }

  // ==================== TICKET STATISTICS ====================

  /**
   * Get ticket statistics for dashboard
   */
  async getTicketStatistics(): Promise<TicketStatistics> {
    const response = await apiClient.get<ApiResponse<TicketStatistics>>('/tickets/statistics');
    return response.data.data!;
  }

  // ==================== TICKET ASSIGNMENT ====================

  /**
   * Assign ticket to a user
   */
  async assignTicket(ticketId: string, userId: string): Promise<Ticket> {
    const response = await apiClient.post<ApiResponse<Ticket>>(`/tickets/${ticketId}/assign`, {
      assignedTo: userId
    });
    return response.data.data!;
  }

  /**
   * Unassign ticket
   */
  async unassignTicket(ticketId: string): Promise<Ticket> {
    const response = await apiClient.post<ApiResponse<Ticket>>(`/tickets/${ticketId}/assign`, {
      assignedTo: null
    });
    return response.data.data!;
  }
}

// Export singleton instance
export const ticketApi = new TicketApiService();