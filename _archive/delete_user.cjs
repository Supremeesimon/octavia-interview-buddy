const admin = require('firebase-admin');
const serviceAccount = require('./functions/service-account-key.json');

// Initialize Firebase Admin SDK with service account credentials
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'octavia-practice-interviewer'
  });
  console.log('Firebase Admin SDK initialized with service account credentials');
}

const db = admin.firestore();

async function deleteUser() {
  try {
    console.log('Deleting the admin user...');
    
    // The user ID from the previous check
    const userId = 'js2DFyjZekPomgW3v6iUCNoMtwk1';
    // The institution ID
    const institutionId = 'WxD3cWTybNsqkpj7OwW4';
    
    // Delete the admin user document
    await db.collection('institutions').doc(institutionId).collection('admins').doc(userId).delete();
    
    console.log(`Successfully deleted admin user ${userId} from institution ${institutionId}`);
    
    // Also delete the Firebase Authentication user
    try {
      await admin.auth().deleteUser(userId);
      console.log(`Successfully deleted Firebase Auth user ${userId}`);
    } catch (authError) {
      console.log(`Firebase Auth user ${userId} not found or already deleted`);
    }
    
  } catch (error) {
    console.error('Error deleting user:', error);
  } finally {
    // Clean up
    await admin.app().delete();
  }
}

deleteUser();