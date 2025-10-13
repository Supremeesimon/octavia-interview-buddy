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

async function testRoleAssignments() {
  try {
    console.log('🔍 Testing role assignments and access control...');
    
    // Test 1: Check platform admins
    console.log('\n=== Testing Platform Admins ===');
    const platformAdminsRef = collection(db, 'platformAdmins');
    const platformAdminsSnapshot = await getDocs(platformAdminsRef);
    console.log(`Found ${platformAdminsSnapshot.size} platform admins`);
    
    for (const adminDoc of platformAdminsSnapshot.docs) {
      const adminData = adminDoc.data();
      console.log(`\nPlatform Admin: ${adminData.name} (${adminDoc.id})`);
      console.log(`  Email: ${adminData.email}`);
      console.log(`  Role: ${adminData.role}`);
      
      if (adminData.role === 'platform_admin') {
        console.log(`  ✅ Correct role assignment`);
      } else {
        console.log(`  ❌ Incorrect role assignment: expected 'platform_admin', got '${adminData.role}'`);
      }
    }
    
    // Test 2: Check external users
    console.log('\n=== Testing External Users ===');
    const externalUsersRef = collection(db, 'externalUsers');
    const externalUsersSnapshot = await getDocs(externalUsersRef);
    console.log(`Found ${externalUsersSnapshot.size} external users`);
    
    for (const userDoc of externalUsersSnapshot.docs) {
      const userData = userDoc.data();
      console.log(`\nExternal User: ${userData.name} (${userDoc.id})`);
      console.log(`  Email: ${userData.email}`);
      console.log(`  Role: ${userData.role}`);
      
      // External users should be students
      if (userData.role === 'student') {
        console.log(`  ✅ Correct role assignment`);
      } else {
        console.log(`  ❌ Incorrect role assignment: expected 'student', got '${userData.role}'`);
      }
    }
    
    // Test 3: Check institutional users
    console.log('\n=== Testing Institutional Users ===');
    const institutionsRef = collection(db, 'institutions');
    const institutionsSnapshot = await getDocs(institutionsRef);
    console.log(`Found ${institutionsSnapshot.size} institutions`);
    
    for (const institutionDoc of institutionsSnapshot.docs) {
      const institutionData = institutionDoc.data();
      console.log(`\nInstitution: ${institutionData.name} (${institutionDoc.id})`);
      
      // Check admins
      console.log(`\n  --- Testing Admins ---`);
      const adminsRef = collection(doc(db, 'institutions', institutionDoc.id), 'admins');
      const adminsSnapshot = await getDocs(adminsRef);
      console.log(`  Found ${adminsSnapshot.size} admins`);
      
      for (const adminDoc of adminsSnapshot.docs) {
        const adminData = adminDoc.data();
        console.log(`\n    Admin: ${adminData.name} (${adminDoc.id})`);
        console.log(`      Email: ${adminData.email}`);
        console.log(`      Role: ${adminData.role}`);
        
        if (adminData.role === 'institution_admin') {
          console.log(`      ✅ Correct role assignment`);
        } else {
          console.log(`      ❌ Incorrect role assignment: expected 'institution_admin', got '${adminData.role}'`);
        }
      }
      
      // Check departments
      const departmentsRef = collection(doc(db, 'institutions', institutionDoc.id), 'departments');
      const departmentsSnapshot = await getDocs(departmentsRef);
      console.log(`\n  --- Testing Departments (${departmentsSnapshot.size} found) ---`);
      
      for (const departmentDoc of departmentsSnapshot.docs) {
        const departmentData = departmentDoc.data();
        console.log(`\n    Department: ${departmentData.departmentName} (${departmentDoc.id})`);
        
        // Check teachers
        console.log(`\n    ----- Testing Teachers -----`);
        const teachersRef = collection(doc(db, 'institutions', institutionDoc.id, 'departments', departmentDoc.id), 'teachers');
        const teachersSnapshot = await getDocs(teachersRef);
        console.log(`    Found ${teachersSnapshot.size} teachers`);
        
        for (const teacherDoc of teachersSnapshot.docs) {
          const teacherData = teacherDoc.data();
          console.log(`\n      Teacher: ${teacherData.name} (${teacherDoc.id})`);
          console.log(`        Email: ${teacherData.email}`);
          console.log(`        Role: ${teacherData.role}`);
          
          if (teacherData.role === 'teacher' || teacherData.role === 'institution_admin') {
            console.log(`        ✅ Correct role assignment`);
          } else {
            console.log(`        ❌ Incorrect role assignment: expected 'teacher' or 'institution_admin', got '${teacherData.role}'`);
          }
        }
        
        // Check students
        console.log(`\n    ----- Testing Students -----`);
        const studentsRef = collection(doc(db, 'institutions', institutionDoc.id, 'departments', departmentDoc.id), 'students');
        const studentsSnapshot = await getDocs(studentsRef);
        console.log(`    Found ${studentsSnapshot.size} students`);
        
        for (const studentDoc of studentsSnapshot.docs) {
          const studentData = studentDoc.data();
          console.log(`\n      Student: ${studentData.name} (${studentDoc.id})`);
          console.log(`        Email: ${studentData.email}`);
          console.log(`        Role: ${studentData.role}`);
          
          if (studentData.role === 'student') {
            console.log(`        ✅ Correct role assignment`);
          } else {
            console.log(`        ❌ Incorrect role assignment: expected 'student', got '${studentData.role}'`);
          }
        }
      }
    }
    
    console.log('\n✅ Role assignment test completed!');
    
  } catch (error) {
    console.error('❌ Error during role assignment test:', error);
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

testRoleAssignments();