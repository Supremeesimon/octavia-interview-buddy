const { initializeApp, getApp, getApps } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc } = require('firebase/firestore');
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

async function checkInstitutions() {
  try {
    console.log('Checking institutions collection...');
    
    // Get all institutions
    const institutionsSnap = await getDocs(collection(db, 'institutions'));
    
    console.log(`\n=== FOUND ${institutionsSnap.size} INSTITUTIONS ===`);
    
    for (const docSnap of institutionsSnap.docs) {
      console.log(`\n--- Institution: ${docSnap.id} ---`);
      const data = docSnap.data();
      
      console.log(`Name: ${data.name || 'No name'}`);
      console.log(`Domain: ${data.domain || 'No domain'}`);
      console.log(`Approval Status: ${data.approvalStatus || 'No status'}`);
      console.log(`Is Active: ${data.isActive ? 'Yes' : 'No'}`);
      
      if (data.customSignupLink) {
        console.log(`Signup Link: ${data.customSignupLink}`);
      }
      
      if (data.stats) {
        console.log('Statistics:');
        console.log(`  Total Students: ${data.stats.totalStudents || 0}`);
        console.log(`  Active Students: ${data.stats.activeStudents || 0}`);
        console.log(`  Total Interviews: ${data.stats.totalInterviews || 0}`);
        console.log(`  Average Score: ${data.stats.averageScore || 0}/100`);
      }
      
      if (data.settings) {
        console.log('Settings:');
        console.log(`  Session Length: ${data.settings.sessionLength || 'Not set'} minutes`);
        console.log(`  Require Resume Upload: ${data.settings.requireResumeUpload ? 'Yes' : 'No'}`);
      }
      
      if (data.pricingOverride) {
        console.log('Pricing Override:');
        console.log(`  Enabled: ${data.pricingOverride.isEnabled ? 'Yes' : 'No'}`);
        if (data.pricingOverride.isEnabled) {
          console.log(`  Custom VAPI Cost: $${data.pricingOverride.customVapiCost || 0}/minute`);
          console.log(`  Custom Markup: ${data.pricingOverride.customMarkupPercentage || 0}%`);
        }
      }
      
      if (data.sessionPool) {
        console.log('Session Pool:');
        console.log(`  Total Sessions: ${data.sessionPool.totalSessions || 0}`);
        console.log(`  Used Sessions: ${data.sessionPool.usedSessions || 0}`);
        console.log(`  Available Sessions: ${(data.sessionPool.totalSessions || 0) - (data.sessionPool.usedSessions || 0)}`);
      }
      
      console.log(`Created: ${data.createdAt ? new Date(data.createdAt.seconds * 1000).toString() : 'Unknown'}`);
      console.log(`Updated: ${data.updatedAt ? new Date(data.updatedAt.seconds * 1000).toString() : 'Unknown'}`);
    }
    
    console.log('\n✅ Institutions check completed');
    
  } catch (error) {
    console.error('❌ Error checking institutions:', error.message);
    console.error('Error stack:', error.stack);
  }
}

// Run the function
checkInstitutions();