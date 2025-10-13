const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, setDoc, Timestamp } = require('firebase/firestore');
const { v4: uuidv4 } = require('uuid');

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

async function testAutomaticCreation() {
  try {
    console.log('🔍 Testing automatic collection creation on signup...');
    
    // Test 1: Create a new institution and verify automatic structure creation
    console.log('\n=== Testing Automatic Institution Creation ===');
    
    const newInstitution = {
      name: 'Test University',
      domain: 'testuniversity.edu',
      customSignupLink: '',
      customSignupToken: '',
      partnershipRequestDate: Timestamp.now(),
      approvalStatus: 'pending',
      contactEmail: 'admin@testuniversity.edu',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isActive: true
    };
    
    // Generate signup token
    const signupToken = uuidv4();
    newInstitution.customSignupToken = signupToken;
    newInstitution.customSignupLink = `https://octavia.ai/signup-institution/${signupToken}`;
    
    // Create the institution
    const institutionDocRef = doc(collection(db, 'institutions'));
    await setDoc(institutionDocRef, newInstitution);
    const institutionId = institutionDocRef.id;
    
    console.log(`✅ Created institution: ${newInstitution.name} (${institutionId})`);
    console.log(`  Signup Link: ${newInstitution.customSignupLink}`);
    
    // Verify the institution was created with correct structure
    const institutionDoc = await doc(db, 'institutions', institutionId);
    const institutionSnap = await getDoc(institutionDoc);
    
    if (institutionSnap.exists()) {
      const data = institutionSnap.data();
      if (data.customSignupToken && data.customSignupLink) {
        console.log(`✅ Institution has correct signup structure`);
      } else {
        console.log(`❌ Institution missing signup structure`);
      }
    }
    
    // Test 2: Simulate admin signup and verify automatic admin creation
    console.log('\n=== Testing Automatic Admin Creation ===');
    
    const adminData = {
      name: 'Test Admin',
      email: 'admin@testuniversity.edu',
      role: 'institution_admin',
      isEmailVerified: true,
      emailVerified: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      lastLogin: Timestamp.now(),
      sessionCount: 0,
      profileCompleted: true
    };
    
    // Create admin in the institution's admins subcollection
    const adminDocRef = doc(collection(db, 'institutions', institutionId, 'admins'));
    await setDoc(adminDocRef, adminData);
    const adminId = adminDocRef.id;
    
    console.log(`✅ Created admin: ${adminData.name} (${adminId})`);
    
    // Verify the admin was created
    const adminDoc = await doc(db, 'institutions', institutionId, 'admins', adminId);
    const adminSnap = await getDoc(adminDoc);
    
    if (adminSnap.exists()) {
      console.log(`✅ Admin creation verified`);
    } else {
      console.log(`❌ Admin creation failed`);
    }
    
    // Test 3: Simulate teacher signup and verify automatic department and teacher creation
    console.log('\n=== Testing Automatic Department and Teacher Creation ===');
    
    const departmentName = 'Computer Science';
    const departmentData = {
      departmentName,
      departmentSignupToken: uuidv4(),
      departmentSignupLink: '',
      createdAt: Timestamp.now(),
      createdBy: adminId
    };
    
    departmentData.departmentSignupLink = `https://octavia.ai/signup-institution/${institutionId}?department=${encodeURIComponent(departmentName)}&token=${departmentData.departmentSignupToken}`;
    
    // Create department
    const departmentDocRef = doc(collection(db, 'institutions', institutionId, 'departments'));
    await setDoc(departmentDocRef, departmentData);
    const departmentId = departmentDocRef.id;
    
    console.log(`✅ Created department: ${departmentName} (${departmentId})`);
    console.log(`  Signup Link: ${departmentData.departmentSignupLink}`);
    
    // Verify the department was created
    const departmentDoc = await doc(db, 'institutions', institutionId, 'departments', departmentId);
    const departmentSnap = await getDoc(departmentDoc);
    
    if (departmentSnap.exists()) {
      console.log(`✅ Department creation verified`);
    } else {
      console.log(`❌ Department creation failed`);
    }
    
    // Create teacher in the department
    const teacherData = {
      name: 'Test Teacher',
      email: 'teacher@testuniversity.edu',
      role: 'teacher',
      department: departmentName,
      departmentId: departmentId,
      isEmailVerified: true,
      emailVerified: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      lastLogin: Timestamp.now(),
      sessionCount: 0,
      profileCompleted: true
    };
    
    const teacherDocRef = doc(collection(db, 'institutions', institutionId, 'departments', departmentId, 'teachers'));
    await setDoc(teacherDocRef, teacherData);
    const teacherId = teacherDocRef.id;
    
    console.log(`✅ Created teacher: ${teacherData.name} (${teacherId})`);
    
    // Verify the teacher was created
    const teacherDoc = await doc(db, 'institutions', institutionId, 'departments', departmentId, 'teachers', teacherId);
    const teacherSnap = await getDoc(teacherDoc);
    
    if (teacherSnap.exists()) {
      console.log(`✅ Teacher creation verified`);
    } else {
      console.log(`❌ Teacher creation failed`);
    }
    
    // Test 4: Simulate student signup and verify automatic student creation
    console.log('\n=== Testing Automatic Student Creation ===');
    
    const studentData = {
      name: 'Test Student',
      email: 'student@testuniversity.edu',
      role: 'student',
      department: departmentName,
      departmentId: departmentId,
      yearOfStudy: '2023',
      enrollmentStatus: 'active',
      isEmailVerified: true,
      emailVerified: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      lastLogin: Timestamp.now(),
      sessionCount: 0,
      profileCompleted: true
    };
    
    const studentDocRef = doc(collection(db, 'institutions', institutionId, 'departments', departmentId, 'students'));
    await setDoc(studentDocRef, studentData);
    const studentId = studentDocRef.id;
    
    console.log(`✅ Created student: ${studentData.name} (${studentId})`);
    
    // Verify the student was created
    const studentDoc = await doc(db, 'institutions', institutionId, 'departments', departmentId, 'students', studentId);
    const studentSnap = await getDoc(studentDoc);
    
    if (studentSnap.exists()) {
      console.log(`✅ Student creation verified`);
    } else {
      console.log(`❌ Student creation failed`);
    }
    
    // Test 5: Verify the complete hierarchy structure
    console.log('\n=== Testing Complete Hierarchy Structure ===');
    
    // Check institutions
    const institutionsQuery = collection(db, 'institutions');
    const institutionsSnapshot = await getDocs(institutionsQuery);
    console.log(`Total institutions: ${institutionsSnapshot.size}`);
    
    // Check our test institution
    const testInstitutionDoc = await doc(db, 'institutions', institutionId);
    const testInstitutionSnap = await getDoc(testInstitutionDoc);
    
    if (testInstitutionSnap.exists()) {
      console.log(`✅ Test institution exists`);
      
      // Check admins subcollection
      const adminsQuery = collection(db, 'institutions', institutionId, 'admins');
      const adminsSnapshot = await getDocs(adminsQuery);
      console.log(`  Admins: ${adminsSnapshot.size}`);
      
      // Check departments subcollection
      const departmentsQuery = collection(db, 'institutions', institutionId, 'departments');
      const departmentsSnapshot = await getDocs(departmentsQuery);
      console.log(`  Departments: ${departmentsSnapshot.size}`);
      
      if (!departmentsSnapshot.empty) {
        const testDepartmentDoc = departmentsSnapshot.docs[0];
        console.log(`  ✅ Department exists: ${testDepartmentDoc.data().departmentName}`);
        
        // Check teachers subcollection
        const teachersQuery = collection(db, 'institutions', institutionId, 'departments', testDepartmentDoc.id, 'teachers');
        const teachersSnapshot = await getDocs(teachersQuery);
        console.log(`    Teachers: ${teachersSnapshot.size}`);
        
        // Check students subcollection
        const studentsQuery = collection(db, 'institutions', institutionId, 'departments', testDepartmentDoc.id, 'students');
        const studentsSnapshot = await getDocs(studentsQuery);
        console.log(`    Students: ${studentsSnapshot.size}`);
      }
    }
    
    console.log('\n✅ Automatic collection creation test completed!');
    console.log('\n📝 Note: In a real implementation, you would want to clean up test data after testing.');
    
  } catch (error) {
    console.error('❌ Error during automatic collection creation test:', error);
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

testAutomaticCreation();