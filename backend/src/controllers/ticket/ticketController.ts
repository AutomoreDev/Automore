// backend/src/controllers/ticket/ticketController.ts

import { Request, Response } from 'express';
import { TicketService } from '../../services/ticket/ticketService';
import { 
  CreateTicketDTO, 
  UpdateTicketDTO, 
  TicketQueryParams,
  TicketPriority,
  TicketCategory,
  TicketStatus
} from '../../types/ticket/ticketTypes';
import { AuthUser } from '../../../../shared/types/auth';

export class TicketController {
  private ticketService = new TicketService();

  /**
   * Create a new ticket
   * POST /api/v1/tickets
   */
  createTicket = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as AuthUser;
      const ticketData: CreateTicketDTO = req.body;

      // Validate required fields
      if (!ticketData.title || !ticketData.description) {
        res.status(400).json({
          success: false,
          message: 'Title and description are required'
        });
        return;
      }

      // Validate enums
      if (!Object.values(TicketPriority).includes(ticketData.priority)) {
        res.status(400).json({
          success: false,
          message: 'Invalid priority value'
        });
        return;
      }

      if (!Object.values(TicketCategory).includes(ticketData.category)) {
        res.status(400).json({
          success: false,
          message: 'Invalid category value'
        });
        return;
      }

      const ticket = await this.ticketService.createTicket(ticketData, user);

      res.status(201).json({
        success: true,
        message: 'Ticket created successfully',
        data: ticket,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Error in createTicket:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create ticket'
      });
    }
  };

  /**
   * Get a specific ticket by ID
   * GET /api/v1/tickets/:id
   */
  getTicketById = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as AuthUser;
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Ticket ID is required'
        });
        return;
      }

      const ticket = await this.ticketService.getTicketById(id, user);

      res.status(200).json({
        success: true,
        data: ticket
      });
    } catch (error: any) {
      console.error('Error in getTicketById:', error);
      
      if (error.message === 'Ticket not found') {
        res.status(404).json({
          success: false,
          message: 'Ticket not found'
        });
        return;
      }
      
      if (error.message === 'Access denied') {
        res.status(403).json({
          success: false,
          message: 'Access denied'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to fetch ticket'
      });
    }
  };

  /**
   * Get all tickets with filtering and pagination
   * GET /api/v1/tickets
   */
  getTickets = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as AuthUser;
      const queryParams: TicketQueryParams = {
        status: this.parseEnumArray(req.query.status as string, TicketStatus),
        priority: this.parseEnumArray(req.query.priority as string, TicketPriority),
        category: this.parseEnumArray(req.query.category as string, TicketCategory),
        assignedTo: req.query.assignedTo as string,
        createdBy: req.query.createdBy as string,
        companyId: req.query.companyId as string,
        tags: this.parseStringArray(req.query.tags as string),
        search: req.query.search as string,
        sortBy: req.query.sortBy as 'createdAt' | 'updatedAt' | 'priority' | 'dueDate',
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
        limit: parseInt(req.query.limit as string) || 20,
        offset: parseInt(req.query.offset as string) || 0
      };

      // Validate pagination parameters
      if (queryParams.limit! > 100) {
        res.status(400).json({
          success: false,
          message: 'Limit cannot exceed 100'
        });
        return;
      }

      const result = await this.ticketService.getTickets(queryParams, user);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('Error in getTickets:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch tickets'
      });
    }
  };

  /**
   * Update a ticket
   * PUT /api/v1/tickets/:id
   */
  updateTicket = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as AuthUser;
      const { id } = req.params;
      const updates: UpdateTicketDTO = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Ticket ID is required'
        });
        return;
      }

      // Validate enum values if provided
      if (updates.status && !Object.values(TicketStatus).includes(updates.status)) {
        res.status(400).json({
          success: false,
          message: 'Invalid status value'
        });
        return;
      }

      if (updates.priority && !Object.values(TicketPriority).includes(updates.priority)) {
        res.status(400).json({
          success: false,
          message: 'Invalid priority value'
        });
        return;
      }

      if (updates.category && !Object.values(TicketCategory).includes(updates.category)) {
        res.status(400).json({
          success: false,
          message: 'Invalid category value'
        });
        return;
      }

      const ticket = await this.ticketService.updateTicket(id, updates, user);

      res.status(200).json({
        success: true,
        message: 'Ticket updated successfully',
        data: ticket
      });
    } catch (error: any) {
      console.error('Error in updateTicket:', error);
      
      if (error.message === 'Ticket not found') {
        res.status(404).json({
          success: false,
          message: 'Ticket not found'
        });
        return;
      }
      
      if (error.message === 'Access denied') {
        res.status(403).json({
          success: false,
          message: 'Access denied'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update ticket'
      });
    }
  };

  /**
   * Delete a ticket
   * DELETE /api/v1/tickets/:id
   */
  deleteTicket = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as AuthUser;
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Ticket ID is required'
        });
        return;
      }

      await this.ticketService.deleteTicket(id, user);

      res.status(200).json({
        success: true,
        message: 'Ticket deleted successfully'
      });
    } catch (error: any) {
      console.error('Error in deleteTicket:', error);
      
      if (error.message === 'Ticket not found') {
        res.status(404).json({
          success: false,
          message: 'Ticket not found'
        });
        return;
      }
      
      if (error.message === 'Access denied') {
        res.status(403).json({
          success: false,
          message: 'Access denied'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to delete ticket'
      });
    }
  };

  /**
   * Get ticket statistics for dashboard
   * GET /api/v1/tickets/statistics
   */
  getTicketStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as AuthUser;
      const statistics = await this.ticketService.getTicketStatistics(user);

      res.status(200).json({
        success: true,
        data: statistics
      });
    } catch (error: any) {
      console.error('Error in getTicketStatistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch ticket statistics'
      });
    }
  };

  /**
   * Get tickets assigned to current user
   * GET /api/v1/tickets/my-tickets
   */
  getMyTickets = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as AuthUser;
      const queryParams: TicketQueryParams = {
        ...this.parseQueryParams(req.query),
        assignedTo: user.uid // Override to only show user's assigned tickets
      };

      const result = await this.ticketService.getTickets(queryParams, user);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('Error in getMyTickets:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch assigned tickets'
      });
    }
  };

  /**
   * Get tickets created by current user
   * GET /api/v1/tickets/my-created-tickets
   */
  getMyCreatedTickets = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as AuthUser;
      const queryParams: TicketQueryParams = {
        ...this.parseQueryParams(req.query),
        createdBy: user.uid // Override to only show user's created tickets
      };

      const result = await this.ticketService.getTickets(queryParams, user);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('Error in getMyCreatedTickets:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch created tickets'
      });
    }
  };

  /**
   * Get available support agents for ticket assignment
   * GET /api/v1/tickets/available-agents
   */
  getAvailableAgents = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as AuthUser;
      
      // Only admins can view available agents
      if (user.role !== 'BUSINESS_ADMIN' && user.role !== 'CLIENT_ADMIN' && user.role !== 'SYSTEM_ADMIN') {
        res.status(403).json({
          success: false,
          message: 'Access denied'
        });
        return;
      }

      const agents = await this.ticketService.getAvailableAgents(user.companyId!);

      res.status(200).json({
        success: true,
        data: agents
      });
    } catch (error: any) {
      console.error('Error in getAvailableAgents:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch available agents'
      });
    }
  };

  /**
   * Get all messages for a ticket
   * GET /api/v1/tickets/:id/messages
   */
  getTicketMessages = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as AuthUser;
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Ticket ID is required'
        });
        return;
      }

      const messages = await this.ticketService.getTicketMessages(id, user);

      res.status(200).json({
        success: true,
        data: messages
      });
    } catch (error: any) {
      console.error('Error in getTicketMessages:', error);
      
      if (error.message === 'Ticket not found') {
        res.status(404).json({
          success: false,
          message: 'Ticket not found'
        });
        return;
      }
      
      if (error.message === 'Access denied') {
        res.status(403).json({
          success: false,
          message: 'Access denied'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to load messages'
      });
    }
  };

  /**
   * Create a new message for a ticket
   * POST /api/v1/tickets/:id/messages
   */
  createTicketMessage = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as AuthUser;
      const { id } = req.params;
      const { message } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Ticket ID is required'
        });
        return;
      }

      if (!message || message.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'Message is required'
        });
        return;
      }

      const newMessage = await this.ticketService.createTicketMessage(id, { message }, user, req.files as any[]);

      res.status(201).json({
        success: true,
        message: 'Message created successfully',
        data: newMessage
      });
    } catch (error: any) {
      console.error('Error in createTicketMessage:', error);
      
      if (error.message === 'Ticket not found') {
        res.status(404).json({
          success: false,
          message: 'Ticket not found'
        });
        return;
      }
      
      if (error.message === 'Access denied') {
        res.status(403).json({
          success: false,
          message: 'Access denied'
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create message'
      });
    }
  };

  /**
   * Assign ticket to a user
   * PUT /api/v1/tickets/:id/assign
   */
  assignTicket = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user as AuthUser;
      const { id } = req.params;
      const { assignedTo } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Ticket ID is required'
        });
        return;
      }

      // Only admins can assign tickets
      if (user.role !== 'BUSINESS_ADMIN' && user.role !== 'CLIENT_ADMIN' && user.role !== 'SYSTEM_ADMIN') {
        res.status(403).json({
          success: false,
          message: 'Access denied - admin privileges required'
        });
        return;
      }

      const updatedTicket = await this.ticketService.assignTicket(id, assignedTo, user);

      res.status(200).json({
        success: true,
        message: assignedTo ? 'Ticket assigned successfully' : 'Ticket unassigned successfully',
        data: updatedTicket
      });
    } catch (error: any) {
      console.error('Error in assignTicket:', error);
      
      if (error.message === 'Ticket not found') {
        res.status(404).json({
          success: false,
          message: 'Ticket not found'
        });
        return;
      }
      
      if (error.message === 'Access denied') {
        res.status(403).json({
          success: false,
          message: 'Access denied'
        });
        return;
      }

      if (error.message.includes('Invalid assignee')) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Failed to assign ticket'
      });
    }
  };

  // ==================== PRIVATE HELPER METHODS ====================

  /**
   * Parse query parameters into TicketQueryParams
   */
  private parseQueryParams(query: any): TicketQueryParams {
    return {
      status: this.parseEnumArray(query.status, TicketStatus),
      priority: this.parseEnumArray(query.priority, TicketPriority),
      category: this.parseEnumArray(query.category, TicketCategory),
      assignedTo: query.assignedTo,
      createdBy: query.createdBy,
      companyId: query.companyId,
      tags: this.parseStringArray(query.tags),
      search: query.search,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'desc',
      limit: Math.min(parseInt(query.limit) || 20, 100),
      offset: parseInt(query.offset) || 0
    };
  }

  /**
   * Parse comma-separated enum array from query string
   */
  private parseEnumArray<T>(value: string | undefined, enumObject: any): T[] | undefined {
    if (!value) return undefined;
    
    const values = value.split(',').map(v => v.trim());
    const validValues = values.filter(v => Object.values(enumObject).includes(v));
    
    return validValues.length > 0 ? validValues as T[] : undefined;
  }

  /**
   * Parse comma-separated string array from query string
   */
  private parseStringArray(value: string | undefined): string[] | undefined {
    if (!value) return undefined;
    return value.split(',').map(v => v.trim()).filter(v => v.length > 0);
  }
}