const admin = require('firebase-admin');
const serviceAccount = require('./src/service-account-key.json');

// Initialize Firebase Admin with service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'octavia-practice-interviewer',
  storageBucket: 'octavia-practice-interviewer.appspot.com'
});

const db = admin.firestore();

async function testDepartmentFetch() {
  try {
    console.log('=== Testing Department Fetch Logic ===\n');
    
    const institutionName = 'Lethbridge Polytechnic';
    console.log('Fetching departments for institution:', institutionName);
    
    // First, find the institution by name
    const institutionsRef = db.collection('institutions');
    const querySnapshot = await institutionsRef.where('name', '==', institutionName).get();
    
    if (querySnapshot.empty) {
      console.log('No institution found with name:', institutionName);
      return;
    }
    
    const institutionDoc = querySnapshot.docs[0];
    const institutionId = institutionDoc.id;
    console.log('Found institution:', institutionDoc.data().name, 'ID:', institutionId);
    
    // Get all departments for this institution
    const departmentsRef = db.collection('institutions').doc(institutionId).collection('departments');
    const departmentsSnapshot = await departmentsRef.get();
    console.log('Found', departmentsSnapshot.size, 'departments');
    
    const departments = [];
    departmentsSnapshot.forEach(doc => {
      const data = doc.data();
      departments.push({
        id: doc.id,
        name: data.departmentName || 'Unnamed Department'
      });
    });
    
    console.log('Departments list:', departments);
    
  } catch (error) {
    console.error('Error testing department fetch:', error);
  } finally {
    await admin.app().delete();
  }
}

testDepartmentFetch();