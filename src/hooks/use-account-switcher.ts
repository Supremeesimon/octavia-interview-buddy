import { useState, useEffect } from 'react';
import { accountSwitcherService } from '@/services/account-switcher.service';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import type { UserProfile } from '@/types';

interface UseAccountSwitcherReturn {
  activeAccount: UserProfile | null;
  accounts: UserProfile[];
  isLoading: boolean;
  hasMultipleAccounts: boolean;
  switchAccount: (accountId: string) => Promise<void>;
  addCurrentAccount: () => void;
  removeAccount: (accountId: string) => void;
  getAccountCount: () => number;
}

export function useAccountSwitcher(): UseAccountSwitcherReturn {
  const { user: currentUser, isLoading: authLoading } = useFirebaseAuth();
  const [activeAccount, setActiveAccount] = useState<UserProfile | null>(null);
  const [accounts, setAccounts] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load accounts and active account state
  useEffect(() => {
    const loadAccounts = async () => {
      setIsLoading(true);
      
      try {
        const allAccounts = accountSwitcherService.getAllAccounts();
        setAccounts(allAccounts.map(account => account.user));
        
        const activeAccountSession = accountSwitcherService.getActiveAccount();
        setActiveAccount(activeAccountSession?.user || null);
      } finally {
        setIsLoading(false);
      }
    };

    loadAccounts();

    // Set up event listener for account changes if needed
    // For now, we'll just reload when the effect runs
  }, []);

  // Update when the current user changes (e.g., after login)
  useEffect(() => {
    if (currentUser && !authLoading) {
      // If this is a new account not already stored, add it
      if (!accountSwitcherService.accountExists(currentUser.email)) {
        // We can't add it here automatically as we don't have the token
        // This would typically be handled when logging in
      }
    }
  }, [currentUser, authLoading]);

  const switchAccount = async (accountId: string): Promise<void> => {
    setIsLoading(true);
    try {
      await accountSwitcherService.switchToAccount(accountId);
      
      // Reload accounts and active account
      const allAccounts = accountSwitcherService.getAllAccounts();
      setAccounts(allAccounts.map(account => account.user));
      
      const activeAccountSession = accountSwitcherService.getActiveAccount();
      setActiveAccount(activeAccountSession?.user || null);
    } catch (error) {
      console.error('Error switching account:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addCurrentAccount = (): void => {
    if (currentUser) {
      // We can't add the current account without the token
      // This function would typically be called from login functions
      console.warn('addCurrentAccount: Cannot add account without token. This should be called from login functions.');
    }
  };

  const removeAccount = (accountId: string): void => {
    accountSwitcherService.removeAccount(accountId);
    
    // Update local state
    const allAccounts = accountSwitcherService.getAllAccounts();
    setAccounts(allAccounts.map(account => account.user));
    
    const activeAccountSession = accountSwitcherService.getActiveAccount();
    setActiveAccount(activeAccountSession?.user || null);
  };

  const getAccountCount = (): number => {
    return accountSwitcherService.getAccountCount();
  };

  return {
    activeAccount,
    accounts,
    isLoading: isLoading || authLoading,
    hasMultipleAccounts: accountSwitcherService.hasMultipleAccounts(),
    switchAccount,
    addCurrentAccount,
    removeAccount,
    getAccountCount
  };
}