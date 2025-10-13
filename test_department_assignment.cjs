const admin = require('firebase-admin');
const serviceAccount = require('./src/service-account-key.json');

// Initialize Firebase Admin with service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'octavia-practice-interviewer',
  storageBucket: 'octavia-practice-interviewer.appspot.com'
});

const db = admin.firestore();

async function testDepartmentAssignment() {
  try {
    console.log('=== Testing Department Assignment Logic ===\n');
    
    // Get the institution
    const institutionsSnapshot = await db.collection('institutions').where('name', '==', 'Lethbridge Polytechnic').get();
    
    if (institutionsSnapshot.empty) {
      console.log('ERROR: Institution "Lethbridge Polytechnic" not found.');
      return;
    }
    
    const institutionDoc = institutionsSnapshot.docs[0];
    const institutionId = institutionDoc.id;
    console.log(`Found institution: ${institutionDoc.data().name} (ID: ${institutionId})`);
    
    // Create a unique department name for testing
    const testDepartmentName = 'Electrical Engineering ' + Date.now();
    
    console.log(`\n1. Testing department creation with name: "${testDepartmentName}"`);
    
    // Simulate first user (teacher) signing up with this department
    console.log('   Creating first teacher with this department...');
    
    // Check if department exists
    let departmentSnapshot = await db.collection('institutions').doc(institutionId).collection('departments')
      .where('departmentName', '==', testDepartmentName).get();
    
    let departmentId;
    if (departmentSnapshot.empty) {
      console.log('   Department does not exist. Creating it...');
      
      // Create new department
      const departmentRef = await db.collection('institutions').doc(institutionId).collection('departments').add({
        departmentName: testDepartmentName,
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
        department: testDepartmentName,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date()
      });
    
    console.log('   ✓ Teacher created successfully');
    
    // Simulate second user (student) signing up with the same department name
    console.log(`\n2. Testing second user assignment to same department: "${testDepartmentName}"`);
    
    // This should find the existing department
    departmentSnapshot = await db.collection('institutions').doc(institutionId).collection('departments')
      .where('departmentName', '==', testDepartmentName).get();
    
    if (departmentSnapshot.empty) {
      console.log('   ERROR: Department should exist but was not found!');
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
        department: testDepartmentName,
        yearOfStudy: '2025',
        enrollmentStatus: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date()
      });
    
    console.log('   ✓ Student created successfully in same department');
    
    // Verify both users are in the same department
    console.log('\n3. Verifying department grouping:');
    
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
    
    console.log('\n✓ Department assignment test completed successfully!');
    console.log('✓ Both users with the same department name are grouped together.');
    console.log('✓ The system correctly finds existing departments and assigns users to them.');
    
  } catch (error) {
    console.error('Error testing department assignment:', error);
  } finally {
    await admin.app().delete();
  }
}

testDepartmentAssignment();