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
      console.warn('No current Firebase user found');
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

export default {
  refreshToken,
  isTokenExpired
};