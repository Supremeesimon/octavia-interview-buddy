/**
 * Centralized Error Handler
 * Standardized error handling and logging across the application
 */

import { toast } from "sonner";

export interface AppError {
  message: string;
  code?: string;
  status?: number;
  originalError?: any;
  context?: string;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  
  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle API errors with user-friendly messages
   */
  handleApiError(error: any, context: string = 'API Request'): AppError {
    const appError: AppError = {
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      status: 0,
      originalError: error,
      context
    };

    // Handle network errors
    if (error.code === 'NETWORK_ERROR' || error.status === 0) {
      appError.message = 'Network connection failed. Please check your internet connection.';
      appError.code = 'NETWORK_ERROR';
      this.logError(appError);
      toast.error('Connection Failed', {
        description: 'Please check your internet connection and try again.'
      });
      return appError;
    }

    // Handle timeout errors
    if (error.code === 'TIMEOUT' || error.status === 408) {
      appError.message = 'Request timed out. Please try again.';
      appError.code = 'TIMEOUT_ERROR';
      this.logError(appError);
      toast.error('Request Timeout', {
        description: 'The request took too long. Please try again.'
      });
      return appError;
    }

    // Handle authentication errors
    if (error.status === 401 || error.status === 403) {
      if (error.message?.includes('Invalid or expired token')) {
        appError.message = 'Session expired. Please log in again.';
        appError.code = 'TOKEN_EXPIRED';
        this.logWarn(appError);
        toast.error('Session Expired', {
          description: 'Your session has expired. Please log in again.'
        });
      } else {
        appError.message = 'Access denied. Please check your permissions.';
        appError.code = 'PERMISSION_DENIED';
        this.logWarn(appError);
        toast.error('Access Denied', {
          description: 'You don\'t have permission to perform this action.'
        });
      }
      return appError;
    }

    // Handle not found errors
    if (error.status === 404) {
      appError.message = 'Resource not found.';
      appError.code = 'NOT_FOUND';
      this.logWarn(appError);
      toast.error('Not Found', {
        description: 'The requested resource could not be found.'
      });
      return appError;
    }

    // Handle server errors
    if (error.status >= 500) {
      appError.message = 'Server error. Please try again later.';
      appError.code = 'SERVER_ERROR';
      this.logError(appError);
      toast.error('Server Error', {
        description: 'Something went wrong on our end. Please try again later.'
      });
      return appError;
    }

    // Handle bad request errors
    if (error.status === 400) {
      appError.message = error.message || 'Invalid request data.';
      appError.code = 'BAD_REQUEST';
      this.logWarn(appError);
      toast.error('Invalid Request', {
        description: error.message || 'Please check your input and try again.'
      });
      return appError;
    }

    // Log unknown errors
    this.logError(appError);
    toast.error('Unexpected Error', {
      description: 'An unexpected error occurred. Please try again.'
    });
    
    return appError;
  }

  /**
   * Handle authentication-specific errors
   */
  handleAuthError(error: any, action: string = 'authentication'): AppError {
    const appError: AppError = {
      message: `Authentication failed during ${action}`,
      code: 'AUTH_ERROR',
      originalError: error,
      context: 'Authentication'
    };

    // Firebase auth errors
    if (error.code) {
      switch (error.code) {
        case 'auth/user-not-found':
          appError.message = 'No account found with this email.';
          break;
        case 'auth/wrong-password':
          appError.message = 'Incorrect password.';
          break;
        case 'auth/email-already-in-use':
          appError.message = 'An account with this email already exists.';
          break;
        case 'auth/invalid-email':
          appError.message = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          appError.message = 'Password should be at least 6 characters.';
          break;
        case 'auth/network-request-failed':
          appError.message = 'Network error. Please check your connection.';
          appError.code = 'NETWORK_ERROR';
          break;
        default:
          appError.message = error.message || 'Authentication failed.';
      }
    }

    this.logWarn(appError);
    toast.error('Authentication Failed', {
      description: appError.message
    });

    return appError;
  }

  /**
   * Handle account switching errors
   */
  handleAccountSwitchError(error: any, accountId?: string): AppError {
    const appError: AppError = {
      message: 'Failed to switch accounts',
      code: 'ACCOUNT_SWITCH_ERROR',
      originalError: error,
      context: 'Account Switching'
    };

    // Enhanced error categorization
    if (error.message?.includes('Invalid or expired Firebase token')) {
      appError.message = 'Account session expired. Please log in again.';
      appError.code = 'ACCOUNT_TOKEN_EXPIRED';
    } else if (error.message?.includes('Account not found')) {
      appError.message = 'Account not found. It may have been removed.';
      appError.code = 'ACCOUNT_NOT_FOUND';
    } else if (error.message?.includes('Invalid or expired authentication token')) {
      appError.message = 'Authentication token expired. Attempting to refresh...';
      appError.code = 'AUTH_TOKEN_EXPIRED';
    } else if (error.message?.includes('No valid authentication token available')) {
      appError.message = 'No valid authentication session found.';
      appError.code = 'NO_AUTH_TOKEN';
    } else if (error.message?.includes('Failed to refresh expired token')) {
      appError.message = `Unable to refresh session for account ${accountId}. Please re-authenticate this account.`;
      appError.code = 'TOKEN_REFRESH_FAILED';
    } else if (error.message?.includes('Cannot switch to account') && error.message?.includes('Current user')) {
      const match = error.message.match(/Cannot switch to account ([^:]+): Current user ([^ ]+) doesn't match account owner ([^.]+)/);
      if (match) {
        const [, accountId, currentUser, accountOwner] = match;
        appError.message = `Account ${accountId} belongs to a different user (${accountOwner}). This account has been removed from your switcher. Please log in as that user to access it.`;
        appError.code = 'ACCOUNT_OWNER_MISMATCH';
      } else {
        appError.message = 'Account belongs to a different user and has been removed.';
        appError.code = 'USER_MISMATCH';
      }
    } else if (error.message?.includes('User mismatch')) {
      appError.message = `Account user doesn't match current session. Please log out and log back in as the correct user.`;
      appError.code = 'USER_MISMATCH';
    } else if (accountId) {
      appError.message = `Failed to switch to account ${accountId}`;
      // Add more specific error details if available
      if (error.message) {
        appError.message += `. Error: ${error.message}`;
      }
    }

    // Log detailed error information for debugging
    this.logDetailedAccountError(appError, accountId, error);
    
    toast.error('Account Switch Failed', {
      description: appError.message
    });

    return appError;
  }

  /**
   * Log error to console (production-safe)
   */
  private logError(error: AppError): void {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ERROR][${error.context}] ${error.message}`, {
        code: error.code,
        status: error.status,
        originalError: error.originalError
      });
    }
    // In production, send to error reporting service
    this.reportToMonitoring(error);
  }

  /**
   * Log detailed account switching error information
   */
  private logDetailedAccountError(error: AppError, accountId: string | undefined, originalError: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.group(`[ACCOUNT SWITCH ERROR] ${accountId || 'Unknown Account'}`);
      console.error('Error Details:', {
        accountId,
        errorCode: error.code,
        errorMessage: error.message,
        originalErrorMessage: originalError?.message,
        originalErrorStack: originalError?.stack,
        timestamp: new Date().toISOString()
      });
      
      // Check localStorage state
      try {
        const accountData = localStorage.getItem('accountSwitcherData');
        if (accountData) {
          const parsed = JSON.parse(accountData);
          console.log('Account Storage State:', {
            totalAccounts: Object.keys(parsed.accounts || {}).length,
            activeAccount: parsed.activeAccount,
            targetAccountExists: accountId ? !!parsed.accounts?.[accountId] : 'N/A'
          });
          
          if (accountId && parsed.accounts?.[accountId]) {
            const account = parsed.accounts[accountId];
            console.log('Target Account Details:', {
              userId: account.user?.id,
              email: account.user?.email,
              role: account.user?.role,
              hasToken: !!account.token,
              tokenLength: account.token?.length || 0,
              lastUsed: account.lastUsed
            });
          }
        } else {
          console.log('No account switcher data in localStorage');
        }
      } catch (storageError) {
        console.error('Error reading localStorage:', storageError);
      }
      
      console.groupEnd();
    }
    
    this.reportToMonitoring(error);
  }

  /**
   * Log warning to console (production-safe)
   */
  private logWarn(error: AppError): void {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[WARN][${error.context}] ${error.message}`, {
        code: error.code,
        status: error.status
      });
    }
    // In production, send to monitoring if severity warrants
    this.reportToMonitoring(error, 'warning');
  }

  /**
   * Report error to external monitoring service
   */
  private reportToMonitoring(error: AppError, level: 'error' | 'warning' = 'error'): void {
    // TODO: Implement actual error reporting service (Sentry, etc.)
    // For now, just log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[MONITORING][${level}] Reporting:`, error);
    }
  }

  /**
   * Create a standardized error object
   */
  createError(message: string, code: string, context: string, originalError?: any): AppError {
    return {
      message,
      code,
      context,
      originalError
    };
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

export default errorHandler;