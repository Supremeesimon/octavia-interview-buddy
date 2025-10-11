import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

// Firebase configuration
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

async function checkCollections() {
  try {
    console.log('🔍 Checking Firestore collections...\n');

    // Check end-of-call-analysis collection
    console.log('=== END-OF-CALL-ANALYSIS COLLECTION ===');
    const analysisQuery = query(
      collection(db, 'end-of-call-analysis'),
      orderBy('timestamp', 'desc'),
      limit(5)
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
        console.log(`  Timestamp: ${data.timestamp ? new Date(data.timestamp._seconds * 1000).toISOString() : 'N/A'}`);
        console.log(`  Interview Type: ${data.interviewType || 'N/A'}`);
        console.log(`  Has Summary: ${!!data.summary}`);
        console.log(`  Has Transcript: ${!!data.transcript}`);
        console.log(`  Overall Score: ${data.overallScore || data.successEvaluation?.score || 'N/A'}`);
      });
      console.log('\n');
    }

    // Check interviews collection
    console.log('=== INTERVIEWS COLLECTION ===');
    const interviewsQuery = query(
      collection(db, 'interviews'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const interviewsSnapshot = await getDocs(interviewsQuery);
    console.log(`Found ${interviewsSnapshot.size} documents`);
    
    if (interviewsSnapshot.empty) {
      console.log('No documents found in interviews collection\n');
    } else {
      interviewsSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\nDocument ${index + 1}: ${doc.id}`);
        console.log(`  Student ID: ${data.studentId || 'N/A'}`);
        console.log(`  Status: ${data.status || 'N/A'}`);
        console.log(`  Type: ${data.type || 'N/A'}`);
        console.log(`  Score: ${data.score || 'N/A'}`);
        console.log(`  Created At: ${data.createdAt ? new Date(data.createdAt._seconds * 1000).toISOString() : 'N/A'}`);
        console.log(`  VAPI Call ID: ${data.vapiCallId || 'N/A'}`);
      });
      console.log('\n');
    }

    // Check interview-feedback collection
    console.log('=== INTERVIEW-FEEDBACK COLLECTION ===');
    const feedbackQuery = query(
      collection(db, 'interview-feedback'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    const feedbackSnapshot = await getDocs(feedbackQuery);
    console.log(`Found ${feedbackSnapshot.size} documents`);
    
    if (feedbackSnapshot.empty) {
      console.log('No documents found in interview-feedback collection\n');
    } else {
      feedbackSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\nDocument ${index + 1}: ${doc.id}`);
        console.log(`  Interview ID: ${data.interviewId || 'N/A'}`);
        console.log(`  Student ID: ${data.studentId || 'N/A'}`);
        console.log(`  Overall Score: ${data.overallScore || 'N/A'}`);
        console.log(`  Created At: ${data.createdAt ? new Date(data.createdAt._seconds * 1000).toISOString() : 'N/A'}`);
        console.log(`  Has Categories: ${!!(data.categories && data.categories.length > 0)}`);
        console.log(`  Has Strengths: ${!!(data.strengths && data.strengths.length > 0)}`);
        console.log(`  Has Improvements: ${!!(data.improvements && data.improvements.length > 0)}`);
      });
      console.log('\n');
    }

    console.log('✅ Firestore collection check completed');
  } catch (error) {
    console.error('❌ Error checking Firestore collections:', error);
  }
}

// Run the check
checkCollections();