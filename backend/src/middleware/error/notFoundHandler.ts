import { Request, Response } from 'express';
import { ApiResponse } from '../../../../shared/types/api';

/**
 * 404 Not Found middleware
 */
export const notFoundHandler = (req: Request, res: Response<ApiResponse>): void => {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
};