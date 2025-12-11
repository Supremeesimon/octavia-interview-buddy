const { initializeApp, getApp, getApps } = require('firebase/app');
const { getFirestore, collection, getDocs, query, limit, orderBy } = require('firebase/firestore');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'your_firebase_api_key_here',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'octavia-practice-interviewer.firebaseapp.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'octavia-practice-interviewer',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'octavia-practice-interviewer.firebasestorage.app',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'your_messaging_sender_id',
  appId: process.env.VITE_FIREBASE_APP_ID || 'your_firebase_app_id',
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || 'your_measurement_id'
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Firestore
const db = getFirestore(app);

async function checkFirebaseCollections() {
  try {
    console.log('Connecting to Firebase Firestore...');
    
    // List all collections
    console.log('\n=== FETCHING COLLECTIONS ===');
    
    // Check specific collections that we know exist
    const collectionsToCheck = [
      'institutions',
      'system_config',
      'interview_analyses',
      'performance_data',
      'user_profiles'
    ];
    
    for (const collectionName of collectionsToCheck) {
      try {
        console.log(`\n--- Collection: ${collectionName} ---`);
        const q = query(
          collection(db, collectionName),
          orderBy('createdAt', 'desc'),
          limit(10)
        );
        const snapshot = await getDocs(q);
        
        console.log(`Found ${snapshot.size} documents in ${collectionName}:`);
        
        if (snapshot.empty) {
          console.log('  No documents found.');
        } else {
          snapshot.forEach((doc) => {
            const data = doc.data();
            console.log(`\n  Document ID: ${doc.id}`);
            console.log(`  Data: ${JSON.stringify(data, null, 2)}`);
          });
        }
      } catch (error) {
        console.log(`  Error accessing ${collectionName}: ${error.message}`);
      }
    }
    
    // Try to list all collections (might not work in all environments)
    try {
      console.log('\n=== ATTEMPTING TO LIST ALL COLLECTIONS ===');
      // Note: This might not work depending on security rules
      const collectionRefs = await db.listCollections();
      console.log(`Found ${collectionRefs.length} collections:`);
      collectionRefs.forEach(ref => {
        console.log(`  - ${ref.id}`);
      });
    } catch (error) {
      console.log('Could not list all collections (may be restricted by security rules):', error.message);
    }
    
    console.log('\n✅ Firebase collections check completed');
    
  } catch (error) {
    console.error('❌ Error checking Firebase collections:', error.message);
    console.error('Error stack:', error.stack);
  }
}

// Run the function
checkFirebaseCollections();