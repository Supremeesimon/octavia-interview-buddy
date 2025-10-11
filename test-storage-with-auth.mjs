import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Load environment variables
import { config } from 'dotenv';
config({ path: '.env.local' });

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

console.log('Firebase config:', firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

async function testStorageUploadWithAuth() {
  try {
    console.log('Testing Firebase Storage upload with authentication...');
    
    // Sign in anonymously
    console.log('Signing in anonymously...');
    const userCredential = await signInAnonymously(auth);
    console.log('Signed in as:', userCredential.user.uid);
    
    // Create a simple test file as a Blob
    const testContent = "This is a test file for Firebase Storage upload testing with authentication.";
    const blob = new Blob([testContent], { type: 'text/plain' });
    
    // Create a reference to 'test/test-file-with-auth.txt'
    const storageRef = ref(storage, 'test/test-file-with-auth.txt');
    
    // Upload the file
    console.log('Uploading file...');
    const snapshot = await uploadBytes(storageRef, blob);
    console.log('Upload successful!', snapshot);
    
    // Get the download URL
    console.log('Getting download URL...');
    const downloadURL = await getDownloadURL(storageRef);
    console.log('Download URL:', downloadURL);
    
    console.log('Firebase Storage test with authentication completed successfully!');
  } catch (error) {
    console.error('Firebase Storage test with authentication failed:', error);
  }
}

testStorageUploadWithAuth();