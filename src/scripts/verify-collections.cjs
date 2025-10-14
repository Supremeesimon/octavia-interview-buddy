const admin = require('firebase-admin');
// Fix the path to the service account key - it's in the functions directory
const serviceAccount = require('../../functions/service-account-key.json');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://octavia-practice-interviewer.firebaseio.com'
  });
}

const db = admin.firestore();

async function verifyCollections() {
  try {
    console.log('Verifying Firebase collections structure...\n');
    
    // List all collections
    const collections = await db.listCollections();
    console.log('Available collections:');
    collections.forEach(collection => {
      console.log(`- ${collection.id}`);
    });
    
    console.log('\n--- Collection Details ---\n');
    
    // Check institution_interests collection
    console.log('1. institution_interests collection:');
    const interestSnapshot = await db.collection('institution_interests').limit(5).get();
    console.log(`   Document count: ${interestSnapshot.size}`);
    interestSnapshot.forEach(doc => {
      console.log(`   Document ID: ${doc.id}`);
      console.log(`   Data: ${JSON.stringify(doc.data(), null, 2)}`);
    });
    
    // Check institutions collection
    console.log('\n2. institutions collection:');
    const institutionSnapshot = await db.collection('institutions').limit(5).get();
    console.log(`   Document count: ${institutionSnapshot.size}`);
    institutionSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   Document ID: ${doc.id}`);
      console.log(`   Name: ${data.name}`);
      console.log(`   Admin ID: ${data.adminId || 'NOT SET'}`);
      console.log(`   Created At: ${data.createdAt ? new Date(data.createdAt._seconds * 1000) : 'N/A'}`);
    });
    
    // Check platformAdmins collection
    console.log('\n3. platformAdmins collection:');
    const adminSnapshot = await db.collection('platformAdmins').limit(5).get();
    console.log(`   Document count: ${adminSnapshot.size}`);
    adminSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   Document ID: ${doc.id}`);
      console.log(`   Name: ${data.name}`);
      console.log(`   Email: ${data.email}`);
    });
    
    // Check messages collection
    console.log('\n4. messages collection:');
    const messageSnapshot = await db.collection('messages').limit(5).get();
    console.log(`   Document count: ${messageSnapshot.size}`);
    messageSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   Document ID: ${doc.id}`);
      console.log(`   Title: ${data.title}`);
      console.log(`   Type: ${data.type}`);
    });
    
    // Check broadcast_history collection
    console.log('\n5. broadcast_history collection:');
    const broadcastSnapshot = await db.collection('broadcast_history').limit(5).get();
    console.log(`   Document count: ${broadcastSnapshot.size}`);
    broadcastSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   Document ID: ${doc.id}`);
      console.log(`   Message ID: ${data.messageId}`);
      console.log(`   Title: ${data.title}`);
    });
    
    // Check end-of-call-analysis collection
    console.log('\n6. end-of-call-analysis collection:');
    const analysisSnapshot = await db.collection('end-of-call-analysis').limit(5).get();
    console.log(`   Document count: ${analysisSnapshot.size}`);
    analysisSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   Document ID: ${doc.id}`);
      console.log(`   Session ID: ${data.sessionId}`);
      console.log(`   Student ID: ${data.studentId}`);
    });
    
    // Check system_config collection
    console.log('\n7. system_config collection:');
    const configSnapshot = await db.collection('system_config').limit(5).get();
    console.log(`   Document count: ${configSnapshot.size}`);
    configSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`   Document ID: ${doc.id}`);
      console.log(`   Config Data: ${JSON.stringify(data, null, 2)}`);
    });
    
    console.log('\n--- Verification Complete ---');
    
  } catch (error) {
    console.error('Error verifying collections:', error);
  } finally {
    // Clean up the app
    if (admin.apps.length > 0) {
      admin.app().delete();
    }
  }
}

// Run the verification
verifyCollections().catch(console.error);