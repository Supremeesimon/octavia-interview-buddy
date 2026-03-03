const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'octavia-practice-interviewer'
  });
}

const db = admin.firestore();

async function listCollections() {
  try {
    console.log('Fetching collections from Firestore...\n');
    
    // List all collections
    const collections = await db.listCollections();
    
    console.log('=== Firestore Collections ===');
    for (const collection of collections) {
      console.log(`Collection: ${collection.id}`);
      
      // Get document count for each collection
      const snapshot = await collection.limit(1).get();
      const countSnapshot = await collection.count().get();
      console.log(`  Document Count: ${countSnapshot.data().count}`);
      
      // Show first few documents as examples (only if there are documents)
      if (!snapshot.empty) {
        console.log('  Sample Documents:');
        const sampleSnapshot = await collection.limit(3).get();
        sampleSnapshot.forEach(doc => {
          console.log(`    - ${doc.id}: ${JSON.stringify(doc.data()).substring(0, 100)}...`);
        });
      }
      console.log('');
    }
    
    console.log(`Total Collections: ${collections.length}`);
    
  } catch (error) {
    console.error('Error fetching collections:', error);
  } finally {
    // Clean up
    await admin.app().delete();
  }
}

listCollections();