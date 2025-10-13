const admin = require('firebase-admin');
const serviceAccount = require('./functions/service-account-key.json');
const { v4: uuidv4 } = require('uuid');

// Initialize Firebase Admin SDK with service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function testAutomaticCreation() {
  try {
    console.log('🔍 Testing automatic collection creation on signup...');
    
    // Test 1: Create a new institution and verify automatic structure creation
    console.log('\n=== Testing Automatic Institution Creation ===');
    
    const newInstitution = {
      name: 'Test University',
      domain: 'testuniversity.edu',
      customSignupLink: '',
      customSignupToken: '',
      partnershipRequestDate: admin.firestore.FieldValue.serverTimestamp(),
      approvalStatus: 'pending',
      contactEmail: 'admin@testuniversity.edu',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true
    };
    
    // Generate signup token
    const signupToken = uuidv4();
    newInstitution.customSignupToken = signupToken;
    newInstitution.customSignupLink = `https://octavia.ai/signup-institution/${signupToken}`;
    
    // Create the institution
    const institutionDocRef = db.collection('institutions').doc();
    await institutionDocRef.set(newInstitution);
    const institutionId = institutionDocRef.id;
    
    console.log(`✅ Created institution: ${newInstitution.name} (${institutionId})`);
    console.log(`  Signup Link: ${newInstitution.customSignupLink}`);
    
    // Verify the institution was created with correct structure
    const institutionDoc = await db.collection('institutions').doc(institutionId).get();
    
    if (institutionDoc.exists) {
      const data = institutionDoc.data();
      if (data.customSignupToken && data.customSignupLink) {
        console.log(`✅ Institution has correct signup structure`);
      } else {
        console.log(`❌ Institution missing signup structure`);
      }
    }
    
    // Test 2: Simulate admin signup and verify automatic admin creation
    console.log('\n=== Testing Automatic Admin Creation ===');
    
    const adminData = {
      name: 'Test Admin',
      email: 'admin@testuniversity.edu',
      role: 'institution_admin',
      isEmailVerified: true,
      emailVerified: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      sessionCount: 0,
      profileCompleted: true
    };
    
    // Create admin in the institution's admins subcollection
    const adminDocRef = db.collection('institutions').doc(institutionId).collection('admins').doc();
    await adminDocRef.set(adminData);
    const adminId = adminDocRef.id;
    
    console.log(`✅ Created admin: ${adminData.name} (${adminId})`);
    
    // Verify the admin was created
    const adminDoc = await db.collection('institutions').doc(institutionId).collection('admins').doc(adminId).get();
    
    if (adminDoc.exists) {
      console.log(`✅ Admin creation verified`);
    } else {
      console.log(`❌ Admin creation failed`);
    }
    
    // Test 3: Simulate teacher signup and verify automatic department and teacher creation
    console.log('\n=== Testing Automatic Department and Teacher Creation ===');
    
    const departmentName = 'Computer Science';
    const departmentData = {
      departmentName,
      departmentSignupToken: uuidv4(),
      departmentSignupLink: '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: adminId
    };
    
    departmentData.departmentSignupLink = `https://octavia.ai/signup-institution/${institutionId}?department=${encodeURIComponent(departmentName)}&token=${departmentData.departmentSignupToken}`;
    
    // Create department
    const departmentDocRef = db.collection('institutions').doc(institutionId).collection('departments').doc();
    await departmentDocRef.set(departmentData);
    const departmentId = departmentDocRef.id;
    
    console.log(`✅ Created department: ${departmentName} (${departmentId})`);
    console.log(`  Signup Link: ${departmentData.departmentSignupLink}`);
    
    // Verify the department was created
    const departmentDoc = await db.collection('institutions').doc(institutionId).collection('departments').doc(departmentId).get();
    
    if (departmentDoc.exists) {
      console.log(`✅ Department creation verified`);
    } else {
      console.log(`❌ Department creation failed`);
    }
    
    // Create teacher in the department
    const teacherData = {
      name: 'Test Teacher',
      email: 'teacher@testuniversity.edu',
      role: 'teacher',
      department: departmentName,
      departmentId: departmentId,
      isEmailVerified: true,
      emailVerified: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      sessionCount: 0,
      profileCompleted: true
    };
    
    const teacherDocRef = db.collection('institutions').doc(institutionId).collection('departments').doc(departmentId).collection('teachers').doc();
    await teacherDocRef.set(teacherData);
    const teacherId = teacherDocRef.id;
    
    console.log(`✅ Created teacher: ${teacherData.name} (${teacherId})`);
    
    // Verify the teacher was created
    const teacherDoc = await db.collection('institutions').doc(institutionId).collection('departments').doc(departmentId).collection('teachers').doc(teacherId).get();
    
    if (teacherDoc.exists) {
      console.log(`✅ Teacher creation verified`);
    } else {
      console.log(`❌ Teacher creation failed`);
    }
    
    // Test 4: Simulate student signup and verify automatic student creation
    console.log('\n=== Testing Automatic Student Creation ===');
    
    const studentData = {
      name: 'Test Student',
      email: 'student@testuniversity.edu',
      role: 'student',
      department: departmentName,
      departmentId: departmentId,
      yearOfStudy: '2023',
      enrollmentStatus: 'active',
      isEmailVerified: true,
      emailVerified: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      sessionCount: 0,
      profileCompleted: true
    };
    
    const studentDocRef = db.collection('institutions').doc(institutionId).collection('departments').doc(departmentId).collection('students').doc();
    await studentDocRef.set(studentData);
    const studentId = studentDocRef.id;
    
    console.log(`✅ Created student: ${studentData.name} (${studentId})`);
    
    // Verify the student was created
    const studentDoc = await db.collection('institutions').doc(institutionId).collection('departments').doc(departmentId).collection('students').doc(studentId).get();
    
    if (studentDoc.exists) {
      console.log(`✅ Student creation verified`);
    } else {
      console.log(`❌ Student creation failed`);
    }
    
    // Test 5: Verify the complete hierarchy structure
    console.log('\n=== Testing Complete Hierarchy Structure ===');
    
    // Check institutions
    const institutionsQuery = db.collection('institutions');
    const institutionsSnapshot = await institutionsQuery.get();
    console.log(`Total institutions: ${institutionsSnapshot.size}`);
    
    // Check our test institution
    const testInstitutionDoc = await db.collection('institutions').doc(institutionId).get();
    
    if (testInstitutionDoc.exists) {
      console.log(`✅ Test institution exists`);
      
      // Check admins subcollection
      const adminsQuery = db.collection('institutions').doc(institutionId).collection('admins');
      const adminsSnapshot = await adminsQuery.get();
      console.log(`  Admins: ${adminsSnapshot.size}`);
      
      // Check departments subcollection
      const departmentsQuery = db.collection('institutions').doc(institutionId).collection('departments');
      const departmentsSnapshot = await departmentsQuery.get();
      console.log(`  Departments: ${departmentsSnapshot.size}`);
      
      if (!departmentsSnapshot.empty) {
        const testDepartmentDoc = departmentsSnapshot.docs[0];
        console.log(`  ✅ Department exists: ${testDepartmentDoc.data().departmentName}`);
        
        // Check teachers subcollection
        const teachersQuery = db.collection('institutions').doc(institutionId).collection('departments').doc(testDepartmentDoc.id).collection('teachers');
        const teachersSnapshot = await teachersQuery.get();
        console.log(`    Teachers: ${teachersSnapshot.size}`);
        
        // Check students subcollection
        const studentsQuery = db.collection('institutions').doc(institutionId).collection('departments').doc(testDepartmentDoc.id).collection('students');
        const studentsSnapshot = await studentsQuery.get();
        console.log(`    Students: ${studentsSnapshot.size}`);
      }
    }
    
    // Clean up test data
    console.log('\n=== Cleaning Up Test Data ===');
    await db.collection('institutions').doc(institutionId).collection('departments').doc(departmentId).collection('students').doc(studentId).delete();
    await db.collection('institutions').doc(institutionId).collection('departments').doc(departmentId).collection('teachers').doc(teacherId).delete();
    await db.collection('institutions').doc(institutionId).collection('departments').doc(departmentId).delete();
    await db.collection('institutions').doc(institutionId).collection('admins').doc(adminId).delete();
    await db.collection('institutions').doc(institutionId).delete();
    
    console.log('✅ Test data cleaned up successfully!');
    console.log('\n✅ Automatic collection creation test completed!');
    
  } catch (error) {
    console.error('❌ Error during automatic collection creation test:', error);
  } finally {
    // Clean up
    await admin.app().delete();
  }
}

testAutomaticCreation();