const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, getDoc, getDocs, query, where } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB75eY2CRuFQ5DcZc1a8R2R7v7b3f9i3k0",
  authDomain: "octavia-practice-interviewer.firebaseapp.com",
  projectId: "octavia-practice-interviewer",
  storageBucket: "octavia-practice-interviewer.appspot.com",
  messagingSenderId: "647792687865",
  appId: "1:647792687865:web:9d7a0b6c8e7f1a2b3c4d5e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function countAllUsers() {
  try {
    console.log('=== Counting All Users in Database ===\n');
    
    let totalUsers = 0;
    let platformAdminsCount = 0;
    let externalUsersCount = 0;
    let institutionalUsersCount = 0;
    
    // Count platform admins
    console.log('Counting platform admins...');
    const platformAdminsRef = collection(db, 'platformAdmins');
    const platformAdminsSnapshot = await getDocs(platformAdminsRef);
    platformAdminsCount = platformAdminsSnapshot.size;
    console.log(`Platform admins: ${platformAdminsCount}`);
    totalUsers += platformAdminsCount;
    
    // Count external users
    console.log('Counting external users...');
    const externalUsersRef = collection(db, 'externalUsers');
    const externalUsersSnapshot = await getDocs(externalUsersRef);
    externalUsersCount = externalUsersSnapshot.size;
    console.log(`External users: ${externalUsersCount}`);
    totalUsers += externalUsersCount;
    
    // Count institutional users
    console.log('Counting institutional users...');
    
    // Check institutions
    const institutionsRef = collection(db, 'institutions');
    const institutionsSnapshot = await getDocs(institutionsRef);
    
    console.log(`Found ${institutionsSnapshot.size} institutions:`);
    
    for (const institutionDoc of institutionsSnapshot.docs) {
      const institutionData = institutionDoc.data();
      console.log(`\nProcessing institution: ${institutionData.name} (ID: ${institutionDoc.id})`);
      
      // Count admins
      const adminsRef = collection(db, 'institutions', institutionDoc.id, 'admins');
      const adminsSnapshot = await getDocs(adminsRef);
      const adminsCount = adminsSnapshot.size;
      console.log(`  Admins: ${adminsCount}`);
      institutionalUsersCount += adminsCount;
      
      // Count departments and their users
      const departmentsRef = collection(db, 'institutions', institutionDoc.id, 'departments');
      const departmentsSnapshot = await getDocs(departmentsRef);
      console.log(`  Departments: ${departmentsSnapshot.size}`);
      
      for (const departmentDoc of departmentsSnapshot.docs) {
        const departmentData = departmentDoc.data();
        console.log(`    Department: ${departmentData.departmentName} (ID: ${departmentDoc.id})`);
        
        // Count teachers
        const teachersRef = collection(db, 'institutions', institutionDoc.id, 'departments', departmentDoc.id, 'teachers');
        const teachersSnapshot = await getDocs(teachersRef);
        const teachersCount = teachersSnapshot.size;
        console.log(`      Teachers: ${teachersCount}`);
        institutionalUsersCount += teachersCount;
        
        // Count students
        const studentsRef = collection(db, 'institutions', institutionDoc.id, 'departments', departmentDoc.id, 'students');
        const studentsSnapshot = await getDocs(studentsRef);
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
  }
}

countAllUsers();