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

async function updateAdminUser() {
  try {
    console.log('Updating the admin user to include institutionId...');
    
    // The user ID from the previous check
    const userId = 'ySWE4DoE1AYeOFX9QTlUTojaxrU2';
    // The institution ID
    const institutionId = 'WxD3cWTybNsqkpj7OwW4';
    
    // Update the admin user document to include institutionId
    await db.collection('institutions').doc(institutionId).collection('admins').doc(userId).update({
      institutionId: institutionId
    });
    
    console.log(`Successfully updated admin user ${userId} with institutionId ${institutionId}`);
    
    // Verify the update
    const adminDoc = await db.collection('institutions').doc(institutionId).collection('admins').doc(userId).get();
    if (adminDoc.exists) {
      const adminData = adminDoc.data();
      console.log(`Updated admin user data:`, JSON.stringify(adminData, null, 2));
    }
    
  } catch (error) {
    console.error('Error updating admin user:', error);
  } finally {
    // Clean up
    await admin.app().delete();
  }
}

updateAdminUser();