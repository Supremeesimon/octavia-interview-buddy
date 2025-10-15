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
  private static baseUrl = '/api/session-requests';

  // Create a new session request
  static async createSessionRequest(requestData: CreateSessionRequestData): Promise<SessionRequest> {
    try {
      const response: ApiResponse<SessionRequest> = await apiClient.post(this.baseUrl, requestData);
      toast.success('Session request submitted successfully');
      return {
        ...response.data,
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt),
        reviewedAt: response.data.reviewedAt ? new Date(response.data.reviewedAt) : undefined
      };
    } catch (error) {
      toast.error('Failed to submit session request');
      throw error;
    }
  }

  // Get session requests for a department
  static async getDepartmentSessionRequests(departmentId: string, status?: 'pending' | 'approved' | 'rejected'): Promise<SessionRequest[]> {
    try {
      const queryParams = status ? `?status=${status}` : '';
      const response: ApiResponse<SessionRequest[]> = await apiClient.get(`${this.baseUrl}/department/${departmentId}${queryParams}`);
      return response.data.map(request => ({
        ...request,
        createdAt: new Date(request.createdAt),
        updatedAt: new Date(request.updatedAt),
        reviewedAt: request.reviewedAt ? new Date(request.reviewedAt) : undefined
      }));
    } catch (error) {
      toast.error('Failed to fetch session requests');
      throw error;
    }
  }

  // Update session request status
  static async updateSessionRequestStatus(id: string, statusData: UpdateSessionRequestStatusData): Promise<SessionRequest> {
    try {
      const response: ApiResponse<SessionRequest> = await apiClient.put(`${this.baseUrl}/${id}/status`, statusData);
      
      const message = statusData.status === 'approved' 
        ? 'Session request approved successfully' 
        : 'Session request rejected';
        
      toast.success(message);
      
      return {
        ...response.data,
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt),
        reviewedAt: response.data.reviewedAt ? new Date(response.data.reviewedAt) : undefined
      };
    } catch (error) {
      toast.error('Failed to update session request status');
      throw error;
    }
  }
}