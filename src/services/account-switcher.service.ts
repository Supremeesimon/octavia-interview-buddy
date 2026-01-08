/**
 * Account Switcher Service
 * Manages multiple account sessions and allows switching between them
 */

import type { UserProfile } from '@/types';
import { apiClient } from '@/lib/api-client';
import { firebaseAuthService } from '@/services/firebase-auth.service';

interface AccountSession {
  user: UserProfile;
  token: string;
  lastUsed: Date;
  loginMethod: 'email' | 'google' | 'other';
}

interface AccountSwitcherState {
  activeAccount: string | null; // User ID of the active account
  accounts: Record<string, AccountSession>; // All stored accounts
}

export class AccountSwitcherService {
  private static instance: AccountSwitcherService;
  private state: AccountSwitcherState;
  private readonly STORAGE_KEY = 'accountSwitcherData';
  private listeners: Array<() => void> = [];
  private isSwitching: boolean = false; // Track if account switching is in progress
  private switchingListeners: Array<(isSwitching: boolean) => void> = []; // Track switching state listeners

  private constructor() {
    this.state = this.loadState();
  }

  public static getInstance(): AccountSwitcherService {
    if (!AccountSwitcherService.instance) {
      AccountSwitcherService.instance = new AccountSwitcherService();
    }
    return AccountSwitcherService.instance;
  }

  private loadState(): AccountSwitcherState {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const accountsWithDates = Object.entries(parsed.accounts || {}).reduce((acc, [key, session]: [string, any]) => {
          acc[key] = {
            ...session,
            lastUsed: new Date(session.lastUsed)
          };
          return acc;
        }, {} as Record<string, AccountSession>);

        return {
          activeAccount: parsed.activeAccount,
          accounts: accountsWithDates
        };
      }
    } catch (error) {
      console.error('Error loading account switcher state:', error);
    }

    return {
      activeAccount: null,
      accounts: {}
    };
  }

  private saveState(): void {
    try {
      const serializableState = {
        ...this.state,
        accounts: Object.entries(this.state.accounts).reduce((acc, [key, session]) => {
          acc[key] = {
            ...session,
            lastUsed: session.lastUsed.toISOString()
          };
          return acc;
        }, {} as Record<string, any>)
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(serializableState));
    } catch (error) {
      console.error('Error saving account switcher state:', error);
    }
  }

  /**
   * Add a new account to the stored accounts
   */
  addAccount(user: UserProfile, token: string, loginMethod: 'email' | 'google' | 'other' = 'email'): void {
    const accountId = user.id;
    
    this.state.accounts[accountId] = {
      user,
      token,
      lastUsed: new Date(),
      loginMethod
    };
    
    this.saveState();
  }

  /**
   * Switch to a different account
   */
  async switchToAccount(accountId: string): Promise<void> {
    // Double-check account exists
    if (!this.state.accounts[accountId]) {
      throw new Error(`Account with ID ${accountId} not found in storage`);
    }

    // Prevent race conditions - check if already switching
    if (this.isSwitching) {
      throw new Error('Account switching already in progress');
    }

    // Set switching state to true immediately
    this.setAccountSwitching(true);
    
    try {
      const accountSession = this.state.accounts[accountId];
      
      // Validate account session structure
      if (!accountSession.user || !accountSession.token) {
        throw new Error(`Invalid account session structure for account ${accountId}`);
      }
      
      // Validate token before switching
      const isValidToken = await this.validateToken(accountSession.token);
      if (!isValidToken) {
        console.log(`Token expired for account ${accountId}, attempting refresh...`);
        // Try to refresh the token
        const refreshedToken = await this.refreshAccountToken(accountId);
        if (!refreshedToken) {
          console.log(`Token refresh failed for ${accountId}, attempting alternative approaches...`);
          
          // Try alternative approaches
          const alternativeSuccess = await this.attemptAlternativeSwitch(accountId, accountSession);
          if (!alternativeSuccess) {
            throw new Error(`Failed to refresh expired token for account ${accountId} and no alternative methods succeeded`);
          }
          console.log(`Successfully switched to account ${accountId} using alternative method`);
        } else {
          accountSession.token = refreshedToken;
          console.log(`Successfully refreshed token for account ${accountId}`);
        }
      }
      
      // Update the last used timestamp
      accountSession.lastUsed = new Date();
      
      // Atomic state update - set active account first
      this.state.activeAccount = accountId;
      
      // Update the API client with the new token
      apiClient.setAuthToken(accountSession.token);
      
      // Save state immediately after successful switch
      this.saveState();
      
      // Notify listeners of the account change
      this.notifyListeners();
      
      console.log(`Successfully switched to account ${accountId} (${accountSession.user.email})`);
      
    } catch (error) {
      console.error(`Failed to switch to account ${accountId}:`, error);
      // Reset switching state on error
      this.setAccountSwitching(false);
      throw error;
    } finally {
      // Set switching state to false after a brief delay to allow state to settle
      setTimeout(() => {
        this.setAccountSwitching(false);
      }, 300); // Reduced delay for better responsiveness
    }
  }

  /**
   * Remove an account from stored accounts
   */
  removeAccount(accountId: string): void {
    if (this.state.accounts[accountId]) {
      delete this.state.accounts[accountId];
      
      // If this was the active account, clear it
      if (this.state.activeAccount === accountId) {
        this.state.activeAccount = null;
        apiClient.clearAuthToken();
      }
      
      this.saveState();
      
      // Notify listeners of the account change
      this.notifyListeners();
    }
  }

  /**
   * Get all stored accounts
   */
  getAllAccounts(): AccountSession[] {
    return Object.values(this.state.accounts).sort((a, b) => 
      b.lastUsed.getTime() - a.lastUsed.getTime() // Sort by most recently used first
    );
  }

  /**
   * Get the currently active account
   */
  getActiveAccount(): AccountSession | null {
    if (!this.state.activeAccount || !this.state.accounts[this.state.activeAccount]) {
      return null;
    }
    return this.state.accounts[this.state.activeAccount];
  }

  /**
   * Check if account switching is available
   */
  hasMultipleAccounts(): boolean {
    return Object.keys(this.state.accounts).length > 1;
  }

  /**
   * Get the number of stored accounts
   */
  getAccountCount(): number {
    return Object.keys(this.state.accounts).length;
  }

  /**
   * Clear all stored accounts
   */
  clearAllAccounts(): void {
    this.state = {
      activeAccount: null,
      accounts: {}
    };
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Update the current session (e.g., after token refresh)
   */
  updateCurrentSession(user: UserProfile, token: string): void {
    if (this.state.activeAccount) {
      const accountId = this.state.activeAccount;
      if (this.state.accounts[accountId]) {
        this.state.accounts[accountId] = {
          ...this.state.accounts[accountId],
          user,
          token,
          lastUsed: new Date()
        };
        this.saveState();
      }
    }
  }

  /**
   * Get account by email (for identifying existing accounts)
   */
  getAccountByEmail(email: string): AccountSession | undefined {
    return Object.values(this.state.accounts).find(account => 
      account.user.email === email
    );
  }

  /**
   * Check if an account exists for the given email
   */
  accountExists(email: string): boolean {
    return !!this.getAccountByEmail(email);
  }

  /**
   * Subscribe to account changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners of account changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('Error in account switcher listener:', error);
      }
    });
  }

  /**
   * Add the current account using the current token from API client
   */
  async addCurrentAccount(user: UserProfile, loginMethod: 'email' | 'google' | 'other' = 'email'): Promise<void> {
    try {
      // Get the current token from localStorage where apiClient stores it
      const token = localStorage.getItem('authToken');
      
      // If no token exists in localStorage, we may need to get it from the API client or Firebase
      let finalToken = token;
      
      if (!token) {
        console.warn('No current auth token found in localStorage, attempting to get from Firebase');
        // Try to get Firebase token and exchange it for backend token
        const { auth } = await import('@/lib/firebase');
        const { getAuth, getIdToken } = await import('firebase/auth');
        const currentUser = getAuth().currentUser;
        
        if (currentUser) {
          const firebaseToken = await getIdToken(currentUser, true); // Force refresh
          
          // Exchange Firebase token for backend JWT token
          const { firebaseAuthService } = await import('@/services/firebase-auth.service');
          const exchangeResult = await firebaseAuthService.exchangeFirebaseToken(firebaseToken);
          finalToken = exchangeResult.token;
        }
      }
      
      if (!finalToken) {
        throw new Error('No valid authentication token available');
      }
      
      // Validate the token before adding the account
      const isValidToken = await this.validateToken(finalToken);
      if (!isValidToken) {
        throw new Error('Invalid or expired authentication token');
      }
      
      this.addAccount(user, finalToken, loginMethod);
      this.notifyListeners();
    } catch (error) {
      console.error('Error adding current account:', error);
      throw error;
    }
  }

  /**
   * Check if account switching is in progress
   */
  isAccountSwitching(): boolean {
    return this.isSwitching;
  }

  /**
   * Set account switching state
   */
  private setAccountSwitching(switching: boolean): void {
    this.isSwitching = switching;
    // Notify switching state listeners
    this.switchingListeners.forEach(listener => {
      try {
        listener(switching);
      } catch (error) {
        console.error('Error in switching state listener:', error);
      }
    });
  }

  /**
   * Subscribe to switching state changes
   */
  subscribeToSwitching(listener: (isSwitching: boolean) => void): () => void {
    this.switchingListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.switchingListeners = this.switchingListeners.filter(l => l !== listener);
    };
  }

  /**
   * Validate a token by making a simple authenticated request
   */
  private async validateToken(token: string): Promise<boolean> {
    try {
      // Temporarily set the token to test it
      const currentToken = localStorage.getItem('authToken');
      apiClient.setAuthToken(token);
      
      // Make a lightweight authenticated request
      await apiClient.get('/auth/profile');
      
      // Restore original token if it existed
      if (currentToken) {
        apiClient.setAuthToken(currentToken);
      }
      
      return true;
    } catch (error) {
      console.warn('Token validation failed:', error);
      return false;
    }
  }

  /**
   * Attempt alternative switching methods when token refresh fails
   */
  private async attemptAlternativeSwitch(accountId: string, accountSession: AccountSession): Promise<boolean> {
    try {
      console.log(`Attempting alternative switch methods for account ${accountId}`);
      
      // Method 1: Try using Firebase token directly if backend exchange fails
      const { auth } = await import('@/lib/firebase');
      const { getAuth, getIdToken } = await import('firebase/auth');
      const currentUser = getAuth().currentUser;
      
      if (currentUser && currentUser.uid === accountSession.user.id) {
        console.log('Trying direct Firebase token approach');
        const firebaseToken = await getIdToken(currentUser, true);
        if (firebaseToken) {
          // Use Firebase token directly
          accountSession.token = firebaseToken;
          this.saveState();
          console.log('Successfully used Firebase token directly');
          return true;
        }
      }
      
      // Method 2: Remove the problematic account and suggest re-login
      console.log('Alternative methods failed, removing problematic account');
      this.removeAccount(accountId);
      
      // Notify that account needs to be re-added
      console.log(`Account ${accountId} removed due to persistent token issues. Please re-add the account.`);
      
      return false;
      
    } catch (error) {
      console.error(`Alternative switch methods failed for ${accountId}:`, error);
      return false;
    }
  }

  /**
   * Refresh token for a specific account
   */
  private async refreshAccountToken(accountId: string): Promise<string | null> {
    try {
      console.log(`Attempting to refresh token for account ${accountId}`);
      
      const accountSession = this.state.accounts[accountId];
      if (!accountSession) {
        console.error(`Account session not found for ${accountId}`);
        throw new Error(`Account session not found for ${accountId}`);
      }
      
      // Get fresh Firebase token and exchange it
      const { auth } = await import('@/lib/firebase');
      const { getAuth, getIdToken } = await import('firebase/auth');
      
      // Check current Firebase user
      const currentUser = getAuth().currentUser;
      if (!currentUser) {
        console.error('No current Firebase user found for token refresh');
        throw new Error('No authenticated Firebase user available for token refresh');
      }
      
      // Verify this is the correct user for this account
      if (currentUser.uid !== accountSession.user.id) {
        console.warn(`Current Firebase user (${currentUser.uid}) doesn't match account user (${accountSession.user.id})`);
        // This indicates we're trying to switch to an account that belongs to a different user
        // Remove the account from storage since we can't switch to it
        this.removeAccount(accountId);
        throw new Error(`Cannot switch to account ${accountId}: Current user ${currentUser.uid} doesn't match account owner ${accountSession.user.id}. Account has been removed.`);
      }
      
      console.log(`Getting fresh Firebase token for user ${currentUser.uid}`);
      const firebaseToken = await getIdToken(currentUser, true);
      
      if (!firebaseToken) {
        console.error('Failed to get Firebase token');
        throw new Error('Failed to obtain Firebase ID token');
      }
      
      console.log(`Exchanging Firebase token for backend token (length: ${firebaseToken.length})`);
      const { firebaseAuthService } = await import('@/services/firebase-auth.service');
      const exchangeResult = await firebaseAuthService.exchangeFirebaseToken(firebaseToken);
      
      if (!exchangeResult?.token) {
        console.error('Token exchange returned no token');
        throw new Error('Token exchange service returned invalid response');
      }
      
      // Update the account with the new token
      accountSession.token = exchangeResult.token;
      this.saveState();
      
      console.log(`Successfully refreshed token for account ${accountId}`);
      return exchangeResult.token;
      
    } catch (error) {
      console.error(`Failed to refresh account token for ${accountId}:`, error);
      
      // Provide more specific error handling
      if (error instanceof Error) {
        if (error.message.includes('User mismatch')) {
          // This suggests we might need to re-authenticate as the correct user
          console.log(`User mismatch detected for ${accountId}. May need manual re-authentication.`);
        } else if (error.message.includes('No authenticated Firebase user')) {
          console.log(`No authenticated user for ${accountId}. Account may need to be re-added.`);
        } else if (error.message.includes('Token exchange service')) {
          console.log(`Backend token exchange service unavailable for ${accountId}.`);
        }
      }
      
      return null;
    }
  }
}

// Export singleton instance
export const accountSwitcherService = AccountSwitcherService.getInstance();

export default accountSwitcherService;