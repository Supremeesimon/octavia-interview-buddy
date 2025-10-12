import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Helper function to get environment variables in both Vite and Node.js environments
function getEnvVar(name: string): string | undefined {
  // Try Vite's import.meta.env first
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[name];
  }
  
  // Fall back to process.env for Node.js environments
  if (typeof process !== 'undefined' && process.env) {
    return process.env[name];
  }
  
  return undefined;
}

// Firebase configuration with fallback for Node.js environments
const firebaseConfig = {
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY') || 'your_firebase_api_key_here',
  authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN') || 'octavia-practice-interviewer.firebaseapp.com',
  projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID') || 'octavia-practice-interviewer',
  storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET') || 'octavia-practice-interviewer.appspot.com',
  messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID') || 'your_messaging_sender_id',
  appId: getEnvVar('VITE_FIREBASE_APP_ID') || 'your_firebase_app_id',
  measurementId: getEnvVar('VITE_FIREBASE_MEASUREMENT_ID') || 'your_measurement_id'
};

// Check if we have valid configuration
const hasValidConfig = firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your_firebase_api_key_here';

if (!hasValidConfig) {
  console.warn('Firebase configuration is missing or incomplete. Please set environment variables.');
  console.warn('Using default configuration which may not work in production.');
}

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw new Error('Failed to initialize Firebase. Please check your configuration.');
}

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Export default app
export default app;