const admin = require('firebase-admin');
const serviceAccount = require('./src/service-account-key.json');

// Initialize Firebase Admin with service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'octavia-practice-interviewer',
  storageBucket: 'octavia-practice-interviewer.appspot.com'
});

const db = admin.firestore();

async function checkDepartments() {
  try {
    console.log('=== Checking Departments ===\n');
    
    // Get the institution
    const institutionsSnapshot = await db.collection('institutions').where('name', '==', 'Lethbridge Polytechnic').get();
    
    if (institutionsSnapshot.empty) {
      console.log('ERROR: Institution "Lethbridge Polytechnic" not found.');
      return;
    }
    
    const institutionDoc = institutionsSnapshot.docs[0];
    const institutionId = institutionDoc.id;
    console.log(`Found institution: ${institutionDoc.data().name} (ID: ${institutionId})`);
    
    // Get all departments for this institution
    const departmentsSnapshot = await db.collection('institutions').doc(institutionId).collection('departments').get();
    
    console.log(`\nFound ${departmentsSnapshot.size} departments:`);
    
    for (const departmentDoc of departmentsSnapshot.docs) {
      const departmentData = departmentDoc.data();
      console.log(`- ${departmentData.departmentName || 'Unnamed Department'} (ID: ${departmentDoc.id})`);
    }
    
  } catch (error) {
    console.error('Error checking departments:', error);
  } finally {
    await admin.app().delete();
  }
}

checkDepartments();