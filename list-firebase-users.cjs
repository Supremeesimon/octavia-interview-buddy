const admin = require('firebase-admin');
const serviceAccount = require('./functions/service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://octavia-practice-interviewer.firebaseio.com'
});

const auth = admin.auth();

async function listUsers() {
  try {
    const result = await auth.listUsers();
    console.log('Firebase Auth Users:');
    if (result.users.length === 0) {
      console.log('No users found in Firebase Authentication');
      return;
    }
    
    result.users.forEach((user, index) => {
      console.log(`\n--- User ${index + 1} ---`);
      console.log('UID:', user.uid);
      console.log('Email:', user.email || 'No email');
      console.log('Display Name:', user.displayName || 'No name');
      console.log('Phone Number:', user.phoneNumber || 'No phone');
      console.log('Disabled:', user.disabled ? 'Yes' : 'No');
      console.log('Email Verified:', user.emailVerified ? 'Yes' : 'No');
      console.log('Creation Time:', user.metadata.creationTime);
      console.log('Last Sign In:', user.metadata.lastSignInTime || 'Never');
      
      // Custom claims
      if (user.customClaims) {
        console.log('Custom Claims:', JSON.stringify(user.customClaims, null, 2));
      }
    });
    
    console.log(`\nTotal users: ${result.users.length}`);
  } catch (error) {
    console.error('Error listing users:', error);
  } finally {
    await admin.app().delete();
  }
}

listUsers();