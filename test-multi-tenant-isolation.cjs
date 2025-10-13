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

async function testMultiTenantIsolation() {
  try {
    console.log('🔍 Testing multi-tenant data isolation...');
    
    // Get all institutions
    const institutionsRef = collection(db, 'institutions');
    const institutionsSnapshot = await getDocs(institutionsRef);
    
    if (institutionsSnapshot.empty) {
      console.log('❌ No institutions found to test isolation');
      return;
    }
    
    console.log(`\n=== Testing Isolation Between ${institutionsSnapshot.size} Institutions ===`);
    
    const institutions = [];
    for (const institutionDoc of institutionsSnapshot.docs) {
      const institutionData = institutionDoc.data();
      institutions.push({
        id: institutionDoc.id,
        name: institutionData.name,
        domain: institutionData.domain
      });
    }
    
    // Test isolation between institutions
    for (let i = 0; i < institutions.length; i++) {
      const institution1 = institutions[i];
      console.log(`\nInstitution ${i + 1}: ${institution1.name} (${institution1.id})`);
      
      // Get departments for this institution
      const departmentsRef = collection(doc(db, 'institutions', institution1.id), 'departments');
      const departmentsSnapshot = await getDocs(departmentsRef);
      console.log(`  Departments: ${departmentsSnapshot.size}`);
      
      // Check that departments don't exist in other institutions
      for (let j = 0; j < institutions.length; j++) {
        if (i !== j) {
          const institution2 = institutions[j];
          
          // Try to access departments from institution2 using institution1's department IDs
          for (const departmentDoc of departmentsSnapshot.docs) {
            const departmentRef = doc(db, 'institutions', institution2.id, 'departments', departmentDoc.id);
            const departmentSnap = await getDoc(departmentRef);
            
            if (departmentSnap.exists()) {
              console.log(`  ❌ WARNING: Department ${departmentDoc.id} from ${institution1.name} is accessible from ${institution2.name}`);
            }
          }
        }
      }
    }
    
    // Test user isolation
    console.log('\n=== Testing User Isolation ===');
    
    // Get users from first institution
    if (institutions.length > 0) {
      const firstInstitution = institutions[0];
      console.log(`\nChecking users in ${firstInstitution.name} (${firstInstitution.id})`);
      
      // Get departments
      const departmentsRef = collection(doc(db, 'institutions', firstInstitution.id), 'departments');
      const departmentsSnapshot = await getDocs(departmentsRef);
      
      let totalUsers = 0;
      
      for (const departmentDoc of departmentsSnapshot.docs) {
        const departmentData = departmentDoc.data();
        console.log(`\n  Department: ${departmentData.departmentName} (${departmentDoc.id})`);
        
        // Check teachers
        const teachersRef = collection(doc(db, 'institutions', firstInstitution.id, 'departments', departmentDoc.id), 'teachers');
        const teachersSnapshot = await getDocs(teachersRef);
        console.log(`    Teachers: ${teachersSnapshot.size}`);
        totalUsers += teachersSnapshot.size;
        
        // Check students
        const studentsRef = collection(doc(db, 'institutions', firstInstitution.id, 'departments', departmentDoc.id), 'students');
        const studentsSnapshot = await getDocs(studentsRef);
        console.log(`    Students: ${studentsSnapshot.size}`);
        totalUsers += studentsSnapshot.size;
      }
      
      console.log(`\n  Total users in ${firstInstitution.name}: ${totalUsers}`);
      
      // Verify users are not accessible from other institutions
      if (institutions.length > 1) {
        const secondInstitution = institutions[1];
        console.log(`\n  Verifying users from ${firstInstitution.name} are not accessible from ${secondInstitution.name}`);
        
        // Try to access a teacher from first institution in second institution
        if (departmentsSnapshot.size > 0) {
          const firstDepartment = departmentsSnapshot.docs[0];
          const teachersRef = collection(doc(db, 'institutions', firstInstitution.id, 'departments', firstDepartment.id), 'teachers');
          const teachersSnapshot = await getDocs(teachersRef);
          
          if (!teachersSnapshot.empty) {
            const teacherDoc = teachersSnapshot.docs[0];
            const teacherRef = doc(db, 'institutions', secondInstitution.id, 'departments', firstDepartment.id, 'teachers', teacherDoc.id);
            const teacherSnap = await getDoc(teacherRef);
            
            if (teacherSnap.exists()) {
              console.log(`  ❌ WARNING: Teacher ${teacherDoc.id} from ${firstInstitution.name} is accessible from ${secondInstitution.name}`);
            } else {
              console.log(`  ✅ Teacher ${teacherDoc.id} is properly isolated`);
            }
          }
        }
      }
    }
    
    console.log('\n✅ Multi-tenant isolation test completed!');
    
  } catch (error) {
    console.error('❌ Error during multi-tenant isolation test:', error);
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

testMultiTenantIsolation();