import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
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
const auth = getAuth(app);
const db = getFirestore(app);

async function testAnalysisFetch() {
  return new Promise((resolve, reject) => {
    console.log('🔍 Testing analysis fetch...\n');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          console.log(`✅ Current user: ${user.email} (ID: ${user.uid})\n`);
          
          // Test the query that interviewService.getStudentAnalyses uses
          console.log('=== Testing End-of-Call Analysis Query ===');
          const analysisQuery = query(
            collection(db, 'end-of-call-analysis'),
            where('studentId', '==', user.uid),
            orderBy('timestamp', 'desc')
          );
          
          try {
            const analysisSnapshot = await getDocs(analysisQuery);
            console.log(`Found ${analysisSnapshot.size} end-of-call analysis records\n`);
            
            if (!analysisSnapshot.empty) {
              console.log('Analysis records:');
              analysisSnapshot.forEach((doc, index) => {
                const analysisData = doc.data();
                console.log(`${index + 1}. ID: ${doc.id}`);
                console.log(`   Call ID: ${analysisData.callId || 'N/A'}`);
                console.log(`   Summary: ${analysisData.summary ? analysisData.summary.substring(0, 50) + '...' : 'N/A'}`);
                console.log(`   Score: ${analysisData.successEvaluation?.score || analysisData.overallScore || 'N/A'}`);
                console.log(`   Created: ${analysisData.timestamp ? new Date(analysisData.timestamp._seconds * 1000) : 'N/A'}`);
                console.log('');
              });
            }
          } catch (error) {
            console.log(`⚠️ Error querying end-of-call-analysis collection: ${error.message}\n`);
          }
        } else {
          console.log('❌ No user is currently signed in\n');
          
          // Let's try with the known user ID
          console.log('=== Testing with known user ID ===');
          const userId = 'xVoQq94Gk3YoBKnnt5TzDrlPtZ72';
          const analysisQuery = query(
            collection(db, 'end-of-call-analysis'),
            where('studentId', '==', userId),
            orderBy('timestamp', 'desc')
          );
          
          try {
            const analysisSnapshot = await getDocs(analysisQuery);
            console.log(`Found ${analysisSnapshot.size} end-of-call analysis records for known user ID\n`);
          } catch (error) {
            console.log(`⚠️ Error querying end-of-call-analysis collection: ${error.message}\n`);
          }
        }
        
        unsubscribe();
        resolve();
      } catch (error) {
        unsubscribe();
        reject(error);
      }
    });
  });
}

// Run the test
testAnalysisFetch().catch(error => {
  console.error('❌ Error during test:', error.message);
});