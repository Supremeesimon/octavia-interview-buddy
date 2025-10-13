const admin = require('firebase-admin');
const serviceAccount = require('./functions/service-account-key.json');

// Initialize Firebase Admin SDK with service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function testRoleAssignments() {
  try {
    console.log('🔍 Testing role assignments and access control...');
    
    // Test 1: Check platform admins
    console.log('\n=== Testing Platform Admins ===');
    const platformAdminsRef = db.collection('platformAdmins');
    const platformAdminsSnapshot = await platformAdminsRef.get();
    console.log(`Found ${platformAdminsSnapshot.size} platform admins`);
    
    for (const adminDoc of platformAdminsSnapshot.docs) {
      const adminData = adminDoc.data();
      console.log(`\nPlatform Admin: ${adminData.name} (${adminDoc.id})`);
      console.log(`  Email: ${adminData.email}`);
      console.log(`  Role: ${adminData.role}`);
      
      if (adminData.role === 'platform_admin') {
        console.log(`  ✅ Correct role assignment`);
      } else {
        console.log(`  ❌ Incorrect role assignment: expected 'platform_admin', got '${adminData.role}'`);
      }
    }
    
    // Test 2: Check external users
    console.log('\n=== Testing External Users ===');
    const externalUsersRef = db.collection('externalUsers');
    const externalUsersSnapshot = await externalUsersRef.get();
    console.log(`Found ${externalUsersSnapshot.size} external users`);
    
    for (const userDoc of externalUsersSnapshot.docs) {
      const userData = userDoc.data();
      console.log(`\nExternal User: ${userData.name} (${userDoc.id})`);
      console.log(`  Email: ${userData.email}`);
      console.log(`  Role: ${userData.role}`);
      
      // External users should be students
      if (userData.role === 'student') {
        console.log(`  ✅ Correct role assignment`);
      } else {
        console.log(`  ❌ Incorrect role assignment: expected 'student', got '${userData.role}'`);
      }
    }
    
    // Test 3: Check institutional users
    console.log('\n=== Testing Institutional Users ===');
    const institutionsRef = db.collection('institutions');
    const institutionsSnapshot = await institutionsRef.get();
    console.log(`Found ${institutionsSnapshot.size} institutions`);
    
    for (const institutionDoc of institutionsSnapshot.docs) {
      const institutionData = institutionDoc.data();
      console.log(`\nInstitution: ${institutionData.name} (${institutionDoc.id})`);
      
      // Check admins
      console.log(`\n  --- Testing Admins ---`);
      const adminsRef = db.collection('institutions').doc(institutionDoc.id).collection('admins');
      const adminsSnapshot = await adminsRef.get();
      console.log(`  Found ${adminsSnapshot.size} admins`);
      
      for (const adminDoc of adminsSnapshot.docs) {
        const adminData = adminDoc.data();
        console.log(`\n    Admin: ${adminData.name} (${adminDoc.id})`);
        console.log(`      Email: ${adminData.email}`);
        console.log(`      Role: ${adminData.role}`);
        
        if (adminData.role === 'institution_admin') {
          console.log(`      ✅ Correct role assignment`);
        } else {
          console.log(`      ❌ Incorrect role assignment: expected 'institution_admin', got '${adminData.role}'`);
        }
      }
      
      // Check departments
      const departmentsRef = db.collection('institutions').doc(institutionDoc.id).collection('departments');
      const departmentsSnapshot = await departmentsRef.get();
      console.log(`\n  --- Testing Departments (${departmentsSnapshot.size} found) ---`);
      
      for (const departmentDoc of departmentsSnapshot.docs) {
        const departmentData = departmentDoc.data();
        console.log(`\n    Department: ${departmentData.departmentName} (${departmentDoc.id})`);
        
        // Check teachers
        console.log(`\n    ----- Testing Teachers -----`);
        const teachersRef = db.collection('institutions').doc(institutionDoc.id).collection('departments').doc(departmentDoc.id).collection('teachers');
        const teachersSnapshot = await teachersRef.get();
        console.log(`    Found ${teachersSnapshot.size} teachers`);
        
        for (const teacherDoc of teachersSnapshot.docs) {
          const teacherData = teacherDoc.data();
          console.log(`\n      Teacher: ${teacherData.name} (${teacherDoc.id})`);
          console.log(`        Email: ${teacherData.email}`);
          console.log(`        Role: ${teacherData.role}`);
          
          if (teacherData.role === 'teacher' || teacherData.role === 'institution_admin') {
            console.log(`        ✅ Correct role assignment`);
          } else {
            console.log(`        ❌ Incorrect role assignment: expected 'teacher' or 'institution_admin', got '${teacherData.role}'`);
          }
        }
        
        // Check students
        console.log(`\n    ----- Testing Students -----`);
        const studentsRef = db.collection('institutions').doc(institutionDoc.id).collection('departments').doc(departmentDoc.id).collection('students');
        const studentsSnapshot = await studentsRef.get();
        console.log(`    Found ${studentsSnapshot.size} students`);
        
        for (const studentDoc of studentsSnapshot.docs) {
          const studentData = studentDoc.data();
          console.log(`\n      Student: ${studentData.name} (${studentDoc.id})`);
          console.log(`        Email: ${studentData.email}`);
          console.log(`        Role: ${studentData.role}`);
          
          if (studentData.role === 'student') {
            console.log(`        ✅ Correct role assignment`);
          } else {
            console.log(`        ❌ Incorrect role assignment: expected 'student', got '${studentData.role}'`);
          }
        }
      }
    }
    
    console.log('\n✅ Role assignment test completed!');
    
  } catch (error) {
    console.error('❌ Error during role assignment test:', error);
  } finally {
    // Clean up
    await admin.app().delete();
  }
}

testRoleAssignments();