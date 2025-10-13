const admin = require('firebase-admin');
const serviceAccount = require('./functions/service-account-key.json');

// Initialize Firebase Admin SDK with service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function testMultiTenantIsolation() {
  try {
    console.log('🔍 Testing multi-tenant data isolation...');
    
    // Get all institutions
    const institutionsRef = db.collection('institutions');
    const institutionsSnapshot = await institutionsRef.get();
    
    if (institutionsSnapshot.empty) {
      console.log('❌ No institutions found to test isolation');
      return;
    }
    
    console.log(`\n=== Testing Isolation Between ${institutionsSnapshot.size} Institutions ===`);
    
    const institutions = [];
    for (const institutionDoc of institutionsSnapshot.docs) {
      const institutionData = institutionDoc.data();
      institutions.push({
        id: institutionDoc.id,
        name: institutionData.name,
        domain: institutionData.domain
      });
    }
    
    // Test isolation between institutions
    for (let i = 0; i < institutions.length; i++) {
      const institution1 = institutions[i];
      console.log(`\nInstitution ${i + 1}: ${institution1.name} (${institution1.id})`);
      
      // Get departments for this institution
      const departmentsRef = db.collection('institutions').doc(institution1.id).collection('departments');
      const departmentsSnapshot = await departmentsRef.get();
      console.log(`  Departments: ${departmentsSnapshot.size}`);
      
      // Check that departments don't exist in other institutions
      for (let j = 0; j < institutions.length; j++) {
        if (i !== j) {
          const institution2 = institutions[j];
          
          // Try to access departments from institution2 using institution1's department IDs
          for (const departmentDoc of departmentsSnapshot.docs) {
            const departmentRef = db.collection('institutions').doc(institution2.id).collection('departments').doc(departmentDoc.id);
            const departmentSnap = await departmentRef.get();
            
            if (departmentSnap.exists) {
              console.log(`  ❌ WARNING: Department ${departmentDoc.id} from ${institution1.name} is accessible from ${institution2.name}`);
            }
          }
        }
      }
    }
    
    // Test user isolation
    console.log('\n=== Testing User Isolation ===');
    
    // Get users from first institution
    if (institutions.length > 0) {
      const firstInstitution = institutions[0];
      console.log(`\nChecking users in ${firstInstitution.name} (${firstInstitution.id})`);
      
      // Get departments
      const departmentsRef = db.collection('institutions').doc(firstInstitution.id).collection('departments');
      const departmentsSnapshot = await departmentsRef.get();
      
      let totalUsers = 0;
      
      for (const departmentDoc of departmentsSnapshot.docs) {
        const departmentData = departmentDoc.data();
        console.log(`\n  Department: ${departmentData.departmentName} (${departmentDoc.id})`);
        
        // Check teachers
        const teachersRef = db.collection('institutions').doc(firstInstitution.id).collection('departments').doc(departmentDoc.id).collection('teachers');
        const teachersSnapshot = await teachersRef.get();
        console.log(`    Teachers: ${teachersSnapshot.size}`);
        totalUsers += teachersSnapshot.size;
        
        // Check students
        const studentsRef = db.collection('institutions').doc(firstInstitution.id).collection('departments').doc(departmentDoc.id).collection('students');
        const studentsSnapshot = await studentsRef.get();
        console.log(`    Students: ${studentsSnapshot.size}`);
        totalUsers += studentsSnapshot.size;
      }
      
      console.log(`\n  Total users in ${firstInstitution.name}: ${totalUsers}`);
      
      // Verify users are not accessible from other institutions
      if (institutions.length > 1) {
        const secondInstitution = institutions[1];
        console.log(`\n  Verifying users from ${firstInstitution.name} are not accessible from ${secondInstitution.name}`);
        
        // Try to access a teacher from first institution in second institution
        if (departmentsSnapshot.size > 0) {
          const firstDepartment = departmentsSnapshot.docs[0];
          const teachersRef = db.collection('institutions').doc(firstInstitution.id).collection('departments').doc(firstDepartment.id).collection('teachers');
          const teachersSnapshot = await teachersRef.get();
          
          if (!teachersSnapshot.empty) {
            const teacherDoc = teachersSnapshot.docs[0];
            const teacherRef = db.collection('institutions').doc(secondInstitution.id).collection('departments').doc(firstDepartment.id).collection('teachers').doc(teacherDoc.id);
            const teacherSnap = await teacherRef.get();
            
            if (teacherSnap.exists) {
              console.log(`  ❌ WARNING: Teacher ${teacherDoc.id} from ${firstInstitution.name} is accessible from ${secondInstitution.name}`);
            } else {
              console.log(`  ✅ Teacher ${teacherDoc.id} is properly isolated`);
            }
          }
        }
      }
    }
    
    console.log('\n✅ Multi-tenant isolation test completed!');
    
  } catch (error) {
    console.error('❌ Error during multi-tenant isolation test:', error);
  } finally {
    // Clean up
    await admin.app().delete();
  }
}

testMultiTenantIsolation();