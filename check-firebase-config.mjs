#!/usr/bin/env node

/**
 * Simple script to check Firebase connection using client SDK
 * This script will not be able to list all users, but can verify connection
 */

import { join } from 'path';
import { readFileSync } from 'fs';

// Function to extract Firebase config from .env.local
function getFirebaseConfig() {
  try {
    const envPath = join(process.cwd(), '.env.local');
    const envContent = readFileSync(envPath, 'utf8');
    
    const config = {};
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      if (line.startsWith('VITE_FIREBASE_')) {
        const [key, value] = line.split('=');
        if (key && value) {
          // Remove VITE_ prefix and convert to camelCase
          const cleanKey = key.replace('VITE_FIREBASE_', '').toLowerCase();
          config[cleanKey] = value.replace(/"/g, '');
        }
      }
    });
    
    return {
      apiKey: config.api_key,
      authDomain: config.auth_domain,
      projectId: config.project_id,
      storageBucket: config.storage_bucket,
      messagingSenderId: config.messaging_sender_id,
      appId: config.app_id,
      measurementId: config.measurement_id
    };
  } catch (error) {
    console.error('Error reading Firebase config:', error.message);
    return null;
  }
}

// Display Firebase configuration
console.log('=== Firebase Configuration Check ===');
const firebaseConfig = getFirebaseConfig();

if (firebaseConfig) {
  console.log('Firebase configuration found:');
  Object.entries(firebaseConfig).forEach(([key, value]) => {
    console.log(`  ${key}: ${value || 'NOT SET'}`);
  });
  
  console.log('\nNote: To list all users, you need:');
  console.log('1. Firebase Admin SDK credentials (service account key)');
  console.log('2. Save the service account JSON as "firebase-service-account.json"');
  console.log('3. Run the count-users.mjs script again');
  
  console.log('\nTo get your service account key:');
  console.log('1. Go to Firebase Console > Project Settings > Service Accounts');
  console.log('2. Click "Generate new private key"');
  console.log('3. Save the JSON file in this directory as "firebase-service-account.json"');
} else {
  console.log('No Firebase configuration found in .env.local');
  console.log('Please ensure your .env.local file contains Firebase configuration variables');
}