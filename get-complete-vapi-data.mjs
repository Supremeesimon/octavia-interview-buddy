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

async function getCompleteVapiData() {
  try {
    console.log('🔍 Retrieving complete VAPI data from Firestore...\n');

    // Get the most recent document from end-of-call-analysis collection
    const analysisCollection = db.collection('end-of-call-analysis');
    const analysisSnapshot = await analysisCollection
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
    
    if (analysisSnapshot.empty) {
      console.log('No documents found in end-of-call-analysis collection\n');
      return;
    }

    const doc = analysisSnapshot.docs[0];
    const data = doc.data();
    
    console.log('=== COMPLETE VAPI DATA ===');
    console.log(`Document ID: ${doc.id}`);
    console.log(`Firestore Document ID: ${doc.id}`);
    console.log('');
    
    // Display all top-level fields
    console.log('--- ALL FIELDS ---');
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'object' && value !== null) {
        if (value._seconds) {
          // This is a Firestore timestamp
          console.log(`${key}: ${new Date(value._seconds * 1000).toISOString()}`);
        } else {
          console.log(`${key}: [OBJECT - see details below]`);
        }
      } else if (typeof value === 'string' && value.length > 100) {
        console.log(`${key}: ${value.substring(0, 100)}... (${value.length} chars total)`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }
    
    console.log('');
    
    // Display detailed analysis data
    if (data.summary) {
      console.log('--- SUMMARY ---');
      console.log(data.summary);
      console.log('');
    }
    
    if (data.transcript) {
      console.log('--- TRANSCRIPT ---');
      console.log(data.transcript);
      console.log('');
    }
    
    if (data.recordingUrl) {
      console.log('--- RECORDING URL ---');
      console.log(data.recordingUrl);
      console.log('');
    }
    
    // Display structured data details
    if (data.structuredData) {
      console.log('--- STRUCTURED DATA ---');
      console.log(JSON.stringify(data.structuredData, null, 2));
      console.log('');
    }
    
    // Display success evaluation details
    if (data.successEvaluation) {
      console.log('--- SUCCESS EVALUATION ---');
      console.log(JSON.stringify(data.successEvaluation, null, 2));
      console.log('');
    }
    
    // Display compliance data
    if (data.compliance) {
      console.log('--- COMPLIANCE DATA ---');
      console.log(JSON.stringify(data.compliance, null, 2));
      console.log('');
    }
    
    // Display metadata if it exists
    if (data.metadata) {
      console.log('--- METADATA ---');
      console.log(JSON.stringify(data.metadata, null, 2));
      console.log('');
    }
    
    // Display cost information
    if (data.cost) {
      console.log('--- COST INFORMATION ---');
      console.log(JSON.stringify(data.cost, null, 2));
      console.log('');
    }
    
    // Display timing information
    console.log('--- TIMING INFORMATION ---');
    console.log(`Started At: ${data.startedAt || 'N/A'}`);
    console.log(`Ended At: ${data.endedAt || 'N/A'}`);
    console.log(`Duration: ${data.duration || 'N/A'}`);
    console.log(`Ended Reason: ${data.endedReason || 'N/A'}`);
    console.log('');
    
    console.log('✅ Complete VAPI data retrieval finished!');
    
  } catch (error) {
    console.error('❌ Error retrieving VAPI data:', error);
  }
}

// Run the function
getCompleteVapiData();