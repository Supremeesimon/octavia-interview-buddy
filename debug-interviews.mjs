import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, orderBy, doc, getDoc } from 'firebase/firestore';

// Firebase configuration - using the same as in the existing check scripts
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

async function debugInterviews() {
  try {
    console.log('🔍 Debugging interviews...\n');
    
    // Check for interviews in the interviews collection
    console.log('=== Checking Interviews Collection ===');
    const interviewsSnapshot = await getDocs(collection(db, 'interviews'));
    
    console.log(`Found ${interviewsSnapshot.size} total interviews\n`);
    
    if (!interviewsSnapshot.empty) {
      console.log('All interviews:');
      interviewsSnapshot.forEach((doc, index) => {
        const interviewData = doc.data();
        console.log(`${index + 1}. ID: ${doc.id}`);
        console.log(`   Student ID: ${interviewData.studentId || 'N/A'}`);
        console.log(`   Status: ${interviewData.status || 'N/A'}`);
        console.log(`   Type: ${interviewData.type || 'N/A'}`);
        console.log(`   Score: ${interviewData.score || 'N/A'}`);
        console.log(`   Created: ${interviewData.createdAt ? new Date(interviewData.createdAt._seconds * 1000) : 'N/A'}`);
        console.log('');
      });
    }
    
    // Check for interview feedback
    console.log('=== Checking Interview Feedback Collection ===');
    const feedbackSnapshot = await getDocs(collection(db, 'interview-feedback'));
    
    console.log(`Found ${feedbackSnapshot.size} total feedback records\n`);
    
    if (!feedbackSnapshot.empty) {
      console.log('All feedback records:');
      feedbackSnapshot.forEach((doc, index) => {
        const feedbackData = doc.data();
        console.log(`${index + 1}. ID: ${doc.id}`);
        console.log(`   Student ID: ${feedbackData.studentId || 'N/A'}`);
        console.log(`   Interview ID: ${feedbackData.interviewId || 'N/A'}`);
        console.log(`   Overall Score: ${feedbackData.overallScore || 'N/A'}`);
        console.log(`   Created: ${feedbackData.createdAt ? new Date(feedbackData.createdAt._seconds * 1000) : 'N/A'}`);
        console.log('');
      });
    }
    
    // Check for end-of-call analysis
    console.log('=== Checking End-of-Call Analysis Collection ===');
    const analysisSnapshot = await getDocs(collection(db, 'end-of-call-analysis'));
    
    console.log(`Found ${analysisSnapshot.size} total end-of-call analysis records\n`);
    
    if (!analysisSnapshot.empty) {
      console.log('All end-of-call analysis records:');
      analysisSnapshot.forEach((doc, index) => {
        const analysisData = doc.data();
        console.log(`${index + 1}. ID: ${doc.id}`);
        console.log(`   Student ID: ${analysisData.studentId || 'N/A'}`);
        console.log(`   Call ID: ${analysisData.callId || 'N/A'}`);
        console.log(`   Summary: ${analysisData.summary ? analysisData.summary.substring(0, 50) + '...' : 'N/A'}`);
        console.log(`   Score: ${analysisData.successEvaluation?.score || 'N/A'}`);
        console.log(`   Created: ${analysisData.createdAt ? new Date(analysisData.createdAt._seconds * 1000) : 'N/A'}`);
        console.log('');
      });
    }
    
    console.log('✅ Debug complete!');
    
  } catch (error) {
    console.error('❌ Error during debug:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the debug
debugInterviews();