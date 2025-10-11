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

async function checkFeedbackData() {
  try {
    console.log('🔍 Checking feedback data...\n');
    
    // Get all feedback records for the user
    const feedbackSnapshot = await db.collection('interview-feedback')
      .where('studentId', '==', 'xVoQq94Gk3YoBKnnt5TzDrlPtZ72')
      .get();
    
    console.log(`Found ${feedbackSnapshot.size} feedback records for user xVoQq94Gk3YoBKnnt5TzDrlPtZ72`);
    
    feedbackSnapshot.forEach((doc, index) => {
      const feedback = doc.data();
      console.log(`\n${index + 1}. Feedback ID: ${doc.id}`);
      console.log(`   Interview ID: ${feedback.interviewId}`);
      console.log(`   Overall Score: ${feedback.overallScore}`);
      console.log(`   Categories Count: ${feedback.categories ? feedback.categories.length : 0}`);
      console.log(`   Strengths Count: ${feedback.strengths ? feedback.strengths.length : 0}`);
      console.log(`   Improvements Count: ${feedback.improvements ? feedback.improvements.length : 0}`);
      console.log(`   Has Detailed Analysis: ${!!feedback.detailedAnalysis}`);
      console.log(`   Created At: ${feedback.createdAt ? new Date(feedback.createdAt._seconds * 1000) : 'N/A'}`);
    });
    
    // Also get the interviews to see which ones have feedback
    console.log('\n=== Interview to Feedback Mapping ===');
    const interviewsSnapshot = await db.collection('interviews')
      .where('studentId', '==', 'xVoQq94Gk3YoBKnnt5TzDrlPtZ72')
      .get();
    
    for (const doc of interviewsSnapshot.docs) {
      const interview = doc.data();
      console.log(`\nInterview ID: ${doc.id}`);
      console.log(`   Score: ${interview.score}`);
      console.log(`   Created At: ${interview.createdAt ? new Date(interview.createdAt._seconds * 1000) : 'N/A'}`);
      
      // Check if this interview has feedback
      const feedbackQuery = await db.collection('interview-feedback')
        .where('interviewId', '==', doc.id)
        .limit(1)
        .get();
      
      if (!feedbackQuery.empty) {
        const feedback = feedbackQuery.docs[0].data();
        console.log(`   ✅ Has feedback (Score: ${feedback.overallScore})`);
      } else {
        console.log(`   ❌ No feedback found`);
      }
    }
    
    console.log('\n✅ Feedback data check complete!');
    
  } catch (error) {
    console.error('❌ Error checking feedback data:', error.message);
  }
}

// Run the check
checkFeedbackData();