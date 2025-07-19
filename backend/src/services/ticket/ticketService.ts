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
          await this.autoAssignTicket(docRef.id, user.companyId!, ticketData.category, user.uid);
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
        // Start with a basic query
        let query: Query = this.db.collection(this.ticketsCollection);
  
        // Apply filters based on user role and company
        query = this.applyAccessFilters(query, user);
        query = this.applyQueryFilters(query, queryParams);
  
        // Get total count (before pagination)
        const countSnapshot = await query.get();
        const totalCount = countSnapshot.size;
  
        // If no tickets found, return empty result
        if (totalCount === 0) {
          return {
            tickets: [],
            totalCount: 0,
            currentPage: 1,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false
          };
        }
  
        // Apply sorting
        const sortBy = queryParams.sortBy || 'createdAt';
        const sortOrder = queryParams.sortOrder || 'desc';
        
        // Create a new query for pagination (since we already used the first one)
        let paginatedQuery: Query = this.db.collection(this.ticketsCollection);
        paginatedQuery = this.applyAccessFilters(paginatedQuery, user);
        paginatedQuery = this.applyQueryFilters(paginatedQuery, queryParams);
        paginatedQuery = paginatedQuery.orderBy(sortBy, sortOrder);
  
        // Apply pagination
        const limit = queryParams.limit || 20;
        const offset = queryParams.offset || 0;
        
        if (offset > 0) {
          paginatedQuery = paginatedQuery.offset(offset);
        }
        paginatedQuery = paginatedQuery.limit(limit);
  
        // Execute query
        const snapshot = await paginatedQuery.get();
        
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
      category: TicketCategory,
      creatorId?: string
    ): Promise<void> {
      try {
        console.log(`Starting auto-assignment for ticket ${ticketId} in company ${companyId} for category ${category}`);
        
        // Find available support agents for this company
        const availableAgents = await this.findAvailableSupportAgents(companyId, category);
        
        if (availableAgents.length === 0) {
          console.log(`No available agents found for company ${companyId} and category ${category}`);
          console.log(`Ticket ${ticketId} will remain unassigned - can be assigned manually later`);
          
          // Create a system message indicating the ticket is unassigned
          await this.createSystemMessage(
            ticketId,
            'Ticket created - no available agents for auto-assignment. Manual assignment required.',
            creatorId || 'system'
          );
          return;
        }

        // Select the best agent based on workload and expertise
        const selectedAgent = await this.selectBestAgent(availableAgents);
        
        if (!selectedAgent) {
          console.log(`No suitable agent found for ticket assignment`);
          return;
        }

        // Assign the ticket
        await this.assignTicketToAgent(ticketId, selectedAgent.uid, selectedAgent.firstName, selectedAgent.lastName);
        
        console.log(`Successfully auto-assigned ticket ${ticketId} to agent ${selectedAgent.uid} (${selectedAgent.firstName} ${selectedAgent.lastName})`);
        
      } catch (error) {
        console.error(`Error during auto-assignment for ticket ${ticketId}:`, error);
        // Don't throw error - auto-assignment failure shouldn't break ticket creation
      }
    }

    /**
     * Find available support agents for a company and category
     */
    private async findAvailableSupportAgents(companyId: string, category: TicketCategory): Promise<any[]> {
      try {
        // First, try to find support agents with admin roles
        let usersQuery = this.db.collection('users')
          .where('companyId', '==', companyId)
          .where('role', 'in', ['BUSINESS_ADMIN', 'CLIENT_ADMIN']) // Support agents
          .where('status', '==', 'active');

        let usersSnapshot = await usersQuery.get();
        
        // If no admin agents found, try to find any active users in the company
        if (usersSnapshot.empty) {
          console.log(`No admin agents found, looking for any active users in company ${companyId}`);
          usersQuery = this.db.collection('users')
            .where('companyId', '==', companyId)
            .where('status', '==', 'active');
          
          usersSnapshot = await usersQuery.get();
        }
        
        // If still no users found, check if there are any users at all in the company
        if (usersSnapshot.empty) {
          console.log(`No active users found, checking for any users in company ${companyId}`);
          usersQuery = this.db.collection('users')
            .where('companyId', '==', companyId);
          
          usersSnapshot = await usersQuery.get();
          
          if (usersSnapshot.empty) {
            console.log(`No users found at all in company ${companyId}`);
            return [];
          } else {
            console.log(`Found ${usersSnapshot.size} inactive users in company, but none are active`);
            return [];
          }
        }

        const agents = usersSnapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        }));

        console.log(`Found ${agents.length} potential agents for assignment`);

        // Filter agents based on category expertise (if configured)
        const suitableAgents = agents.filter(agent => 
          this.isAgentSuitableForCategory(agent, category)
        );

        return suitableAgents.length > 0 ? suitableAgents : agents; // Fallback to all agents if no specific expertise
        
      } catch (error) {
        console.error('Error finding available support agents:', error);
        return [];
      }
    }

    /**
     * Check if an agent is suitable for a specific category
     */
    private isAgentSuitableForCategory(agent: any, category: TicketCategory): boolean {
      // Check if agent has category expertise defined
      if (agent.categoryExpertise && Array.isArray(agent.categoryExpertise)) {
        return agent.categoryExpertise.includes(category);
      }
      
      // If no expertise defined, agent can handle any category
      return true;
    }

    /**
     * Select the best agent based on current workload
     */
    private async selectBestAgent(agents: any[]): Promise<any | null> {
      if (agents.length === 0) return null;
      
      try {
        // Get current workload for each agent
        const agentsWithWorkload = await Promise.all(
          agents.map(async (agent) => {
            const workload = await this.getAgentCurrentWorkload(agent.uid);
            return {
              ...agent,
              currentWorkload: workload
            };
          })
        );

        // Sort by workload (ascending) and return the agent with least workload
        agentsWithWorkload.sort((a, b) => a.currentWorkload - b.currentWorkload);
        
        return agentsWithWorkload[0];
        
      } catch (error) {
        console.error('Error selecting best agent:', error);
        // Fallback to random selection
        return agents[Math.floor(Math.random() * agents.length)];
      }
    }

    /**
     * Get current workload (number of open/in-progress tickets) for an agent
     */
    private async getAgentCurrentWorkload(agentId: string): Promise<number> {
      try {
        const workloadQuery = this.db.collection(this.ticketsCollection)
          .where('assignedTo', '==', agentId)
          .where('status', 'in', [TicketStatus.OPEN, TicketStatus.IN_PROGRESS]);

        const snapshot = await workloadQuery.get();
        return snapshot.size;
        
      } catch (error) {
        console.error(`Error getting workload for agent ${agentId}:`, error);
        return 0;
      }
    }

    /**
     * Assign ticket to a specific agent
     */
    private async assignTicketToAgent(
      ticketId: string, 
      agentId: string, 
      agentFirstName: string, 
      agentLastName: string
    ): Promise<void> {
      const ticketRef = this.db.collection(this.ticketsCollection).doc(ticketId);
      
      await ticketRef.update({
        assignedTo: agentId,
        updatedAt: Timestamp.now(),
        lastActivityAt: Timestamp.now()
      });

      // Create system message about assignment
      await this.createSystemMessage(
        ticketId,
        `Ticket auto-assigned to ${agentFirstName} ${agentLastName}`,
        agentId
      );
    }

    /**
     * Get all messages for a ticket
     */
    async getTicketMessages(ticketId: string, user: AuthUser): Promise<any[]> {
      try {
        // First verify user can access this ticket
        await this.getTicketById(ticketId, user);
        
        // Get messages for this ticket (simplified query to avoid index issues)
        const messagesQuery = this.db.collection(this.messagesCollection)
          .where('ticketId', '==', ticketId);

        const snapshot = await messagesQuery.get();
        
        if (snapshot.empty) {
          return [];
        }

        // Collect all unique sender IDs to avoid N+1 queries
        const senderIds = [...new Set(
          snapshot.docs
            .map(doc => doc.data().senderId)
            .filter(id => id)
        )];
        
        // Batch fetch all senders in a single query
        const sendersMap = new Map();
        if (senderIds.length > 0) {
          try {
            // Split into chunks of 10 for Firestore 'in' query limit
            const chunkSize = 10;
            for (let i = 0; i < senderIds.length; i += chunkSize) {
              const chunk = senderIds.slice(i, i + chunkSize);
              const senderDocs = await this.db.collection('users')
                .where('__name__', 'in', chunk)
                .get();
              
              senderDocs.docs.forEach(doc => {
                const senderData = doc.data();
                sendersMap.set(doc.id, {
                  uid: doc.id,
                  firstName: senderData?.firstName || 'Unknown',
                  lastName: senderData?.lastName || 'User',
                  email: senderData?.email || '',
                  role: senderData?.role || ''
                });
              });
            }
          } catch (error) {
            console.error('Error batch fetching sender data:', error);
          }
        }
        
        // Transform messages with cached sender data
        const messages = snapshot.docs.map((doc) => {
          const docData = doc.data();
          const sender = sendersMap.get(docData.senderId) || null;
          
          return {
            id: doc.id,
            ...docData,
            sender,
            createdAt: docData.createdAt?.toDate().toISOString(),
            editedAt: docData.editedAt?.toDate().toISOString()
          };
        });

        // Sort messages by creation date (oldest first)
        messages.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });

        return messages;
        
      } catch (error) {
        console.error('Error getting ticket messages:', error);
        throw error;
      }
    }

    /**
     * Create a new message for a ticket
     */
    async createTicketMessage(ticketId: string, messageData: { message: string }, user: AuthUser, attachments?: any[]): Promise<any> {
      try {
        // First verify user can access this ticket
        await this.getTicketById(ticketId, user);
        
        // Process attachments if any
        const processedAttachments = attachments ? attachments.map(file => ({
          id: `${Date.now()}_${file.originalname}`,
          filename: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path,
          uploadedAt: new Date().toISOString()
        })) : [];
        
        // Create the message
        const messageDoc = {
          ticketId,
          senderId: user.uid,
          message: messageData.message,
          type: 'user_message',
          attachments: processedAttachments,
          createdAt: Timestamp.now(),
          editedAt: null
        };

        const docRef = await this.db.collection(this.messagesCollection).add(messageDoc);
        
        // Update ticket's last activity
        await this.db.collection(this.ticketsCollection).doc(ticketId).update({
          lastActivityAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });

        // Return the created message with populated sender
        const createdMessage = await docRef.get();
        const createdMessageData = createdMessage.data();
        
        // Populate sender information
        const sender = {
          uid: user.uid,
          firstName: user.firstName || 'Unknown',
          lastName: user.lastName || 'User',
          email: user.email || '',
          role: user.role || ''
        };
        
        return {
          id: createdMessage.id,
          ...createdMessageData,
          sender,
          createdAt: createdMessageData?.createdAt?.toDate().toISOString(),
          editedAt: createdMessageData?.editedAt?.toDate().toISOString()
        };
        
      } catch (error) {
        console.error('Error creating ticket message:', error);
        throw error;
      }
    }

    /**
     * Manually assign ticket to a user
     */
    async assignTicket(ticketId: string, assignedTo: string | null, user: AuthUser): Promise<any> {
      try {
        // First verify user can access this ticket
        const ticketDoc = await this.db.collection(this.ticketsCollection).doc(ticketId).get();
        
        if (!ticketDoc.exists) {
          throw new Error('Ticket not found');
        }

        const ticket = ticketDoc.data() as TicketDocument;
        
        // Check access permissions
        if (!this.canAccessTicket(ticket, user)) {
          throw new Error('Access denied');
        }
        
        // Check if user can modify tickets
        if (!this.canModifyTicket(ticket, user)) {
          throw new Error('Access denied');
        }
        
        // If assigning to someone, validate the assignee
        if (assignedTo) {
          await this.validateAssignee(assignedTo, user.companyId!);
        }
        
        // Update the ticket
        const ticketRef = this.db.collection(this.ticketsCollection).doc(ticketId);
        await ticketRef.update({
          assignedTo: assignedTo,
          updatedAt: Timestamp.now(),
          lastActivityAt: Timestamp.now()
        });

        // Create system message about assignment change
        const message = assignedTo 
          ? `Ticket manually assigned to user ${assignedTo}`
          : 'Ticket unassigned';
          
        await this.createSystemMessage(ticketId, message, user.uid);
        
        // Return updated ticket
        return await this.getTicketById(ticketId, user);
        
      } catch (error) {
        console.error('Error assigning ticket:', error);
        throw error;
      }
    }

    /**
     * Validate that a user can be assigned to a ticket
     */
    private async validateAssignee(assigneeId: string, companyId: string): Promise<void> {
      try {
        const userDoc = await this.db.collection('users').doc(assigneeId).get();
        
        if (!userDoc.exists) {
          throw new Error('Invalid assignee - user not found');
        }
        
        const userData = userDoc.data();
        
        if (userData?.companyId !== companyId) {
          throw new Error('Invalid assignee - user not in same company');
        }
        
        if (userData?.status !== 'active') {
          throw new Error('Invalid assignee - user is not active');
        }
        
      } catch (error) {
        console.error('Error validating assignee:', error);
        throw error;
      }
    }

    /**
     * Get available support agents for manual assignment
     */
    async getAvailableAgents(companyId: string): Promise<any[]> {
      try {
        const agents = await this.findAvailableSupportAgents(companyId, TicketCategory.GENERAL);
        
        // Get workload for each agent and return formatted data
        const agentsWithWorkload = await Promise.all(
          agents.map(async (agent) => {
            const workload = await this.getAgentCurrentWorkload(agent.uid);
            return {
              uid: agent.uid,
              firstName: agent.firstName,
              lastName: agent.lastName,
              email: agent.email,
              role: agent.role,
              currentWorkload: workload,
              categoryExpertise: agent.categoryExpertise || [],
              status: agent.status || 'active'
            };
          })
        );

        // Sort by workload (ascending)
        agentsWithWorkload.sort((a, b) => a.currentWorkload - b.currentWorkload);
        
        return agentsWithWorkload;
        
      } catch (error) {
        console.error('Error getting available agents:', error);
        throw new Error('Failed to fetch available agents');
      }
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
      
      // If user has no companyId, they can only access their own tickets
      if (!user.companyId) {
        return ticket.createdBy === user.uid || ticket.assignedTo === user.uid;
      }
      
      // Company-based access control
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
      
      // If user has no companyId, they can't delete tickets
      if (!user.companyId) return false;
      
      // Company-based delete control
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
      
      // Filter by company (only if user has a companyId)
      if (user.companyId) {
        query = query.where('companyId', '==', user.companyId);
      }
      
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