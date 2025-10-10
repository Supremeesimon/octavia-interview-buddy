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

async function verifyDataSaving() {
  try {
    console.log('Verifying that data saving is working correctly...\n');
    
    // Check current state
    console.log('--- Current state before test ---');
    const analysisBefore = await db.collection('end-of-call-analysis').get();
    const interviewsBefore = await db.collection('interviews').get();
    console.log(`end-of-call-analysis documents: ${analysisBefore.size}`);
    console.log(`interviews documents: ${interviewsBefore.size}`);
    
    console.log('\n✅ Test completed!');
    console.log('Now try an interview on http://localhost:8084 and check this again');
    console.log('The document counts should increase after the interview ends.');
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
  }
}

verifyDataSaving();