// frontend/src/components/tickets/TicketMessaging/MessageThread.tsx
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Download as DownloadIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { TicketMessage, MessageType } from '../../../types/ticket';
import { useAuth } from '../../../context/auth/AuthContext';

interface MessageThreadProps {
  ticketId: string;
  messages: TicketMessage[];
}

const getFileIcon = (mimeType: string) => {
  if (!mimeType || typeof mimeType !== 'string') return <FileIcon />;
  if (mimeType.startsWith('image/')) return <ImageIcon />;
  if (mimeType === 'application/pdf') return <PdfIcon />;
  return <FileIcon />;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const MessageThread: React.FC<MessageThreadProps> = ({ ticketId, messages }) => {
  const { user } = useAuth();

  if (!messages || messages.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          No messages yet. Be the first to send a message!
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxHeight: 600, overflowY: 'auto' }}>
      {messages.map((message) => {
        const isCurrentUser = user?.uid === message.senderId;
        const isSystemMessage = message.type === MessageType.SYSTEM_MESSAGE;
        const isStatusChange = message.type === MessageType.STATUS_CHANGE;

        // System messages (status changes, etc.)
        if (isSystemMessage || isStatusChange) {
          return (
            <Box key={message.id} sx={{ mb: 2, textAlign: 'center' }}>
              <Chip
                label={message.message}
                size="small"
                variant="outlined"
                color="info"
                sx={{ bgcolor: 'background.paper' }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                {format(new Date(message.createdAt), 'MMM dd, yyyy HH:mm')}
              </Typography>
            </Box>
          );
        }

        // Regular user messages
        return (
          <Box
            key={message.id}
            sx={{
              mb: 3,
              display: 'flex',
              flexDirection: isCurrentUser ? 'row-reverse' : 'row',
              alignItems: 'flex-start',
              gap: 1,
            }}
          >
            {/* Avatar */}
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: isCurrentUser ? 'primary.main' : 'secondary.main',
                fontSize: '0.875rem',
              }}
            >
              {message.sender.firstName[0]}{message.sender.lastName[0]}
            </Avatar>

            {/* Message Content */}
            <Paper
              elevation={1}
              sx={{
                p: 2,
                maxWidth: '70%',
                bgcolor: isCurrentUser ? 'primary.light' : 'background.paper',
                color: isCurrentUser ? 'primary.contrastText' : 'text.primary',
                borderRadius: 2,
                borderTopLeftRadius: isCurrentUser ? 2 : 0.5,
                borderTopRightRadius: isCurrentUser ? 0.5 : 2,
              }}
            >
              {/* Message Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold', opacity: 0.8 }}>
                  {message.sender.firstName} {message.sender.lastName}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  {format(new Date(message.createdAt), 'MMM dd, HH:mm')}
                </Typography>
              </Box>

              {/* Message Text */}
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  lineHeight: 1.4,
                }}
              >
                {message.message}
              </Typography>

              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" sx={{ display: 'block', mb: 1, opacity: 0.8 }}>
                    Attachments:
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {message.attachments.map((attachment) => (
                      <Paper
                        key={attachment.id}
                        variant="outlined"
                        sx={{
                          p: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                          },
                        }}
                        onClick={() => window.open(attachment.downloadUrl, '_blank')}
                      >
                        {getFileIcon(attachment.mimeType)}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {attachment.originalName}
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.7 }}>
                            {formatFileSize(attachment.fileSize)}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          sx={{ color: 'inherit' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(attachment.downloadUrl, '_blank');
                          }}
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Paper>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Edit indicator */}
              {message.editedAt && (
                <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.6, fontStyle: 'italic' }}>
                  Edited {format(new Date(message.editedAt), 'MMM dd, HH:mm')}
                </Typography>
              )}
            </Paper>
          </Box>
        );
      })}
    </Box>
  );
};