const admin = require('firebase-admin');
const serviceAccount = require('./src/service-account-key.json');

// Initialize Firebase Admin with service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'octavia-practice-interviewer',
  storageBucket: 'octavia-practice-interviewer.appspot.com'
});

const db = admin.firestore();

async function checkRealDepartments() {
  try {
    console.log('=== Checking Real Departments Used by Students/Teachers ===\n');
    
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
    
    // Keep track of departments that have students or teachers
    const departmentsWithUsers = new Set();
    
    for (const departmentDoc of departmentsSnapshot.docs) {
      const departmentData = departmentDoc.data();
      const departmentId = departmentDoc.id;
      
      console.log(`\nDepartment: ${departmentData.departmentName || 'Unnamed Department'} (ID: ${departmentId})`);
      
      // Check for teachers in this department
      const teachersSnapshot = await db.collection('institutions').doc(institutionId).collection('departments').doc(departmentId).collection('teachers').get();
      console.log(`  Teachers: ${teachersSnapshot.size}`);
      
      if (teachersSnapshot.size > 0) {
        departmentsWithUsers.add(departmentId);
        for (const teacherDoc of teachersSnapshot.docs) {
          const teacherData = teacherDoc.data();
          console.log(`    - ${teacherData.name} (${teacherData.email})`);
        }
      }
      
      // Check for students in this department
      const studentsSnapshot = await db.collection('institutions').doc(institutionId).collection('departments').doc(departmentId).collection('students').get();
      console.log(`  Students: ${studentsSnapshot.size}`);
      
      if (studentsSnapshot.size > 0) {
        departmentsWithUsers.add(departmentId);
        for (const studentDoc of studentsSnapshot.docs) {
          const studentData = studentDoc.data();
          console.log(`    - ${studentData.name} (${studentData.email})`);
        }
      }
    }
    
    console.log('\n=== Departments with Active Users ===');
    for (const departmentDoc of departmentsSnapshot.docs) {
      if (departmentsWithUsers.has(departmentDoc.id)) {
        const departmentData = departmentDoc.data();
        console.log(`- ${departmentData.departmentName || 'Unnamed Department'} (ID: ${departmentDoc.id})`);
      }
    }
    
    console.log('\n=== Departments without Users (can be removed) ===');
    for (const departmentDoc of departmentsSnapshot.docs) {
      if (!departmentsWithUsers.has(departmentDoc.id)) {
        const departmentData = departmentDoc.data();
        console.log(`- ${departmentData.departmentName || 'Unnamed Department'} (ID: ${departmentDoc.id})`);
      }
    }
    
  } catch (error) {
    console.error('Error checking real departments:', error);
  } finally {
    await admin.app().delete();
  }
}

checkRealDepartments();