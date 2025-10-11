import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, orderBy, doc, getDoc } from 'firebase/firestore';

// Firebase configuration from your .env.local
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

async function checkUserInterviews() {
  try {
    console.log('🔍 Checking interviews for user: oluwaferanmionabanjo@gmail.com\n');
    
    // First, find your user document
    console.log('=== Looking for your user ===');
    const userQuery = query(collection(db, 'users'), where('email', '==', 'oluwaferanmionabanjo@gmail.com'));
    const userSnapshot = await getDocs(userQuery);
    
    if (userSnapshot.empty) {
      console.log('❌ User not found in database');
      return;
    }
    
    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();
    console.log(`✅ Found user: ${userData.email} (ID: ${userDoc.id})\n`);
    
    // Check for interviews in the interviews collection
    console.log('=== Checking Interviews Collection ===');
    const interviewsQuery = query(
      collection(db, 'interviews'),
      where('studentId', '==', userDoc.id),
      orderBy('createdAt', 'desc')
    );
    const interviewsSnapshot = await getDocs(interviewsQuery);
    
    console.log(`Found ${interviewsSnapshot.size} interviews in interviews collection\n`);
    
    if (!interviewsSnapshot.empty) {
      console.log('Interviews:');
      interviewsSnapshot.forEach((doc, index) => {
        const interviewData = doc.data();
        console.log(`${index + 1}. ID: ${doc.id}`);
        console.log(`   Status: ${interviewData.status}`);
        console.log(`   Type: ${interviewData.type}`);
        console.log(`   Score: ${interviewData.score || 'N/A'}`);
        console.log(`   Created: ${interviewData.createdAt ? new Date(interviewData.createdAt._seconds * 1000) : 'N/A'}`);
        console.log(`   Has Transcript: ${!!interviewData.transcript}`);
        console.log('');
      });
    }
    
    // Check for interview feedback
    console.log('=== Checking Interview Feedback Collection ===');
    const feedbackQuery = query(
      collection(db, 'interview-feedback'),
      where('studentId', '==', userDoc.id),
      orderBy('createdAt', 'desc')
    );
    const feedbackSnapshot = await getDocs(feedbackQuery);
    
    console.log(`Found ${feedbackSnapshot.size} feedback records\n`);
    
    if (!feedbackSnapshot.empty) {
      console.log('Feedback records:');
      feedbackSnapshot.forEach((doc, index) => {
        const feedbackData = doc.data();
        console.log(`${index + 1}. ID: ${doc.id}`);
        console.log(`   Interview ID: ${feedbackData.interviewId}`);
        console.log(`   Overall Score: ${feedbackData.overallScore || 'N/A'}`);
        console.log(`   Created: ${feedbackData.createdAt ? new Date(feedbackData.createdAt._seconds * 1000) : 'N/A'}`);
        console.log('');
      });
    }
    
    // Check for end-of-call analysis
    console.log('=== Checking End-of-Call Analysis Collection ===');
    const analysisQuery = query(
      collection(db, 'end-of-call-analysis'),
      where('studentId', '==', userDoc.id),
      orderBy('createdAt', 'desc')
    );
    const analysisSnapshot = await getDocs(analysisQuery);
    
    console.log(`Found ${analysisSnapshot.size} end-of-call analysis records\n`);
    
    if (!analysisSnapshot.empty) {
      console.log('End-of-call analysis records:');
      analysisSnapshot.forEach((doc, index) => {
        const analysisData = doc.data();
        console.log(`${index + 1}. ID: ${doc.id}`);
        console.log(`   Call ID: ${analysisData.callId || 'N/A'}`);
        console.log(`   Summary: ${analysisData.summary ? analysisData.summary.substring(0, 50) + '...' : 'N/A'}`);
        console.log(`   Score: ${analysisData.successEvaluation?.score || 'N/A'}`);
        console.log(`   Created: ${analysisData.createdAt ? new Date(analysisData.createdAt._seconds * 1000) : 'N/A'}`);
        console.log('');
      });
    }
    
    // Check for any interviews without studentId (anonymous)
    console.log('=== Checking for Anonymous Interviews ===');
    const anonymousInterviewsQuery = query(
      collection(db, 'interviews'),
      where('studentId', '==', ''),
      orderBy('createdAt', 'desc')
    );
    const anonymousInterviewsSnapshot = await getDocs(anonymousInterviewsQuery);
    
    console.log(`Found ${anonymousInterviewsSnapshot.size} anonymous interviews\n`);
    
    // Check for any end-of-call analysis without studentId (anonymous)
    const anonymousAnalysisQuery = query(
      collection(db, 'end-of-call-analysis'),
      where('studentId', '==', ''),
      orderBy('createdAt', 'desc')
    );
    const anonymousAnalysisSnapshot = await getDocs(anonymousAnalysisQuery);
    
    console.log(`Found ${anonymousAnalysisSnapshot.size} anonymous end-of-call analysis records\n`);
    
  } catch (error) {
    console.error('❌ Error checking user interviews:', error.message);
  }
}

// Run the check
checkUserInterviews();