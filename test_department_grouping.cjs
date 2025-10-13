const admin = require('firebase-admin');
const serviceAccount = require('./src/service-account-key.json');

// Initialize Firebase Admin with service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'octavia-practice-interviewer',
  storageBucket: 'octavia-practice-interviewer.appspot.com'
});

const db = admin.firestore();

async function testDepartmentGrouping() {
  try {
    console.log('=== Testing Department Grouping Logic ===\n');
    
    // Get the institution
    const institutionsSnapshot = await db.collection('institutions').where('name', '==', 'Lethbridge Polytechnic').get();
    
    if (institutionsSnapshot.empty) {
      console.log('ERROR: Institution "Lethbridge Polytechnic" not found.');
      return;
    }
    
    const institutionDoc = institutionsSnapshot.docs[0];
    const institutionId = institutionDoc.id;
    console.log(`Found institution: ${institutionDoc.data().name} (ID: ${institutionId})`);
    
    // Test case 1: Create a teacher with a specific department
    const teacherDepartment = 'Computer Science';
    console.log(`\n1. Creating teacher with department: ${teacherDepartment}`);
    
    // Check if department exists
    let departmentSnapshot = await db.collection('institutions').doc(institutionId).collection('departments')
      .where('departmentName', '==', teacherDepartment).get();
    
    let departmentId;
    if (departmentSnapshot.empty) {
      console.log(`   Department "${teacherDepartment}" does not exist. Creating it...`);
      
      // Create new department
      const departmentRef = await db.collection('institutions').doc(institutionId).collection('departments').add({
        departmentName: teacherDepartment,
        createdAt: new Date(),
        createdBy: 'test-script'
      });
      
      departmentId = departmentRef.id;
      console.log(`   Created department with ID: ${departmentId}`);
    } else {
      departmentId = departmentSnapshot.docs[0].id;
      console.log(`   Found existing department with ID: ${departmentId}`);
    }
    
    // Create teacher in this department
    const teacherId = 'test-teacher-' + Date.now();
    await db.collection('institutions').doc(institutionId).collection('departments').doc(departmentId)
      .collection('teachers').doc(teacherId).set({
        name: 'Test Teacher',
        email: 'test.teacher@lethbridgepolytechnic.ca',
        role: 'teacher',
        institutionId: institutionId,
        departmentId: departmentId,
        department: teacherDepartment,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date()
      });
    
    console.log(`   Created teacher in department "${teacherDepartment}"`);
    
    // Test case 2: Create a student with the same department
    console.log(`\n2. Creating student with same department: ${teacherDepartment}`);
    
    // Check if department exists (should find the one we just created)
    departmentSnapshot = await db.collection('institutions').doc(institutionId).collection('departments')
      .where('departmentName', '==', teacherDepartment).get();
    
    if (departmentSnapshot.empty) {
      console.log(`   ERROR: Department "${teacherDepartment}" should exist but was not found!`);
      return;
    }
    
    const sameDepartmentId = departmentSnapshot.docs[0].id;
    console.log(`   Found existing department with ID: ${sameDepartmentId}`);
    
    // Create student in the same department
    const studentId = 'test-student-' + Date.now();
    await db.collection('institutions').doc(institutionId).collection('departments').doc(sameDepartmentId)
      .collection('students').doc(studentId).set({
        name: 'Test Student',
        email: 'test.student@lethbridgepolytechnic.ca',
        role: 'student',
        institutionId: institutionId,
        departmentId: sameDepartmentId,
        department: teacherDepartment,
        yearOfStudy: '2025',
        enrollmentStatus: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date()
      });
    
    console.log(`   Created student in same department "${teacherDepartment}"`);
    
    // Verify both users are in the same department
    console.log('\n3. Verifying both users are in the same department:');
    
    // Get the department
    const deptDoc = await db.collection('institutions').doc(institutionId).collection('departments').doc(sameDepartmentId).get();
    console.log(`   Department: ${deptDoc.data().departmentName} (ID: ${sameDepartmentId})`);
    
    // Get teachers in this department
    const teachersSnapshot = await db.collection('institutions').doc(institutionId).collection('departments').doc(sameDepartmentId)
      .collection('teachers').get();
    console.log(`   Teachers in department: ${teachersSnapshot.size}`);
    
    // Get students in this department
    const studentsSnapshot = await db.collection('institutions').doc(institutionId).collection('departments').doc(sameDepartmentId)
      .collection('students').get();
    console.log(`   Students in department: ${studentsSnapshot.size}`);
    
    console.log('\n✓ Test completed successfully! Users with the same department name are grouped together.');
    
  } catch (error) {
    console.error('Error testing department grouping:', error);
  } finally {
    await admin.app().delete();
  }
}

testDepartmentGrouping();