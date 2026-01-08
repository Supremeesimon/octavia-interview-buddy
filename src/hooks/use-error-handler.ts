/**
 * Error Handling Hook
 * Provides centralized error handling for components
 */

import { useCallback } from 'react';
import { errorHandler, AppError } from '@/lib/error-handler';
import { toast } from 'sonner';

interface UseErrorHandlerReturn {
  handleApiError: (error: any, context?: string) => AppError;
  handleAuthError: (error: any, action?: string) => AppError;
  handleAccountError: (error: any, accountId?: string) => AppError;
  handleError: (error: any, message: string, context?: string) => void;
}

export function useErrorHandler(): UseErrorHandlerReturn {
  const handleApiError = useCallback((error: any, context: string = 'API Request'): AppError => {
    return errorHandler.handleApiError(error, context);
  }, []);

  const handleAuthError = useCallback((error: any, action: string = 'authentication'): AppError => {
    return errorHandler.handleAuthError(error, action);
  }, []);

  const handleAccountError = useCallback((error: any, accountId?: string): AppError => {
    return errorHandler.handleAccountSwitchError(error, accountId);
  }, []);

  const handleError = useCallback((error: any, message: string, context: string = 'Application'): void => {
    const appError = errorHandler.createError(message, 'COMPONENT_ERROR', context, error);
    errorHandler['logError'](appError);
    toast.error(message);
  }, []);

  return {
    handleApiError,
    handleAuthError,
    handleAccountError,
    handleError
  };
}