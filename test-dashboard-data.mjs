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

async function testDashboardData() {
  try {
    console.log('🔍 Testing Dashboard Data\n');
    console.log('===========================================\n');
    
    // Test interviews data
    console.log('📋 INTERVIEWS DATA');
    console.log('===========================================');
    
    const interviewsSnapshot = await db.collection('interviews')
      .where('studentId', '==', 'xVoQq94Gk3YoBKnnt5TzDrlPtZ72')
      .get();
    
    console.log(`Total interviews: ${interviewsSnapshot.size}\n`);
    
    for (const doc of interviewsSnapshot.docs) {
      const interview = doc.data();
      console.log(`Interview ID: ${doc.id}`);
      console.log(`  Score: ${interview.score}`);
      console.log(`  Status: ${interview.status}`);
      console.log(`  Type: ${interview.type}`);
      console.log(`  Created At: ${interview.createdAt ? new Date(interview.createdAt._seconds * 1000) : 'N/A'}`);
      console.log(`  Has Transcript: ${!!interview.transcript}`);
      console.log('');
    }
    
    // Test feedback data
    console.log('📝 FEEDBACK DATA');
    console.log('===========================================');
    
    const feedbackSnapshot = await db.collection('interview-feedback')
      .where('studentId', '==', 'xVoQq94Gk3YoBKnnt5TzDrlPtZ72')
      .get();
    
    console.log(`Total feedback records: ${feedbackSnapshot.size}\n`);
    
    for (const doc of feedbackSnapshot.docs) {
      const feedback = doc.data();
      console.log(`Feedback ID: ${doc.id}`);
      console.log(`  Interview ID: ${feedback.interviewId}`);
      console.log(`  Overall Score: ${feedback.overallScore}`);
      console.log(`  Categories: ${feedback.categories.length}`);
      console.log(`  Strengths: ${feedback.strengths.length}`);
      console.log(`  Improvements: ${feedback.improvements.length}`);
      console.log(`  Recommendations: ${feedback.recommendations.length}`);
      console.log(`  Created At: ${feedback.createdAt ? new Date(feedback.createdAt._seconds * 1000) : 'N/A'}`);
      console.log('');
    }
    
    // Test latest feedback for student
    console.log('🎯 LATEST FEEDBACK TEST');
    console.log('===========================================');
    
    // Get latest completed interview
    const latestInterviewQuery = await db.collection('interviews')
      .where('studentId', '==', 'xVoQq94Gk3YoBKnnt5TzDrlPtZ72')
      .where('status', '==', 'completed')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
    
    if (!latestInterviewQuery.empty) {
      const latestInterview = latestInterviewQuery.docs[0];
      const interviewData = latestInterview.data();
      console.log(`Latest Interview ID: ${latestInterview.id}`);
      console.log(`  Score: ${interviewData.score}`);
      console.log(`  Created At: ${interviewData.createdAt ? new Date(interviewData.createdAt._seconds * 1000) : 'N/A'}`);
      
      // Get feedback for this interview
      const feedbackQuery = await db.collection('interview-feedback')
        .where('interviewId', '==', latestInterview.id)
        .limit(1)
        .get();
      
      if (!feedbackQuery.empty) {
        const feedbackDoc = feedbackQuery.docs[0];
        const feedbackData = feedbackDoc.data();
        console.log(`\nFeedback for Latest Interview:`);
        console.log(`  Feedback ID: ${feedbackDoc.id}`);
        console.log(`  Overall Score: ${feedbackData.overallScore}`);
        console.log(`  Categories: ${feedbackData.categories.length}`);
        console.log(`  Has Strengths: ${!!(feedbackData.strengths && feedbackData.strengths.length > 0)}`);
        console.log(`  Has Improvements: ${!!(feedbackData.improvements && feedbackData.improvements.length > 0)}`);
      } else {
        console.log(`\nNo feedback found for latest interview`);
      }
    } else {
      console.log(`No completed interviews found`);
    }
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  }
}

// Run the test
testDashboardData();