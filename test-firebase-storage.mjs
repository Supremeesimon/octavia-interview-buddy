import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Firebase configuration from the test script
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
const storage = getStorage(app);

async function testStorageUpload() {
  try {
    console.log('Testing Firebase Storage upload...');
    
    // Create a simple test file as a Blob
    const testContent = "This is a test file for Firebase Storage upload testing.";
    const blob = new Blob([testContent], { type: 'text/plain' });
    
    // Create a reference to 'test/test-file.txt'
    const storageRef = ref(storage, 'test/test-file.txt');
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, blob);
    console.log('Upload successful!', snapshot);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    console.log('Download URL:', downloadURL);
    
    console.log('Firebase Storage test completed successfully!');
  } catch (error) {
    console.error('Firebase Storage test failed:', error);
  }
}

testStorageUpload();