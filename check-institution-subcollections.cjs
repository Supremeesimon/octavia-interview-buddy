const admin = require('firebase-admin');
const serviceAccount = require('./firebase-config.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkInstitutionSubcollections() {
  try {
    console.log('🔍 Checking institution subcollections...');
    
    // Get the specific institution document
    const institutionId = 'WxD3cWTybNsqkpj7OwW4';
    const institutionRef = db.collection('institutions').doc(institutionId);
    const institutionDoc = await institutionRef.get();
    
    if (!institutionDoc.exists) {
      console.log('❌ Institution not found');
      return;
    }
    
    console.log('✅ Institution found:', institutionDoc.data());
    
    // Check for subcollections
    const subcollections = await institutionRef.listCollections();
    console.log(`\n=== SUBCOLLECTIONS FOUND: ${subcollections.length} ===`);
    
    for (const collection of subcollections) {
      console.log(`\nCollection: ${collection.id}`);
      
      // Get documents in subcollection
      const documents = await collection.limit(5).get();
      console.log(`Document Count: ${documents.size}`);
      
      if (!documents.empty) {
        documents.forEach(doc => {
          console.log(`  Document ID: ${doc.id}`);
          const data = doc.data();
          const fieldNames = Object.keys(data).slice(0, 5); // Show first 5 fields
          console.log(`  Sample Fields: ${fieldNames.join(', ')}`);
        });
      }
    }
    
    console.log('\n✅ Subcollection check complete!');
    
  } catch (error) {
    console.error('❌ Error checking institution subcollections:', error);
  } finally {
    await admin.app().delete();
  }
}

checkInstitutionSubcollections();