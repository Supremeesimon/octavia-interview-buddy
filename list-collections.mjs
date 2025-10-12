import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query } from 'firebase/firestore';

// Firebase configuration from your .env.example
const firebaseConfig = {
  apiKey: "your_firebase_api_key_here",
  authDomain: "octavia-practice-interviewer.firebaseapp.com",
  projectId: "octavia-practice-interviewer",
  storageBucket: "octavia-practice-interviewer.appspot.com",
  messagingSenderId: "your_messaging_sender_id",
  appId: "your_firebase_app_id",
  measurementId: "your_measurement_id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function listAllCollections() {
  try {
    console.log('🔍 Listing all collections in Firestore...\n');

    // Note: Firebase client SDK doesn't have a direct way to list all collections
    // We'll try to check some known collections
    
    const knownCollections = [
      'end-of-call-analysis',
      'interviews',
      'interview-feedback',
      'student-stats',
      'institution-stats',
      'institutions',
      'users',
      'resumes',
      'sessions',
      'callReports'
    ];
    
    for (const collectionName of knownCollections) {
      try {
        const collectionRef = collection(db, collectionName);
        const q = query(collectionRef);
        const snapshot = await getDocs(q);
        console.log(`Collection '${collectionName}': ${snapshot.size} documents`);
      } catch (error) {
        console.log(`Collection '${collectionName}': Error accessing - ${error.message}`);
      }
    }
    
    console.log('\n✅ Collection check complete!');
    
  } catch (error) {
    console.error('❌ Error listing collections:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
  }
}

// Run the check
listAllCollections();