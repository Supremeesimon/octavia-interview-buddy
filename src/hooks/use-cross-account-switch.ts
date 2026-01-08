/**
 * Cross-Account Switch Hook
 * Provides utilities for handling cross-account switching with CTA buttons
 */

import { toast } from "sonner";
import { useFirebaseAuth } from '@/hooks/use-firebase-auth';

interface CrossAccountSwitchOptions {
  accountId: string;
  accountEmail: string;
  accountName: string;
}

export const useCrossAccountSwitch = () => {
  const { logout } = useFirebaseAuth();

  const handleCrossAccountSwitch = async (options: CrossAccountSwitchOptions) => {
    const { accountId, accountEmail, accountName } = options;
    
    // Store the pending switch information
    localStorage.setItem('pendingAccountSwitch', JSON.stringify({
      accountId,
      userEmail: accountEmail,
      userName: accountName,
      timestamp: Date.now()
    }));

    try {
      // Perform logout
      await logout();
      
      // Redirect to login page with return context
      const returnUrl = window.location.href;
      localStorage.setItem('postAuthRedirect', returnUrl);
      
      // Redirect to login
      window.location.href = '/login';
      
    } catch (error) {
      console.error('Error during cross-account switch:', error);
      toast.error('Failed to initiate account switch', {
        description: 'Please try signing out manually and logging in with the target account.'
      });
    }
  };

  const showCrossAccountSwitchToast = (options: CrossAccountSwitchOptions) => {
    const { accountName, accountEmail } = options;
    
    toast(
      `Switch to ${accountName}?`,
      {
        description: `Sign out and log in as ${accountEmail} to access this account. The system will automatically switch after login.`,
        duration: 10000, // 10 seconds
        action: {
          label: 'Sign Out & Switch',
          onClick: () => handleCrossAccountSwitch(options)
        }
      }
    );
  };

  return {
    showCrossAccountSwitchToast,
    handleCrossAccountSwitch
  };
};