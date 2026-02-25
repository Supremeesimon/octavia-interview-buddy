// Script to check specific user roles in Firebase
import admin from 'firebase-admin';
import serviceAccount from './service-account-key.json' assert { type: 'json' };

// Initialize Firebase Admin
function initializeFirebase() {
  if (!admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'octavia-practice-interviewer.appspot.com',
      });
      console.log('Initialized Firebase Admin with service account key');
    } catch (error) {
      console.error('Failed to initialize Firebase Admin with service account:', error);
      process.exit(1);
    }
  }
}

async function checkUserRoles() {
  try {
    initializeFirebase();
    
    // Get Firestore instance
    const adminDb = admin.firestore();
    
    console.log('=== Checking User Roles in Firebase ===\n');
    
    // Check supremeesimon@gmail.com
    console.log('Checking supremeesimon@gmail.com:');
    const platformAdminsSnapshot = await adminDb.collection('platformAdmins').get();
    let foundPlatformAdmin = false;
    
    platformAdminsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.email === 'supremeesimon@gmail.com') {
        console.log(`  ✓ FOUND in platformAdmins collection`);
        console.log(`    ID: ${doc.id}`);
        console.log(`    Name: ${data.name || 'N/A'}`);
        console.log(`    Email: ${data.email}`);
        console.log(`    Role: ${data.role || 'N/A'}`);
        console.log(`    Created At: ${data.createdAt?.toDate() || 'N/A'}`);
        foundPlatformAdmin = true;
      }
    });
    
    if (!foundPlatformAdmin) {
      console.log(`  ✗ NOT FOUND in platformAdmins collection`);
    }
    
    // Check octavia.intelligence@gmail.com
    console.log('\nChecking octavia.intelligence@gmail.com:');
    
    // Check external users collection
    const externalUsersSnapshot = await adminDb.collection('externalUsers').get();
    let foundExternalUser = false;
    
    externalUsersSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.email === 'octavia.intelligence@gmail.com') {
        console.log(`  ✓ FOUND in externalUsers collection`);
        console.log(`    ID: ${doc.id}`);
        console.log(`    Name: ${data.name || 'N/A'}`);
        console.log(`    Email: ${data.email}`);
        console.log(`    Role: ${data.role || 'N/A'}`);
        console.log(`    Created At: ${data.createdAt?.toDate() || 'N/A'}`);
        foundExternalUser = true;
      }
    });
    
    if (!foundExternalUser) {
      console.log(`  ✗ NOT FOUND in externalUsers collection`);
    }
    
    // Check institutions for this user
    console.log('\nChecking institutions for octavia.intelligence@gmail.com:');
    const institutionsSnapshot = await adminDb.collection('institutions').get();
    
    for (const institutionDoc of institutionsSnapshot.docs) {
      const institutionData = institutionDoc.data();
      console.log(`\nInstitution: ${institutionData.name} (${institutionDoc.id})`);
      
      // Check admins subcollection
      const adminsSnapshot = await adminDb
        .collection('institutions')
        .doc(institutionDoc.id)
        .collection('admins')
        .get();
      
      adminsSnapshot.forEach((adminDoc) => {
        const adminData = adminDoc.data();
        if (adminData.email === 'octavia.intelligence@gmail.com') {
          console.log(`  ✓ FOUND as institution admin`);
          console.log(`    ID: ${adminDoc.id}`);
          console.log(`    Name: ${adminData.name || 'N/A'}`);
          console.log(`    Email: ${adminData.email}`);
          console.log(`    Role: ${adminData.role || 'N/A'}`);
        }
      });
      
      // Check departments for teachers/students
      const departmentsSnapshot = await adminDb
        .collection('institutions')
        .doc(institutionDoc.id)
        .collection('departments')
        .get();
      
      for (const deptDoc of departmentsSnapshot.docs) {
        const deptData = deptDoc.data();
        console.log(`  Department: ${deptData.name} (${deptDoc.id})`);
        
        // Check teachers
        const teachersSnapshot = await adminDb
          .collection('institutions')
          .doc(institutionDoc.id)
          .collection('departments')
          .doc(deptDoc.id)
          .collection('teachers')
          .get();
        
        teachersSnapshot.forEach((teacherDoc) => {
          const teacherData = teacherDoc.data();
          if (teacherData.email === 'octavia.intelligence@gmail.com') {
            console.log(`    ✓ FOUND as teacher`);
            console.log(`      ID: ${teacherDoc.id}`);
            console.log(`      Name: ${teacherData.name || 'N/A'}`);
            console.log(`      Email: ${teacherData.email}`);
            console.log(`      Role: ${teacherData.role || 'N/A'}`);
          }
        });
        
        // Check students
        const studentsSnapshot = await adminDb
          .collection('institutions')
          .doc(institutionDoc.id)
          .collection('departments')
          .doc(deptDoc.id)
          .collection('students')
          .get();
        
        studentsSnapshot.forEach((studentDoc) => {
          const studentData = studentDoc.data();
          if (studentData.email === 'octavia.intelligence@gmail.com') {
            console.log(`    ✓ FOUND as student`);
            console.log(`      ID: ${studentDoc.id}`);
            console.log(`      Name: ${studentData.name || 'N/A'}`);
            console.log(`      Email: ${studentData.email}`);
            console.log(`      Role: ${studentData.role || 'N/A'}`);
          }
        });
      }
    }
    
    console.log('\n=== User Role Check Complete ===');
    
  } catch (error) {
    console.error('Error checking user roles:', error);
  }
}

// Run the script
checkUserRoles();