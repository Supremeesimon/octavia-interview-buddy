import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';

// Firebase configuration from environment
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyCn847Eo_wh90MCJWYwW7K01rihUl8h2-Q",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "octavia-practice-interviewer.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "octavia-practice-interviewer",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "octavia-practice-interview-buddy.appspot.com",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "475685845155",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:475685845155:web:ff55f944f48fc987bae716",
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || "G-YYHF1TW9MM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function authenticateAsAdmin() {
  try {
    // You'll need to replace these with actual admin credentials
    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "password123";
    
    console.log('Authenticating as platform admin...');
    const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    console.log('Successfully authenticated as:', userCredential.user.email);
    return userCredential.user;
  } catch (error) {
    console.error('Authentication failed:', error);
    throw error;
  }
}

async function debugFirestoreData() {
  let adminUser = null;
  
  try {
    console.log('=== Debugging Firestore Data ===');
    
    // Authenticate as platform admin
    adminUser = await authenticateAsAdmin();
    
    // Check scheduled_price_changes collection
    try {
      console.log('\n--- Checking scheduled_price_changes Collection ---');
      const priceChangesQuery = query(
        collection(db, 'scheduled_price_changes'),
        orderBy('changeDate', 'asc')
      );
      const priceChangesSnapshot = await getDocs(priceChangesQuery);
      
      console.log('Price changes count:', priceChangesSnapshot.size);
      
      if (priceChangesSnapshot.size > 0) {
        console.log('\nPrice changes data:');
        let index = 0;
        priceChangesSnapshot.forEach((doc) => {
          const data = doc.data();
          console.log(`\nDocument ${++index}:`);
          console.log(`  ID: ${doc.id}`);
          console.log(`  Data:`, data);
        });
      } else {
        console.log('No price changes found in Firestore');
      }
    } catch (error) {
      console.error('Error checking price changes:', error);
    }
    
    // Check institutions collection
    try {
      console.log('\n--- Checking Institutions Collection ---');
      const institutionsQuery = query(
        collection(db, 'institutions'),
        orderBy('name', 'asc'),
        limit(5)
      );
      const institutionsSnapshot = await getDocs(institutionsQuery);
      
      console.log('Institutions count:', institutionsSnapshot.size);
      
      if (institutionsSnapshot.size > 0) {
        console.log('\nInstitutions data:');
        let index = 0;
        institutionsSnapshot.forEach((doc) => {
          const data = doc.data();
          console.log(`\nDocument ${++index}:`);
          console.log(`  ID: ${doc.id}`);
          console.log(`  Name: ${data.name || 'N/A'}`);
          console.log(`  Data:`, data);
        });
      } else {
        console.log('No institutions found in Firestore');
      }
    } catch (error) {
      console.error('Error checking institutions:', error);
    }
    
    // Check system_config collection (for pricing settings)
    try {
      console.log('\n--- Checking System Config Collection ---');
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
    
    console.log('\n=== Debugging Complete ===');
  } catch (error) {
    console.error('Debug error:', error);
  } finally {
    // Sign out to clean up
    if (adminUser) {
      try {
        await signOut(auth);
        console.log('Signed out successfully');
      } catch (error) {
        console.error('Error signing out:', error);
      }
    }
  }
}

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

debugFirestoreData();