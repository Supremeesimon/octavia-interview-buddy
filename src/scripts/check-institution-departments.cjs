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

async function checkInstitutionDepartments(institutionId) {
  try {
    console.log('Checking departments for institution ID:', institutionId);
    
    // Fetch the institution document first to get the name
    const institutionRef = db.collection('institutions').doc(institutionId);
    const institutionSnap = await institutionRef.get();
    
    if (institutionSnap.exists) {
      const institutionData = institutionSnap.data();
      console.log('Institution name:', institutionData.name);
      
      // Fetch all departments for this institution
      const departmentsRef = db.collection('institutions').doc(institutionId).collection('departments');
      const departmentsSnapshot = await departmentsRef.get();
      
      if (departmentsSnapshot.empty) {
        console.log('No departments found for this institution');
        return;
      }
      
      console.log(`Found ${departmentsSnapshot.size} department(s):\n`);
      
      for (const doc of departmentsSnapshot.docs) {
        const data = doc.data();
        console.log(`Department: ${data.departmentName || data.name || 'Unnamed Department'}`);
        console.log(`  ID: ${doc.id}`);
        console.log(`  Students: ${data.studentCount || 0}`);
        console.log('');
      }
    } else {
      console.log('No institution found with ID:', institutionId);
    }
  } catch (error) {
    console.error('Error checking institution departments:', error);
  }
}

// Check all institutions to find one with departments
async function checkAllInstitutions() {
  const institutionIds = ['0mKFfYGDNigbyc8w6AS9', 'WxD3cWTybNsqkpj7OwW4', 'o27XAYG3ifHmWKM56aTV'];
  
  for (const id of institutionIds) {
    await checkInstitutionDepartments(id);
    console.log('\n' + '='.repeat(50) + '\n');
  }
}

checkAllInstitutions();