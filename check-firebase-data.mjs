import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';

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

async function checkFirebaseData() {
  try {
    console.log('Checking Firebase data...');
    
    // Check end-of-call-analysis collection
    console.log('\n--- Checking end-of-call-analysis collection ---');
    const analysisQuery = query(
      collection(db, 'end-of-call-analysis'),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    
    const analysisSnapshot = await getDocs(analysisQuery);
    console.log(`Found ${analysisSnapshot.size} documents in end-of-call-analysis`);
    
    analysisSnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\nDocument ${index + 1}:`);
      console.log(`  ID: ${doc.id}`);
      console.log(`  Call ID: ${data.callId || 'N/A'}`);
      console.log(`  Student ID: ${data.studentId || 'N/A'}`);
      console.log(`  Timestamp: ${data.timestamp?.toDate?.() || data.timestamp || 'N/A'}`);
      console.log(`  Interview Type: ${data.interviewType || 'N/A'}`);
      console.log(`  Overall Score: ${data.overallScore || 'N/A'}`);
    });
    
    // Check interviews collection
    console.log('\n--- Checking interviews collection ---');
    const interviewsQuery = query(
      collection(db, 'interviews'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    
    const interviewsSnapshot = await getDocs(interviewsQuery);
    console.log(`Found ${interviewsSnapshot.size} documents in interviews`);
    
    interviewsSnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\nDocument ${index + 1}:`);
      console.log(`  ID: ${doc.id}`);
      console.log(`  Student ID: ${data.studentId || 'N/A'}`);
      console.log(`  Status: ${data.status || 'N/A'}`);
      console.log(`  Type: ${data.type || 'N/A'}`);
      console.log(`  Created At: ${data.createdAt?.toDate?.() || data.createdAt || 'N/A'}`);
    });
    
    // Check for anonymous user data specifically
    console.log('\n--- Checking for anonymous user data ---');
    
    // Check end-of-call-analysis without studentId
    const anonymousAnalysisQuery = query(
      collection(db, 'end-of-call-analysis'),
      where('studentId', '==', ''),
      limit(5)
    );
    
    const anonymousAnalysisSnapshot = await getDocs(anonymousAnalysisQuery);
    console.log(`Found ${anonymousAnalysisSnapshot.size} anonymous analyses (empty studentId)`);
    
    // Check interviews without studentId
    const anonymousInterviewsQuery = query(
      collection(db, 'interviews'),
      where('studentId', '==', ''),
      limit(5)
    );
    
    const anonymousInterviewsSnapshot = await getDocs(anonymousInterviewsQuery);
    console.log(`Found ${anonymousInterviewsSnapshot.size} anonymous interviews (empty studentId)`);
    
    console.log('\n✅ Firebase data check completed!');
    
  } catch (error) {
    console.error('❌ Error checking Firebase data:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
  }
}

checkFirebaseData();