/**
 * Token Utilities
 * Helper functions for handling authentication tokens
 */

import { auth } from '@/lib/firebase';
import { firebaseAuthService } from '@/services/firebase-auth.service';
import { apiClient } from '@/lib/api-client';

/**
 * Refresh the authentication token by getting a new Firebase ID token
 * and exchanging it for a new backend JWT token
 */
export async function refreshToken(): Promise<boolean> {
  try {
    // Get current Firebase user
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.warn('No current Firebase user found during token refresh');
      return false;
    }

    console.log('Attempting to refresh token for user:', currentUser.uid);
    
    // Get a fresh Firebase ID token with forced refresh
    const firebaseToken = await currentUser.getIdToken(true);
    console.log('Got fresh Firebase token, length:', firebaseToken.length);
    
    // Exchange Firebase token for backend JWT token
    const exchangeResult = await firebaseAuthService.exchangeFirebaseToken(firebaseToken);
    console.log('Token exchange successful, got backend token, length:', exchangeResult.token.length);
    
    // Set the backend JWT token in apiClient for API calls that need it
    apiClient.setAuthToken(exchangeResult.token);
    console.log('Set new auth token in apiClient');
    
    return true;
  } catch (error) {
    console.error('Token refresh failed:', error);
    
    // If it's a network error, we might want to retry
    if (error instanceof Error && error.message.includes('Network Error')) {
      console.log('Network error during token refresh, will retry');
      // Wait a bit and try once more
      await new Promise(resolve => setTimeout(resolve, 1000));
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const firebaseToken = await currentUser.getIdToken(true);
          const exchangeResult = await firebaseAuthService.exchangeFirebaseToken(firebaseToken);
          apiClient.setAuthToken(exchangeResult.token);
          return true;
        }
      } catch (retryError) {
        console.error('Token refresh retry failed:', retryError);
      }
    }
    
    return false;
  }
}

/**
 * Check if the current token is expired
 */
export function isTokenExpired(): boolean {
  const token = localStorage.getItem('authToken');
  if (!token) return true;
  
  try {
    // Decode the JWT token to check expiration
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    
    // Consider token expired if it's within 5 minutes of expiration
    return currentTime > (expirationTime - 5 * 60 * 1000);
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
}

/**
 * Schedule a token refresh before it expires
 */
export function scheduleTokenRefresh(): void {
  const token = localStorage.getItem('authToken');
  if (!token) return;
  
  try {
    // Decode the JWT token to get expiration time
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    
    // Calculate time until expiration (with 5 minute buffer)
    const timeUntilExpiration = expirationTime - currentTime - (5 * 60 * 1000);
    
    // Only schedule if token is still valid
    if (timeUntilExpiration > 0) {
      console.log(`Scheduling token refresh in ${Math.floor(timeUntilExpiration / 1000)} seconds`);
      
      // Schedule token refresh
      setTimeout(async () => {
        console.log('Performing scheduled token refresh');
        await refreshToken();
      }, timeUntilExpiration);
    } else {
      console.log('Token is already expired or about to expire');
    }
  } catch (error) {
    console.error('Error scheduling token refresh:', error);
  }
}

export default {
  refreshToken,
  isTokenExpired,
  scheduleTokenRefresh
};