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

async function fixInterviewScores() {
  try {
    console.log('🔧 Fixing interview scores...\n');
    
    // Get all interviews for the user
    const interviewsSnapshot = await db.collection('interviews')
      .where('studentId', '==', 'xVoQq94Gk3YoBKnnt5TzDrlPtZ72')
      .get();
    
    console.log(`Found ${interviewsSnapshot.size} interviews to check\n`);
    
    for (const doc of interviewsSnapshot.docs) {
      const interview = doc.data();
      console.log(`Interview ID: ${doc.id}`);
      console.log(`  Current Score: ${interview.score}`);
      
      // If score is 0 or missing, update it
      if (!interview.score || interview.score === 0) {
        // Get corresponding feedback to get the score
        const feedbackQuery = await db.collection('interview-feedback')
          .where('interviewId', '==', doc.id)
          .limit(1)
          .get();
        
        if (!feedbackQuery.empty) {
          const feedback = feedbackQuery.docs[0].data();
          const newScore = feedback.overallScore || 75;
          
          console.log(`  Updating score to: ${newScore}`);
          
          // Update the interview with the correct score
          await db.collection('interviews').doc(doc.id).update({
            score: newScore
          });
          
          console.log(`  ✅ Updated interview score`);
        } else {
          // Set a default score
          const defaultScore = 70;
          console.log(`  No feedback found, setting default score: ${defaultScore}`);
          
          await db.collection('interviews').doc(doc.id).update({
            score: defaultScore
          });
          
          console.log(`  ✅ Updated interview score to default`);
        }
      } else {
        console.log(`  ℹ️ Score is already set, skipping...`);
      }
      console.log('');
    }
    
    console.log('✅ Interview scores fix complete!');
    
  } catch (error) {
    console.error('❌ Error fixing interview scores:', error.message);
  }
}

// Run the fix
fixInterviewScores();