// Script to delete specific users from Firestore
import admin from 'firebase-admin';
import serviceAccount from './service-account-key.json' assert { type: 'json' };

// Initialize Firebase Admin
function initializeFirebase() {
  if (!admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'octavia-practice-interviewer.appspot.com',
      });
      console.log('Initialized Firebase Admin with service account key');
    } catch (error) {
      console.error('Failed to initialize Firebase Admin with service account:', error);
      process.exit(1);
    }
  }
}

async function deleteUsers() {
  try {
    initializeFirebase();
    
    // Get Firestore instance
    const adminDb = admin.firestore();
    
    console.log('=== Deleting Specific Users from Firestore ===\n');
    
    // Users to delete
    const usersToDelete = [
      {
        email: 'oluwaferanmionabanjo@gmail.com',
        collection: 'institutions/WxD3cWTybNsqkpj7OwW4/departments/Kw4HZprd3C8NiAU0bnQ9/students',
        id: 'xVoQq94Gk3YoBKnnt5TzDrlPtZ72'
      },
      {
        email: 'outreach@autolawn.cloud',
        collection: 'institutions/WxD3cWTybNsqkpj7OwW4/departments/Kw4HZprd3C8NiAU0bnQ9/teachers',
        id: 'De55g0qMSRaF0qU1McqWLIq4vX23'
      }
    ];
    
    // Delete each user
    for (const user of usersToDelete) {
      try {
        await adminDb.doc(`${user.collection}/${user.id}`).delete();
        console.log(`Successfully deleted user with email: ${user.email}`);
        console.log(`  Collection: ${user.collection}`);
        console.log(`  ID: ${user.id}\n`);
      } catch (error) {
        console.error(`Error deleting user with email ${user.email}:`, error);
      }
    }
    
    console.log('User deletion process completed');
    
  } catch (error) {
    console.error('Error in delete users script:', error);
    process.exit(1);
  }
}

deleteUsers().then(() => {
  console.log('User deletion script completed successfully');
  
  // Clean up the copied service account key file
  import('fs').then(fs => {
    fs.unlinkSync('./service-account-key.json');
  }).catch(err => {
    console.error('Failed to remove service account key file:', err);
  });
  
  process.exit(0);
}).catch((error) => {
  console.error('Error in user deletion script:', error);
  
  // Clean up the copied service account key file
  import('fs').then(fs => {
    fs.unlinkSync('./service-account-key.json');
  }).catch(err => {
    console.error('Failed to remove service account key file:', err);
  });
  
  process.exit(1);
});