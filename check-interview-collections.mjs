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

async function checkInterviewCollections() {
  try {
    console.log('🔍 Checking interview collections...\n');
    
    // Check interviews collection
    console.log('=== Interviews Collection ===');
    const interviewsSnapshot = await db.collection('interviews')
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();
    
    console.log(`Found ${interviewsSnapshot.size} interviews`);
    
    if (interviewsSnapshot.empty) {
      console.log('No interviews found');
    } else {
      interviewsSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\n${index + 1}. Interview ID: ${doc.id}`);
        console.log(`   Student ID: ${data.studentId || 'N/A'}`);
        console.log(`   Status: ${data.status || 'N/A'}`);
        console.log(`   Type: ${data.type || 'N/A'}`);
        console.log(`   Score: ${data.score || 'N/A'}`);
        console.log(`   Created At: ${data.createdAt ? new Date(data.createdAt._seconds * 1000) : 'N/A'}`);
        console.log(`   Has Transcript: ${!!data.transcript}`);
      });
    }
    
    // Check feedback collection
    console.log('\n=== Feedback Collection ===');
    const feedbackSnapshot = await db.collection('interview-feedback')
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();
    
    console.log(`Found ${feedbackSnapshot.size} feedback records`);
    
    if (feedbackSnapshot.empty) {
      console.log('No feedback found');
    } else {
      feedbackSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\n${index + 1}. Feedback ID: ${doc.id}`);
        console.log(`   Interview ID: ${data.interviewId || 'N/A'}`);
        console.log(`   Student ID: ${data.studentId || 'N/A'}`);
        console.log(`   Overall Score: ${data.overallScore || 'N/A'}`);
        console.log(`   Created At: ${data.createdAt ? new Date(data.createdAt._seconds * 1000) : 'N/A'}`);
        console.log(`   Has Detailed Analysis: ${!!data.detailedAnalysis}`);
      });
    }
    
    console.log('\n✅ Collection check complete!');
    
  } catch (error) {
    console.error('❌ Error checking collections:', error.message);
  }
}

checkInterviewCollections();