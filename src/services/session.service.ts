import { apiClient, ApiResponse } from '../lib/api-client';
import { toast } from 'sonner';
import { authService } from './auth.service';

export interface SessionPurchase {
  id: string;
  institutionId: string;
  sessionId: string;
  purchaseDate: Date;
  quantity: number;
  pricePerSession: number;
  totalPrice: number;
  status: 'pending' | 'completed' | 'cancelled';
  clientSecret?: string;
}

// Add a new interface for creating session purchases
export interface CreateSessionPurchaseData {
  sessionCount: number;
  pricePerSession: number;
  paymentMethodId?: string;
}

export interface SessionAllocation {
  id: string;
  institutionId: string;
  name?: string;
  departmentId?: string;
  studentId?: string;
  allocationType: 'institution' | 'department' | 'student';
  allocatedSessions: number;
  usedSessions: number;
  startDate: Date;
  endDate: number;
  isActive: boolean;
}

export interface SessionPool {
  totalSessions: number;
  usedSessions: number;
  availableSessions: number;
  lastUpdated: Date;
}

export class SessionService {
  private static baseUrl = '/sessions';
  private static stripeBaseUrl = '/stripe';

  // Session Purchase Methods
  static async getSessionPurchases(institutionId: string): Promise<SessionPurchase[]> {
    try {
      const response: ApiResponse<SessionPurchase[]> = await apiClient.get(`${this.baseUrl}/purchases`);
      // Handle case where response.data might be null or undefined
      if (!response.data) {
        return [];
      }
      return response.data.map((purchase: any) => ({
        ...purchase,
        purchaseDate: purchase.purchaseDate ? new Date(purchase.purchaseDate) : new Date(),
      }));
    } catch (error: any) {
      // Handle different types of errors appropriately
      // Don't show error toast for 404 errors as it may be normal not to have purchases yet
      if (error.status === 404) {
        return [];
      }
      
      // For 400 responses (bad request), don't show toast but still throw the error
      if (error.status === 400) {
        console.warn('Session purchases request failed with 400 (Bad Request):', error.message);
        return [];
      }
      
      // Show error toast for actual errors (network issues, 5xx server errors, etc.)
      // but not for normal client errors
      if (error.status === undefined) {
        // Network error
        toast.error('Network error: Failed to fetch session purchases');
      } else if (error.status >= 500) {
        // Server error
        toast.error('Server error: Failed to fetch session purchases');
      } else {
        // Other errors (401, 403, etc.) - log but don't show toast
        console.warn(`Session purchases request failed with status ${error.status}:`, error.message);
      }
      
      throw error;
    }
  }

  static async createSessionPurchase(purchaseData: CreateSessionPurchaseData): Promise<any> {
    try {
      // Make direct API call to match backend expectations
      const response = await apiClient.post('/sessions/purchases', purchaseData);
      console.log('Session purchase response:', response);
      return response.data;
    } catch (error: any) {
      console.error('Session purchase error:', error);
      // Show error toast for actual errors
      if (error.status === undefined) {
        // Network error
        toast.error('Network error: Failed to create session purchase');
      } else if (error.status === 403) {
        // Permission error
        toast.error('Permission denied: You do not have permission to purchase sessions');
      } else if (error.status === 404) {
        // Not found error
        toast.error('Purchase service not found: The session purchase service is currently unavailable');
      } else if (error.status >= 500) {
        // Server error
        toast.error('Server error: Failed to create session purchase');
      } else if (error.status >= 400) {
        // Client error
        toast.error(error.message || 'Failed to create session purchase');
      }
      
      throw error;
    }
  }

  // Session Pool Methods
  static async getSessionPool(): Promise<SessionPool | null> {
    try {
      const response: ApiResponse<SessionPool> = await apiClient.get(`${this.baseUrl}/pool`);
      // Handle case where response.data might be null
      if (!response.data) {
        return null;
      }
      return {
        ...response.data,
        lastUpdated: response.data.lastUpdated ? new Date(response.data.lastUpdated) : new Date(),
      };
    } catch (error: any) {
      // Handle different types of errors appropriately
      // Don't show error toast for 404 errors as it's normal not to have a session pool yet
      // According to project specification: "A 404 response when fetching session allocations 
      // should not trigger an error message display, as it may be a normal state indicating 
      // no allocations exist yet. Only network errors or unexpected status codes should show error messages."
      
      // For 404 responses, return null as it's a normal state
      if (error.status === 404) {
        return null;
      }
      
      // For 400 responses (bad request), don't show toast but still log
      // This might happen if institutionId is missing from the user context
      if (error.status === 400) {
        console.warn('Session pool request failed with 400 (Bad Request):', error.message);
        return null;
      }
      
      // Show error toast for actual errors (network issues, 5xx server errors, etc.)
      // but not for normal client errors
      if (error.status === undefined) {
        // Network error
        toast.error('Network error: Failed to fetch session pool');
      } else if (error.status >= 500) {
        // Server error
        toast.error('Server error: Failed to fetch session pool');
      } else {
        // Other errors (401, 403, etc.) - log but don't show toast
        console.warn(`Session pool request failed with status ${error.status}:`, error.message);
      }
      
      throw error;
    }
  }

  static async getSessionAllocations(): Promise<SessionAllocation[]> {
    try {
      const response: ApiResponse<SessionAllocation[]> = await apiClient.get(`${this.baseUrl}/allocations`);
      // Handle case where response.data might be null or undefined
      if (!response.data) {
        return [];
      }
      return response.data.map((allocation: any) => ({
        ...allocation,
        startDate: allocation.startDate ? new Date(allocation.startDate) : new Date(),
      }));
    } catch (error: any) {
      // Handle different types of errors appropriately
      // Don't show error toast for 404 errors as it may be normal not to have allocations yet
      // According to project specification: "A 404 response when fetching session allocations 
      // should not trigger an error message display, as it may be a normal state indicating 
      // no allocations exist yet. Only network errors or unexpected status codes should show error messages."
      
      // For 404 responses, return empty array as it's a normal state
      if (error.status === 404) {
        return [];
      }
      
      // For 400 responses (bad request), don't show toast but still throw the error
      if (error.status === 400) {
        console.warn('Session allocations request failed with 400 (Bad Request):', error.message);
        return [];
      }
      
      // Show error toast for actual errors (network issues, 5xx server errors, etc.)
      // but not for normal client errors
      if (error.status === undefined) {
        // Network error
        toast.error('Network error: Failed to fetch session allocations');
      } else if (error.status >= 500) {
        // Server error
        toast.error('Server error: Failed to fetch session allocations');
      } else {
        // Other errors (401, 403, etc.) - log but don't show toast
        console.warn(`Session allocations request failed with status ${error.status}:`, error.message);
      }
      
      throw error;
    }
  }

  static async createSessionAllocation(allocationData: Partial<SessionAllocation>): Promise<SessionAllocation> {
    try {
      const response: ApiResponse<SessionAllocation> = await apiClient.post(`${this.baseUrl}/allocations`, allocationData);
      return {
        ...response.data,
        startDate: new Date(response.data.startDate),
      };
    } catch (error: any) {
      // Show error toast for actual errors
      if (error.status === undefined) {
        // Network error
        toast.error('Network error: Failed to create session allocation');
      } else if (error.status >= 500) {
        // Server error
        toast.error('Server error: Failed to create session allocation');
      } else if (error.status >= 400) {
        // Client error
        toast.error(error.message || 'Failed to create session allocation');
      }
      
      throw error;
    }
  }

  static async updateSessionAllocation(id: string, allocationData: Partial<SessionAllocation>): Promise<SessionAllocation> {
    try {
      const response: ApiResponse<SessionAllocation> = await apiClient.put(`${this.baseUrl}/allocations/${id}`, allocationData);
      return {
        ...response.data,
        startDate: new Date(response.data.startDate),
      };
    } catch (error: any) {
      // Show error toast for actual errors
      if (error.status === undefined) {
        // Network error
        toast.error('Network error: Failed to update session allocation');
      } else if (error.status >= 500) {
        // Server error
        toast.error('Server error: Failed to update session allocation');
      } else if (error.status >= 400) {
        // Client error
        toast.error(error.message || 'Failed to update session allocation');
      }
      
      throw error;
    }
  }

  static async deleteSessionAllocation(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseUrl}/allocations/${id}`);
      toast.success('Session allocation deleted');
    } catch (error: any) {
      toast.error('Failed to delete session allocation');
      throw error;
    }
  }

  // Add Stripe-related methods
  static async getPaymentMethods(): Promise<any[]> {
    try {
      const response: ApiResponse<any[]> = await apiClient.get(`${this.stripeBaseUrl}/payment-methods`);
      // Ensure we return an array even if response.data is null/undefined
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      // Handle different types of errors appropriately
      // Don't show error toast for 404 errors as it may be normal not to have payment methods yet
      if (error.status === 404) {
        return [];
      }
      
      // For 400 responses (bad request), don't show toast but still throw the error
      if (error.status === 400) {
        console.warn('Payment methods request failed with 400 (Bad Request):', error.message);
        return [];
      }
      
      // Show error toast for actual errors (network issues, 5xx server errors, etc.)
      // but not for normal client errors
      if (error.status === undefined) {
        // Network error
        toast.error('Network error: Failed to fetch payment methods');
      } else if (error.status >= 500) {
        // Server error
        toast.error('Server error: Failed to fetch payment methods');
      } else {
        // Other errors (401, 403, etc.) - log but don't show toast
        console.warn(`Payment methods request failed with status ${error.status}:`, error.message);
      }
      
      throw error;
    }
  }

  static async savePaymentMethod(paymentMethodId: string): Promise<any> {
    try {
      const response: ApiResponse<any> = await apiClient.post(`${this.stripeBaseUrl}/payment-methods`, {
        paymentMethodId
      });
      toast.success('Payment method saved successfully');
      return response.data;
    } catch (error: any) {
      // Show error toast for actual errors
      if (error.status === undefined) {
        // Network error
        toast.error('Network error: Failed to save payment method');
      } else if (error.status >= 500) {
        // Server error
        toast.error('Server error: Failed to save payment method');
      } else if (error.status >= 400) {
        // Client error
        toast.error(error.message || 'Failed to save payment method');
      }
      
      throw error;
    }
  }

  static async deletePaymentMethod(paymentMethodId: string): Promise<any> {
    try {
      const response: ApiResponse<any> = await apiClient.delete(`${this.stripeBaseUrl}/payment-methods?paymentMethodId=${paymentMethodId}`);
      toast.success('Payment method deleted successfully');
      return response.data;
    } catch (error: any) {
      // Show error toast for actual errors
      if (error.status === undefined) {
        // Network error
        toast.error('Network error: Failed to delete payment method');
      } else if (error.status >= 500) {
        // Server error
        toast.error('Server error: Failed to delete payment method');
      } else if (error.status >= 400) {
        // Client error
        toast.error(error.message || 'Failed to delete payment method');
      }
      
      throw error;
    }
  }

  static async getInvoices(): Promise<any[]> {
    try {
      const response: ApiResponse<any[]> = await apiClient.get(`${this.stripeBaseUrl}/invoices`);
      // Ensure we return an array even if response.data is null/undefined
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      // Handle different types of errors appropriately
      // Don't show error toast for 404 errors as it may be normal not to have invoices yet
      if (error.status === 404) {
        return [];
      }
      
      // For 400 responses (bad request), don't show toast but still throw the error
      if (error.status === 400) {
        console.warn('Invoices request failed with 400 (Bad Request):', error.message);
        return [];
      }
      
      // Show error toast for actual errors (network issues, 5xx server errors, etc.)
      // but not for normal client errors
      if (error.status === undefined) {
        // Network error
        toast.error('Network error: Failed to fetch invoices');
      } else if (error.status >= 500) {
        // Server error
        toast.error('Server error: Failed to fetch invoices');
      } else {
        // Other errors (401, 403, etc.) - log but don't show toast
        console.warn(`Invoices request failed with status ${error.status}:`, error.message);
      }
      
      throw error;
    }
  }
}