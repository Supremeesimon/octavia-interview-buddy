const admin = require('firebase-admin');
const serviceAccount = require('./src/service-account-key.json');

// Initialize Firebase Admin with service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'octavia-practice-interviewer',
  storageBucket: 'octavia-practice-interviewer.appspot.com'
});

const db = admin.firestore();

async function checkStudentStructure() {
  try {
    console.log('=== Checking Student Document Structure ===\n');
    
    // Get institutions
    const institutionsSnapshot = await db.collection('institutions').get();
    
    for (const institutionDoc of institutionsSnapshot.docs) {
      const institutionData = institutionDoc.data();
      console.log(`Institution: ${institutionData.name || 'Unnamed'} (ID: ${institutionDoc.id})`);
      
      // Get departments
      const departmentsSnapshot = await db.collection('institutions').doc(institutionDoc.id).collection('departments').get();
      
      for (const departmentDoc of departmentsSnapshot.docs) {
        const departmentData = departmentDoc.data();
        console.log(`  Department: ${departmentData.departmentName || 'Unnamed'} (ID: ${departmentDoc.id})`);
        
        // Get students
        const studentsSnapshot = await db.collection('institutions').doc(institutionDoc.id).collection('departments').doc(departmentDoc.id).collection('students').get();
        
        for (const studentDoc of studentsSnapshot.docs) {
          const studentData = studentDoc.data();
          console.log(`    Student ID: ${studentDoc.id}`);
          console.log(`    Student Data:`);
          console.log(JSON.stringify(studentData, null, 2));
          console.log('---');
        }
      }
    }
    
  } catch (error) {
    console.error('Error checking student structure:', error);
  } finally {
    // Clean up
    await admin.app().delete();
  }
}

checkStudentStructure();