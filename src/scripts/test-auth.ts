import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Firebase configuration from environment
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

console.log('Firebase config:', {
  apiKey: process.env.VITE_FIREBASE_API_KEY ? 'SET' : 'MISSING',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function testAuth() {
  console.log('=== Testing Firebase Authentication (Hierarchical Structure) ===');
  
  // Check if we have admin credentials
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  console.log('Admin credentials:', {
    email: adminEmail ? 'SET' : 'MISSING',
    password: adminPassword ? 'SET' : 'MISSING'
  });
  
  if (!adminEmail || !adminPassword) {
    console.log('Missing admin credentials. Please set ADMIN_EMAIL and ADMIN_PASSWORD in .env.local');
    return;
  }
  
  try {
    console.log('Attempting to sign in as admin...');
    const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    console.log('Successfully signed in as:', userCredential.user.email);
    console.log('User UID:', userCredential.user.uid);
    
    // Check if user has platform admin role by looking at platformAdmins collection
    console.log('\nChecking user role in Firestore (Hierarchical Structure)...');
    
    // Check platform admins collection
    console.log('Checking platformAdmins collection...');
    const platformAdminDoc = await getDoc(doc(db, 'platformAdmins', userCredential.user.uid));
    
    if (platformAdminDoc.exists()) {
      const adminData = platformAdminDoc.data();
      console.log('Found admin user in platformAdmins collection:');
      console.log('  ID:', platformAdminDoc.id);
      console.log('  Role:', adminData.role);
      console.log('  Name:', adminData.name);
    } else {
      console.log('User not found in platformAdmins collection');
      
      // Check external users collection
      console.log('Checking externalUsers collection...');
      const externalUserDoc = await getDoc(doc(db, 'externalUsers', userCredential.user.uid));
      
      if (externalUserDoc.exists()) {
        const userData = externalUserDoc.data();
        console.log('Found user in externalUsers collection:');
        console.log('  ID:', externalUserDoc.id);
        console.log('  Role:', userData.role);
        console.log('  Name:', userData.name);
      } else {
        console.log('User not found in externalUsers collection');
        
        // Check institutions collection
        console.log('Checking institutions collection...');
        const institutionsSnapshot = await getDocs(collection(db, 'institutions'));
        
        let userFound = false;
        for (const institutionDoc of institutionsSnapshot.docs) {
          const institutionId = institutionDoc.id;
          
          // Check admins subcollection
          const adminDoc = await getDoc(doc(db, 'institutions', institutionId, 'admins', userCredential.user.uid));
          if (adminDoc.exists()) {
            const adminData = adminDoc.data();
            console.log('Found user in institution admins collection:');
            console.log('  Institution ID:', institutionId);
            console.log('  ID:', adminDoc.id);
            console.log('  Role:', adminData.role);
            console.log('  Name:', adminData.name);
            userFound = true;
            break;
          }
          
          // Check departments for teachers and students
          const departmentsSnapshot = await getDocs(collection(db, 'institutions', institutionId, 'departments'));
          for (const departmentDoc of departmentsSnapshot.docs) {
            const departmentId = departmentDoc.id;
            
            // Check teachers
            const teacherDoc = await getDoc(doc(db, 'institutions', institutionId, 'departments', departmentId, 'teachers', userCredential.user.uid));
            if (teacherDoc.exists()) {
              const teacherData = teacherDoc.data();
              console.log('Found user in institution teachers collection:');
              console.log('  Institution ID:', institutionId);
              console.log('  Department ID:', departmentId);
              console.log('  ID:', teacherDoc.id);
              console.log('  Role:', teacherData.role);
              console.log('  Name:', teacherData.name);
              userFound = true;
              break;
            }
            
            // Check students
            const studentDoc = await getDoc(doc(db, 'institutions', institutionId, 'departments', departmentId, 'students', userCredential.user.uid));
            if (studentDoc.exists()) {
              const studentData = studentDoc.data();
              console.log('Found user in institution students collection:');
              console.log('  Institution ID:', institutionId);
              console.log('  Department ID:', departmentId);
              console.log('  ID:', studentDoc.id);
              console.log('  Role:', studentData.role);
              console.log('  Name:', studentData.name);
              userFound = true;
              break;
            }
          }
          
          if (userFound) break;
        }
        
        if (!userFound) {
          console.log('User not found in any collection');
        }
      }
    }
    
  } catch (error) {
    console.error('Authentication error:', error);
  }
}

testAuth();