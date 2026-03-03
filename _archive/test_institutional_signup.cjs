const admin = require('firebase-admin');
const serviceAccount = require('./src/service-account-key.json');

// Initialize Firebase Admin with service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'octavia-practice-interviewer',
  storageBucket: 'octavia-practice-interviewer.appspot.com'
});

const db = admin.firestore();

async function testInstitutionalSignup() {
  try {
    console.log('=== Testing Institutional Signup Flow ===\n');
    
    // First, let's check if the institution exists
    const institutionsSnapshot = await db.collection('institutions').where('name', '==', 'Lethbridge Polytechnic').get();
    
    if (institutionsSnapshot.empty) {
      console.log('Institution "Lethbridge Polytechnic" not found. Creating it...');
      
      // Create the institution
      const institutionData = {
        name: 'Lethbridge Polytechnic',
        domain: 'lethbridgepolytechnic.ca',
        customSignupLink: 'http://localhost:8080/signup-institution/Lethbridge%20Polytechnic',
        customSignupToken: 'test-token-123',
        partnershipRequestDate: new Date(),
        approvalStatus: 'approved',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const institutionRef = await db.collection('institutions').add(institutionData);
      console.log(`Created institution with ID: ${institutionRef.id}`);
    } else {
      const institutionDoc = institutionsSnapshot.docs[0];
      console.log(`Found institution: ${institutionDoc.data().name} (ID: ${institutionDoc.id})`);
    }
    
    // Now let's check if there's a department
    const institutionSnapshot = await db.collection('institutions').where('name', '==', 'Lethbridge Polytechnic').get();
    const institutionId = institutionSnapshot.docs[0].id;
    
    const departmentsSnapshot = await db.collection('institutions').doc(institutionId).collection('departments').get();
    
    if (departmentsSnapshot.empty) {
      console.log('No departments found. Creating a default department...');
      
      // Create a default department
      const departmentData = {
        departmentName: 'Computer Science',
        departmentSignupToken: 'dept-token-456',
        departmentSignupLink: `http://localhost:8080/signup-institution/${institutionId}?department=Computer%20Science`,
        createdAt: new Date(),
        createdBy: 'system'
      };
      
      const departmentRef = await db.collection('institutions').doc(institutionId).collection('departments').add(departmentData);
      console.log(`Created department with ID: ${departmentRef.id}`);
    } else {
      const departmentDoc = departmentsSnapshot.docs[0];
      console.log(`Found department: ${departmentDoc.data().departmentName} (ID: ${departmentDoc.id})`);
    }
    
    console.log('\n=== Test completed successfully ===');
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await admin.app().delete();
  }
}

testInstitutionalSignup();