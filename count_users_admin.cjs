const admin = require('firebase-admin');
const serviceAccount = require('./src/service-account-key.json');

// Initialize Firebase Admin with service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'octavia-practice-interviewer',
  storageBucket: 'octavia-practice-interviewer.appspot.com'
});

const db = admin.firestore();

async function countAllUsers() {
  try {
    console.log('=== Counting All Users in Database (Admin SDK) ===\n');
    
    let totalUsers = 0;
    let platformAdminsCount = 0;
    let externalUsersCount = 0;
    let institutionalUsersCount = 0;
    
    // Count platform admins
    console.log('Counting platform admins...');
    const platformAdminsSnapshot = await db.collection('platformAdmins').get();
    platformAdminsCount = platformAdminsSnapshot.size;
    console.log(`Platform admins: ${platformAdminsCount}`);
    totalUsers += platformAdminsCount;
    
    // Count external users
    console.log('Counting external users...');
    const externalUsersSnapshot = await db.collection('externalUsers').get();
    externalUsersCount = externalUsersSnapshot.size;
    console.log(`External users: ${externalUsersCount}`);
    totalUsers += externalUsersCount;
    
    // Count institutional users
    console.log('Counting institutional users...');
    
    // Check institutions
    const institutionsSnapshot = await db.collection('institutions').get();
    
    console.log(`Found ${institutionsSnapshot.size} institutions:`);
    
    for (const institutionDoc of institutionsSnapshot.docs) {
      const institutionData = institutionDoc.data();
      console.log(`\nProcessing institution: ${institutionData.name || 'Unnamed'} (ID: ${institutionDoc.id})`);
      
      // Count admins
      const adminsSnapshot = await db.collection('institutions').doc(institutionDoc.id).collection('admins').get();
      const adminsCount = adminsSnapshot.size;
      console.log(`  Admins: ${adminsCount}`);
      institutionalUsersCount += adminsCount;
      
      // Count departments and their users
      const departmentsSnapshot = await db.collection('institutions').doc(institutionDoc.id).collection('departments').get();
      console.log(`  Departments: ${departmentsSnapshot.size}`);
      
      for (const departmentDoc of departmentsSnapshot.docs) {
        const departmentData = departmentDoc.data();
        console.log(`    Department: ${departmentData.departmentName || 'Unnamed'} (ID: ${departmentDoc.id})`);
        
        // Count teachers
        const teachersSnapshot = await db.collection('institutions').doc(institutionDoc.id).collection('departments').doc(departmentDoc.id).collection('teachers').get();
        const teachersCount = teachersSnapshot.size;
        console.log(`      Teachers: ${teachersCount}`);
        institutionalUsersCount += teachersCount;
        
        // Count students
        const studentsSnapshot = await db.collection('institutions').doc(institutionDoc.id).collection('departments').doc(departmentDoc.id).collection('students').get();
        const studentsCount = studentsSnapshot.size;
        console.log(`      Students: ${studentsCount}`);
        institutionalUsersCount += studentsCount;
      }
    }
    
    console.log(`\nInstitutional users total: ${institutionalUsersCount}`);
    totalUsers += institutionalUsersCount;
    
    // Summary
    console.log('\n=== SUMMARY ===');
    console.log(`Platform admins: ${platformAdminsCount}`);
    console.log(`External users: ${externalUsersCount}`);
    console.log(`Institutional users: ${institutionalUsersCount}`);
    console.log(`Total users in database: ${totalUsers}`);
    
  } catch (error) {
    console.error('Error counting users:', error);
  } finally {
    // Clean up
    await admin.app().delete();
  }
}

countAllUsers();