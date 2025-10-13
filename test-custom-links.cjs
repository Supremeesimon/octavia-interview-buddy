const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc, query, where } = require('firebase/firestore');

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

async function testCustomLinks() {
  try {
    console.log('🔍 Testing custom link system functionality...');
    
    // Test 1: Check institution signup links
    console.log('\n=== Testing Institution Signup Links ===');
    const institutionsRef = collection(db, 'institutions');
    const institutionsSnapshot = await getDocs(institutionsRef);
    
    for (const institutionDoc of institutionsSnapshot.docs) {
      const institutionData = institutionDoc.data();
      console.log(`\nInstitution: ${institutionData.name} (${institutionDoc.id})`);
      
      // Check if custom signup link exists
      if (institutionData.customSignupLink) {
        console.log(`  ✅ Custom signup link: ${institutionData.customSignupLink}`);
      } else {
        console.log(`  ❌ No custom signup link found`);
      }
      
      // Check if custom signup token exists
      if (institutionData.customSignupToken) {
        console.log(`  ✅ Custom signup token: ${institutionData.customSignupToken}`);
      } else {
        console.log(`  ❌ No custom signup token found`);
      }
      
      // Test token validation
      if (institutionData.customSignupToken) {
        const q = query(collection(db, 'institutions'), where('customSignupToken', '==', institutionData.customSignupToken));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          console.log(`  ✅ Token validation successful`);
        } else {
          console.log(`  ❌ Token validation failed`);
        }
      }
    }
    
    // Test 2: Check department signup links
    console.log('\n=== Testing Department Signup Links ===');
    
    for (const institutionDoc of institutionsSnapshot.docs) {
      const institutionData = institutionDoc.data();
      console.log(`\nInstitution: ${institutionData.name} (${institutionDoc.id})`);
      
      // Get departments
      const departmentsRef = collection(doc(db, 'institutions', institutionDoc.id), 'departments');
      const departmentsSnapshot = await getDocs(departmentsRef);
      
      for (const departmentDoc of departmentsSnapshot.docs) {
        const departmentData = departmentDoc.data();
        console.log(`\n  Department: ${departmentData.departmentName} (${departmentDoc.id})`);
        
        // Check if department signup link exists
        if (departmentData.departmentSignupLink) {
          console.log(`    ✅ Department signup link: ${departmentData.departmentSignupLink}`);
        } else {
          console.log(`    ❌ No department signup link found`);
        }
        
        // Check if department signup token exists
        if (departmentData.departmentSignupToken) {
          console.log(`    ✅ Department signup token: ${departmentData.departmentSignupToken}`);
        } else {
          console.log(`    ❌ No department signup token found`);
        }
        
        // Test token validation
        if (departmentData.departmentSignupToken) {
          const q = query(
            collection(doc(db, 'institutions', institutionDoc.id), 'departments'), 
            where('departmentSignupToken', '==', departmentData.departmentSignupToken)
          );
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            console.log(`    ✅ Token validation successful`);
          } else {
            console.log(`    ❌ Token validation failed`);
          }
        }
      }
    }
    
    console.log('\n✅ Custom link system test completed!');
    
  } catch (error) {
    console.error('❌ Error during custom link system test:', error);
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

testCustomLinks();