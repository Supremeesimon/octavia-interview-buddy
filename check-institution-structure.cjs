const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc } = require('firebase/firestore');

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

async function checkInstitutionStructure() {
  try {
    console.log('🔍 Checking institution structure...');
    
    // Get the specific institution document
    const institutionId = 'WxD3cWTybNsqkpj7OwW4';
    const institutionRef = doc(db, 'institutions', institutionId);
    
    // Check for subcollections
    console.log('\n=== CHECKING SUBCOLLECTIONS ===');
    
    // Check for departments subcollection
    const departmentsRef = collection(institutionRef, 'departments');
    const departmentsSnapshot = await getDocs(departmentsRef);
    console.log(`Departments: ${departmentsSnapshot.size} documents`);
    
    departmentsSnapshot.forEach(doc => {
      console.log(`  Department ID: ${doc.id}`);
      console.log(`  Department Data:`, doc.data());
    });
    
    // Check for admins subcollection
    const adminsRef = collection(institutionRef, 'admins');
    const adminsSnapshot = await getDocs(adminsRef);
    console.log(`\nAdmins: ${adminsSnapshot.size} documents`);
    
    adminsSnapshot.forEach(doc => {
      console.log(`  Admin ID: ${doc.id}`);
      console.log(`  Admin Data:`, doc.data());
    });
    
    console.log('\n✅ Institution structure check complete!');
    
  } catch (error) {
    console.error('❌ Error checking institution structure:', error);
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

checkInstitutionStructure();