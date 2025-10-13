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

async function checkAdminUser() {
  try {
    console.log('Checking for the specific admin user...');
    
    // The new user ID from the previous check
    const userId = 'js2DFyjZekPomgW3v6iUCNoMtwk1';
    
    // Check institutions
    const institutionsRef = db.collection('institutions');
    const institutionsSnapshot = await institutionsRef.get();
    
    console.log(`Found ${institutionsSnapshot.size} institutions:`);
    
    for (const institutionDoc of institutionsSnapshot.docs) {
      const institutionData = institutionDoc.data();
      console.log(`- Institution: ${institutionData.name} (ID: ${institutionDoc.id})`);
      
      // Check the specific admin user
      const adminDoc = await db.collection('institutions').doc(institutionDoc.id).collection('admins').doc(userId).get();
      
      if (adminDoc.exists) {
        const adminData = adminDoc.data();
        console.log(`  Admin user found:`);
        console.log(`    ID: ${adminDoc.id}`);
        console.log(`    Data:`, JSON.stringify(adminData, null, 2));
        return;
      } else {
        console.log(`  Admin user not found in this institution`);
      }
    }
    
    console.log('Admin user not found in any institution');
    
  } catch (error) {
    console.error('Error checking admin user:', error);
  } finally {
    // Clean up
    await admin.app().delete();
  }
}

checkAdminUser();