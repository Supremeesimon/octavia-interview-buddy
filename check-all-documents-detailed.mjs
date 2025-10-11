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

async function checkAllDocumentsDetailed() {
  try {
    console.log('🔍 Checking all documents in all collections...\n');

    // Check end-of-call-analysis collection
    console.log('=== END-OF-CALL-ANALYSIS COLLECTION ===');
    const analysisCollection = db.collection('end-of-call-analysis');
    const analysisSnapshot = await analysisCollection.get();
    
    console.log(`Found ${analysisSnapshot.size} documents\n`);
    
    for (const [index, doc] of analysisSnapshot.docs.entries()) {
      const data = doc.data();
      console.log(`--- Document ${index + 1}: ${doc.id} ---`);
      console.log(`Call ID: ${data.callId || 'N/A'}`);
      console.log(`Student ID: '${data.studentId}' (${typeof data.studentId})`);
      console.log(`Has metadata: ${!!data.metadata}`);
      console.log(`Has summary: ${!!data.summary}`);
      console.log(`Has structuredData: ${!!data.structuredData && Object.keys(data.structuredData).length > 0}`);
      console.log(`Has successEvaluation: ${!!data.successEvaluation && Object.keys(data.successEvaluation).length > 0}`);
      console.log('');
    }

    // Check interviews collection
    console.log('=== INTERVIEWS COLLECTION ===');
    const interviewsCollection = db.collection('interviews');
    const interviewsSnapshot = await interviewsCollection.get();
    
    console.log(`Found ${interviewsSnapshot.size} documents\n`);
    
    if (interviewsSnapshot.empty) {
      console.log('No documents found\n');
    } else {
      for (const [index, doc] of interviewsSnapshot.docs.entries()) {
        const data = doc.data();
        console.log(`--- Document ${index + 1}: ${doc.id} ---`);
        console.log(`Student ID: '${data.studentId}' (${typeof data.studentId})`);
        console.log(`Status: ${data.status || 'N/A'}`);
        console.log(`Type: ${data.type || 'N/A'}`);
        console.log(`Score: ${data.score || 'N/A'}`);
        console.log('');
      }
    }

    // Check interview-feedback collection
    console.log('=== INTERVIEW-FEEDBACK COLLECTION ===');
    const feedbackCollection = db.collection('interview-feedback');
    const feedbackSnapshot = await feedbackCollection.get();
    
    console.log(`Found ${feedbackSnapshot.size} documents\n`);
    
    if (feedbackSnapshot.empty) {
      console.log('No documents found\n');
    } else {
      for (const [index, doc] of feedbackSnapshot.docs.entries()) {
        const data = doc.data();
        console.log(`--- Document ${index + 1}: ${doc.id} ---`);
        console.log(`Interview ID: ${data.interviewId || 'N/A'}`);
        console.log(`Student ID: '${data.studentId}' (${typeof data.studentId})`);
        console.log(`Overall Score: ${data.overallScore || 'N/A'}`);
        console.log(`Has Categories: ${!!(data.categories && data.categories.length > 0)}`);
        console.log(`Has Strengths: ${!!(data.strengths && data.strengths.length > 0)}`);
        console.log('');
      }
    }

    console.log('✅ Complete document check finished!');
    
  } catch (error) {
    console.error('❌ Error checking documents:', error);
  }
}

// Run the function
checkAllDocumentsDetailed();