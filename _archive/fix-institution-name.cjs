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

async function fixInstitutionName() {
  try {
    console.log('Checking institutions for trailing spaces...\n');
    
    // Get all institutions
    const institutionsRef = db.collection('institutions');
    const snapshot = await institutionsRef.get();
    
    if (snapshot.empty) {
      console.log('No institutions found in database.');
      return;
    }
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const originalName = data.name;
      const trimmedName = originalName.trim();
      
      // Check if there are leading or trailing spaces
      if (originalName !== trimmedName) {
        console.log(`Found institution with trailing/leading spaces:`);
        console.log(`  Original: "${originalName}"`);
        console.log(`  Trimmed:  "${trimmedName}"`);
        
        // Update the institution name
        await doc.ref.update({
          name: trimmedName
        });
        
        console.log(`  Updated institution ID ${doc.id} name to: "${trimmedName}"\n`);
      } else {
        console.log(`Institution "${originalName}" name is already clean.`);
      }
    }
    
    console.log('Finished checking and fixing institution names.');
  } catch (error) {
    console.error('Error fixing institution names:', error);
  } finally {
    // Exit the process
    process.exit(0);
  }
}

fixInstitutionName();