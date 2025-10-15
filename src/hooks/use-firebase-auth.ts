import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { firebaseAuthService } from '@/services/firebase-auth.service';
import { apiClient } from '@/lib/api-client';
import type { UserProfile, UserRole } from '@/types';

interface UseFirebaseAuthReturn {
  user: UserProfile | null;
  firebaseUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ user: UserProfile; token: string }>;
  register: (data: { name: string; email: string; password: string; institutionDomain?: string; role?: UserRole; department?: string; yearOfStudy?: string; }) => Promise<{ user: UserProfile; token: string }>;
  loginWithGoogle: (institutionContext?: { institutionName?: string, userType?: string }) => Promise<{ user: UserProfile; token: string }>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
}

export function useFirebaseAuth(): UseFirebaseAuthReturn {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('useFirebaseAuth: Setting up auth state listener');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('useFirebaseAuth: Auth state changed', { firebaseUser: !!firebaseUser });
      
      // Set loading state when auth state changes
      setIsLoading(true);
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          console.log('useFirebaseAuth: Fetching user profile for', firebaseUser.uid);
          
          // Get Firebase ID token
          const firebaseToken = await firebaseUser.getIdToken();
          
          // Exchange Firebase token for backend JWT token
          try {
            const response = await apiClient.post('/auth/exchange-firebase-token', { firebaseToken });
            const { user: backendUser, token: backendToken } = response.data;
            
            // Set the backend token in apiClient
            apiClient.setAuthToken(backendToken);
            
            // Fetch user profile from our service
            const userProfile = await firebaseAuthService.getCurrentUser();
            console.log('useFirebaseAuth: User profile fetched', { userProfile: !!userProfile });
            setUser(userProfile || backendUser);
          } catch (exchangeError) {
            console.error('Error exchanging Firebase token for backend token:', exchangeError);
            // Fallback to Firebase-only auth
            const userProfile = await firebaseAuthService.getCurrentUser();
            console.log('useFirebaseAuth: User profile fetched (fallback)', { userProfile: !!userProfile });
            setUser(userProfile);
          }
        } catch (error) {
          console.error('Error getting user profile:', error);
          setError(error instanceof Error ? error.message : 'Failed to get user profile');
          setUser(null);
        }
      } else {
        console.log('useFirebaseAuth: No firebase user, setting user to null');
        setUser(null);
        // Clear the auth token when user logs out
        apiClient.clearAuthToken();
      }
      
      // Always set loading to false after processing
      setIsLoading(false);
      console.log('useFirebaseAuth: Finished processing auth state change');
    });

    // Cleanup function
    return () => {
      console.log('useFirebaseAuth: Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await firebaseAuthService.login({ email, password });
      
      // Exchange Firebase token for backend JWT token
      try {
        const response = await apiClient.post('/auth/exchange-firebase-token', { firebaseToken: result.token });
        const { token: backendToken } = response.data;
        apiClient.setAuthToken(backendToken);
      } catch (exchangeError) {
        console.error('Error exchanging Firebase token for backend token:', exchangeError);
      }
      
      return result;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { name: string; email: string; password: string; institutionDomain?: string; role?: UserRole; department?: string; yearOfStudy?: string; }) => {
    setIsLoading(true);
    try {
      const result = await firebaseAuthService.register(data);
      
      // Exchange Firebase token for backend JWT token
      try {
        const response = await apiClient.post('/auth/exchange-firebase-token', { firebaseToken: result.token });
        const { token: backendToken } = response.data;
        apiClient.setAuthToken(backendToken);
      } catch (exchangeError) {
        console.error('Error exchanging Firebase token for backend token:', exchangeError);
      }
      
      return result;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (institutionContext?: { institutionName?: string, userType?: string }) => {
    setIsLoading(true);
    try {
      const result = await firebaseAuthService.loginWithGoogle(institutionContext);
      
      // Exchange Firebase token for backend JWT token
      try {
        const response = await apiClient.post('/auth/exchange-firebase-token', { firebaseToken: result.token });
        const { token: backendToken } = response.data;
        apiClient.setAuthToken(backendToken);
      } catch (exchangeError) {
        console.error('Error exchanging Firebase token for backend token:', exchangeError);
      }
      
      return result;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Google login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await firebaseAuthService.logout();
      // Clear the auth token when user logs out
      apiClient.clearAuthToken();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Logout failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      await firebaseAuthService.requestPasswordReset(email);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Password reset request failed');
      throw error;
    }
  };

  return {
    user,
    firebaseUser,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    loginWithGoogle,
    logout,
    requestPasswordReset
  };
}