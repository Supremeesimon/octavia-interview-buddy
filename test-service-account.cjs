const admin = require('firebase-admin');
const serviceAccount = require('./functions/service-account-key.json');

// Initialize Firebase Admin SDK with service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function testServiceAccount() {
  try {
    console.log('🔍 Testing Firebase Admin SDK with service account...');
    
    // Test reading from institutions collection
    const institutionsSnapshot = await db.collection('institutions').limit(1).get();
    console.log(`✅ Successfully connected to Firestore`);
    console.log(`✅ Found ${institutionsSnapshot.size} institutions`);
    
    if (!institutionsSnapshot.empty) {
      const institutionDoc = institutionsSnapshot.docs[0];
      const institutionData = institutionDoc.data();
      console.log(`✅ Sample institution: ${institutionData.name || 'Unknown'} (${institutionDoc.id})`);
    }
    
    // Test reading from users collection
    const usersSnapshot = await db.collection('users').limit(1).get();
    console.log(`✅ Found ${usersSnapshot.size} users in legacy collection`);
    
    // Test reading from externalUsers collection (if it exists)
    try {
      const externalUsersSnapshot = await db.collection('externalUsers').limit(1).get();
      console.log(`✅ Found ${externalUsersSnapshot.size} external users`);
    } catch (error) {
      console.log(`ℹ️  externalUsers collection may not exist yet`);
    }
    
    console.log('\n✅ Service account test completed successfully!');
    console.log('✅ Firebase Admin SDK is properly configured');
    
  } catch (error) {
    console.error('❌ Error during service account test:', error);
  } finally {
    // Clean up
    await admin.app().delete();
  }
}

testServiceAccount();