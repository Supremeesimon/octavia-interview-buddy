const admin = require('firebase-admin');
const serviceAccount = require('./src/service-account-key.json');

// Initialize Firebase Admin with service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'octavia-practice-interviewer',
  storageBucket: 'octavia-practice-interviewer.appspot.com'
});

const db = admin.firestore();

async function comprehensiveDepartmentCheck() {
  try {
    console.log('=== Comprehensive Department Grouping Check ===\n');
    
    // Get all institutions
    const institutionsSnapshot = await db.collection('institutions').get();
    
    if (institutionsSnapshot.empty) {
      console.log('No institutions found in the database.');
      return;
    }
    
    for (const institutionDoc of institutionsSnapshot.docs) {
      const institutionData = institutionDoc.data();
      console.log(`Institution: ${institutionData.name || 'Unnamed'} (ID: ${institutionDoc.id})`);
      
      // Create a map to group users by department
      const departmentMap = new Map();
      
      // Get all departments in this institution
      const departmentsSnapshot = await db.collection('institutions').doc(institutionDoc.id).collection('departments').get();
      
      console.log(`  Total Departments: ${departmentsSnapshot.size}`);
      
      for (const departmentDoc of departmentsSnapshot.docs) {
        const departmentData = departmentDoc.data();
        const departmentKey = departmentData.departmentName || 'Unnamed';
        
        // Initialize department in map
        if (!departmentMap.has(departmentKey)) {
          departmentMap.set(departmentKey, {
            departmentId: departmentDoc.id,
            teachers: [],
            students: []
          });
        }
        
        // Get teachers in this department
        const teachersSnapshot = await db.collection('institutions').doc(institutionDoc.id).collection('departments').doc(departmentDoc.id).collection('teachers').get();
        
        for (const teacherDoc of teachersSnapshot.docs) {
          const teacherData = teacherDoc.data();
          departmentMap.get(departmentKey).teachers.push({
            id: teacherDoc.id,
            name: teacherData.name,
            email: teacherData.email
          });
        }
        
        // Get students in this department
        const studentsSnapshot = await db.collection('institutions').doc(institutionDoc.id).collection('departments').doc(departmentDoc.id).collection('students').get();
        
        for (const studentDoc of studentsSnapshot.docs) {
          const studentData = studentDoc.data();
          departmentMap.get(departmentKey).students.push({
            id: studentDoc.id,
            name: studentData.name,
            email: studentData.email
          });
        }
      }
      
      // Display results
      console.log('\n  Department Grouping Analysis:');
      console.log('  =============================');
      
      for (const [departmentName, departmentInfo] of departmentMap) {
        console.log(`\n  Department: ${departmentName}`);
        console.log(`    ID: ${departmentInfo.departmentId}`);
        console.log(`    Teachers: ${departmentInfo.teachers.length}`);
        departmentInfo.teachers.forEach(teacher => {
          console.log(`      - ${teacher.name} (${teacher.email})`);
        });
        console.log(`    Students: ${departmentInfo.students.length}`);
        departmentInfo.students.forEach(student => {
          console.log(`      - ${student.name} (${student.email})`);
        });
      }
      
      // Check for users with same department names but in different departments
      console.log('\n  Checking for Department Name Conflicts:');
      console.log('  ======================================');
      
      // Group departments by name
      const departmentsByName = new Map();
      
      for (const departmentDoc of departmentsSnapshot.docs) {
        const departmentData = departmentDoc.data();
        const departmentName = departmentData.departmentName || 'Unnamed';
        
        if (!departmentsByName.has(departmentName)) {
          departmentsByName.set(departmentName, []);
        }
        
        departmentsByName.get(departmentName).push({
          id: departmentDoc.id,
          ...departmentData
        });
      }
      
      // Check for duplicate department names
      let hasConflicts = false;
      for (const [departmentName, departments] of departmentsByName) {
        if (departments.length > 1) {
          hasConflicts = true;
          console.log(`\n  WARNING: Department name "${departmentName}" exists in multiple department documents:`);
          departments.forEach(dept => {
            console.log(`    - ID: ${dept.id}`);
          });
        }
      }
      
      if (!hasConflicts) {
        console.log('  No department name conflicts found.');
      }
      
      console.log('\n' + '='.repeat(60));
    }
    
    // Test the logic for creating users with the same department
    console.log('\n=== Testing Department Creation Logic ===\n');
    
    const testInstitution = institutionsSnapshot.docs[0];
    const testInstitutionId = testInstitution.id;
    const testDepartmentName = 'Test Department ' + Date.now();
    
    console.log(`Testing with institution: ${testInstitution.data().name}`);
    console.log(`Creating test department: ${testDepartmentName}`);
    
    // Create first user (teacher) with this department
    const teacherDepartmentRef = await db.collection('institutions').doc(testInstitutionId).collection('departments').add({
      departmentName: testDepartmentName,
      createdAt: new Date(),
      createdBy: 'test-script'
    });
    
    const teacherId = 'test-teacher-' + Date.now();
    await db.collection('institutions').doc(testInstitutionId).collection('departments').doc(teacherDepartmentRef.id)
      .collection('teachers').doc(teacherId).set({
        name: 'Test Teacher',
        email: 'test.teacher@example.com',
        role: 'teacher',
        institutionId: testInstitutionId,
        departmentId: teacherDepartmentRef.id,
        department: testDepartmentName,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date()
      });
    
    console.log(`✓ Created teacher with department "${testDepartmentName}"`);
    
    // Try to create second user (student) with same department name
    // This should find the existing department instead of creating a new one
    
    // First, check if department exists
    const existingDepartmentSnapshot = await db.collection('institutions').doc(testInstitutionId).collection('departments')
      .where('departmentName', '==', testDepartmentName).get();
    
    if (existingDepartmentSnapshot.empty) {
      console.log('❌ ERROR: Department should exist but was not found!');
    } else {
      const existingDepartmentId = existingDepartmentSnapshot.docs[0].id;
      
      const studentId = 'test-student-' + Date.now();
      await db.collection('institutions').doc(testInstitutionId).collection('departments').doc(existingDepartmentId)
        .collection('students').doc(studentId).set({
          name: 'Test Student',
          email: 'test.student@example.com',
          role: 'student',
          institutionId: testInstitutionId,
          departmentId: existingDepartmentId,
          department: testDepartmentName,
          yearOfStudy: '2025',
          enrollmentStatus: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          lastLogin: new Date()
        });
      
      console.log(`✓ Created student in existing department "${testDepartmentName}"`);
      console.log(`✓ Both users are in the same department (ID: ${existingDepartmentId})`);
    }
    
    console.log('\n=== Test Completed ===');
    
  } catch (error) {
    console.error('Error in comprehensive department check:', error);
  } finally {
    await admin.app().delete();
  }
}

comprehensiveDepartmentCheck();