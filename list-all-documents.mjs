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

async function listAllDocuments() {
  try {
    console.log('Listing all documents in Firebase collections...\n');
    
    // Check end-of-call-analysis collection
    console.log('--- end-of-call-analysis collection ---');
    const analysisSnapshot = await db.collection('end-of-call-analysis').orderBy('createdAt', 'desc').get();
    console.log(`Found ${analysisSnapshot.size} documents`);
    
    if (!analysisSnapshot.empty) {
      analysisSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\n${index + 1}. Document ID: ${doc.id}`);
        console.log(`   Call ID: ${data.callId || 'N/A'}`);
        console.log(`   Student ID: "${data.studentId || 'N/A'}"`);
        console.log(`   Created At: ${data.createdAt?.toDate?.() || data.createdAt || 'N/A'}`);
        console.log(`   Interview Type: ${data.interviewType || 'N/A'}`);
        console.log(`   Summary: ${data.summary ? data.summary.substring(0, 50) + '...' : 'N/A'}`);
      });
    }
    
    // Check interviews collection
    console.log('\n--- interviews collection ---');
    const interviewsSnapshot = await db.collection('interviews').orderBy('createdAt', 'desc').get();
    console.log(`Found ${interviewsSnapshot.size} documents`);
    
    if (!interviewsSnapshot.empty) {
      interviewsSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\n${index + 1}. Document ID: ${doc.id}`);
        console.log(`   Student ID: "${data.studentId || 'N/A'}"`);
        console.log(`   Status: ${data.status || 'N/A'}`);
        console.log(`   Type: ${data.type || 'N/A'}`);
        console.log(`   Created At: ${data.createdAt?.toDate?.() || data.createdAt || 'N/A'}`);
        console.log(`   Overall Score: ${data.overallScore || 'N/A'}`);
      });
    }
    
    console.log('\n✅ Document listing completed!');
    
  } catch (error) {
    console.error('❌ Error listing documents:', error);
  }
}

listAllDocuments();