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

async function checkCallIds() {
  try {
    console.log('🔍 Checking call IDs...\n');
    
    // Get all interviews for the user
    const interviewsSnapshot = await db.collection('interviews')
      .where('studentId', '==', 'xVoQq94Gk3YoBKnnt5TzDrlPtZ72')
      .get();
    
    console.log(`Interviews:`);
    interviewsSnapshot.forEach((doc, index) => {
      const interview = doc.data();
      console.log(`${index + 1}. Interview ID: ${doc.id}`);
      console.log(`   VAPI Call ID: ${interview.vapiCallId || 'N/A'}`);
    });
    
    // Get all analysis records for the user
    const analysisSnapshot = await db.collection('end-of-call-analysis')
      .where('studentId', '==', 'xVoQq94Gk3YoBKnnt5TzDrlPtZ72')
      .get();
    
    console.log(`\nAnalysis Records:`);
    analysisSnapshot.forEach((doc, index) => {
      const analysis = doc.data();
      console.log(`${index + 1}. Analysis ID: ${doc.id}`);
      console.log(`   Call ID: ${analysis.callId || 'N/A'}`);
    });
    
    console.log('\n✅ Call ID check complete!');
    
  } catch (error) {
    console.error('❌ Error checking call IDs:', error.message);
  }
}

// Run the check
checkCallIds();