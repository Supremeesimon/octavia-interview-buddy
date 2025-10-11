import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Read the service account key file
const serviceAccount = JSON.parse(
  readFileSync(resolve('./firebase-service-account.json'), 'utf8')
);

// Initialize Firebase Admin with service account credentials
const app = initializeApp({
  credential: cert(serviceAccount),
  projectId: 'octavia-practice-interviewer',
});

const db = getFirestore(app);

async function checkAllCollections() {
  try {
    console.log('🔍 Checking all Firestore collections with Admin SDK...\n');

    // Check end-of-call-analysis collection
    console.log('=== END-OF-CALL-ANALYSIS COLLECTION ===');
    const analysisCollection = db.collection('end-of-call-analysis');
    const analysisSnapshot = await analysisCollection
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();
    
    console.log(`Found ${analysisSnapshot.size} documents`);
    
    if (analysisSnapshot.empty) {
      console.log('No documents found in end-of-call-analysis collection\n');
    } else {
      analysisSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\nDocument ${index + 1}: ${doc.id}`);
        console.log(`  Call ID: ${data.callId || 'N/A'}`);
        console.log(`  Student ID: ${data.studentId || 'N/A'}`);
        console.log(`  Timestamp: ${data.createdAt ? new Date(data.createdAt._seconds * 1000).toISOString() : 'N/A'}`);
        console.log(`  Interview Type: ${data.interviewType || 'N/A'}`);
        console.log(`  Has Summary: ${!!data.summary}`);
        console.log(`  Has Transcript: ${!!data.transcript}`);
        console.log(`  Overall Score: ${data.overallScore || data.successEvaluation?.score || 'N/A'}`);
      });
      console.log('\n');
    }

    // Check interviews collection
    console.log('=== INTERVIEWS COLLECTION ===');
    const interviewsCollection = db.collection('interviews');
    const interviewsSnapshot = await interviewsCollection
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();
    
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
    const feedbackCollection = db.collection('interview-feedback');
    const feedbackSnapshot = await feedbackCollection
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();
    
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

    console.log('✅ Firestore collection check completed with Admin SDK');
  } catch (error) {
    console.error('❌ Error checking Firestore collections:', error);
  }
}

// Run the check
checkAllCollections();