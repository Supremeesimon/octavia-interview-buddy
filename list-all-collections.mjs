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

async function listAllCollections() {
  try {
    console.log('🔍 Listing all Firestore collections...\n');
    
    // List all collections in the database
    const collections = await db.listCollections();
    console.log('Available collections:');
    
    if (collections.length === 0) {
      console.log('No collections found in the database.');
      return;
    }
    
    for (const collection of collections) {
      console.log(`- ${collection.id}`);
      
      // Try to get a count of documents in each collection
      try {
        const countSnapshot = await collection.count().get();
        console.log(`  Documents: ${countSnapshot.data().count}`);
      } catch (countError) {
        console.log(`  Documents: Unable to count (error: ${countError.message})`);
      }
    }
    
    console.log('\n✅ Collection listing complete!');
    
  } catch (error) {
    console.error('❌ Error listing collections:', error.message);
    console.log('\nNote: Make sure the service account key file is properly configured.');
  }
}

listAllCollections();