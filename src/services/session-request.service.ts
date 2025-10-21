import { apiClient, ApiResponse } from '../lib/api-client';
import { toast } from 'sonner';

export interface SessionRequest {
  id: string;
  studentId: string;
  institutionId: string;
  departmentId: string;
  sessionCount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSessionRequestData {
  studentId: string;
  institutionId: string;
  departmentId: string;
  sessionCount: number;
  reason?: string;
}

export interface UpdateSessionRequestStatusData {
  status: 'approved' | 'rejected';
  reviewedBy: string;
}

export class SessionRequestService {
  private static baseUrl = '/session-requests';

  static async createSessionRequest(requestData: any): Promise<any> {
    const response = await apiClient.post(`${this.baseUrl}`, requestData);
    return response.data;
  }

  static async getSessionRequests(departmentId: string): Promise<SessionRequest[]> {
    try {
      const response: ApiResponse<SessionRequest[]> = await apiClient.get(`${this.baseUrl}/department/${departmentId}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching session requests:', error);
      return [];
    }
  }

  static async updateSessionRequestStatus(requestId: string, status: string): Promise<any> {
    const response = await apiClient.put(`${this.baseUrl}/${requestId}/status`, { status });
    return response.data;
  }
}