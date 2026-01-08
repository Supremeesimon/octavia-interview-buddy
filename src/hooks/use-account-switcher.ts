import { useState, useEffect } from 'react';
import { accountSwitcherService } from '@/services/account-switcher.service';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';
import { useErrorHandler } from '@/hooks/use-error-handler';
import type { UserProfile } from '@/types';

interface UseAccountSwitcherReturn {
  activeAccount: UserProfile | null;
  accounts: UserProfile[];
  isLoading: boolean;
  isSwitching: boolean; // Add isSwitching property
  hasMultipleAccounts: boolean;
  switchAccount: (accountId: string) => Promise<void>;
  addCurrentAccount: () => Promise<void>;
  removeAccount: (accountId: string) => void;
  getAccountCount: () => number;
}

export function useAccountSwitcher(): UseAccountSwitcherReturn {
  const { user: currentUser, isLoading: authLoading } = useFirebaseAuth();
  const { handleAccountError } = useErrorHandler();
  const [activeAccount, setActiveAccount] = useState<UserProfile | null>(null);
  const [accounts, setAccounts] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false); // Track account switching state

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
    setIsSwitching(true); // Set switching state to true
    try {
      await accountSwitcherService.switchToAccount(accountId);
      
      // Reload accounts and active account
      const allAccounts = accountSwitcherService.getAllAccounts();
      setAccounts(allAccounts.map(account => account.user));
      
      const activeAccountSession = accountSwitcherService.getActiveAccount();
      setActiveAccount(activeAccountSession?.user || null);
    } catch (error) {
      handleAccountError(error, accountId);
      throw error;
    } finally {
      setIsLoading(false);
      setIsSwitching(false); // Set switching state to false
    }
  };

  const addCurrentAccount = async (): Promise<void> => {
    if (currentUser) {
      try {
        // Use the new method in the service to add the current account
        await accountSwitcherService.addCurrentAccount(currentUser, 'email'); // Could detect login method here
        
        // Update local state
        const allAccounts = accountSwitcherService.getAllAccounts();
        setAccounts(allAccounts.map(account => account.user));
        
        const activeAccountSession = accountSwitcherService.getActiveAccount();
        setActiveAccount(activeAccountSession?.user || null);
      } catch (error) {
        handleAccountError(error);
        throw error;
      }
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
    isSwitching, // Add isSwitching to the return object
    hasMultipleAccounts: accountSwitcherService.hasMultipleAccounts(),
    switchAccount,
    addCurrentAccount,
    removeAccount,
    getAccountCount
  };
}