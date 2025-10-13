const admin = require('firebase-admin');
const serviceAccount = require('./functions/service-account-key.json');

// Initialize Firebase Admin SDK with service account credentials
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'octavia-practice-interviewer'
  });
  console.log('Firebase Admin SDK initialized with service account credentials');
}

const db = admin.firestore();

// Test the findUserById method
async function testLogin() {
  try {
    console.log('Testing login flow...');
    
    // The user ID from the previous check
    const userId = 'ySWE4DoE1AYeOFX9QTlUTojaxrU2';
    
    // Simulate the findUserById method
    console.log(`Searching for user with ID: ${userId}`);
    
    // Check platform admins first
    const platformAdminDoc = await db.collection('platformAdmins').doc(userId).get();
    if (platformAdminDoc.exists) {
      console.log('Found as platform admin');
      return;
    }

    // Check external users
    const externalUserDoc = await db.collection('externalUsers').doc(userId).get();
    if (externalUserDoc.exists) {
      console.log('Found as external user');
      return;
    }

    // Check institutions for admins, teachers, and students
    const institutionsRef = db.collection('institutions');
    const institutionsSnapshot = await institutionsRef.get();

    for (const institutionDoc of institutionsSnapshot.docs) {
      const institutionId = institutionDoc.id;
      const institutionData = institutionDoc.data();
      console.log(`Checking institution: ${institutionData.name} (${institutionId})`);
      
      // Check admins subcollection
      const adminDoc = await db.collection('institutions').doc(institutionId).collection('admins').doc(userId).get();
      if (adminDoc.exists) {
        const data = adminDoc.data();
        console.log('Found as institution admin');
        console.log('Admin data:', JSON.stringify(data, null, 2));
        console.log('User profile constructed:', {
          id: adminDoc.id,
          name: data.name,
          email: data.email,
          role: data.role,
          institutionId: data.institutionId,
          institutionDomain: data.institutionDomain,
          emailVerified: data.emailVerified,
          isEmailVerified: data.isEmailVerified,
          sessionCount: data.sessionCount || 0,
          profileCompleted: data.profileCompleted || false,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate() || new Date()
        });
        return;
      }
      
      // Check departments for teachers and students
      const departmentsRef = db.collection('institutions').doc(institutionId).collection('departments');
      const departmentsSnapshot = await departmentsRef.get();
      
      for (const departmentDoc of departmentsSnapshot.docs) {
        const departmentId = departmentDoc.id;
        const departmentData = departmentDoc.data();
        console.log(`  Checking department: ${departmentData.departmentName} (${departmentId})`);
        
        // Check teachers
        const teacherDoc = await db.collection('institutions').doc(institutionId).collection('departments').doc(departmentId).collection('teachers').doc(userId).get();
        if (teacherDoc.exists) {
          console.log('Found as teacher');
          return;
        }
        
        // Check students
        const studentDoc = await db.collection('institutions').doc(institutionId).collection('departments').doc(departmentId).collection('students').doc(userId).get();
        if (studentDoc.exists) {
          console.log('Found as student');
          return;
        }
      }
    }

    console.log('User not found in any collection');
    
  } catch (error) {
    console.error('Error testing login:', error);
  } finally {
    // Clean up
    await admin.app().delete();
  }
}

testLogin();