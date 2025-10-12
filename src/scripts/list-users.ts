import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
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

async function listUsers() {
  try {
    console.log('=== Listing Users in Firestore ===');
    
    // Try to access users collection with limited permissions
    const usersQuery = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    
    const usersSnapshot = await getDocs(usersQuery);
    
    console.log('Users count:', usersSnapshot.size);
    
    if (usersSnapshot.size > 0) {
      console.log('\nUsers data:');
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`\nDocument ID: ${doc.id}`);
        console.log(`  Name: ${data.name || 'N/A'}`);
        console.log(`  Email: ${data.email || 'N/A'}`);
        console.log(`  Role: ${data.role || 'N/A'}`);
        console.log(`  Created At: ${data.createdAt?.toDate?.() || data.createdAt || 'N/A'}`);
      });
    } else {
      console.log('No users found in Firestore');
    }
    
    // Also check if we can access system_config
    console.log('\n--- Checking System Config ---');
    try {
      const systemConfigQuery = query(collection(db, 'system_config'));
      const systemConfigSnapshot = await getDocs(systemConfigQuery);
      
      console.log('System config documents count:', systemConfigSnapshot.size);
      
      if (systemConfigSnapshot.size > 0) {
        console.log('\nSystem config data:');
        systemConfigSnapshot.forEach((doc) => {
          const data = doc.data();
          console.log(`\nDocument ID: ${doc.id}`);
          console.log(`  Data:`, data);
        });
      } else {
        console.log('No system config documents found in Firestore');
      }
    } catch (error) {
      console.error('Error checking system config:', error);
    }
    
  } catch (error) {
    console.error('Error listing users:', error);
  }
}

listUsers();