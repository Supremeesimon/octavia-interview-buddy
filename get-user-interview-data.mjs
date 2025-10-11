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

async function getUserInterviewData(email) {
  try {
    console.log(`🔍 Checking interview data for user: ${email}\n`);
    
    // First, find the user ID by email
    console.log('=== Finding User ID ===');
    const usersSnapshot = await db.collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();
    
    if (usersSnapshot.empty) {
      console.log(`❌ No user found with email: ${email}`);
      return;
    }
    
    const userDoc = usersSnapshot.docs[0];
    const userId = userDoc.id;
    const userData = userDoc.data();
    
    console.log(`✅ Found user: ${userData.name} (${userData.email})`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Role: ${userData.role}`);
    console.log(`   Institution Domain: ${userData.institutionDomain || 'N/A'}\n`);
    
    // Check interviews collection for this user (without orderBy to avoid index issue)
    console.log('=== User Interviews ===');
    const interviewsSnapshot = await db.collection('interviews')
      .where('studentId', '==', userId)
      .limit(10)
      .get();
    
    console.log(`Found ${interviewsSnapshot.size} interviews for user ${userId}`);
    
    if (interviewsSnapshot.empty) {
      console.log('No interviews found for this user');
    } else {
      // Convert to array and sort by createdAt manually
      const interviews = [];
      interviewsSnapshot.forEach(doc => {
        const data = doc.data();
        interviews.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt ? new Date(data.createdAt._seconds * 1000) : null
        });
      });
      
      // Sort by createdAt descending
      interviews.sort((a, b) => (b.createdAt || new Date(0)) - (a.createdAt || new Date(0)));
      
      interviews.forEach((interview, index) => {
        console.log(`\n${index + 1}. Interview ID: ${interview.id}`);
        console.log(`   Status: ${interview.status || 'N/A'}`);
        console.log(`   Type: ${interview.type || 'N/A'}`);
        console.log(`   Score: ${interview.score || 'N/A'}`);
        console.log(`   Duration: ${interview.duration || 'N/A'} seconds`);
        console.log(`   Created At: ${interview.createdAt || 'N/A'}`);
        console.log(`   Has Transcript: ${!!interview.transcript}`);
        console.log(`   Has Recording: ${!!interview.recordingUrl}`);
      });
    }
    
    // Check feedback collection for this user (without orderBy to avoid index issue)
    console.log('\n=== User Feedback ===');
    const feedbackSnapshot = await db.collection('interview-feedback')
      .where('studentId', '==', userId)
      .limit(10)
      .get();
    
    console.log(`Found ${feedbackSnapshot.size} feedback records for user ${userId}`);
    
    if (feedbackSnapshot.empty) {
      console.log('No feedback found for this user');
    } else {
      // Convert to array and sort by createdAt manually
      const feedbacks = [];
      feedbackSnapshot.forEach(doc => {
        const data = doc.data();
        feedbacks.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt ? new Date(data.createdAt._seconds * 1000) : null
        });
      });
      
      // Sort by createdAt descending
      feedbacks.sort((a, b) => (b.createdAt || new Date(0)) - (a.createdAt || new Date(0)));
      
      feedbacks.forEach((feedback, index) => {
        console.log(`\n${index + 1}. Feedback ID: ${feedback.id}`);
        console.log(`   Interview ID: ${feedback.interviewId || 'N/A'}`);
        console.log(`   Overall Score: ${feedback.overallScore || 'N/A'}`);
        console.log(`   Categories Count: ${feedback.categories ? feedback.categories.length : 0}`);
        console.log(`   Strengths Count: ${feedback.strengths ? feedback.strengths.length : 0}`);
        console.log(`   Improvements Count: ${feedback.improvements ? feedback.improvements.length : 0}`);
        console.log(`   Created At: ${feedback.createdAt || 'N/A'}`);
        console.log(`   Has Detailed Analysis: ${!!feedback.detailedAnalysis}`);
      });
    }
    
    // Check end-of-call-analysis collection for this user (without orderBy to avoid index issue)
    console.log('\n=== End-of-Call Analysis ===');
    const analysisSnapshot = await db.collection('end-of-call-analysis')
      .where('studentId', '==', userId)
      .limit(10)
      .get();
    
    console.log(`Found ${analysisSnapshot.size} analysis records for user ${userId}`);
    
    if (analysisSnapshot.empty) {
      console.log('No end-of-call analysis found for this user');
    } else {
      // Convert to array and sort by timestamp manually
      const analyses = [];
      analysisSnapshot.forEach(doc => {
        const data = doc.data();
        analyses.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp ? new Date(data.timestamp._seconds * 1000) : null
        });
      });
      
      // Sort by timestamp descending
      analyses.sort((a, b) => (b.timestamp || new Date(0)) - (a.timestamp || new Date(0)));
      
      analyses.forEach((analysis, index) => {
        console.log(`\n${index + 1}. Analysis ID: ${analysis.id}`);
        console.log(`   Call ID: ${analysis.callId || 'N/A'}`);
        console.log(`   Overall Score: ${analysis.overallScore || analysis.successEvaluation?.score || 'N/A'}`);
        console.log(`   Duration: ${analysis.duration || 'N/A'} seconds`);
        console.log(`   Timestamp: ${analysis.timestamp || 'N/A'}`);
        console.log(`   Has Summary: ${!!analysis.summary}`);
        console.log(`   Has Transcript: ${!!analysis.transcript}`);
      });
    }
    
    console.log('\n✅ User data check complete!');
    
  } catch (error) {
    console.error('❌ Error checking user data:', error.message);
  }
}

// Run the check for the specified user
getUserInterviewData('oluwaferanmionabanjo@gmail.com');