import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, orderBy } from 'firebase/firestore';

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

async function checkUserAnalysis() {
  try {
    console.log('🔍 Checking end-of-call analysis for user: onabanjo oluwaferanmi\n');
    
    // First, find the user ID for onabanjo oluwaferanmi
    console.log('=== Looking for user ===');
    const userQuery = query(collection(db, 'users'), where('email', '==', 'oluwaferanmionabanjo@gmail.com'));
    const userSnapshot = await getDocs(userQuery);
    
    if (userSnapshot.empty) {
      console.log('❌ User not found in database');
      return;
    }
    
    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();
    console.log(`✅ Found user: ${userData.email} (ID: ${userDoc.id})\n`);
    
    // Check for end-of-call analysis
    console.log('=== Checking End-of-Call Analysis Collection ===');
    const analysisQuery = query(
      collection(db, 'end-of-call-analysis'),
      where('studentId', '==', userDoc.id),
      orderBy('timestamp', 'desc')
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
        console.log(`   Score: ${analysisData.successEvaluation?.score || analysisData.overallScore || 'N/A'}`);
        console.log(`   Created: ${analysisData.timestamp ? new Date(analysisData.timestamp._seconds * 1000) : 'N/A'}`);
        console.log(`   Interview Type: ${analysisData.interviewType || 'N/A'}`);
        console.log('');
      });
    }
    
    console.log('✅ Data check complete!');
    
  } catch (error) {
    console.error('❌ Error checking user analysis:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the check
checkUserAnalysis();