// Test script to check Firebase Storage upload with proper authentication
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Firebase configuration from .env.local
const firebaseConfig = {
  apiKey: "AIzaSyCn847Eo_wh90MCJWYwW7K01rihUl8h2-Q",
  authDomain: "octavia-practice-interviewer.firebaseapp.com",
  projectId: "octavia-practice-interviewer",
  storageBucket: "octavia-practice-interviewer.firebasestorage.app",
  messagingSenderId: "475685845155",
  appId: "1:475685845155:web:ff55f944f48fc987bae716",
  measurementId: "G-YYHF1TW9MM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);

async function testAuthenticatedUpload() {
  try {
    console.log('Testing Firebase Storage upload with email/password authentication...');
    
    // Create a test user or sign in with existing one
    const email = 'test@example.com';
    const password = 'password123';
    
    let userCredential;
    try {
      // Try to create a new user
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Created new user:', userCredential.user.uid);
    } catch (createError) {
      // If user already exists, try to sign in
      if (createError.code === 'auth/email-already-in-use') {
        console.log('User already exists, signing in...');
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('Signed in as:', userCredential.user.uid);
      } else {
        throw createError;
      }
    }
    
    // Create a simple test file as a Blob
    const testContent = "This is a test file for Firebase Storage upload testing with email/password authentication.";
    const blob = new Blob([testContent], { type: 'text/plain' });
    
    // Create a reference to 'resumes/{userId}/test-resume.txt'
    const userId = userCredential.user.uid;
    const storageRef = ref(storage, `resumes/${userId}/test-resume.txt`);
    
    // Upload the file
    console.log('Uploading file...');
    const snapshot = await uploadBytes(storageRef, blob);
    console.log('Upload successful!', snapshot);
    
    // Get the download URL
    console.log('Getting download URL...');
    const downloadURL = await getDownloadURL(storageRef);
    console.log('Download URL:', downloadURL);
    
    console.log('Firebase Storage test with email/password authentication completed successfully!');
  } catch (error) {
    console.error('Firebase Storage test with email/password authentication failed:', error);
  }
}

testAuthenticatedUpload();