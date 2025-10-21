const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin SDK
const serviceAccountPath = path.join(__dirname, 'functions/service-account-key.json');
if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  admin.initializeApp();
}

const db = admin.firestore();

async function checkUser(userId) {
  console.log(`Checking user with ID: ${userId}`);
  
  // Check platform admins
  try {
    const platformAdminDoc = await db.collection('platformAdmins').doc(userId).get();
    if (platformAdminDoc.exists) {
      console.log('User found in platformAdmins collection');
      console.log('Data:', platformAdminDoc.data());
      return;
    }
  } catch (error) {
    console.log('Error checking platformAdmins:', error.message);
  }
  
  // Check external users
  try {
    const externalUserDoc = await db.collection('externalUsers').doc(userId).get();
    if (externalUserDoc.exists) {
      console.log('User found in externalUsers collection');
      console.log('Data:', externalUserDoc.data());
      return;
    }
  } catch (error) {
    console.log('Error checking externalUsers:', error.message);
  }
  
  // Check institutions
  try {
    const institutionsSnapshot = await db.collection('institutions').get();
    console.log(`Found ${institutionsSnapshot.size} institutions`);
    
    for (const institutionDoc of institutionsSnapshot.docs) {
      const institutionId = institutionDoc.id;
      console.log(`Checking institution: ${institutionId}`);
      
      // Check admins
      try {
        const adminDoc = await db.collection('institutions').doc(institutionId).collection('admins').doc(userId).get();
        if (adminDoc.exists) {
          console.log(`User found as admin in institution: ${institutionId}`);
          console.log('Data:', adminDoc.data());
          return;
        }
      } catch (error) {
        console.log(`Error checking admins for institution ${institutionId}:`, error.message);
      }
      
      // Check departments
      try {
        const departmentsSnapshot = await db.collection('institutions').doc(institutionId).collection('departments').get();
        console.log(`Found ${departmentsSnapshot.size} departments in institution ${institutionId}`);
        
        for (const departmentDoc of departmentsSnapshot.docs) {
          const departmentId = departmentDoc.id;
          console.log(`Checking department: ${departmentId}`);
          
          // Check teachers
          try {
            const teacherDoc = await db.collection('institutions').doc(institutionId).collection('departments').doc(departmentId).collection('teachers').doc(userId).get();
            if (teacherDoc.exists) {
              console.log(`User found as teacher in department ${departmentId} of institution ${institutionId}`);
              console.log('Data:', teacherDoc.data());
              return;
            }
          } catch (error) {
            console.log(`Error checking teachers for department ${departmentId}:`, error.message);
          }
          
          // Check students
          try {
            const studentDoc = await db.collection('institutions').doc(institutionId).collection('departments').doc(departmentId).collection('students').doc(userId).get();
            if (studentDoc.exists) {
              console.log(`User found as student in department ${departmentId} of institution ${institutionId}`);
              console.log('Data:', studentDoc.data());
              return;
            }
          } catch (error) {
            console.log(`Error checking students for department ${departmentId}:`, error.message);
          }
        }
      } catch (error) {
        console.log(`Error checking departments for institution ${institutionId}:`, error.message);
      }
    }
  } catch (error) {
    console.log('Error checking institutions:', error.message);
  }
  
  console.log('User not found in any collection');
}

// Get user ID from command line arguments
const userId = process.argv[2];
if (!userId) {
  console.log('Usage: node check-user-role.js <user-id>');
  console.log('Please provide a user ID to check.');
  process.exit(1);
}

checkUser(userId).then(() => {
  console.log('Check complete');
  process.exit(0);
}).catch(error => {
  console.error('Error:', error);
  process.exit(1);
});