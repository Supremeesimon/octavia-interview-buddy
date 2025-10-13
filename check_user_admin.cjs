const admin = require('firebase-admin');
const serviceAccount = require('./functions/service-account-key.json');

// Initialize Firebase Admin SDK with service account credentials
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'octavia-practice-interviewer'
  });
  console.log('Firebase Admin SDK initialized with service account credentials');
}

const db = admin.firestore();

async function checkUser() {
  try {
    console.log('Checking for institutions...');
    
    // Check institutions
    const institutionsRef = db.collection('institutions');
    const institutionsSnapshot = await institutionsRef.get();
    
    console.log(`Found ${institutionsSnapshot.size} institutions:`);
    
    for (const institutionDoc of institutionsSnapshot.docs) {
      const institutionData = institutionDoc.data();
      console.log(`- Institution: ${institutionData.name} (ID: ${institutionDoc.id})`);
      
      // Check admins
      const adminsRef = db.collection('institutions').doc(institutionDoc.id).collection('admins');
      const adminsSnapshot = await adminsRef.get();
      
      console.log(`  Admins (${adminsSnapshot.size}):`);
      for (const adminDoc of adminsSnapshot.docs) {
        const adminData = adminDoc.data();
        console.log(`    - ${adminData.name} (${adminData.email}) - ID: ${adminDoc.id}`);
      }
      
      // Check departments
      const departmentsRef = db.collection('institutions').doc(institutionDoc.id).collection('departments');
      const departmentsSnapshot = await departmentsRef.get();
      
      console.log(`  Departments (${departmentsSnapshot.size}):`);
      for (const departmentDoc of departmentsSnapshot.docs) {
        const departmentData = departmentDoc.data();
        console.log(`    - ${departmentData.departmentName} (ID: ${departmentDoc.id})`);
        
        // Check teachers
        const teachersRef = db.collection('institutions').doc(institutionDoc.id).collection('departments').doc(departmentDoc.id).collection('teachers');
        const teachersSnapshot = await teachersRef.get();
        
        console.log(`    Teachers (${teachersSnapshot.size}):`);
        for (const teacherDoc of teachersSnapshot.docs) {
          const teacherData = teacherDoc.data();
          console.log(`      - ${teacherData.name} (${teacherData.email}) - ID: ${teacherDoc.id}`);
        }
        
        // Check students
        const studentsRef = db.collection('institutions').doc(institutionDoc.id).collection('departments').doc(departmentDoc.id).collection('students');
        const studentsSnapshot = await studentsRef.get();
        
        console.log(`    Students (${studentsSnapshot.size}):`);
        for (const studentDoc of studentsSnapshot.docs) {
          const studentData = studentDoc.data();
          console.log(`      - ${studentData.name} (${studentData.email}) - ID: ${studentDoc.id}`);
        }
      }
    }
    
    // Check external users
    console.log('\nChecking external users...');
    const externalUsersRef = db.collection('externalUsers');
    const externalUsersSnapshot = await externalUsersRef.get();
    
    console.log(`Found ${externalUsersSnapshot.size} external users:`);
    for (const userDoc of externalUsersSnapshot.docs) {
      const userData = userDoc.data();
      console.log(`- ${userData.name} (${userData.email}) - ID: ${userDoc.id}`);
    }
    
    // Check platform admins
    console.log('\nChecking platform admins...');
    const platformAdminsRef = db.collection('platformAdmins');
    const platformAdminsSnapshot = await platformAdminsRef.get();
    
    console.log(`Found ${platformAdminsSnapshot.size} platform admins:`);
    for (const adminDoc of platformAdminsSnapshot.docs) {
      const adminData = adminDoc.data();
      console.log(`- ${adminData.name} (${adminData.email}) - ID: ${adminDoc.id}`);
    }
    
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    // Clean up
    await admin.app().delete();
  }
}

checkUser();