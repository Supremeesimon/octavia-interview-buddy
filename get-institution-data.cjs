const admin = require('firebase-admin');
const serviceAccount = require('./functions/service-account-key.json');

// Initialize Firebase Admin SDK with service account credentials
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'octavia-practice-interviewer'
});

const db = admin.firestore();

async function getInstitutionData() {
  try {
    console.log('🔍 Fetching institution data from Firestore...\n');
    
    // Get institutions collection
    const institutionsCollection = db.collection('institutions');
    const institutionsSnapshot = await institutionsCollection.get();
    
    console.log('=== INSTITUTION DATA ===');
    console.log(`Found ${institutionsSnapshot.size} institution(s):\n`);
    
    if (institutionsSnapshot.empty) {
      console.log('No institutions found in the database.');
      return;
    }
    
    // Show institution details
    institutionsSnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. Institution ID: ${doc.id}`);
      console.log(`   Name: ${data.name || 'N/A'}`);
      console.log(`   Domain: ${data.domain || 'N/A'}`);
      console.log(`   Admin ID: ${data.adminId || 'N/A'}`);
      console.log(`   Created At: ${data.createdAt ? new Date(data.createdAt._seconds * 1000).toISOString() : 'N/A'}`);
      console.log('');
    });
    
    // Also get users to understand the user base
    console.log('=== USER DATA ===');
    const usersCollection = db.collection('users');
    const usersSnapshot = await usersCollection.get();
    
    console.log(`Found ${usersSnapshot.size} user(s):\n`);
    
    usersSnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. User ID: ${doc.id}`);
      console.log(`   Name: ${data.name || 'N/A'}`);
      console.log(`   Email: ${data.email || 'N/A'}`);
      console.log(`   Role: ${data.role || 'N/A'}`);
      console.log(`   Institution ID: ${data.institutionId || 'N/A'}`);
      console.log('');
    });
    
    console.log('✅ Data fetch complete!');
    
  } catch (error) {
    console.error('❌ Error fetching data:', error.message);
  } finally {
    // Clean up the Firebase app
    await admin.app().delete();
  }
}

// Run the function
getInstitutionData();