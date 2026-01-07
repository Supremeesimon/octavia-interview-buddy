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
    if (!this.state.accounts[accountId]) {
      throw new Error(`Account with ID ${accountId} not found`);
    }

    // Set switching state to true
    this.setAccountSwitching(true);
    
    const accountSession = this.state.accounts[accountId];
    
    // Update the last used timestamp
    accountSession.lastUsed = new Date();
    
    // Set the active account
    this.state.activeAccount = accountId;
    
    // Update the API client with the new token
    apiClient.setAuthToken(accountSession.token);
    
    this.saveState();
    
    // Notify listeners of the account change
    this.notifyListeners();
    
    // Set switching state to false after a brief delay to allow state to settle
    setTimeout(() => {
      this.setAccountSwitching(false);
    }, 500);
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
  addCurrentAccount(user: UserProfile, loginMethod: 'email' | 'google' | 'other' = 'email'): void {
    // Get the current token from localStorage where apiClient stores it
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.warn('No current auth token found to add current account');
      // Try to get the Firebase token as a fallback
      const firebaseToken = localStorage.getItem('firebase:authUser:*:octavia-practice-interviewer.firebaseapp.com');
      if (firebaseToken) {
        console.log('Found Firebase token, attempting to use for account addition');
        // We can't directly use the Firebase token without exchanging it for a backend token
        // So we'll need to trigger the exchange process first
        console.warn('Firebase token found but requires exchange for backend token');
      }
      return;
    }
    
    this.addAccount(user, token, loginMethod);
    this.notifyListeners();
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
}

// Export singleton instance
export const accountSwitcherService = AccountSwitcherService.getInstance();

export default accountSwitcherService;