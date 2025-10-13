import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// Load environment variables
dotenv.config();

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin SDK
function initializeFirebase() {
  try {
    const serviceAccountPath = join(__dirname, '..', '..', 'functions', 'service-account-key.json');
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
    
    // Check if Firebase is already initialized
    try {
      if (admin.apps && admin.apps.length === 0) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          databaseURL: process.env.VITE_FIREBASE_DATABASE_URL
        });
      }
    } catch (appsError) {
      // If there's an issue checking apps, try to initialize anyway
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.VITE_FIREBASE_DATABASE_URL
      });
    }
    
    return admin.firestore();
  } catch (initError) {
    console.error('Firebase Admin SDK initialization failed:', initError);
    process.exit(1);
  }
}

async function listAllInstitutions() {
  try {
    const db = initializeFirebase();
    console.log('Listing all institutions in database...\n');
    
    // Get all institutions
    const institutionsRef = db.collection('institutions');
    const snapshot = await institutionsRef.get();
    
    if (snapshot.empty) {
      console.log('No institutions found in database.');
      return;
    }
    
    console.log(`Found ${snapshot.size} institution(s):\n`);
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      console.log(`=== Institution: ${data.name} ===`);
      console.log(`ID: ${doc.id}`);
      console.log(`Name: ${data.name}`);
      console.log(`Domain: ${data.domain || 'Not set'}`);
      console.log(`Active: ${data.isActive ? 'Yes' : 'No'}`);
      if (data.createdAt) {
        console.log(`Created: ${new Date(data.createdAt._seconds * 1000).toISOString()}`);
      }
      
      // Check if there's a custom signup link
      if (data.customSignupLink) {
        console.log(`Signup Link: ${data.customSignupLink}`);
      }
      
      // Check admins
      try {
        const adminsSnapshot = await doc.ref.collection('admins').get();
        if (!adminsSnapshot.empty) {
          console.log(`Admins (${adminsSnapshot.size}):`);
          for (const adminDoc of adminsSnapshot.docs) {
            const adminData = adminDoc.data();
            console.log(`  - ${adminData.name || adminData.email} (${adminDoc.id})`);
          }
        } else {
          console.log('Admins: None');
        }
      } catch (adminError) {
        console.log('Admins: Error fetching (likely permissions)');
      }
      
      // Check departments
      try {
        const departmentsSnapshot = await doc.ref.collection('departments').get();
        if (!departmentsSnapshot.empty) {
          console.log(`Departments (${departmentsSnapshot.size}):`);
          for (const deptDoc of departmentsSnapshot.docs) {
            const deptData = deptDoc.data();
            console.log(`  - ${deptData.departmentName || 'Unnamed Department'} (${deptDoc.id})`);
          }
        } else {
          console.log('Departments: None');
        }
      } catch (deptError) {
        console.log('Departments: Error fetching (likely permissions)');
      }
      
      console.log(''); // Empty line for readability
    }
  } catch (error) {
    console.error('Error listing institutions:', error);
  }
}

listAllInstitutions();