const admin = require('firebase-admin');
const serviceAccount = require('./firebase-config.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'octavia-practice-interviewer'
});

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
      const countSnapshot = await collection.count().get();
      console.log(`  Document Count: ${countSnapshot.data().count}`);
    }
    
    console.log(`\nTotal Collections: ${collections.length}`);
    
  } catch (error) {
    console.error('Error fetching collections:', error.message);
  } finally {
    // Clean up
    await admin.app().delete();
  }
}

listCollections();