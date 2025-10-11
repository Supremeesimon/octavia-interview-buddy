// Test script to verify resume upload functionality
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

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
const db = getFirestore(app);

async function testResumeUpload() {
  try {
    console.log('Testing resume upload functionality...');
    
    // Create or sign in a test user
    const email = 'test' + Date.now() + '@example.com';
    const password = 'password123';
    const name = 'Test User';
    
    let userCredential;
    try {
      // Try to create a new user
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Created new user:', userCredential.user.uid);
      
      // Create user profile in Firestore
      const userProfile = {
        id: userCredential.user.uid,
        name: name,
        email: email,
        role: 'student',
        institutionDomain: 'example.com',
        emailVerified: userCredential.user.emailVerified,
        isEmailVerified: userCredential.user.emailVerified,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
        sessionCount: 0,
        profileCompleted: false
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        ...userProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      });
    } catch (createError) {
      console.error('Error creating user:', createError);
      return;
    }
    
    // Create a test resume file as a Blob
    const testContent = "This is a test resume file for testing the upload functionality.\nName: John Doe\nEmail: john.doe@example.com\nPhone: (555) 123-4567\n\nSUMMARY\n-------\nExperienced software developer with 5+ years of experience in web development.\n\nSKILLS\n------\n- JavaScript\n- React\n- Node.js\n- HTML/CSS\n- SQL\n\nEXPERIENCE\n----------\nSenior Developer - Tech Corp (2020-Present)\n- Developed web applications using React and Node.js\n- Collaborated with design team to implement UI/UX improvements\n\nEDUCATION\n---------\nB.S. Computer Science - University of Technology (2016-2020)";
    const blob = new Blob([testContent], { type: 'text/plain' });
    
    // Create a proper resume ID
    const resumeId = `resume_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const userId = userCredential.user.uid;
    
    // Create a reference to 'resumes/{userId}/{resumeId}'
    const storageRef = ref(storage, `resumes/${userId}/${resumeId}`);
    
    // Upload the file
    console.log('Uploading resume file...');
    const snapshot = await uploadBytes(storageRef, blob);
    console.log('Upload successful!', snapshot);
    
    // Get the download URL
    console.log('Getting download URL...');
    const downloadURL = await getDownloadURL(storageRef);
    console.log('Download URL:', downloadURL);
    
    console.log('Resume upload test completed successfully!');
    console.log('File path in storage: resumes/' + userId + '/' + resumeId);
    
  } catch (error) {
    console.error('Resume upload test failed:', error);
  }
}

testResumeUpload();