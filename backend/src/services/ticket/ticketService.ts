// backend/src/services/ticket/ticketService.ts

import { 
    getFirestore, 
    Timestamp, 
    Query,
    DocumentSnapshot
  } from 'firebase-admin/firestore';
  import {
    TicketDocument,
    TicketResponse,
    CreateTicketDTO,
    UpdateTicketDTO,
    TicketQueryParams,
    PaginatedTicketsResponse,
    TicketStatistics,
    TicketStatus,
    TicketPriority,
    TicketCategory
  } from '../../types/ticket/ticketTypes';
  import { AuthUser } from '../../../../shared/types/auth';
  
  export class TicketService {
    private db = getFirestore();
    private ticketsCollection = 'tickets';
    private messagesCollection = 'ticket_messages';
    private attachmentsCollection = 'ticket_attachments';
    private countersCollection = 'counters';
  
    /**
     * Create a new support ticket
     */
    async createTicket(
      ticketData: CreateTicketDTO, 
      user: AuthUser
    ): Promise<TicketResponse> {
      try {
        // Generate human-readable ticket number
        const ticketNumber = await this.generateTicketNumber();
        
        // Calculate due date based on priority and SLA
        const dueDate = this.calculateDueDate(ticketData.priority);
        
        const now = Timestamp.now();
        
        const ticketDoc: Omit<TicketDocument, 'id'> = {
          title: ticketData.title,
          description: ticketData.description,
          status: TicketStatus.OPEN,
          priority: ticketData.priority,
          category: ticketData.category,
          createdBy: user.uid,
          assignedTo: null, // Will be auto-assigned later
          companyId: user.companyId!,
          ticketNumber,
          createdAt: now,
          updatedAt: now,
          resolvedAt: null,
          dueDate: ticketData.dueDate ? Timestamp.fromDate(new Date(ticketData.dueDate)) : dueDate,
          lastActivityAt: now,
          attachments: [], // Will be updated after file uploads
          tags: ticketData.tags || [],
          estimatedHours: ticketData.estimatedHours || null,
          actualHours: null,
          resolution: null
        };
  
        // Create the ticket document
        const docRef = await this.db.collection(this.ticketsCollection).add(ticketDoc);
        
        // Log the ticket creation as a system message
        await this.createSystemMessage(
          docRef.id,
          `Ticket created by ${user.firstName} ${user.lastName}`,
          user.uid
        );
  
        // Auto-assign if enabled
        if (process.env.TICKET_AUTO_ASSIGN === 'true') {
          await this.autoAssignTicket(docRef.id, user.companyId!, ticketData.category);
        }
  
        // Return the created ticket
        return await this.getTicketById(docRef.id, user);
      } catch (error) {
        console.error('Error creating ticket:', error);
        throw new Error('Failed to create ticket');
      }
    }
  
    /**
     * Get a ticket by ID with all related data
     */
    async getTicketById(ticketId: string, user: AuthUser): Promise<TicketResponse> {
      try {
        const ticketDoc = await this.db.collection(this.ticketsCollection).doc(ticketId).get();
        
        if (!ticketDoc.exists) {
          throw new Error('Ticket not found');
        }
  
        const ticket = ticketDoc.data() as TicketDocument;
        
        // Check access permissions
        if (!this.canAccessTicket(ticket, user)) {
          throw new Error('Access denied');
        }
  
        return await this.transformTicketToResponse(ticketDoc);
      } catch (error) {
        console.error('Error fetching ticket:', error);
        throw error;
      }
    }
  
    /**
     * Update a ticket
     */
    async updateTicket(
      ticketId: string,
      updates: UpdateTicketDTO,
      user: AuthUser
    ): Promise<TicketResponse> {
      try {
        const ticketRef = this.db.collection(this.ticketsCollection).doc(ticketId);
        const ticketDoc = await ticketRef.get();
        
        if (!ticketDoc.exists) {
          throw new Error('Ticket not found');
        }
  
        const currentTicket = ticketDoc.data() as TicketDocument;
        
        // Check permissions
        if (!this.canModifyTicket(currentTicket, user)) {
          throw new Error('Access denied');
        }
  
        // Prepare update data, converting types as needed
        const { dueDate, ...restUpdates } = updates;
        const updateData: Partial<TicketDocument> = {
          ...restUpdates,
          updatedAt: Timestamp.now(),
          lastActivityAt: Timestamp.now()
        };

        // Handle dueDate conversion if provided
        if (dueDate !== undefined) {
          updateData.dueDate = dueDate ? Timestamp.fromDate(new Date(dueDate)) : null;
        }
  
        // Handle status changes
        if (updates.status && updates.status !== currentTicket.status) {
          if (updates.status === TicketStatus.RESOLVED || updates.status === TicketStatus.CLOSED) {
            updateData.resolvedAt = Timestamp.now();
          }
          
          // Log status change
          await this.createSystemMessage(
            ticketId,
            `Status changed from ${currentTicket.status} to ${updates.status}`,
            user.uid
          );
        }
  
        // Handle assignment changes
        if (updates.assignedTo !== undefined && updates.assignedTo !== currentTicket.assignedTo) {
          const message = updates.assignedTo 
            ? `Ticket assigned to user ${updates.assignedTo}`
            : 'Ticket unassigned';
          
          await this.createSystemMessage(ticketId, message, user.uid);
        }
  
        // Update the ticket
        await ticketRef.update(updateData);
        
        return await this.getTicketById(ticketId, user);
      } catch (error) {
        console.error('Error updating ticket:', error);
        throw error;
      }
    }
  
    /**
     * Get tickets with filtering and pagination
     */
    async getTickets(
      queryParams: TicketQueryParams,
      user: AuthUser
    ): Promise<PaginatedTicketsResponse> {
      try {
        let query: Query = this.db.collection(this.ticketsCollection);
  
        // Apply filters based on user role and company
        query = this.applyAccessFilters(query, user);
        query = this.applyQueryFilters(query, queryParams);
  
        // Get total count (before pagination)
        const countSnapshot = await query.get();
        const totalCount = countSnapshot.size;
  
        // Apply sorting
        const sortBy = queryParams.sortBy || 'createdAt';
        const sortOrder = queryParams.sortOrder || 'desc';
        query = query.orderBy(sortBy, sortOrder);
  
        // Apply pagination
        const limit = queryParams.limit || 20;
        const offset = queryParams.offset || 0;
        
        if (offset > 0) {
          query = query.offset(offset);
        }
        query = query.limit(limit);
  
        // Execute query
        const snapshot = await query.get();
        
        // Transform results
        const tickets = await Promise.all(
          snapshot.docs.map(doc => this.transformTicketToResponse(doc))
        );
  
        // Calculate pagination info
        const currentPage = Math.floor(offset / limit) + 1;
        const totalPages = Math.ceil(totalCount / limit);
  
        return {
          tickets,
          totalCount,
          currentPage,
          totalPages,
          hasNextPage: currentPage < totalPages,
          hasPreviousPage: currentPage > 1
        };
      } catch (error) {
        console.error('Error fetching tickets:', error);
        throw new Error('Failed to fetch tickets');
      }
    }
  
    /**
     * Get ticket statistics for dashboard
     */
    async getTicketStatistics(user: AuthUser): Promise<TicketStatistics> {
      try {
        let query: Query = this.db.collection(this.ticketsCollection);
        query = this.applyAccessFilters(query, user);
  
        const snapshot = await query.get();
        const tickets = snapshot.docs.map(doc => doc.data() as TicketDocument);
  
        const stats: TicketStatistics = {
          totalTickets: tickets.length,
          openTickets: tickets.filter(t => t.status === TicketStatus.OPEN).length,
          inProgressTickets: tickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length,
          resolvedTickets: tickets.filter(t => t.status === TicketStatus.RESOLVED).length,
          closedTickets: tickets.filter(t => t.status === TicketStatus.CLOSED).length,
          
          criticalTickets: tickets.filter(t => t.priority === TicketPriority.CRITICAL).length,
          highPriorityTickets: tickets.filter(t => t.priority === TicketPriority.HIGH).length,
          mediumPriorityTickets: tickets.filter(t => t.priority === TicketPriority.MEDIUM).length,
          lowPriorityTickets: tickets.filter(t => t.priority === TicketPriority.LOW).length,
          
          averageResolutionTime: this.calculateAverageResolutionTime(tickets),
          overdueTickets: this.countOverdueTickets(tickets),
          ticketsCreatedToday: this.countTicketsCreatedToday(tickets),
          ticketsResolvedToday: this.countTicketsResolvedToday(tickets)
        };
  
        return stats;
      } catch (error) {
        console.error('Error fetching ticket statistics:', error);
        throw new Error('Failed to fetch ticket statistics');
      }
    }
  
    /**
     * Delete a ticket (soft delete - change status to closed)
     */
    async deleteTicket(ticketId: string, user: AuthUser): Promise<void> {
      try {
        const ticketRef = this.db.collection(this.ticketsCollection).doc(ticketId);
        const ticketDoc = await ticketRef.get();
        
        if (!ticketDoc.exists) {
          throw new Error('Ticket not found');
        }
  
        const ticket = ticketDoc.data() as TicketDocument;
        
        // Check permissions (only admins can delete)
        if (!this.canDeleteTicket(ticket, user)) {
          throw new Error('Access denied');
        }
  
        // Soft delete - update status to closed
        await ticketRef.update({
          status: TicketStatus.CLOSED,
          updatedAt: Timestamp.now(),
          lastActivityAt: Timestamp.now()
        });
  
        // Log deletion
        await this.createSystemMessage(
          ticketId,
          `Ticket deleted by ${user.firstName} ${user.lastName}`,
          user.uid
        );
      } catch (error) {
        console.error('Error deleting ticket:', error);
        throw error;
      }
    }
  
    // ==================== PRIVATE HELPER METHODS ====================
  
    /**
     * Generate a unique human-readable ticket number
     */
    private async generateTicketNumber(): Promise<string> {
      const counterRef = this.db.collection(this.countersCollection).doc('tickets');
      
      return this.db.runTransaction(async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        const currentYear = new Date().getFullYear();
        
        if (!counterDoc.exists) {
          // Initialize counter
          transaction.set(counterRef, {
            currentNumber: 1,
            prefix: 'AUT',
            year: currentYear
          });
          return `AUT-${currentYear}-001`;
        }
        
        const data = counterDoc.data()!;
        
        // Reset counter if new year
        if (data.year !== currentYear) {
          transaction.update(counterRef, {
            currentNumber: 1,
            year: currentYear
          });
          return `AUT-${currentYear}-001`;
        }
        
        // Increment counter
        const newNumber = data.currentNumber + 1;
        transaction.update(counterRef, { currentNumber: newNumber });
        
        return `AUT-${currentYear}-${newNumber.toString().padStart(3, '0')}`;
      });
    }
  
    /**
     * Calculate due date based on priority and SLA
     */
    private calculateDueDate(priority: TicketPriority): Timestamp {
      const now = new Date();
      const slaHours = this.getSLAHours(priority);
      now.setHours(now.getHours() + slaHours);
      return Timestamp.fromDate(now);
    }
  
    /**
     * Get SLA hours based on priority
     */
    private getSLAHours(priority: TicketPriority): number {
      const defaultSLA = parseInt(process.env.TICKET_SLA_HOURS || '24');
      
      switch (priority) {
        case TicketPriority.CRITICAL: return 2;
        case TicketPriority.HIGH: return 8;
        case TicketPriority.MEDIUM: return defaultSLA;
        case TicketPriority.LOW: return defaultSLA * 2;
        default: return defaultSLA;
      }
    }
  
    /**
     * Create a system message for ticket events
     */
    private async createSystemMessage(
      ticketId: string, 
      message: string, 
      userId: string
    ): Promise<void> {
      await this.db.collection(this.messagesCollection).add({
        ticketId,
        senderId: userId,
        message,
        type: 'system_message',
        attachments: [],
        createdAt: Timestamp.now(),
        editedAt: null
      });
    }
  
    /**
     * Auto-assign ticket based on category and availability
     */
    private async autoAssignTicket(
      ticketId: string, 
      companyId: string, 
      category: TicketCategory
    ): Promise<void> {
      // TODO: Implement auto-assignment logic
      // This would query for available support agents based on:
      // - Category expertise
      // - Current workload
      // - Online status
      // - Company assignment
      console.log(`Auto-assignment needed for ticket ${ticketId} in company ${companyId} for category ${category}`);
    }
  
    /**
     * Check if user can access a ticket
     */
    private canAccessTicket(ticket: TicketDocument, user: AuthUser): boolean {
      // Users can access tickets if:
      // 1. They created the ticket
      // 2. They are assigned to the ticket
      // 3. They are an admin in the same company
      // 4. They are a system admin
      
      if (user.role === 'SYSTEM_ADMIN') return true;
      if (ticket.companyId !== user.companyId) return false;
      if (ticket.createdBy === user.uid) return true;
      if (ticket.assignedTo === user.uid) return true;
      if (user.role === 'BUSINESS_ADMIN' || user.role === 'CLIENT_ADMIN') return true;
      
      return false;
    }
  
    /**
     * Check if user can modify a ticket
     */
    private canModifyTicket(ticket: TicketDocument, user: AuthUser): boolean {
      // Users can modify tickets if they can access them
      // Additional restrictions can be added here
      return this.canAccessTicket(ticket, user);
    }
  
    /**
     * Check if user can delete a ticket
     */
    private canDeleteTicket(ticket: TicketDocument, user: AuthUser): boolean {
      // Only admins can delete tickets
      if (user.role === 'SYSTEM_ADMIN') return true;
      if (ticket.companyId !== user.companyId) return false;
      if (user.role === 'BUSINESS_ADMIN' || user.role === 'CLIENT_ADMIN') return true;
      
      return false;
    }
  
    /**
     * Apply access control filters to query
     */
    private applyAccessFilters(query: Query, user: AuthUser): Query {
      if (user.role === 'SYSTEM_ADMIN') {
        // System admins can see all tickets
        return query;
      }
      
      // Filter by company
      query = query.where('companyId', '==', user.companyId);
      
      // Non-admin users can only see their own tickets or assigned tickets
      if (user.role !== 'BUSINESS_ADMIN' && user.role !== 'CLIENT_ADMIN') {
        // This is complex in Firestore - we'll handle this in the application layer
      }
      
      return query;
    }
  
    /**
     * Apply query filters
     */
    private applyQueryFilters(query: Query, params: TicketQueryParams): Query {
      if (params.status) {
        const statuses = Array.isArray(params.status) ? params.status : [params.status];
        query = query.where('status', 'in', statuses);
      }
      
      if (params.priority) {
        const priorities = Array.isArray(params.priority) ? params.priority : [params.priority];
        query = query.where('priority', 'in', priorities);
      }
      
      if (params.category) {
        const categories = Array.isArray(params.category) ? params.category : [params.category];
        query = query.where('category', 'in', categories);
      }
      
      if (params.assignedTo) {
        query = query.where('assignedTo', '==', params.assignedTo);
      }
      
      if (params.createdBy) {
        query = query.where('createdBy', '==', params.createdBy);
      }
      
      // Note: Text search and tag filtering would need to be implemented differently
      // due to Firestore limitations. Consider using Algolia or similar for full-text search.
      
      return query;
    }
  
    /**
     * Transform Firestore document to API response
     */
    private async transformTicketToResponse(doc: DocumentSnapshot): Promise<TicketResponse> {
      const data = doc.data() as TicketDocument;
      
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        category: data.category,
        createdBy: data.createdBy,
        assignedTo: data.assignedTo,
        companyId: data.companyId,
        ticketNumber: data.ticketNumber,
        createdAt: data.createdAt.toDate().toISOString(),
        updatedAt: data.updatedAt.toDate().toISOString(),
        resolvedAt: data.resolvedAt?.toDate().toISOString() || null,
        dueDate: data.dueDate?.toDate().toISOString() || null,
        lastActivityAt: data.lastActivityAt.toDate().toISOString(),
        attachments: [], // TODO: Populate attachments
        tags: data.tags,
        estimatedHours: data.estimatedHours,
        actualHours: data.actualHours,
        resolution: data.resolution
      };
    }
  
    // Statistics helper methods
    private calculateAverageResolutionTime(tickets: TicketDocument[]): number {
      const resolvedTickets = tickets.filter(t => t.resolvedAt && t.createdAt);
      if (resolvedTickets.length === 0) return 0;
      
      const totalTime = resolvedTickets.reduce((sum, ticket) => {
        const created = ticket.createdAt.toDate().getTime();
        const resolved = ticket.resolvedAt!.toDate().getTime();
        return sum + (resolved - created);
      }, 0);
      
      return totalTime / resolvedTickets.length / (1000 * 60 * 60); // Convert to hours
    }
  
    private countOverdueTickets(tickets: TicketDocument[]): number {
      const now = new Date();
      return tickets.filter(ticket => 
        ticket.dueDate && 
        ticket.dueDate.toDate() < now && 
        ticket.status !== TicketStatus.RESOLVED && 
        ticket.status !== TicketStatus.CLOSED
      ).length;
    }
  
    private countTicketsCreatedToday(tickets: TicketDocument[]): number {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return tickets.filter(ticket => 
        ticket.createdAt.toDate() >= today
      ).length;
    }
  
    private countTicketsResolvedToday(tickets: TicketDocument[]): number {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return tickets.filter(ticket => 
        ticket.resolvedAt && ticket.resolvedAt.toDate() >= today
      ).length;
    }
  }