const { initializeApp, getApp, getApps } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');
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

async function checkSystemConfig() {
  try {
    console.log('Checking system_config collection...');
    
    // Check for the specific pricing document
    const pricingDoc = doc(db, 'system_config', 'pricing');
    const pricingSnap = await getDoc(pricingDoc);
    
    if (pricingSnap.exists()) {
      console.log('\n--- System Config: pricing ---');
      console.log('Document ID: pricing');
      console.log('Data:', JSON.stringify(pricingSnap.data(), null, 2));
    } else {
      console.log('\n--- System Config: pricing ---');
      console.log('No pricing document found');
    }
    
    // Check for other common system config documents
    const configDocs = ['settings', 'features', 'notifications'];
    
    for (const docName of configDocs) {
      try {
        const configDoc = doc(db, 'system_config', docName);
        const configSnap = await getDoc(configDoc);
        
        if (configSnap.exists()) {
          console.log(`\n--- System Config: ${docName} ---`);
          console.log('Data:', JSON.stringify(configSnap.data(), null, 2));
        } else {
          console.log(`\n--- System Config: ${docName} ---`);
          console.log(`No ${docName} document found`);
        }
      } catch (error) {
        console.log(`\n--- System Config: ${docName} ---`);
        console.log(`Error accessing ${docName}: ${error.message}`);
      }
    }
    
    console.log('\n✅ System config check completed');
    
  } catch (error) {
    console.error('❌ Error checking system config:', error.message);
    console.error('Error stack:', error.stack);
  }
}

// Run the function
checkSystemConfig();