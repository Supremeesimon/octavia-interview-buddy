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

async function checkInterviewStructure() {
  try {
    console.log('🔍 Checking interview data structure...\n');
    
    // Get all interviews for the user
    const interviewsSnapshot = await db.collection('interviews')
      .where('studentId', '==', 'xVoQq94Gk3YoBKnnt5TzDrlPtZ72')
      .get();
    
    console.log(`Found ${interviewsSnapshot.size} interviews for user xVoQq94Gk3YoBKnnt5TzDrlPtZ72`);
    
    interviewsSnapshot.forEach((doc, index) => {
      const interview = doc.data();
      console.log(`\n${index + 1}. Interview ID: ${doc.id}`);
      console.log(`   All fields: ${Object.keys(interview).join(', ')}`);
      console.log(`   Student ID: ${interview.studentId}`);
      console.log(`   Status: ${interview.status}`);
      console.log(`   Type: ${interview.type}`);
      console.log(`   Score: ${interview.score}`);
      console.log(`   Duration: ${interview.duration}`);
      console.log(`   Has Transcript: ${!!interview.transcript}`);
      console.log(`   Has Recording URL: ${!!interview.recordingUrl}`);
      console.log(`   Created At: ${interview.createdAt ? new Date(interview.createdAt._seconds * 1000) : 'N/A'}`);
      console.log(`   Updated At: ${interview.updatedAt ? new Date(interview.updatedAt._seconds * 1000) : 'N/A'}`);
    });
    
    console.log('\n✅ Interview structure check complete!');
    
  } catch (error) {
    console.error('❌ Error checking interview structure:', error.message);
  }
}

// Run the check
checkInterviewStructure();