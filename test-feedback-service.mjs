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

async function testFeedbackService() {
  try {
    console.log('🔍 Testing feedback service for user: xVoQq94Gk3YoBKnnt5TzDrlPtZ72\n');
    
    // Test the exact query that getLatestStudentFeedback uses
    console.log('=== Testing Interview Query ===');
    const interviewsSnapshot = await db.collection('interviews')
      .where('studentId', '==', 'xVoQq94Gk3YoBKnnt5TzDrlPtZ72')
      .where('status', '==', 'completed')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
    
    console.log(`Found ${interviewsSnapshot.size} completed interviews`);
    
    if (!interviewsSnapshot.empty) {
      const latestInterview = interviewsSnapshot.docs[0];
      const interviewData = latestInterview.data();
      console.log(`Latest interview ID: ${latestInterview.id}`);
      console.log(`Interview data:`, interviewData);
      
      // Now test getting feedback for this interview
      console.log('\n=== Testing Feedback Query ===');
      const feedbackSnapshot = await db.collection('interview-feedback')
        .where('interviewId', '==', latestInterview.id)
        .get();
      
      console.log(`Found ${feedbackSnapshot.size} feedback records for interview ${latestInterview.id}`);
      
      if (!feedbackSnapshot.empty) {
        const feedbackDoc = feedbackSnapshot.docs[0];
        const feedbackData = feedbackDoc.data();
        console.log(`Feedback ID: ${feedbackDoc.id}`);
        console.log(`Feedback data:`, feedbackData);
      } else {
        console.log('No feedback found for this interview');
      }
    } else {
      console.log('No completed interviews found for this user');
    }
    
    console.log('\n✅ Test complete!');
    
  } catch (error) {
    console.error('❌ Error testing feedback service:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testFeedbackService();