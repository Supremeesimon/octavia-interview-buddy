/**
 * Authentication Hook
 * Provides authentication state and actions for React components
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import authService from '@/services/auth.service';
import type { User, LoginRequest, SignupRequest } from '@/types';

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: SignupRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
  hasRole: (role: User['role']) => boolean;
  belongsToInstitution: (institutionId: string) => boolean;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(authService.getCurrentUser());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check authentication status on mount
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await authService.login(credentials);
      setUser(user);
      
      // Navigate based on user role
      switch (user.role) {
        case 'student':
          navigate('/student');
          break;
        case 'institution_admin':
          navigate('/dashboard');
          break;
        case 'platform_admin':
          navigate('/admin');
          break;
        default:
          navigate('/');
      }
      
      toast.success(`Welcome back, ${user.name}!`);
    } catch (err: any) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const register = useCallback(async (userData: SignupRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await authService.register(userData);
      setUser(user);
      
      // Navigate to appropriate dashboard
      if (user.role === 'student') {
        navigate('/student');
      } else {
        navigate('/dashboard');
      }
      
      toast.success(`Welcome to Octavia, ${user.name}!`);
      
      // Show email verification reminder if needed
      if (!user.isEmailVerified) {
        toast.info('Please check your email to verify your account.');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Registration failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      await authService.logout();
      setUser(null);
      navigate('/');
      toast.success('Logged out successfully');
    } catch (err: any) {
      console.error('Logout error:', err);
      // Clear local state even if API call fails
      setUser(null);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const refreshToken = useCallback(async () => {
    try {
      await authService.refreshToken();
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
    } catch (err: any) {
      console.error('Token refresh failed:', err);
      setUser(null);
      navigate('/login');
      toast.error('Session expired. Please login again.');
    }
  }, [navigate]);

  const hasRole = useCallback((role: User['role']) => {
    return authService.hasRole(role);
  }, [user]);

  const belongsToInstitution = useCallback((institutionId: string) => {
    return authService.belongsToInstitution(institutionId);
  }, [user]);

  return {
    user,
    isAuthenticated: authService.isAuthenticated(),
    isLoading,
    error,
    login,
    register,
    logout,
    refreshToken,
    clearError,
    hasRole,
    belongsToInstitution,
  };
};

export default useAuth;