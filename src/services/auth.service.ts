/**
 * Authentication Service
 * Handles user authentication, registration, and session management
 */

import apiClient, { ApiResponse } from '@/lib/api-client';
import type { 
  User, 
  LoginRequest, 
  LoginResponse, 
  SignupRequest,
  UserRole
} from '@/types';

export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;

  private constructor() {
    // Load user from localStorage on initialization
    this.loadUserFromStorage();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private loadUserFromStorage(): void {
    try {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('authToken');
      
      if (userData && token) {
        this.currentUser = JSON.parse(userData);
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
      this.clearSession();
    }
  }

  private saveUserToStorage(user: User, token: string): void {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('authToken', token);
    apiClient.setAuthToken(token);
  }

  private clearSession(): void {
    this.currentUser = null;
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    apiClient.clearAuthToken();
  }

  /**
   * Login user with email and password
   */
  async login(credentials: LoginRequest): Promise<User> {
    try {
      const response: ApiResponse<LoginResponse> = await apiClient.post('/auth/login', credentials);
      
      const { user, token } = response.data;
      this.currentUser = user;
      this.saveUserToStorage(user, token);
      
      return user;
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  }

  /**
   * Register new user
   */
  async register(userData: SignupRequest & { role?: UserRole, department?: string, yearOfStudy?: string }): Promise<User> {
    try {
      const response: ApiResponse<LoginResponse> = await apiClient.post('/auth/register', userData);
      
      const { user, token } = response.data;
      this.currentUser = user;
      this.saveUserToStorage(user, token);
      
      return user;
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearSession();
    }
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null && !!localStorage.getItem('authToken');
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: User['role']): boolean {
    return this.currentUser?.role === role;
  }

  /**
   * Check if user belongs to specific institution
   */
  belongsToInstitution(institutionId: string): boolean {
    return this.currentUser?.institutionId === institutionId;
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      await apiClient.post('/auth/request-password-reset', { email });
    } catch (error: any) {
      throw new Error(error.message || 'Password reset request failed');
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await apiClient.post('/auth/reset-password', { token, password: newPassword });
    } catch (error: any) {
      throw new Error(error.message || 'Password reset failed');
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    try {
      await apiClient.post('/auth/verify-email', { token });
      
      // Update current user's email verification status
      if (this.currentUser) {
        this.currentUser.isEmailVerified = true;
        this.saveUserToStorage(this.currentUser, localStorage.getItem('authToken')!);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Email verification failed');
    }
  }

  /**
   * Resend email verification
   */
  async resendEmailVerification(): Promise<void> {
    try {
      await apiClient.post('/auth/resend-verification');
    } catch (error: any) {
      throw new Error(error.message || 'Failed to resend verification email');
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<void> {
    try {
      // Import the refreshToken function from token-utils
      const { refreshToken } = await import('@/utils/token-utils');
      
      // Attempt to refresh the token
      const refreshed = await refreshToken();
      
      if (!refreshed) {
        throw new Error('Token refresh failed');
      }
      
      // Update current user with new token
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        this.saveUserToStorage(currentUser, localStorage.getItem('authToken')!);
      }
    } catch (error: any) {
      console.error('Token refresh failed:', error);
      this.clearSession();
      throw new Error('Session expired. Please login again.');
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const response: ApiResponse<User> = await apiClient.put('/auth/profile', updates);
      
      this.currentUser = response.data;
      this.saveUserToStorage(this.currentUser, localStorage.getItem('authToken')!);
      
      return this.currentUser;
    } catch (error: any) {
      throw new Error(error.message || 'Profile update failed');
    }
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await apiClient.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
    } catch (error: any) {
      throw new Error(error.message || 'Password change failed');
    }
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();

export default authService;