const admin = require('firebase-admin');
const serviceAccount = require('./src/service-account-key.json');

// Initialize Firebase Admin with service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'octavia-practice-interviewer',
  storageBucket: 'octavia-practice-interviewer.appspot.com'
});

const db = admin.firestore();

async function verifyDepartmentStructure() {
  try {
    console.log('=== Verifying Department Structure ===\n');
    
    // Get all institutions
    const institutionsSnapshot = await db.collection('institutions').get();
    
    for (const institutionDoc of institutionsSnapshot.docs) {
      const institutionData = institutionDoc.data();
      console.log(`Institution: ${institutionData.name || 'Unnamed'} (ID: ${institutionDoc.id})`);
      
      // Get all departments in this institution
      const departmentsSnapshot = await db.collection('institutions').doc(institutionDoc.id).collection('departments').get();
      
      console.log(`  Total Departments: ${departmentsSnapshot.size}`);
      
      for (const departmentDoc of departmentsSnapshot.docs) {
        const departmentData = departmentDoc.data();
        console.log(`\n  Department: ${departmentData.departmentName || 'Unnamed'} (ID: ${departmentDoc.id})`);
        
        // Get teachers in this department
        const teachersSnapshot = await db.collection('institutions').doc(institutionDoc.id).collection('departments').doc(departmentDoc.id).collection('teachers').get();
        console.log(`    Teachers: ${teachersSnapshot.size}`);
        
        for (const teacherDoc of teachersSnapshot.docs) {
          const teacherData = teacherDoc.data();
          console.log(`      - ${teacherData.name} (${teacherData.email})`);
        }
        
        // Get students in this department
        const studentsSnapshot = await db.collection('institutions').doc(institutionDoc.id).collection('departments').doc(departmentDoc.id).collection('students').get();
        console.log(`    Students: ${studentsSnapshot.size}`);
        
        for (const studentDoc of studentsSnapshot.docs) {
          const studentData = studentDoc.data();
          console.log(`      - ${studentData.name} (${studentData.email})`);
        }
      }
      
      console.log('\n' + '='.repeat(50));
    }
    
  } catch (error) {
    console.error('Error verifying department structure:', error);
  } finally {
    await admin.app().delete();
  }
}

verifyDepartmentStructure();