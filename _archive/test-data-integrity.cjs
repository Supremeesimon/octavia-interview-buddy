const admin = require('firebase-admin');
const serviceAccount = require('./functions/service-account-key.json');

// Initialize Firebase Admin SDK with service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function testDataIntegrity() {
  try {
    console.log('🔍 Testing data integrity and relationships...');
    
    // Test 1: Check institutions collection
    console.log('\n=== Testing Institutions Collection ===');
    const institutionsRef = db.collection('institutions');
    const institutionsSnapshot = await institutionsRef.get();
    console.log(`Found ${institutionsSnapshot.size} institutions`);
    
    for (const institutionDoc of institutionsSnapshot.docs) {
      const institutionData = institutionDoc.data();
      console.log(`\nInstitution: ${institutionData.name} (${institutionDoc.id})`);
      console.log(`  Domain: ${institutionData.domain}`);
      console.log(`  Signup Token: ${institutionData.customSignupToken}`);
      console.log(`  Signup Link: ${institutionData.customSignupLink}`);
      
      // Test 2: Check admins subcollection
      console.log('\n  --- Testing Admins Subcollection ---');
      const adminsRef = db.collection('institutions').doc(institutionDoc.id).collection('admins');
      const adminsSnapshot = await adminsRef.get();
      console.log(`  Found ${adminsSnapshot.size} admins`);
      
      for (const adminDoc of adminsSnapshot.docs) {
        const adminData = adminDoc.data();
        console.log(`    Admin: ${adminData.name} (${adminDoc.id})`);
        console.log(`      Email: ${adminData.email}`);
      }
      
      // Test 3: Check departments subcollection
      console.log('\n  --- Testing Departments Subcollection ---');
      const departmentsRef = db.collection('institutions').doc(institutionDoc.id).collection('departments');
      const departmentsSnapshot = await departmentsRef.get();
      console.log(`  Found ${departmentsSnapshot.size} departments`);
      
      for (const departmentDoc of departmentsSnapshot.docs) {
        const departmentData = departmentDoc.data();
        console.log(`    Department: ${departmentData.departmentName} (${departmentDoc.id})`);
        console.log(`      Signup Token: ${departmentData.departmentSignupToken}`);
        console.log(`      Signup Link: ${departmentData.departmentSignupLink}`);
        
        // Test 4: Check teachers subcollection
        console.log('\n      ----- Testing Teachers Subcollection -----');
        const teachersRef = db.collection('institutions').doc(institutionDoc.id).collection('departments').doc(departmentDoc.id).collection('teachers');
        const teachersSnapshot = await teachersRef.get();
        console.log(`      Found ${teachersSnapshot.size} teachers`);
        
        for (const teacherDoc of teachersSnapshot.docs) {
          const teacherData = teacherDoc.data();
          console.log(`        Teacher: ${teacherData.name} (${teacherDoc.id})`);
          console.log(`          Email: ${teacherData.email}`);
          console.log(`          Department ID: ${teacherData.departmentId}`);
        }
        
        // Test 5: Check students subcollection
        console.log('\n      ----- Testing Students Subcollection -----');
        const studentsRef = db.collection('institutions').doc(institutionDoc.id).collection('departments').doc(departmentDoc.id).collection('students');
        const studentsSnapshot = await studentsRef.get();
        console.log(`      Found ${studentsSnapshot.size} students`);
        
        for (const studentDoc of studentsSnapshot.docs) {
          const studentData = studentDoc.data();
          console.log(`        Student: ${studentData.name} (${studentDoc.id})`);
          console.log(`          Email: ${studentData.email}`);
          console.log(`          Department ID: ${studentData.departmentId}`);
          console.log(`          Teacher ID: ${studentData.teacherId || 'Not assigned'}`);
        }
      }
    }
    
    // Test 6: Check external users collection
    console.log('\n=== Testing External Users Collection ===');
    const externalUsersRef = db.collection('externalUsers');
    const externalUsersSnapshot = await externalUsersRef.get();
    console.log(`Found ${externalUsersSnapshot.size} external users`);
    
    for (const externalUserDoc of externalUsersSnapshot.docs) {
      const userData = externalUserDoc.data();
      console.log(`\nExternal User: ${userData.name} (${externalUserDoc.id})`);
      console.log(`  Email: ${userData.email}`);
      console.log(`  Role: ${userData.role}`);
    }
    
    // Test 7: Check platform admins collection
    console.log('\n=== Testing Platform Admins Collection ===');
    const platformAdminsRef = db.collection('platformAdmins');
    const platformAdminsSnapshot = await platformAdminsRef.get();
    console.log(`Found ${platformAdminsSnapshot.size} platform admins`);
    
    for (const adminDoc of platformAdminsSnapshot.docs) {
      const userData = adminDoc.data();
      console.log(`\nPlatform Admin: ${userData.name} (${adminDoc.id})`);
      console.log(`  Email: ${userData.email}`);
    }
    
    console.log('\n✅ Data integrity test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during data integrity test:', error);
  } finally {
    // Clean up
    await admin.app().delete();
  }
}

testDataIntegrity();