// frontend/src/components/tickets/TicketMessaging/MessageComposer.tsx
import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  IconButton,
  Paper,
  Chip,
  LinearProgress,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachIcon,
  Close as CloseIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTicketMessaging } from '../../../hooks/tickets/useTickets';
import { CreateMessageForm } from '../../../types/ticket';

interface MessageComposerProps {
  ticketId: string;
  onMessageSent?: () => void;
}

const messageSchema = yup.object({
  message: yup
    .string()
    .required('Message is required')
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message must not exceed 2000 characters'),
});

type MessageFormData = yup.InferType<typeof messageSchema>;

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const MessageComposer: React.FC<MessageComposerProps> = ({ ticketId, onMessageSent }) => {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const { sendMessage, sendingMessage } = useTicketMessaging(ticketId);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<MessageFormData>({
    resolver: yupResolver(messageSchema),
    defaultValues: {
      message: '',
    },
  });

  const messageText = watch('message');
  const isMessageEmpty = !messageText?.trim();
  const canSend = !isMessageEmpty && !sendingMessage;

  const handleFileSelect = useCallback((files: File[]) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const maxFiles = 5;
    
    const validFiles = Array.from(files).filter(file => {
      if (file.size > maxSize) {
        alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    const totalFiles = attachments.length + validFiles.length;
    if (totalFiles > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed.`);
      return;
    }

    setAttachments(prev => [...prev, ...validFiles]);
  }, [attachments]);

  const handleFileInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      handleFileSelect(Array.from(files));
    }
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFileSelect]);

  const handleRemoveAttachment = useCallback((index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileSelect(files);
  }, [handleFileSelect]);

  const onSubmit = useCallback(async (data: MessageFormData) => {
    try {
      const messageData: CreateMessageForm = {
        message: data.message.trim(),
        attachments: attachments.length > 0 ? attachments : undefined,
      };

      await sendMessage(messageData);
      reset();
      setAttachments([]);
      onMessageSent?.();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [sendMessage, attachments, reset, onMessageSent]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && canSend) {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  }, [handleSubmit, onSubmit, canSend]);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        border: isDragOver ? `2px dashed ${theme.palette.primary.main}` : undefined,
        bgcolor: isDragOver ? 'action.hover' : 'background.paper',
        transition: 'all 0.2s ease',
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {sendingMessage && <LinearProgress sx={{ mb: 2 }} />}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Attachments Display */}
        {attachments.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Attachments ({attachments.length}/5):
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {attachments.map((file, index) => (
                <Chip
                  key={index}
                  icon={<FileIcon />}
                  label={`${file.name} (${formatFileSize(file.size)})`}
                  onDelete={() => handleRemoveAttachment(index)}
                  deleteIcon={<CloseIcon />}
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Message Input */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <Controller
            name="message"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                placeholder="Type your message... (Shift+Enter for new line)"
                multiline
                minRows={1}
                maxRows={6}
                fullWidth
                variant="outlined"
                size="small"
                disabled={sendingMessage}
                error={!!errors.message}
                helperText={errors.message?.message}
                onKeyDown={handleKeyDown}
                sx={{
                  '& .MuiInputBase-root': {
                    fontSize: '0.875rem',
                  },
                }}
              />
            )}
          />

          {/* File Upload Button */}
          <IconButton
            onClick={() => fileInputRef.current?.click()}
            disabled={sendingMessage || attachments.length >= 5}
            sx={{ mb: errors.message ? 3 : 0 }}
          >
            <AttachIcon />
          </IconButton>

          {/* Send Button */}
          <Button
            type="submit"
            variant="contained"
            disabled={!canSend}
            startIcon={<SendIcon />}
            sx={{ mb: errors.message ? 3 : 0, minWidth: 'auto' }}
          >
            Send
          </Button>
        </Box>

        {/* Character Count */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {isDragOver ? 'Drop files here to attach' : 'Drag files here or click attach button'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {messageText?.length || 0}/2000 characters
          </Typography>
        </Box>
      </form>

      {/* Hidden File Input */}
      <Box
        component="input"
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        multiple
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
        sx={{ display: 'none' }}
        aria-label="Select files to attach"
        title="Select files to attach"
      />
    </Paper>
  );
};