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

async function createMissingCollections() {
  try {
    console.log('🔍 Creating missing collections...\n');
    
    // Create a dummy document in each collection to ensure they exist
    console.log('Creating interviews collection...');
    const interviewDoc = await db.collection('interviews').add({
      createdAt: new Date(),
      note: 'Collection initialization document - can be safely deleted'
    });
    console.log('✅ Created interviews collection with document ID:', interviewDoc.id);
    
    console.log('Creating interview-feedback collection...');
    const feedbackDoc = await db.collection('interview-feedback').add({
      createdAt: new Date(),
      note: 'Collection initialization document - can be safely deleted'
    });
    console.log('✅ Created interview-feedback collection with document ID:', feedbackDoc.id);
    
    console.log('\n✅ Missing collections created successfully!');
    console.log('Now let\'s test if the VAPI webhook function is working...');
    
  } catch (error) {
    console.error('❌ Error creating collections:', error.message);
  }
}

createMissingCollections();