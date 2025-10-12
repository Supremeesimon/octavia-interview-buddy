import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
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
  console.log('=== Testing Firebase Authentication ===');
  
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
    
    // Check if user has platform admin role by looking at users collection
    console.log('\nChecking user role in Firestore...');
    const usersQuery = collection(db, 'users');
    const usersSnapshot = await getDocs(usersQuery);
    
    console.log('Total users in system:', usersSnapshot.size);
    
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      if (userData.email === adminEmail) {
        console.log('Found admin user:');
        console.log('  ID:', doc.id);
        console.log('  Role:', userData.role);
        console.log('  Name:', userData.name);
      }
    });
    
  } catch (error) {
    console.error('Authentication error:', error);
  }
}

testAuth();