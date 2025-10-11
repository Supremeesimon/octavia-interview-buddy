import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

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

async function checkInterviewData() {
  try {
    console.log('Checking interview data in Firestore...');
    
    // Check interviews collection
    console.log('\n=== Interviews Collection ===');
    const interviewsQuery = query(
      collection(db, 'interviews'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    
    const interviewsSnapshot = await getDocs(interviewsQuery);
    console.log(`Found ${interviewsSnapshot.size} interviews`);
    
    interviewsSnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\nInterview ${index + 1}:`);
      console.log(`  ID: ${doc.id}`);
      console.log(`  Student ID: ${data.studentId || 'N/A'}`);
      console.log(`  Status: ${data.status || 'N/A'}`);
      console.log(`  Type: ${data.type || 'N/A'}`);
      console.log(`  Score: ${data.score || 'N/A'}`);
      console.log(`  Created At: ${data.createdAt?.toDate() || 'N/A'}`);
      console.log(`  Has Transcript: ${!!data.transcript}`);
      console.log(`  Has Recording: ${!!data.recordingUrl}`);
    });
    
    // Check feedback collection
    console.log('\n=== Feedback Collection ===');
    const feedbackQuery = query(
      collection(db, 'interview-feedback'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    
    const feedbackSnapshot = await getDocs(feedbackQuery);
    console.log(`Found ${feedbackSnapshot.size} feedback records`);
    
    feedbackSnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\nFeedback ${index + 1}:`);
      console.log(`  ID: ${doc.id}`);
      console.log(`  Interview ID: ${data.interviewId || 'N/A'}`);
      console.log(`  Student ID: ${data.studentId || 'N/A'}`);
      console.log(`  Overall Score: ${data.overallScore || 'N/A'}`);
      console.log(`  Created At: ${data.createdAt?.toDate() || 'N/A'}`);
      console.log(`  Has Detailed Analysis: ${!!data.detailedAnalysis}`);
    });
    
    // Check end-of-call-analysis collection
    console.log('\n=== End of Call Analysis Collection ===');
    const analysisQuery = query(
      collection(db, 'end-of-call-analysis'),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    
    const analysisSnapshot = await getDocs(analysisQuery);
    console.log(`Found ${analysisSnapshot.size} analysis records`);
    
    analysisSnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\nAnalysis ${index + 1}:`);
      console.log(`  ID: ${doc.id}`);
      console.log(`  Call ID: ${data.callId || 'N/A'}`);
      console.log(`  Student ID: ${data.studentId || 'N/A'}`);
      console.log(`  Score: ${data.overallScore || 'N/A'}`);
      console.log(`  Timestamp: ${data.timestamp?.toDate() || 'N/A'}`);
      console.log(`  Has Summary: ${!!data.summary}`);
      console.log(`  Has Transcript: ${!!data.transcript}`);
    });
    
    console.log('\n=== Data Check Complete ===');
  } catch (error) {
    console.error('Error checking interview data:', error);
  }
}

checkInterviewData();