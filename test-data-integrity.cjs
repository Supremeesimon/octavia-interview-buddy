const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc } = require('firebase/firestore');

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyCn847Eo_wh90MCJWYwW7K01rihUl8h2-Q",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "octavia-practice-interviewer.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "octavia-practice-interviewer",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "octavia-practice-interviewer.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "475685845155",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:475685845155:web:ff55f944f48fc987bae716",
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || "G-YYHF1TW9MM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testDataIntegrity() {
  try {
    console.log('🔍 Testing data integrity and relationships...');
    
    // Test 1: Check institutions collection
    console.log('\n=== Testing Institutions Collection ===');
    const institutionsRef = collection(db, 'institutions');
    const institutionsSnapshot = await getDocs(institutionsRef);
    console.log(`Found ${institutionsSnapshot.size} institutions`);
    
    for (const institutionDoc of institutionsSnapshot.docs) {
      const institutionData = institutionDoc.data();
      console.log(`\nInstitution: ${institutionData.name} (${institutionDoc.id})`);
      console.log(`  Domain: ${institutionData.domain}`);
      console.log(`  Signup Token: ${institutionData.customSignupToken}`);
      console.log(`  Signup Link: ${institutionData.customSignupLink}`);
      
      // Test 2: Check admins subcollection
      console.log('\n  --- Testing Admins Subcollection ---');
      const adminsRef = collection(doc(db, 'institutions', institutionDoc.id), 'admins');
      const adminsSnapshot = await getDocs(adminsRef);
      console.log(`  Found ${adminsSnapshot.size} admins`);
      
      for (const adminDoc of adminsSnapshot.docs) {
        const adminData = adminDoc.data();
        console.log(`    Admin: ${adminData.name} (${adminDoc.id})`);
        console.log(`      Email: ${adminData.email}`);
      }
      
      // Test 3: Check departments subcollection
      console.log('\n  --- Testing Departments Subcollection ---');
      const departmentsRef = collection(doc(db, 'institutions', institutionDoc.id), 'departments');
      const departmentsSnapshot = await getDocs(departmentsRef);
      console.log(`  Found ${departmentsSnapshot.size} departments`);
      
      for (const departmentDoc of departmentsSnapshot.docs) {
        const departmentData = departmentDoc.data();
        console.log(`    Department: ${departmentData.departmentName} (${departmentDoc.id})`);
        console.log(`      Signup Token: ${departmentData.departmentSignupToken}`);
        console.log(`      Signup Link: ${departmentData.departmentSignupLink}`);
        
        // Test 4: Check teachers subcollection
        console.log('\n      ----- Testing Teachers Subcollection -----');
        const teachersRef = collection(doc(db, 'institutions', institutionDoc.id, 'departments', departmentDoc.id), 'teachers');
        const teachersSnapshot = await getDocs(teachersRef);
        console.log(`      Found ${teachersSnapshot.size} teachers`);
        
        for (const teacherDoc of teachersSnapshot.docs) {
          const teacherData = teacherDoc.data();
          console.log(`        Teacher: ${teacherData.name} (${teacherDoc.id})`);
          console.log(`          Email: ${teacherData.email}`);
          console.log(`          Department ID: ${teacherData.departmentId}`);
        }
        
        // Test 5: Check students subcollection
        console.log('\n      ----- Testing Students Subcollection -----');
        const studentsRef = collection(doc(db, 'institutions', institutionDoc.id, 'departments', departmentDoc.id), 'students');
        const studentsSnapshot = await getDocs(studentsRef);
        console.log(`      Found ${studentsSnapshot.size} students`);
        
        for (const studentDoc of studentsSnapshot.docs) {
          const studentData = studentDoc.data();
          console.log(`        Student: ${studentData.name} (${studentDoc.id})`);
          console.log(`          Email: ${studentData.email}`);
          console.log(`          Department ID: ${studentData.departmentId}`);
          console.log(`          Teacher ID: ${studentData.teacherId || 'Not assigned'}`);
        }
      }
    }
    
    // Test 6: Check external users collection
    console.log('\n=== Testing External Users Collection ===');
    const externalUsersRef = collection(db, 'externalUsers');
    const externalUsersSnapshot = await getDocs(externalUsersRef);
    console.log(`Found ${externalUsersSnapshot.size} external users`);
    
    for (const externalUserDoc of externalUsersSnapshot.docs) {
      const userData = externalUserDoc.data();
      console.log(`\nExternal User: ${userData.name} (${externalUserDoc.id})`);
      console.log(`  Email: ${userData.email}`);
      console.log(`  Role: ${userData.role}`);
    }
    
    // Test 7: Check platform admins collection
    console.log('\n=== Testing Platform Admins Collection ===');
    const platformAdminsRef = collection(db, 'platformAdmins');
    const platformAdminsSnapshot = await getDocs(platformAdminsRef);
    console.log(`Found ${platformAdminsSnapshot.size} platform admins`);
    
    for (const adminDoc of platformAdminsSnapshot.docs) {
      const userData = adminDoc.data();
      console.log(`\nPlatform Admin: ${userData.name} (${adminDoc.id})`);
      console.log(`  Email: ${userData.email}`);
    }
    
    console.log('\n✅ Data integrity test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during data integrity test:', error);
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

testDataIntegrity();