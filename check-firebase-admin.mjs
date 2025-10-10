import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const serviceAccount = require('./firebase-service-account.json');

// Initialize Firebase Admin with service account
const app = initializeApp({
  credential: cert(serviceAccount),
  projectId: 'octavia-practice-interviewer'
});

const db = getFirestore(app);

async function checkFirebaseData() {
  try {
    console.log('Checking Firebase data with Admin privileges...');
    
    // Check end-of-call-analysis collection
    console.log('\n--- Checking end-of-call-analysis collection ---');
    const analysisSnapshot = await db.collection('end-of-call-analysis').orderBy('timestamp', 'desc').limit(10).get();
    console.log(`Found ${analysisSnapshot.size} documents in end-of-call-analysis`);
    
    if (analysisSnapshot.empty) {
      console.log('No documents found in end-of-call-analysis collection');
    } else {
      analysisSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\nDocument ${index + 1}:`);
        console.log(`  ID: ${doc.id}`);
        console.log(`  Call ID: ${data.callId || 'N/A'}`);
        console.log(`  Student ID: "${data.studentId || 'N/A'}"`);
        console.log(`  Timestamp: ${data.timestamp?.toDate?.() || data.timestamp || 'N/A'}`);
        console.log(`  Interview Type: ${data.interviewType || 'N/A'}`);
        console.log(`  Overall Score: ${data.overallScore || 'N/A'}`);
        console.log(`  Has Summary: ${!!data.summary}`);
        console.log(`  Has Transcript: ${!!data.transcript}`);
      });
    }
    
    // Check interviews collection
    console.log('\n--- Checking interviews collection ---');
    const interviewsSnapshot = await db.collection('interviews').orderBy('createdAt', 'desc').limit(10).get();
    console.log(`Found ${interviewsSnapshot.size} documents in interviews`);
    
    if (interviewsSnapshot.empty) {
      console.log('No documents found in interviews collection');
    } else {
      interviewsSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\nDocument ${index + 1}:`);
        console.log(`  ID: ${doc.id}`);
        console.log(`  Student ID: "${data.studentId || 'N/A'}"`);
        console.log(`  Status: ${data.status || 'N/A'}`);
        console.log(`  Type: ${data.type || 'N/A'}`);
        console.log(`  Created At: ${data.createdAt?.toDate?.() || data.createdAt || 'N/A'}`);
        console.log(`  Has Transcript: ${!!data.transcript}`);
      });
    }
    
    // Check for anonymous user data specifically
    console.log('\n--- Checking for anonymous user data ---');
    
    // Check end-of-call-analysis without studentId
    console.log('Checking for documents with empty studentId in end-of-call-analysis...');
    const anonymousAnalysisSnapshot = await db.collection('end-of-call-analysis')
      .where('studentId', '==', '')
      .limit(5)
      .get();
    console.log(`Found ${anonymousAnalysisSnapshot.size} anonymous analyses (empty studentId)`);
    
    // Check interviews without studentId
    console.log('Checking for documents with empty studentId in interviews...');
    const anonymousInterviewsSnapshot = await db.collection('interviews')
      .where('studentId', '==', '')
      .limit(5)
      .get();
    console.log(`Found ${anonymousInterviewsSnapshot.size} anonymous interviews (empty studentId)`);
    
    // Check for documents where studentId field doesn't exist
    console.log('Checking for documents without studentId field in end-of-call-analysis...');
    const noStudentIdAnalysisSnapshot = await db.collection('end-of-call-analysis')
      .where('studentId', '==', null)
      .limit(5)
      .get();
    console.log(`Found ${noStudentIdAnalysisSnapshot.size} analyses (null studentId)`);
    
    console.log('\n✅ Firebase data check completed!');
    
  } catch (error) {
    console.error('❌ Error checking Firebase data:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
  }
}

checkFirebaseData();