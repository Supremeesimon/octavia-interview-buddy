// Direct Firebase Admin initialization for counting users
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

async function countAllUsers() {
  try {
    initializeFirebase();
    
    // Get Firestore and Auth instances
    const adminDb = admin.firestore();
    const adminAuth = admin.auth();
    
    console.log('=== Counting All Users in Firestore ===\n');
    
    let totalUsers = 0;
    
    // Count platform admins
    console.log('Counting platform admins...');
    const platformAdminsSnapshot = await adminDb.collection('platformAdmins').get();
    const platformAdminsCount = platformAdminsSnapshot.size;
    console.log(`Platform admins: ${platformAdminsCount}`);
    totalUsers += platformAdminsCount;
    
    // Count external users
    console.log('Counting external users...');
    const externalUsersSnapshot = await adminDb.collection('externalUsers').get();
    const externalUsersCount = externalUsersSnapshot.size;
    console.log(`External users: ${externalUsersCount}`);
    totalUsers += externalUsersCount;
    
    // Count institutional users
    console.log('Counting institutional users...');
    let institutionalUsersCount = 0;
    
    // Get all institutions
    const institutionsSnapshot = await adminDb.collection('institutions').get();
    console.log(`Institutions: ${institutionsSnapshot.size}`);
    
    // For each institution, count admins, teachers, and students
    for (const institutionDoc of institutionsSnapshot.docs) {
      const institutionId = institutionDoc.id;
      console.log(`\nProcessing institution: ${institutionId}`);
      
      // Count institution admins
      try {
        const adminsSnapshot = await adminDb.collection('institutions').doc(institutionId).collection('admins').get();
        console.log(`  Admins: ${adminsSnapshot.size}`);
        institutionalUsersCount += adminsSnapshot.size;
      } catch (error) {
        console.error(`  Error counting admins for institution ${institutionId}:`, error);
      }
      
      // Count departments and their users
      try {
        const departmentsSnapshot = await adminDb.collection('institutions').doc(institutionId).collection('departments').get();
        console.log(`  Departments: ${departmentsSnapshot.size}`);
        
        for (const departmentDoc of departmentsSnapshot.docs) {
          const departmentId = departmentDoc.id;
          
          // Count teachers
          try {
            const teachersSnapshot = await adminDb.collection('institutions').doc(institutionId).collection('departments').doc(departmentId).collection('teachers').get();
            console.log(`    Teachers in ${departmentId}: ${teachersSnapshot.size}`);
            institutionalUsersCount += teachersSnapshot.size;
          } catch (error) {
            console.error(`    Error counting teachers for department ${departmentId}:`, error);
          }
          
          // Count students
          try {
            const studentsSnapshot = await adminDb.collection('institutions').doc(institutionId).collection('departments').doc(departmentId).collection('students').get();
            console.log(`    Students in ${departmentId}: ${studentsSnapshot.size}`);
            institutionalUsersCount += studentsSnapshot.size;
          } catch (error) {
            console.error(`    Error counting students for department ${departmentId}:`, error);
          }
        }
      } catch (error) {
        console.error(`  Error counting departments for institution ${institutionId}:`, error);
      }
    }
    
    console.log(`\nInstitutional users: ${institutionalUsersCount}`);
    totalUsers += institutionalUsersCount;
    
    // Also count Firebase Authentication users (if needed)
    console.log('\nCounting Firebase Authentication users...');
    try {
      // Note: This might be limited by pagination for large numbers of users
      const authUsersResult = await adminAuth.listUsers();
      console.log(`Firebase Auth users: ${authUsersResult.users.length}`);
    } catch (error) {
      console.error('Error counting Firebase Auth users:', error);
      console.log('Skipping Firebase Auth user count due to error');
    }
    
    // Summary
    console.log('\n=== SUMMARY ===');
    console.log(`Platform admins: ${platformAdminsCount}`);
    console.log(`External users: ${externalUsersCount}`);
    console.log(`Institutional users: ${institutionalUsersCount}`);
    console.log(`Total Firestore users: ${totalUsers}`);
    
  } catch (error) {
    console.error('Error counting users:', error);
    process.exit(1);
  }
}

countAllUsers().then(() => {
  console.log('\nUser counting completed successfully');
  
  // Clean up the copied service account key file
  import('fs').then(fs => {
    fs.unlinkSync('./service-account-key.json');
  }).catch(err => {
    console.error('Failed to remove service account key file:', err);
  });
  
  process.exit(0);
}).catch((error) => {
  console.error('Error in user counting script:', error);
  
  // Clean up the copied service account key file
  import('fs').then(fs => {
    fs.unlinkSync('./service-account-key.json');
  }).catch(err => {
    console.error('Failed to remove service account key file:', err);
  });
  
  process.exit(1);
});