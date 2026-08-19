import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: any;
}

export const sendSuccess = <T>(res: Response, data?: T, message?: string, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (res: Response, error: string, statusCode = 400, errors?: any) => {
  return res.status(statusCode).json({
    success: false,
    error,
    errors,
  });
};
