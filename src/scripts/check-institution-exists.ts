import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: process.env.VITE_FIREBASE_DATABASE_URL
  });
}

const db = admin.firestore();

async function checkInstitution(institutionName: string) {
  try {
    console.log(`Checking if institution "${institutionName}" exists...`);
    
    // Query institutions by name
    const institutionsRef = db.collection('institutions');
    const snapshot = await institutionsRef.where('name', '==', institutionName).get();
    
    if (snapshot.empty) {
      console.log('No institution found with that name.');
      
      // List all institutions to see what exists
      console.log('\nAll institutions in database:');
      const allInstitutions = await institutionsRef.get();
      allInstitutions.forEach(doc => {
        const data = doc.data();
        console.log(`- ID: ${doc.id}, Name: "${data.name}"`);
      });
    } else {
      console.log(`Found ${snapshot.size} institution(s) with that name:`);
      snapshot.forEach(doc => {
        const data = doc.data();
        console.log(`- ID: ${doc.id}, Name: "${data.name}", Data:`, JSON.stringify(data, null, 2));
      });
    }
  } catch (error) {
    console.error('Error checking institution:', error);
  }
}

// Get institution name from command line arguments
const institutionName = process.argv[2];
if (!institutionName) {
  console.log('Usage: npm run check-institution "Institution Name"');
  console.log('Please provide an institution name to check.');
  process.exit(1);
}

checkInstitution(institutionName);