import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { firebaseAuthService } from '@/services/firebase-auth.service';
import { apiClient } from '@/lib/api-client';
import { UserProfile, UserRole } from '@/types';
import { scheduleTokenRefresh } from '@/utils/token-utils';
import { accountSwitcherService } from '@/services/account-switcher.service';

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: User | null;
  isLoading: boolean;
  isAccountSwitching: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ user: UserProfile; token: string }>;
  register: (data: { name: string; email: string; password: string; institutionDomain?: string; role?: UserRole; department?: string; yearOfStudy?: string; }) => Promise<{ user: UserProfile; token: string }>;
  loginWithGoogle: (institutionContext?: { institutionName?: string, userType?: string }) => Promise<{ user: UserProfile; token: string }>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccountSwitching, setIsAccountSwitching] = useState(false);

  // Helper to fetch user profile
  const fetchUserProfile = async (currentUser: User) => {
    try {
      console.log('AuthProvider: Fetching user profile for', currentUser.uid);
      
      // Get a fresh Firebase ID token with forced refresh
      const firebaseToken = await currentUser.getIdToken(true);
      
      // Exchange Firebase token for backend JWT token
      try {
        const exchangeResult = await firebaseAuthService.exchangeFirebaseToken(firebaseToken);
        apiClient.setAuthToken(exchangeResult.token);
        scheduleTokenRefresh();
        
        // Fetch user profile from our service
        const userProfile = await firebaseAuthService.getCurrentUser();
        setUser(userProfile);
        
        // Check for and handle pending account switches
        accountSwitcherService.handlePendingAccountSwitch();
      } catch (exchangeError) {
        console.error('Error exchanging Firebase token:', exchangeError);
        // Fallback
        apiClient.setAuthToken(firebaseToken);
        const userProfile = await firebaseAuthService.getCurrentUser();
        setUser(userProfile);
        accountSwitcherService.handlePendingAccountSwitch();
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
      setUser(null);
    }
  };

  const refreshUserProfile = async () => {
    if (firebaseUser) {
      await fetchUserProfile(firebaseUser);
    }
  };

  useEffect(() => {
    console.log('AuthProvider: Setting up auth state listener');
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('AuthProvider: Auth state changed', { hasUser: !!currentUser, isAccountSwitching });
      
      if (isAccountSwitching) {
        setFirebaseUser(currentUser);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setFirebaseUser(currentUser);
      
      if (currentUser) {
        await fetchUserProfile(currentUser);
      } else {
        setUser(null);
        apiClient.clearAuthToken();
      }
      
      setIsLoading(false);
    });

    // Safety timeout
    const safetyTimeout = setTimeout(() => {
      if (isLoading) {
        console.warn('AuthProvider: Safety timeout triggered');
        setIsLoading(false);
      }
    }, 10000);

    // Subscribe to account switcher changes
    const unsubscribeAccountSwitcher = accountSwitcherService.subscribe(() => {
      setIsAccountSwitching(true);
      const activeAccountSession = accountSwitcherService.getActiveAccount();
      
      if (activeAccountSession) {
        setUser(activeAccountSession.user);
      } else {
        setUser(null);
      }
      
      setTimeout(() => setIsAccountSwitching(false), 500);
    });

    const unsubscribeSwitching = accountSwitcherService.subscribeToSwitching((switching) => {
      setIsAccountSwitching(switching);
    });
    
    return () => {
      clearTimeout(safetyTimeout);
      unsubscribe();
      if (unsubscribeAccountSwitcher) unsubscribeAccountSwitcher();
      if (unsubscribeSwitching) unsubscribeSwitching();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await firebaseAuthService.login({ email, password });
      
      try {
        const exchangeResult = await firebaseAuthService.exchangeFirebaseToken(result.token);
        apiClient.setAuthToken(exchangeResult.token);
        // User profile will be updated by onAuthStateChanged listener
        return exchangeResult;
      } catch (exchangeError) {
        apiClient.setAuthToken(result.token);
        return result;
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { name: string; email: string; password: string; institutionDomain?: string; role?: UserRole; department?: string; yearOfStudy?: string; }) => {
    setIsLoading(true);
    try {
      const result = await firebaseAuthService.register(data);
      
      try {
        const exchangeResult = await firebaseAuthService.exchangeFirebaseToken(result.token);
        apiClient.setAuthToken(exchangeResult.token);
        return exchangeResult;
      } catch (exchangeError) {
        apiClient.setAuthToken(result.token);
        return result;
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (institutionContext?: { institutionName?: string, userType?: string }) => {
    setIsLoading(true);
    try {
      const result = await firebaseAuthService.loginWithGoogle(institutionContext);
      
      try {
        const exchangeResult = await firebaseAuthService.exchangeFirebaseToken(result.token);
        apiClient.setAuthToken(exchangeResult.token);
        return exchangeResult;
      } catch (exchangeError) {
        apiClient.setAuthToken(result.token);
        return result;
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await firebaseAuthService.logout();
      apiClient.clearAuthToken();
      setUser(null);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const requestPasswordReset = async (email: string) => {
    await firebaseAuthService.requestPasswordReset(email);
  };

  const value = {
    user,
    firebaseUser,
    isLoading,
    isAccountSwitching,
    isAuthenticated: !!user,
    login,
    register,
    loginWithGoogle,
    logout,
    requestPasswordReset,
    refreshUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
