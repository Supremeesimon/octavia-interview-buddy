import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

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

async function debugFirebaseData() {
  try {
    console.log('=== Debugging Firebase Data ===');
    
    // Check interviews collection
    try {
      console.log('\n--- Checking Interviews Collection ---');
      const interviewsQuery = query(
        collection(db, 'interviews'),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const interviewsSnapshot = await getDocs(interviewsQuery);
      
      console.log('Interviews count:', interviewsSnapshot.size);
      
      if (interviewsSnapshot.empty) {
        console.log('No interviews found');
      } else {
        interviewsSnapshot.forEach((doc, index) => {
          console.log(`\nInterview ${index + 1}:`);
          console.log('  ID:', doc.id);
          console.log('  Data:', JSON.stringify(doc.data(), null, 2));
        });
      }
    } catch (error) {
      console.error('Error fetching interviews:', error.message);
    }
    
    // Check end-of-call-analysis collection
    try {
      console.log('\n--- Checking End-of-Call Analysis Collection ---');
      const analysisQuery = query(
        collection(db, 'end-of-call-analysis'),
        orderBy('timestamp', 'desc'),
        limit(5)
      );
      const analysisSnapshot = await getDocs(analysisQuery);
      
      console.log('End-of-call analysis count:', analysisSnapshot.size);
      
      if (analysisSnapshot.empty) {
        console.log('No end-of-call analysis found');
      } else {
        analysisSnapshot.forEach((doc, index) => {
          console.log(`\nAnalysis ${index + 1}:`);
          console.log('  ID:', doc.id);
          console.log('  Data:', JSON.stringify(doc.data(), null, 2));
        });
      }
    } catch (error) {
      console.error('Error fetching end-of-call analysis:', error.message);
    }
    
    // Check users collection
    try {
      console.log('\n--- Checking Users Collection ---');
      const usersQuery = query(
        collection(db, 'users'),
        limit(5)
      );
      const usersSnapshot = await getDocs(usersQuery);
      
      console.log('Users count:', usersSnapshot.size);
      
      if (usersSnapshot.empty) {
        console.log('No users found');
      } else {
        usersSnapshot.forEach((doc, index) => {
          console.log(`\nUser ${index + 1}:`);
          console.log('  ID:', doc.id);
          console.log('  Data:', JSON.stringify(doc.data(), null, 2));
        });
      }
    } catch (error) {
      console.error('Error fetching users:', error.message);
    }
    
    console.log('\n=== Debug Complete ===');
  } catch (error) {
    console.error('General error:', error);
  }
}

// Run the debug function
debugFirebaseData();