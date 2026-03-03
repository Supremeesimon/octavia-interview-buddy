const admin = require('firebase-admin');
const serviceAccount = require('./functions/service-account-key.json');

// Initialize Firebase Admin SDK with service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Helper function to remove undefined values from objects
function removeUndefinedValues(obj) {
  const cleaned = {};
  for (const key in obj) {
    if (obj[key] !== undefined && obj[key] !== null) {
      cleaned[key] = obj[key];
    }
  }
  return cleaned;
}

async function cleanupAndCorrectMigration() {
  try {
    console.log('🔍 Starting cleanup and correction of migration...');
    
    // Step 1: Fix platform admin user
    console.log('\n=== Fixing Platform Admin User ===');
    const externalUsersRef = db.collection('externalUsers');
    const externalUsersSnapshot = await externalUsersRef.get();
    
    for (const externalUserDoc of externalUsersSnapshot.docs) {
      const userData = externalUserDoc.data();
      if (userData.role === 'platform_admin') {
        console.log(`\nMoving platform admin ${userData.name} to correct collection`);
        
        // Create in platformAdmins collection
        const platformAdminUserData = removeUndefinedValues({
          ...userData,
          permissions: [], // Will be set based on role
          createdAt: userData.createdAt || admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        await db.collection('platformAdmins').doc(externalUserDoc.id).set(platformAdminUserData);
        console.log(`  ✅ Created platform admin: ${userData.name}`);
        
        // Delete from externalUsers collection
        await db.collection('externalUsers').doc(externalUserDoc.id).delete();
        console.log(`  ✅ Removed from externalUsers collection`);
      }
    }
    
    // Step 2: Consolidate duplicate departments
    console.log('\n=== Consolidating Duplicate Departments ===');
    const institutionsRef = db.collection('institutions');
    const institutionsSnapshot = await institutionsRef.get();
    
    for (const institutionDoc of institutionsSnapshot.docs) {
      console.log(`\nProcessing institution: ${institutionDoc.data().name}`);
      
      // Get all departments
      const departmentsRef = db.collection('institutions').doc(institutionDoc.id).collection('departments');
      const departmentsSnapshot = await departmentsRef.orderBy('createdAt').get();
      
      const departmentsByName = {};
      
      // Group departments by name
      for (const departmentDoc of departmentsSnapshot.docs) {
        const departmentData = departmentDoc.data();
        if (!departmentsByName[departmentData.departmentName]) {
          departmentsByName[departmentData.departmentName] = [];
        }
        departmentsByName[departmentData.departmentName].push({
          id: departmentDoc.id,
          data: departmentData
        });
      }
      
      // For each department name, keep the first one and merge others
      for (const [departmentName, departments] of Object.entries(departmentsByName)) {
        if (departments.length > 1) {
          console.log(`\n  Consolidating ${departments.length} departments named: ${departmentName}`);
          
          const primaryDepartment = departments[0];
          console.log(`    Keeping primary department: ${primaryDepartment.id}`);
          
          // Move teachers and students from duplicate departments to primary department
          for (let i = 1; i < departments.length; i++) {
            const duplicateDepartment = departments[i];
            console.log(`    Processing duplicate department: ${duplicateDepartment.id}`);
            
            // Move teachers
            const teachersRef = db.collection('institutions').doc(institutionDoc.id).collection('departments').doc(duplicateDepartment.id).collection('teachers');
            const teachersSnapshot = await teachersRef.get();
            
            for (const teacherDoc of teachersSnapshot.docs) {
              const teacherData = teacherDoc.data();
              console.log(`      Moving teacher: ${teacherData.name}`);
              
              // Update teacher's departmentId
              const updatedTeacherData = {
                ...teacherData,
                departmentId: primaryDepartment.id
              };
              
              // Create in primary department
              await db.collection('institutions').doc(institutionDoc.id).collection('departments').doc(primaryDepartment.id).collection('teachers').doc(teacherDoc.id).set(updatedTeacherData);
              
              // Delete from duplicate department
              await db.collection('institutions').doc(institutionDoc.id).collection('departments').doc(duplicateDepartment.id).collection('teachers').doc(teacherDoc.id).delete();
            }
            
            // Move students
            const studentsRef = db.collection('institutions').doc(institutionDoc.id).collection('departments').doc(duplicateDepartment.id).collection('students');
            const studentsSnapshot = await studentsRef.get();
            
            for (const studentDoc of studentsSnapshot.docs) {
              const studentData = studentDoc.data();
              console.log(`      Moving student: ${studentData.name}`);
              
              // Update student's departmentId
              const updatedStudentData = {
                ...studentData,
                departmentId: primaryDepartment.id
              };
              
              // Create in primary department
              await db.collection('institutions').doc(institutionDoc.id).collection('departments').doc(primaryDepartment.id).collection('students').doc(studentDoc.id).set(updatedStudentData);
              
              // Delete from duplicate department
              await db.collection('institutions').doc(institutionDoc.id).collection('departments').doc(duplicateDepartment.id).collection('students').doc(studentDoc.id).delete();
            }
            
            // Delete the duplicate department
            await db.collection('institutions').doc(institutionDoc.id).collection('departments').doc(duplicateDepartment.id).delete();
            console.log(`    ✅ Deleted duplicate department: ${duplicateDepartment.id}`);
          }
        }
      }
    }
    
    console.log('\n✅ Cleanup and correction completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during cleanup and correction:', error);
  } finally {
    // Clean up
    await admin.app().delete();
  }
}

cleanupAndCorrectMigration();