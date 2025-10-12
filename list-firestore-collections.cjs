const admin = require('firebase-admin');
const serviceAccount = require('./functions/service-account-key.json');

// Initialize Firebase Admin SDK with service account credentials
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'octavia-practice-interviewer'
});

const db = admin.firestore();

async function listAllCollections() {
  try {
    console.log('🔍 Fetching all collections from Firestore...\n');
    
    // List all collections using the Admin SDK
    const collections = await db.listCollections();
    
    console.log('=== ALL FIRESTORE COLLECTIONS ===');
    console.log(`Found ${collections.length} collections:\n`);
    
    // Sort collections alphabetically for better readability
    const sortedCollections = collections.sort((a, b) => a.id.localeCompare(b.id));
    
    for (const [index, collection] of sortedCollections.entries()) {
      try {
        // Get document count for each collection
        const countSnapshot = await collection.count().get();
        const documentCount = countSnapshot.data().count;
        
        console.log(`${index + 1}. ${collection.id}`);
        console.log(`   Document Count: ${documentCount}`);
        
        // For collections with documents, show a sample if there are documents
        if (documentCount > 0) {
          const sampleSnapshot = await collection.limit(1).get();
          if (!sampleSnapshot.empty) {
            const sampleDoc = sampleSnapshot.docs[0];
            const sampleData = sampleDoc.data();
            
            console.log(`   Sample Document ID: ${sampleDoc.id}`);
            
            // Show first few fields of the sample document
            const fieldKeys = Object.keys(sampleData).slice(0, 3);
            console.log(`   Sample Fields: ${fieldKeys.join(', ')}`);
          }
        }
        
        console.log('');
      } catch (collectionError) {
        console.log(`${index + 1}. ${collection.id}`);
        console.log(`   Error accessing collection: ${collectionError.message}\n`);
      }
    }
    
    console.log(`✅ Successfully listed all ${collections.length} collections!`);
    
  } catch (error) {
    console.error('❌ Error listing collections:', error.message);
    console.error('Error code:', error.code);
  } finally {
    // Clean up the Firebase app
    await admin.app().delete();
  }
}

// Run the function
listAllCollections();