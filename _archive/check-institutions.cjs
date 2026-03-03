const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Load service account key
const serviceAccountPath = path.join(__dirname, 'functions', 'service-account-key.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function listInstitutions() {
  try {
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
      
      console.log(''); // Empty line for readability
    }
  } catch (error) {
    console.error('Error listing institutions:', error);
  } finally {
    // Exit the process
    process.exit(0);
  }
}

listInstitutions();