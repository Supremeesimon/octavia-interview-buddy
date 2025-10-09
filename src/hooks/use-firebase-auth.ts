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
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
}

export function useFirebaseAuth(): UseFirebaseAuthReturn {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const userProfile = await firebaseAuthService.getCurrentUser();
          setUser(userProfile);
        } catch (error) {
          console.error('Error getting user profile:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await firebaseAuthService.login({ email, password });
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { name: string; email: string; password: string; institutionDomain?: string }) => {
    setIsLoading(true);
    try {
      const result = await firebaseAuthService.register(data);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await firebaseAuthService.logout();
    } finally {
      setIsLoading(false);
    }
  };

  const requestPasswordReset = async (email: string) => {
    await firebaseAuthService.requestPasswordReset(email);
  };

  return {
    user,
    firebaseUser,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    requestPasswordReset
  };
}