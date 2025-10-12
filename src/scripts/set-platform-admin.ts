import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Try to use service account file from functions directory
    const serviceAccountPath = join(__dirname, '../../functions/service-account-key.json');
    const serviceAccountBuffer = readFileSync(serviceAccountPath);
    const serviceAccount = JSON.parse(serviceAccountBuffer.toString());
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: 'octavia-practice-interviewer.appspot.com',
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    console.log('Please ensure you have the service-account-key.json file in the functions directory');
    process.exit(1);
  }
}

const db = getFirestore();

async function setPlatformAdmin(email: string) {
  try {
    console.log(`Setting user with email ${email} as platform admin...`);
    
    // Query for the user document
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).limit(1).get();
    
    if (snapshot.empty) {
      console.log(`No user found with email ${email}`);
      return;
    }
    
    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();
    
    console.log('Found user:', {
      id: userDoc.id,
      name: userData.name,
      email: userData.email,
      currentRole: userData.role
    });
    
    // Update the user's role to platform_admin
    await userDoc.ref.update({
      role: 'platform_admin',
      updatedAt: new Date()
    });
    
    console.log('Successfully updated user role to platform_admin');
  } catch (error) {
    console.error('Error setting platform admin:', error);
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.log('Usage: npm run set-platform-admin <email>');
  console.log('Example: npm run set-platform-admin supremeesimon@gmail.com');
  process.exit(1);
}

setPlatformAdmin(email);