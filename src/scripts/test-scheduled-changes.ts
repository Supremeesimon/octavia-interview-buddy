import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Firebase configuration from environment
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Import the PriceChangeService after Firebase is initialized
const { PriceChangeService } = await import('@/services/price-change.service');

async function testScheduledChanges() {
  try {
    console.log('Testing scheduled price changes...');
    
    // Initialize sample data
    console.log('Initializing sample data...');
    await PriceChangeService.initializeSampleData();
    
    // Fetch all price changes
    console.log('Fetching all price changes...');
    const allChanges = await PriceChangeService.getAllPriceChanges();
    console.log('All price changes:', allChanges);
    
    // Fetch upcoming price changes
    console.log('Fetching upcoming price changes...');
    const upcomingChanges = await PriceChangeService.getUpcomingPriceChanges();
    console.log('Upcoming price changes:', upcomingChanges);
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Error in test:', error);
  }
}

testScheduledChanges();