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
    
    // Test creating a document in end-of-call-analysis collection
    console.log('\n--- Testing data creation ---');
    const testAnalysisData = {
      callId: 'test_call_' + Date.now(),
      summary: 'This is a test summary.',
      studentId: '', // Empty for anonymous user
      interviewType: 'general',
      overallScore: 85,
      timestamp: new Date(),
      transcript: 'This is a test transcript.',
      duration: 300,
      recordingUrl: 'https://example.com/recording.mp3'
    };
    
    const analysisDocRef = db.collection('end-of-call-analysis').doc();
    await analysisDocRef.set(testAnalysisData);
    console.log('✅ Successfully created test document in end-of-call-analysis collection');
    console.log('  Document ID:', analysisDocRef.id);
    
    // Test creating a document in interviews collection
    const testInterviewData = {
      studentId: '', // Empty for anonymous user
      type: 'general',
      status: 'completed',
      transcript: 'This is a test transcript.',
      recordingUrl: 'https://example.com/recording.mp3',
      recordingDuration: 300,
      overallScore: 85,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const interviewDocRef = db.collection('interviews').doc();
    await interviewDocRef.set(testInterviewData);
    console.log('✅ Successfully created test document in interviews collection');
    console.log('  Document ID:', interviewDocRef.id);
    
    // Now check if we can read the data back
    console.log('\n--- Verifying data was saved ---');
    const analysisSnapshot = await db.collection('end-of-call-analysis').doc(analysisDocRef.id).get();
    if (analysisSnapshot.exists) {
      const data = analysisSnapshot.data();
      console.log('✅ Successfully read back analysis data:');
      console.log('  Call ID:', data.callId);
      console.log('  Student ID:', data.studentId ? 'Present' : 'Empty (anonymous)');
      console.log('  Score:', data.overallScore);
    }
    
    const interviewSnapshot = await db.collection('interviews').doc(interviewDocRef.id).get();
    if (interviewSnapshot.exists) {
      const data = interviewSnapshot.data();
      console.log('✅ Successfully read back interview data:');
      console.log('  Type:', data.type);
      console.log('  Student ID:', data.studentId ? 'Present' : 'Empty (anonymous)');
      console.log('  Score:', data.overallScore);
    }
    
    // Clean up test data
    console.log('\n--- Cleaning up test data ---');
    await analysisDocRef.delete();
    await interviewDocRef.delete();
    console.log('✅ Test data cleaned up');
    
    console.log('\n✅ Firebase data creation test completed!');
    
  } catch (error) {
    console.error('❌ Error testing Firebase data:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
  }
}

checkFirebaseData();