// Script to retrieve user details from Firestore
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

async function getUserDetails() {
  try {
    initializeFirebase();
    
    // Get Firestore instance
    const adminDb = admin.firestore();
    
    console.log('=== Retrieving User Details from Firestore ===\n');
    
    // Get platform admins
    console.log('Platform Admins:');
    const platformAdminsSnapshot = await adminDb.collection('platformAdmins').get();
    platformAdminsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`  ID: ${doc.id}`);
      console.log(`  Name: ${data.name || 'N/A'}`);
      console.log(`  Email: ${data.email || 'N/A'}`);
      console.log(`  Role: ${data.role || 'N/A'}`);
      console.log(`  Created At: ${data.createdAt?.toDate?.() || data.createdAt || 'N/A'}\n`);
    });
    
    // Get external users
    console.log('External Users:');
    const externalUsersSnapshot = await adminDb.collection('externalUsers').get();
    if (externalUsersSnapshot.empty) {
      console.log('  No external users found\n');
    } else {
      externalUsersSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`  ID: ${doc.id}`);
        console.log(`  Name: ${data.name || 'N/A'}`);
        console.log(`  Email: ${data.email || 'N/A'}`);
        console.log(`  Role: ${data.role || 'N/A'}`);
        console.log(`  Auth Provider: ${data.authProvider || 'N/A'}`);
        console.log(`  Created At: ${data.createdAt?.toDate?.() || data.createdAt || 'N/A'}\n`);
      });
    }
    
    // Get institutional users
    console.log('Institutional Users:');
    const institutionsSnapshot = await adminDb.collection('institutions').get();
    
    for (const institutionDoc of institutionsSnapshot.docs) {
      const institutionId = institutionDoc.id;
      const institutionData = institutionDoc.data();
      console.log(`\nInstitution: ${institutionData.name || institutionId}`);
      
      // Get institution admins
      try {
        const adminsSnapshot = await adminDb.collection('institutions').doc(institutionId).collection('admins').get();
        if (!adminsSnapshot.empty) {
          console.log('  Admins:');
          adminsSnapshot.forEach((doc) => {
            const data = doc.data();
            console.log(`    ID: ${doc.id}`);
            console.log(`    Name: ${data.name || 'N/A'}`);
            console.log(`    Email: ${data.email || 'N/A'}`);
            console.log(`    Role: ${data.role || 'N/A'}`);
            console.log(`    Created At: ${data.createdAt?.toDate?.() || data.createdAt || 'N/A'}\n`);
          });
        }
      } catch (error) {
        console.error(`  Error retrieving admins for institution ${institutionId}:`, error);
      }
      
      // Get departments and their users
      try {
        const departmentsSnapshot = await adminDb.collection('institutions').doc(institutionId).collection('departments').get();
        
        for (const departmentDoc of departmentsSnapshot.docs) {
          const departmentId = departmentDoc.id;
          const departmentData = departmentDoc.data();
          console.log(`  Department: ${departmentData.departmentName || departmentId}`);
          
          // Get teachers
          try {
            const teachersSnapshot = await adminDb.collection('institutions').doc(institutionId).collection('departments').doc(departmentId).collection('teachers').get();
            if (!teachersSnapshot.empty) {
              console.log('    Teachers:');
              teachersSnapshot.forEach((doc) => {
                const data = doc.data();
                console.log(`      ID: ${doc.id}`);
                console.log(`      Name: ${data.name || 'N/A'}`);
                console.log(`      Email: ${data.email || 'N/A'}`);
                console.log(`      Role: ${data.role || 'N/A'}`);
                console.log(`      Auth Provider: ${data.authProvider || 'N/A'}`);
                console.log(`      Created At: ${data.createdAt?.toDate?.() || data.createdAt || 'N/A'}\n`);
              });
            }
          } catch (error) {
            console.error(`    Error retrieving teachers for department ${departmentId}:`, error);
          }
          
          // Get students
          try {
            const studentsSnapshot = await adminDb.collection('institutions').doc(institutionId).collection('departments').doc(departmentId).collection('students').get();
            if (!studentsSnapshot.empty) {
              console.log('    Students:');
              studentsSnapshot.forEach((doc) => {
                const data = doc.data();
                console.log(`      ID: ${doc.id}`);
                console.log(`      Name: ${data.name || 'N/A'}`);
                console.log(`      Email: ${data.email || 'N/A'}`);
                console.log(`      Role: ${data.role || 'N/A'}`);
                console.log(`      Auth Provider: ${data.authProvider || 'N/A'}`);
                console.log(`      Created At: ${data.createdAt?.toDate?.() || data.createdAt || 'N/A'}\n`);
              });
            }
          } catch (error) {
            console.error(`    Error retrieving students for department ${departmentId}:`, error);
          }
        }
      } catch (error) {
        console.error(`  Error retrieving departments for institution ${institutionId}:`, error);
      }
    }
    
  } catch (error) {
    console.error('Error retrieving user details:', error);
    process.exit(1);
  }
}

getUserDetails().then(() => {
  console.log('User details retrieval completed successfully');
  
  // Clean up the copied service account key file
  import('fs').then(fs => {
    fs.unlinkSync('./service-account-key.json');
  }).catch(err => {
    console.error('Failed to remove service account key file:', err);
  });
  
  process.exit(0);
}).catch((error) => {
  console.error('Error in user details script:', error);
  
  // Clean up the copied service account key file
  import('fs').then(fs => {
    fs.unlinkSync('./service-account-key.json');
  }).catch(err => {
    console.error('Failed to remove service account key file:', err);
  });
  
  process.exit(1);
});