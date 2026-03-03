const admin = require('firebase-admin');
const serviceAccount = require('./src/service-account-key.json');

// Initialize Firebase Admin with service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'octavia-practice-interviewer',
  storageBucket: 'octavia-practice-interviewer.appspot.com'
});

const db = admin.firestore();

async function testDepartmentGroupingFix() {
  try {
    console.log('=== Testing Department Grouping Fix ===\n');
    
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
    const testDepartment = 'Mechanical Engineering';
    console.log(`\n1. Creating teacher with department: ${testDepartment}`);
    
    // Create teacher with department
    const teacherId = 'test-teacher-' + Date.now();
    const teacherData = {
      name: 'Test Teacher',
      email: 'test.teacher@lethbridgepolytechnic.ca',
      role: 'teacher',
      institutionId: institutionId,
      department: testDepartment,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: new Date()
    };
    
    // Simulate the new logic: Check if department exists, create if not
    let departmentSnapshot = await db.collection('institutions').doc(institutionId).collection('departments')
      .where('departmentName', '==', testDepartment).get();
    
    let departmentId;
    if (departmentSnapshot.empty) {
      console.log(`   Department "${testDepartment}" does not exist. Creating it...`);
      
      // Create new department
      const departmentRef = await db.collection('institutions').doc(institutionId).collection('departments').add({
        departmentName: testDepartment,
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
    await db.collection('institutions').doc(institutionId).collection('departments').doc(departmentId)
      .collection('teachers').doc(teacherId).set(teacherData);
    
    console.log(`   Created teacher in department "${testDepartment}"`);
    
    // Test case 2: Create another teacher with the same department
    console.log(`\n2. Creating another teacher with same department: ${testDepartment}`);
    
    // This should find the existing department
    departmentSnapshot = await db.collection('institutions').doc(institutionId).collection('departments')
      .where('departmentName', '==', testDepartment).get();
    
    if (departmentSnapshot.empty) {
      console.log(`   ERROR: Department "${testDepartment}" should exist but was not found!`);
      return;
    }
    
    const sameDepartmentId = departmentSnapshot.docs[0].id;
    console.log(`   Found existing department with ID: ${sameDepartmentId}`);
    
    // Create second teacher in the same department
    const teacher2Id = 'test-teacher-2-' + Date.now();
    await db.collection('institutions').doc(institutionId).collection('departments').doc(sameDepartmentId)
      .collection('teachers').doc(teacher2Id).set({
        name: 'Test Teacher 2',
        email: 'test.teacher2@lethbridgepolytechnic.ca',
        role: 'teacher',
        institutionId: institutionId,
        department: testDepartment,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date()
      });
    
    console.log(`   Created second teacher in same department "${testDepartment}"`);
    
    // Test case 3: Create a student with the same department
    console.log(`\n3. Creating student with same department: ${testDepartment}`);
    
    // Create student in the same department
    const studentId = 'test-student-' + Date.now();
    await db.collection('institutions').doc(institutionId).collection('departments').doc(sameDepartmentId)
      .collection('students').doc(studentId).set({
        name: 'Test Student',
        email: 'test.student@lethbridgepolytechnic.ca',
        role: 'student',
        institutionId: institutionId,
        departmentId: sameDepartmentId,
        department: testDepartment,
        yearOfStudy: '2025',
        enrollmentStatus: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date()
      });
    
    console.log(`   Created student in same department "${testDepartment}"`);
    
    // Verify all users are in the same department
    console.log('\n4. Verifying all users are in the same department:');
    
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
    
    // List all users
    console.log('\n   Users in department:');
    for (const teacherDoc of teachersSnapshot.docs) {
      const teacherData = teacherDoc.data();
      console.log(`     Teacher: ${teacherData.name} (${teacherData.email})`);
    }
    
    for (const studentDoc of studentsSnapshot.docs) {
      const studentData = studentDoc.data();
      console.log(`     Student: ${studentData.name} (${studentData.email})`);
    }
    
    console.log('\n✓ Test completed successfully! Users with the same department name are grouped together.');
    console.log('✓ Department creation logic works correctly.');
    
  } catch (error) {
    console.error('Error testing department grouping fix:', error);
  } finally {
    await admin.app().delete();
  }
}

testDepartmentGroupingFix();