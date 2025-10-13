import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, limit, doc, getDoc } from 'firebase/firestore';
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function listUsers() {
  try {
    console.log('=== Listing Users in Firestore (Hierarchical Structure) ===');
    
    // List platform admins
    console.log('\n--- Platform Admins ---');
    try {
      const platformAdminsQuery = query(
        collection(db, 'platformAdmins'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      
      const platformAdminsSnapshot = await getDocs(platformAdminsQuery);
      
      console.log('Platform admins count:', platformAdminsSnapshot.size);
      
      if (platformAdminsSnapshot.size > 0) {
        platformAdminsSnapshot.forEach((doc) => {
          const data = doc.data();
          console.log(`\nDocument ID: ${doc.id}`);
          console.log(`  Name: ${data.name || 'N/A'}`);
          console.log(`  Email: ${data.email || 'N/A'}`);
          console.log(`  Created At: ${data.createdAt?.toDate?.() || data.createdAt || 'N/A'}`);
        });
      } else {
        console.log('No platform admins found');
      }
    } catch (error) {
      console.error('Error listing platform admins:', error);
    }
    
    // List external users
    console.log('\n--- External Users ---');
    try {
      const externalUsersQuery = query(
        collection(db, 'externalUsers'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      
      const externalUsersSnapshot = await getDocs(externalUsersQuery);
      
      console.log('External users count:', externalUsersSnapshot.size);
      
      if (externalUsersSnapshot.size > 0) {
        externalUsersSnapshot.forEach((doc) => {
          const data = doc.data();
          console.log(`\nDocument ID: ${doc.id}`);
          console.log(`  Name: ${data.name || 'N/A'}`);
          console.log(`  Email: ${data.email || 'N/A'}`);
          console.log(`  Created At: ${data.createdAt?.toDate?.() || data.createdAt || 'N/A'}`);
        });
      } else {
        console.log('No external users found');
      }
    } catch (error) {
      console.error('Error listing external users:', error);
    }
    
    // List institutional users
    console.log('\n--- Institutional Users ---');
    try {
      const institutionsRef = collection(db, 'institutions');
      const institutionsSnapshot = await getDocs(institutionsRef);
      
      let totalInstitutionalUsers = 0;
      
      for (const institutionDoc of institutionsSnapshot.docs) {
        const institutionId = institutionDoc.id;
        console.log(`\nInstitution: ${institutionId}`);
        
        // List institution admins
        try {
          const adminsRef = collection(db, 'institutions', institutionId, 'admins');
          const adminsSnapshot = await getDocs(adminsRef);
          
          if (adminsSnapshot.size > 0) {
            console.log(`  Admins (${adminsSnapshot.size}):`);
            adminsSnapshot.forEach((doc) => {
              totalInstitutionalUsers++;
              const data = doc.data();
              console.log(`    Document ID: ${doc.id}`);
              console.log(`      Name: ${data.name || 'N/A'}`);
              console.log(`      Email: ${data.email || 'N/A'}`);
              console.log(`      Created At: ${data.createdAt?.toDate?.() || data.createdAt || 'N/A'}`);
            });
          }
        } catch (error) {
          console.error(`  Error listing admins for institution ${institutionId}:`, error);
        }
        
        // List departments and their users
        try {
          const departmentsRef = collection(db, 'institutions', institutionId, 'departments');
          const departmentsSnapshot = await getDocs(departmentsRef);
          
          for (const departmentDoc of departmentsSnapshot.docs) {
            const departmentId = departmentDoc.id;
            console.log(`  Department: ${departmentId}`);
            
            // List teachers
            try {
              const teachersRef = collection(db, 'institutions', institutionId, 'departments', departmentId, 'teachers');
              const teachersSnapshot = await getDocs(teachersRef);
              
              if (teachersSnapshot.size > 0) {
                console.log(`    Teachers (${teachersSnapshot.size}):`);
                teachersSnapshot.forEach((doc) => {
                  totalInstitutionalUsers++;
                  const data = doc.data();
                  console.log(`      Document ID: ${doc.id}`);
                  console.log(`        Name: ${data.name || 'N/A'}`);
                  console.log(`        Email: ${data.email || 'N/A'}`);
                  console.log(`        Created At: ${data.createdAt?.toDate?.() || data.createdAt || 'N/A'}`);
                });
              }
            } catch (error) {
              console.error(`    Error listing teachers for department ${departmentId}:`, error);
            }
            
            // List students
            try {
              const studentsRef = collection(db, 'institutions', institutionId, 'departments', departmentId, 'students');
              const studentsSnapshot = await getDocs(studentsRef);
              
              if (studentsSnapshot.size > 0) {
                console.log(`    Students (${studentsSnapshot.size}):`);
                studentsSnapshot.forEach((doc) => {
                  totalInstitutionalUsers++;
                  const data = doc.data();
                  console.log(`      Document ID: ${doc.id}`);
                  console.log(`        Name: ${data.name || 'N/A'}`);
                  console.log(`        Email: ${data.email || 'N/A'}`);
                  console.log(`        Created At: ${data.createdAt?.toDate?.() || data.createdAt || 'N/A'}`);
                });
              }
            } catch (error) {
              console.error(`    Error listing students for department ${departmentId}:`, error);
            }
          }
        } catch (error) {
          console.error(`  Error listing departments for institution ${institutionId}:`, error);
        }
      }
      
      console.log(`\nTotal institutional users: ${totalInstitutionalUsers}`);
    } catch (error) {
      console.error('Error listing institutional users:', error);
    }
    
    // Also check if we can access system_config
    console.log('\n--- Checking System Config ---');
    try {
      const systemConfigQuery = query(collection(db, 'system_config'));
      const systemConfigSnapshot = await getDocs(systemConfigQuery);
      
      console.log('System config documents count:', systemConfigSnapshot.size);
      
      if (systemConfigSnapshot.size > 0) {
        console.log('\nSystem config data:');
        systemConfigSnapshot.forEach((doc) => {
          const data = doc.data();
          console.log(`\nDocument ID: ${doc.id}`);
          console.log(`  Data:`, data);
        });
      } else {
        console.log('No system config documents found in Firestore');
      }
    } catch (error) {
      console.error('Error checking system config:', error);
    }
    
  } catch (error) {
    console.error('Error listing users:', error);
  }
}

listUsers();