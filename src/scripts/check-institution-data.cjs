const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Load service account key
const serviceAccountPath = path.join(__dirname, '..', '..', 'functions', 'service-account-key.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkInstitutionData(institutionId) {
  try {
    console.log('Checking institution data for ID:', institutionId);
    
    // Fetch the institution document
    const institutionRef = db.collection('institutions').doc(institutionId);
    const institutionSnap = await institutionRef.get();
    
    if (institutionSnap.exists) {
      const data = institutionSnap.data();
      console.log('Institution name:', data.name);
      
      // Check specifically for sessionPool data
      if (data.sessionPool) {
        console.log('Session Pool data:', JSON.stringify(data.sessionPool, null, 2));
      } else {
        console.log('No sessionPool data found in institution document');
      }
    } else {
      console.log('No institution found with ID:', institutionId);
    }
  } catch (error) {
    console.error('Error checking institution data:', error);
  }
}

// Check one institution with sessionPool data
checkInstitutionData('WxD3cWTybNsqkpj7OwW4');