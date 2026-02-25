const { initializeApp, getApp, getApps } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'your_firebase_api_key_here',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'octavia-practice-interviewer.firebaseapp.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'octavia-practice-interviewer',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'octavia-practice-interviewer.firebasestorage.app',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'your_messaging_sender_id',
  appId: process.env.VITE_FIREBASE_APP_ID || 'your_firebase_app_id',
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || 'your_measurement_id'
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Firestore
const db = getFirestore(app);

async function checkUserRoles() {
  try {
    console.log('=== Checking User Roles in Firebase ===\n');
    
    // Check supremeesimon@gmail.com
    console.log('Checking supremeesimon@gmail.com:');
    
    // Check platformAdmins collection
    try {
      const platformAdminsCol = collection(db, 'platformAdmins');
      const platformAdminsQuery = query(platformAdminsCol, where('email', '==', 'supremeesimon@gmail.com'));
      const platformAdminsSnapshot = await getDocs(platformAdminsQuery);
      
      if (!platformAdminsSnapshot.empty) {
        platformAdminsSnapshot.forEach((doc) => {
          const data = doc.data();
          console.log(`  ✓ FOUND in platformAdmins collection`);
          console.log(`    ID: ${doc.id}`);
          console.log(`    Name: ${data.name || 'N/A'}`);
          console.log(`    Email: ${data.email}`);
          console.log(`    Role: ${data.role || 'N/A'}`);
          console.log(`    Created At: ${data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt || 'N/A'}`);
        });
      } else {
        console.log(`  ✗ NOT FOUND in platformAdmins collection`);
      }
    } catch (error) {
      console.log(`  ✗ Error checking platformAdmins: ${error.message}`);
    }
    
    // Check octavia.intelligence@gmail.com
    console.log('\nChecking octavia.intelligence@gmail.com:');
    
    // Check externalUsers collection
    try {
      const externalUsersCol = collection(db, 'externalUsers');
      const externalUsersQuery = query(externalUsersCol, where('email', '==', 'octavia.intelligence@gmail.com'));
      const externalUsersSnapshot = await getDocs(externalUsersQuery);
      
      if (!externalUsersSnapshot.empty) {
        externalUsersSnapshot.forEach((doc) => {
          const data = doc.data();
          console.log(`  ✓ FOUND in externalUsers collection`);
          console.log(`    ID: ${doc.id}`);
          console.log(`    Name: ${data.name || 'N/A'}`);
          console.log(`    Email: ${data.email}`);
          console.log(`    Role: ${data.role || 'N/A'}`);
          console.log(`    Created At: ${data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt || 'N/A'}`);
        });
      } else {
        console.log(`  ✗ NOT FOUND in externalUsers collection`);
      }
    } catch (error) {
      console.log(`  ✗ Error checking externalUsers: ${error.message}`);
    }
    
    // Check institutions for octavia.intelligence@gmail.com
    console.log('\nChecking institutions for octavia.intelligence@gmail.com:');
    
    try {
      const institutionsCol = collection(db, 'institutions');
      const institutionsSnapshot = await getDocs(institutionsCol);
      
      for (const institutionDoc of institutionsSnapshot.docs) {
        const institutionData = institutionDoc.data();
        console.log(`\nInstitution: ${institutionData.name} (${institutionDoc.id})`);
        
        // Check admins subcollection
        try {
          const adminsCol = collection(db, 'institutions', institutionDoc.id, 'admins');
          const adminsQuery = query(adminsCol, where('email', '==', 'octavia.intelligence@gmail.com'));
          const adminsSnapshot = await getDocs(adminsQuery);
          
          if (!adminsSnapshot.empty) {
            adminsSnapshot.forEach((adminDoc) => {
              const adminData = adminDoc.data();
              console.log(`  ✓ FOUND as institution admin`);
              console.log(`    ID: ${adminDoc.id}`);
              console.log(`    Name: ${adminData.name || 'N/A'}`);
              console.log(`    Email: ${adminData.email}`);
              console.log(`    Role: ${adminData.role || 'N/A'}`);
            });
          }
        } catch (error) {
          console.log(`  ✗ Error checking institution admins: ${error.message}`);
        }
        
        // Check departments for teachers/students
        try {
          const departmentsCol = collection(db, 'institutions', institutionDoc.id, 'departments');
          const departmentsSnapshot = await getDocs(departmentsCol);
          
          for (const deptDoc of departmentsSnapshot.docs) {
            const deptData = deptDoc.data();
            console.log(`  Department: ${deptData.name} (${deptDoc.id})`);
            
            // Check teachers
            try {
              const teachersCol = collection(db, 'institutions', institutionDoc.id, 'departments', deptDoc.id, 'teachers');
              const teachersQuery = query(teachersCol, where('email', '==', 'octavia.intelligence@gmail.com'));
              const teachersSnapshot = await getDocs(teachersQuery);
              
              if (!teachersSnapshot.empty) {
                teachersSnapshot.forEach((teacherDoc) => {
                  const teacherData = teacherDoc.data();
                  console.log(`    ✓ FOUND as teacher`);
                  console.log(`      ID: ${teacherDoc.id}`);
                  console.log(`      Name: ${teacherData.name || 'N/A'}`);
                  console.log(`      Email: ${teacherData.email}`);
                  console.log(`      Role: ${teacherData.role || 'N/A'}`);
                });
              }
            } catch (error) {
              console.log(`    ✗ Error checking teachers: ${error.message}`);
            }
            
            // Check students
            try {
              const studentsCol = collection(db, 'institutions', institutionDoc.id, 'departments', deptDoc.id, 'students');
              const studentsQuery = query(studentsCol, where('email', '==', 'octavia.intelligence@gmail.com'));
              const studentsSnapshot = await getDocs(studentsQuery);
              
              if (!studentsSnapshot.empty) {
                studentsSnapshot.forEach((studentDoc) => {
                  const studentData = studentDoc.data();
                  console.log(`    ✓ FOUND as student`);
                  console.log(`      ID: ${studentDoc.id}`);
                  console.log(`      Name: ${studentData.name || 'N/A'}`);
                  console.log(`      Email: ${studentData.email}`);
                  console.log(`      Role: ${studentData.role || 'N/A'}`);
                });
              }
            } catch (error) {
              console.log(`    ✗ Error checking students: ${error.message}`);
            }
          }
        } catch (error) {
          console.log(`  ✗ Error checking departments: ${error.message}`);
        }
      }
    } catch (error) {
      console.log(`✗ Error checking institutions: ${error.message}`);
    }
    
    console.log('\n=== User Role Check Complete ===');
    
  } catch (error) {
    console.error('Error checking user roles:', error.message);
    console.error('Error stack:', error.stack);
  }
}

// Run the function
checkUserRoles();