import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load service account credentials
const serviceAccount = JSON.parse(readFileSync(resolve('firebase-service-account.json'), 'utf8'));

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert(serviceAccount),
  projectId: 'octavia-practice-interviewer',
});

const db = getFirestore(app);

async function checkYourInterviews() {
  try {
    console.log('🔍 Checking interviews for user: oluwaferanmionabanjo@gmail.com\n');
    
    // First, find your user document
    console.log('=== Looking for your user ===');
    const usersSnapshot = await db.collection('users')
      .where('email', '==', 'oluwaferanmionabanjo@gmail.com')
      .get();
    
    if (usersSnapshot.empty) {
      console.log('❌ User not found in database');
      // Let's also check if there might be case sensitivity issues
      console.log('Checking for case variations...');
      const allUsersSnapshot = await db.collection('users').get();
      allUsersSnapshot.forEach(doc => {
        const userData = doc.data();
        if (userData.email && userData.email.toLowerCase().includes('oluwaferanmi')) {
          console.log(`Found similar email: ${userData.email} (ID: ${doc.id})`);
        }
      });
      return;
    }
    
    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();
    console.log(`✅ Found user: ${userData.email} (ID: ${userDoc.id})\n`);
    
    // Check for interviews in the interviews collection
    console.log('=== Checking Interviews Collection ===');
    const interviewsSnapshot = await db.collection('interviews')
      .where('studentId', '==', userDoc.id)
      .orderBy('createdAt', 'desc')
      .get();
    
    console.log(`Found ${interviewsSnapshot.size} interviews in interviews collection\n`);
    
    if (!interviewsSnapshot.empty) {
      console.log('Interviews:');
      interviewsSnapshot.forEach((doc, index) => {
        const interviewData = doc.data();
        console.log(`${index + 1}. ID: ${doc.id}`);
        console.log(`   Status: ${interviewData.status}`);
        console.log(`   Type: ${interviewData.type}`);
        console.log(`   Score: ${interviewData.score || 'N/A'}`);
        console.log(`   Created: ${interviewData.createdAt ? new Date(interviewData.createdAt._seconds * 1000) : 'N/A'}`);
        console.log(`   Has Transcript: ${!!interviewData.transcript}`);
        console.log('');
      });
    }
    
    // Check for interview feedback (without ordering to avoid index issues)
    console.log('=== Checking Interview Feedback Collection ===');
    try {
      const feedbackSnapshot = await db.collection('interview-feedback')
        .where('studentId', '==', userDoc.id)
        .get();
      
      console.log(`Found ${feedbackSnapshot.size} feedback records\n`);
      
      if (!feedbackSnapshot.empty) {
        console.log('Feedback records:');
        feedbackSnapshot.forEach((doc, index) => {
          const feedbackData = doc.data();
          console.log(`${index + 1}. ID: ${doc.id}`);
          console.log(`   Interview ID: ${feedbackData.interviewId}`);
          console.log(`   Overall Score: ${feedbackData.overallScore || 'N/A'}`);
          console.log(`   Created: ${feedbackData.createdAt ? new Date(feedbackData.createdAt._seconds * 1000) : 'N/A'}`);
          console.log('');
        });
      }
    } catch (error) {
      console.log('⚠️  Error querying feedback collection:', error.message);
      console.log('');
    }
    
    // Check for end-of-call analysis (without ordering to avoid index issues)
    console.log('=== Checking End-of-Call Analysis Collection ===');
    try {
      const analysisSnapshot = await db.collection('end-of-call-analysis')
        .where('studentId', '==', userDoc.id)
        .get();
      
      console.log(`Found ${analysisSnapshot.size} end-of-call analysis records\n`);
      
      if (!analysisSnapshot.empty) {
        console.log('End-of-call analysis records:');
        analysisSnapshot.forEach((doc, index) => {
          const analysisData = doc.data();
          console.log(`${index + 1}. ID: ${doc.id}`);
          console.log(`   Call ID: ${analysisData.callId || 'N/A'}`);
          console.log(`   Summary: ${analysisData.summary ? analysisData.summary.substring(0, 50) + '...' : 'N/A'}`);
          console.log(`   Score: ${analysisData.successEvaluation?.score || 'N/A'}`);
          console.log(`   Created: ${analysisData.createdAt ? new Date(analysisData.createdAt._seconds * 1000) : 'N/A'}`);
          console.log('');
        });
      }
    } catch (error) {
      console.log('⚠️  Error querying end-of-call-analysis collection:', error.message);
      console.log('');
    }
    
    // Check for any interviews without studentId (anonymous)
    console.log('=== Checking for Anonymous Interviews ===');
    try {
      const anonymousInterviewsSnapshot = await db.collection('interviews')
        .where('studentId', '==', '')
        .get();
      
      console.log(`Found ${anonymousInterviewsSnapshot.size} anonymous interviews\n`);
    } catch (error) {
      console.log('⚠️  Error querying anonymous interviews:', error.message);
      console.log('');
    }
    
    // Check for any end-of-call analysis without studentId (anonymous)
    try {
      const anonymousAnalysisSnapshot = await db.collection('end-of-call-analysis')
        .where('studentId', '==', '')
        .get();
      
      console.log(`Found ${anonymousAnalysisSnapshot.size} anonymous end-of-call analysis records\n`);
    } catch (error) {
      console.log('⚠️  Error querying anonymous end-of-call analysis:', error.message);
      console.log('');
    }
    
    console.log('✅ Data check complete!');
    
  } catch (error) {
    console.error('❌ Error checking user interviews:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the check
checkYourInterviews();