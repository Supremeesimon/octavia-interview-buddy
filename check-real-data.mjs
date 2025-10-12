import { config } from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

// Load environment variables
config({ path: '.env.local' });

// Firebase configuration from your .env.local
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

async function checkRealData() {
  try {
    console.log('🔍 Checking actual Firestore data with real configuration...\n');

    // Check end-of-call-analysis collection
    console.log('=== END-OF-CALL-ANALYSIS COLLECTION ===');
    const analysisQuery = query(
      collection(db, 'end-of-call-analysis'),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    const analysisSnapshot = await getDocs(analysisQuery);
    console.log(`Found ${analysisSnapshot.size} documents`);
    
    if (analysisSnapshot.empty) {
      console.log('No documents found in end-of-call-analysis collection\n');
    } else {
      analysisSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\nDocument ${index + 1}: ${doc.id}`);
        console.log(`  Call ID: ${data.callId || 'N/A'}`);
        console.log(`  Student ID: ${data.studentId || 'N/A'}`);
        console.log(`  Department ID: ${data.departmentId || 'N/A'}`);
        console.log(`  Institution ID: ${data.institutionId || 'N/A'}`);
        console.log(`  Interview Type: ${data.interviewType || 'N/A'}`);
        
        // Handle timestamp
        let timestampStr = 'N/A';
        if (data.timestamp) {
          if (data.timestamp._seconds) {
            timestampStr = new Date(data.timestamp._seconds * 1000).toISOString();
          } else if (typeof data.timestamp === 'string') {
            timestampStr = new Date(data.timestamp).toISOString();
          }
        }
        console.log(`  Timestamp: ${timestampStr}`);
        
        // Handle createdAt
        let createdAtStr = 'N/A';
        if (data.createdAt) {
          if (data.createdAt._seconds) {
            createdAtStr = new Date(data.createdAt._seconds * 1000).toISOString();
          } else if (typeof data.createdAt === 'string') {
            createdAtStr = new Date(data.createdAt).toISOString();
          }
        }
        console.log(`  Created At: ${createdAtStr}`);
        
        console.log(`  Has Summary: ${!!data.summary}`);
        console.log(`  Has Transcript: ${!!data.transcript}`);
        console.log(`  Has Recording URL: ${!!data.recordingUrl}`);
        console.log(`  Duration: ${data.duration || 'N/A'}`);
        console.log(`  Overall Score: ${data.overallScore || data.successEvaluation?.score || 'N/A'}`);
        
        // Check structured data
        if (data.structuredData) {
          console.log(`  Categories: ${data.structuredData.categories ? data.structuredData.categories.length : 0}`);
          console.log(`  Strengths: ${data.structuredData.strengths ? data.structuredData.strengths.length : 0}`);
          console.log(`  Improvements: ${data.structuredData.improvements ? data.structuredData.improvements.length : 0}`);
        }
        
        // Show a snippet of the summary if it exists
        if (data.summary) {
          console.log(`  Summary (first 200 chars): ${data.summary.substring(0, 200)}${data.summary.length > 200 ? '...' : ''}`);
        }
      });
      console.log('\n');
    }

    console.log('✅ Data check completed');
  } catch (error) {
    console.error('❌ Error checking data:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
  }
}

// Run the check
checkRealData();