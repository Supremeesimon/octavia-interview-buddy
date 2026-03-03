const admin = require('firebase-admin');
const serviceAccount = require('./functions/service-account-key.json');
const { v4: uuidv4 } = require('uuid');

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

async function migrateToHierarchicalStructure() {
  try {
    console.log('🔍 Starting migration to hierarchical structure...');
    
    // Step 1: Update institutions with signup tokens and links
    console.log('\n=== Updating Institutions ===');
    const institutionsRef = db.collection('institutions');
    const institutionsSnapshot = await institutionsRef.get();
    
    console.log(`Found ${institutionsSnapshot.size} institutions to update`);
    
    for (const institutionDoc of institutionsSnapshot.docs) {
      const institutionData = institutionDoc.data();
      console.log(`\nUpdating institution: ${institutionData.name} (${institutionDoc.id})`);
      
      // Generate signup token if it doesn't exist
      const signupToken = institutionData.customSignupToken || uuidv4();
      const signupLink = institutionData.customSignupLink || 
        `https://octavia.ai/signup-institution/${signupToken}`;
      
      // Update the institution document
      await db.collection('institutions').doc(institutionDoc.id).update({
        customSignupToken: signupToken,
        customSignupLink: signupLink,
        partnershipRequestDate: institutionData.partnerRequestDate || admin.firestore.FieldValue.serverTimestamp(),
        approvalStatus: institutionData.approvalStatus || 'approved',
        isActive: institutionData.isActive !== undefined ? institutionData.isActive : true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      console.log(`  ✅ Updated institution with signup token: ${signupToken}`);
      console.log(`  ✅ Updated institution with signup link: ${signupLink}`);
    }
    
    // Step 2: Migrate users to new structure
    console.log('\n=== Migrating Users ===');
    const usersRef = db.collection('users');
    const usersSnapshot = await usersRef.get();
    
    console.log(`Found ${usersSnapshot.size} users to migrate`);
    
    let migratedUsers = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      console.log(`\nMigrating user: ${userData.name} (${userDoc.id}) with role: ${userData.role}`);
      
      // Skip users without institutionId (external users)
      if (!userData.institutionId) {
        // Create in externalUsers collection
        const externalUserData = removeUndefinedValues({
          ...userData,
          authProvider: 'email',
          createdAt: userData.createdAt || admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          lastLogin: userData.lastLoginAt || admin.firestore.FieldValue.serverTimestamp()
        });
        
        await db.collection('externalUsers').doc(userDoc.id).set(externalUserData);
        
        console.log(`  ✅ Migrated external user: ${userData.name}`);
        migratedUsers++;
        continue;
      }
      
      // Get the institution
      const institutionDoc = await db.collection('institutions').doc(userData.institutionId).get();
      if (!institutionDoc.exists) {
        console.log(`  ⚠️  User ${userData.name} has invalid institution ID: ${userData.institutionId}`);
        continue;
      }
      
      // Create appropriate user based on role
      switch (userData.role) {
        case 'institution_admin':
          // Create in institution admins subcollection
          const adminUserData = removeUndefinedValues({
            ...userData,
            createdAt: userData.createdAt || admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            lastLogin: userData.lastLoginAt || admin.firestore.FieldValue.serverTimestamp()
          });
          
          await db.collection('institutions').doc(userData.institutionId).collection('admins').doc(userDoc.id).set(adminUserData);
          console.log(`  ✅ Migrated institution admin: ${userData.name}`);
          migratedUsers++;
          break;
          
        case 'teacher':
          // Create department first
          const departmentName = userData.department || 'Default Department';
          const departmentData = removeUndefinedValues({
            departmentName,
            departmentSignupToken: uuidv4(),
            departmentSignupLink: `https://octavia.ai/signup-institution/${userData.institutionId}?department=${encodeURIComponent(departmentName)}&token=${uuidv4()}`,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: userDoc.id
          });
          
          const departmentDoc = await db.collection('institutions').doc(userData.institutionId).collection('departments').add(departmentData);
          
          // Create teacher in department
          const teacherUserData = removeUndefinedValues({
            ...userData,
            departmentId: departmentDoc.id,
            createdAt: userData.createdAt || admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            lastLogin: userData.lastLoginAt || admin.firestore.FieldValue.serverTimestamp()
          });
          
          await db.collection('institutions').doc(userData.institutionId).collection('departments').doc(departmentDoc.id).collection('teachers').doc(userDoc.id).set(teacherUserData);
          console.log(`  ✅ Migrated teacher: ${userData.name} to department: ${departmentName}`);
          migratedUsers++;
          break;
          
        case 'student':
          // Create department first
          const studentDepartmentName = userData.department || 'Default Department';
          const studentDepartmentData = removeUndefinedValues({
            departmentName: studentDepartmentName,
            departmentSignupToken: uuidv4(),
            departmentSignupLink: `https://octavia.ai/signup-institution/${userData.institutionId}?department=${encodeURIComponent(studentDepartmentName)}&token=${uuidv4()}`,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            createdBy: userDoc.id
          });
          
          const studentDepartmentDoc = await db.collection('institutions').doc(userData.institutionId).collection('departments').add(studentDepartmentData);
          
          // Create student in department
          const studentUserData = removeUndefinedValues({
            ...userData,
            departmentId: studentDepartmentDoc.id,
            yearOfStudy: userData.yearOfStudy || '',
            enrollmentStatus: 'active',
            createdAt: userData.createdAt || admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            lastLogin: userData.lastLoginAt || admin.firestore.FieldValue.serverTimestamp()
          });
          
          await db.collection('institutions').doc(userData.institutionId).collection('departments').doc(studentDepartmentDoc.id).collection('students').doc(userDoc.id).set(studentUserData);
          console.log(`  ✅ Migrated student: ${userData.name} to department: ${studentDepartmentName}`);
          migratedUsers++;
          break;
          
        case 'platform_admin':
          // Create in platformAdmins collection
          const platformAdminUserData = removeUndefinedValues({
            ...userData,
            permissions: [], // Will be set based on role
            createdAt: userData.createdAt || admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          
          await db.collection('platformAdmins').doc(userDoc.id).set(platformAdminUserData);
          console.log(`  ✅ Migrated platform admin: ${userData.name}`);
          migratedUsers++;
          break;
          
        default:
          console.log(`  ⚠️  Unknown role for user ${userData.name}: ${userData.role}`);
      }
    }
    
    console.log(`\n✅ Migration completed! Migrated ${migratedUsers} users.`);
    console.log('✅ Institutions updated with signup tokens and links.');
    console.log('\n📝 Note: The old "users" collection still exists and should be cleaned up after verification.');
    
  } catch (error) {
    console.error('❌ Error during migration:', error);
  } finally {
    // Clean up
    await admin.app().delete();
  }
}

migrateToHierarchicalStructure();