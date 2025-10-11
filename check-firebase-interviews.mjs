import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, limit, doc, getDoc } from 'firebase/firestore';

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

async function checkFirebaseInterviews() {
  try {
    console.log('🔍 Checking Firebase Firestore for interview data...\n');
    
    // Check interviews collection
    console.log('=== Interviews Collection ===');
    const interviewsQuery = query(
      collection(db, 'interviews'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    
    const interviewsSnapshot = await getDocs(interviewsQuery);
    console.log(`Found ${interviewsSnapshot.size} interviews\n`);
    
    if (interviewsSnapshot.empty) {
      console.log('No interviews found in the interviews collection.');
    } else {
      console.log('Recent interviews:');
      interviewsSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\n${index + 1}. Interview ID: ${doc.id}`);
        console.log(`   Student ID: ${data.studentId || 'N/A'}`);
        console.log(`   Status: ${data.status || 'N/A'}`);
        console.log(`   Type: ${data.type || 'N/A'}`);
        console.log(`   Score: ${data.score || 'N/A'}`);
        console.log(`   Created At: ${data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt || 'N/A'}`);
        console.log(`   Has Transcript: ${!!data.transcript}`);
        console.log(`   Has Recording: ${!!data.recordingUrl}`);
      });
    }
    
    // Check feedback collection
    console.log('\n=== Feedback Collection ===');
    const feedbackQuery = query(
      collection(db, 'interview-feedback'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    
    const feedbackSnapshot = await getDocs(feedbackQuery);
    console.log(`Found ${feedbackSnapshot.size} feedback records\n`);
    
    if (feedbackSnapshot.empty) {
      console.log('No feedback found in the interview-feedback collection.');
    } else {
      console.log('Recent feedback:');
      feedbackSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\n${index + 1}. Feedback ID: ${doc.id}`);
        console.log(`   Interview ID: ${data.interviewId || 'N/A'}`);
        console.log(`   Student ID: ${data.studentId || 'N/A'}`);
        console.log(`   Overall Score: ${data.overallScore || 'N/A'}`);
        console.log(`   Created At: ${data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt || 'N/A'}`);
        console.log(`   Has Detailed Analysis: ${!!data.detailedAnalysis}`);
      });
    }
    
    // Check end-of-call-analysis collection
    console.log('\n=== End of Call Analysis Collection ===');
    const analysisQuery = query(
      collection(db, 'end-of-call-analysis'),
      orderBy('timestamp', 'desc'),
      limit(20)
    );
    
    const analysisSnapshot = await getDocs(analysisQuery);
    console.log(`Found ${analysisSnapshot.size} analysis records\n`);
    
    if (analysisSnapshot.empty) {
      console.log('No analysis found in the end-of-call-analysis collection.');
    } else {
      console.log('Recent analysis:');
      analysisSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\n${index + 1}. Analysis ID: ${doc.id}`);
        console.log(`   Call ID: ${data.callId || 'N/A'}`);
        console.log(`   Student ID: ${data.studentId || 'N/A'}`);
        console.log(`   Score: ${data.overallScore || 'N/A'}`);
        console.log(`   Timestamp: ${data.timestamp?.toDate ? data.timestamp.toDate() : data.timestamp || 'N/A'}`);
        console.log(`   Has Summary: ${!!data.summary}`);
        console.log(`   Has Transcript: ${!!data.transcript}`);
      });
    }
    
    // Check student stats collection
    console.log('\n=== Student Stats Collection ===');
    const statsQuery = query(
      collection(db, 'student-stats'),
      limit(20)
    );
    
    const statsSnapshot = await getDocs(statsQuery);
    console.log(`Found ${statsSnapshot.size} student stats records\n`);
    
    if (statsSnapshot.empty) {
      console.log('No student stats found in the student-stats collection.');
    } else {
      console.log('Student stats:');
      statsSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\n${index + 1}. Student ID: ${doc.id}`);
        console.log(`   Total Interviews: ${data.totalInterviews || 0}`);
        console.log(`   Completed Interviews: ${data.completedInterviews || 0}`);
        console.log(`   Average Score: ${data.averageScore || 0}`);
        console.log(`   Last Interview Date: ${data.lastInterviewDate?.toDate ? data.lastInterviewDate.toDate() : data.lastInterviewDate || 'N/A'}`);
      });
    }
    
    console.log('\n✅ Firebase data check complete!');
    
  } catch (error) {
    console.error('❌ Error checking Firebase data:', error);
  }
}

// Run the check
checkFirebaseInterviews();