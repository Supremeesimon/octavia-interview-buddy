import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, limit } from 'firebase/firestore';

// Firebase configuration
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
const db = getFirestore(app);

async function checkCollections() {
  try {
    console.log('🔍 Checking Firestore collections...\n');
    
    // Check if interviews collection exists and has documents
    console.log('=== Checking Interviews Collection ===');
    const interviewsRef = collection(db, 'interviews');
    const interviewsQuery = query(interviewsRef, limit(1));
    const interviewsSnapshot = await getDocs(interviewsQuery);
    
    if (interviewsSnapshot.empty) {
      console.log('❌ No documents found in interviews collection');
    } else {
      console.log('✅ Found documents in interviews collection');
      console.log(`Total documents: ${interviewsSnapshot.size}`);
    }
    
    // Check if interview-feedback collection exists and has documents
    console.log('\n=== Checking Interview Feedback Collection ===');
    const feedbackRef = collection(db, 'interview-feedback');
    const feedbackQuery = query(feedbackRef, limit(1));
    const feedbackSnapshot = await getDocs(feedbackQuery);
    
    if (feedbackSnapshot.empty) {
      console.log('❌ No documents found in interview-feedback collection');
    } else {
      console.log('✅ Found documents in interview-feedback collection');
      console.log(`Total documents: ${feedbackSnapshot.size}`);
    }
    
    // Check if end-of-call-analysis collection exists and has documents
    console.log('\n=== Checking End of Call Analysis Collection ===');
    const analysisRef = collection(db, 'end-of-call-analysis');
    const analysisQuery = query(analysisRef, limit(1));
    const analysisSnapshot = await getDocs(analysisQuery);
    
    if (analysisSnapshot.empty) {
      console.log('❌ No documents found in end-of-call-analysis collection');
    } else {
      console.log('✅ Found documents in end-of-call-analysis collection');
      console.log(`Total documents: ${analysisSnapshot.size}`);
    }
    
    console.log('\n✅ Collection check complete!');
    
  } catch (error) {
    console.error('❌ Error checking collections:', error.message);
  }
}

checkCollections();