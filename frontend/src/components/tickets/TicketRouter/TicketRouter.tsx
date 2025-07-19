import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { TicketsList } from '../TicketsList/TicketsList';
import { TicketDetail } from '../TicketDetail/TicketDetail';
import { CreateTicket } from '../CreateTicket/CreateTicket';

export const TicketRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<TicketsList />} />
      <Route path="/create" element={<CreateTicket />} />
      <Route path="/:ticketId" element={<TicketDetail />} />
      <Route path="*" element={<Navigate to="/dashboard/tickets" replace />} />
    </Routes>
  );
};