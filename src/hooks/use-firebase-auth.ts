import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { firebaseAuthService } from '@/services/firebase-auth.service';
import type { UserProfile } from '@/types';

interface UseFirebaseAuthReturn {
  user: UserProfile | null;
  firebaseUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ user: UserProfile; token: string }>;
  register: (data: { name: string; email: string; password: string; institutionDomain?: string }) => Promise<{ user: UserProfile; token: string }>;
  loginWithGoogle: () => Promise<{ user: UserProfile; token: string }>;
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
          const userProfile = await firebaseAuthService.getCurrentUser();
          console.log('useFirebaseAuth: User profile fetched', { userProfile: !!userProfile });
          setUser(userProfile);
        } catch (error) {
          console.error('Error getting user profile:', error);
          setError(error instanceof Error ? error.message : 'Failed to get user profile');
          setUser(null);
        }
      } else {
        console.log('useFirebaseAuth: No firebase user, setting user to null');
        setUser(null);
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
      return result;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { name: string; email: string; password: string; institutionDomain?: string }) => {
    setIsLoading(true);
    try {
      const result = await firebaseAuthService.register(data);
      return result;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const result = await firebaseAuthService.loginWithGoogle();
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