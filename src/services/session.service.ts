import apiClient from '@/lib/api-client';
import type { ApiResponse } from '@/lib/api-client';
import type { SessionAllocation, SessionPool, SessionPurchase } from '@/types';

export class SessionService {
  private static readonly BASE_URL = '/sessions';

  /**
   * Get session purchases for the current institution
   */
  static async getSessionPurchases(): Promise<SessionPurchase[]> {
    try {
      const response: ApiResponse<SessionPurchase[]> = await apiClient.get(`${this.BASE_URL}/purchases`);
      return response.data;
    } catch (error) {
      console.error('Error fetching session purchases:', error);
      throw error;
    }
  }

  /**
   * Create a new session purchase
   */
  static async createSessionPurchase(sessionCount: number, pricePerSession: number): Promise<SessionPurchase> {
    try {
      const response: ApiResponse<SessionPurchase> = await apiClient.post(`${this.BASE_URL}/purchases`, {
        sessionCount,
        pricePerSession
      });
      return response.data;
    } catch (error) {
      console.error('Error creating session purchase:', error);
      throw error;
    }
  }

  /**
   * Get session pool for the current institution
   */
  static async getSessionPool(): Promise<SessionPool | null> {
    try {
      const response: ApiResponse<SessionPool | null> = await apiClient.get(`${this.BASE_URL}/pool`);
      return response.data;
    } catch (error) {
      console.error('Error fetching session pool:', error);
      throw error;
    }
  }

  /**
   * Get session allocations for the current institution
   */
  static async getSessionAllocations(): Promise<SessionAllocation[]> {
    try {
      const response: ApiResponse<SessionAllocation[]> = await apiClient.get(`${this.BASE_URL}/allocations`);
      return response.data;
    } catch (error) {
      console.error('Error fetching session allocations:', error);
      throw error;
    }
  }

  /**
   * Create a new session allocation
   */
  static async createSessionAllocation(
    name: string,
    allocatedSessions: number,
    departmentId?: string,
    groupId?: string
  ): Promise<SessionAllocation> {
    try {
      const response: ApiResponse<SessionAllocation> = await apiClient.post(`${this.BASE_URL}/allocations`, {
        name,
        allocatedSessions,
        departmentId,
        groupId
      });
      return response.data;
    } catch (error) {
      console.error('Error creating session allocation:', error);
      throw error;
    }
  }

  /**
   * Update an existing session allocation
   */
  static async updateSessionAllocation(
    id: string,
    updates: Partial<{
      name: string;
      allocatedSessions: number;
      departmentId: string;
      groupId: string;
    }>
  ): Promise<SessionAllocation> {
    try {
      const response: ApiResponse<SessionAllocation> = await apiClient.put(`${this.BASE_URL}/allocations/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating session allocation:', error);
      throw error;
    }
  }

  /**
   * Delete a session allocation
   */
  static async deleteSessionAllocation(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.BASE_URL}/allocations/${id}`);
    } catch (error) {
      console.error('Error deleting session allocation:', error);
      throw error;
    }
  }
}

export default SessionService;