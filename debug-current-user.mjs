import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

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

async function debugCurrentUser() {
  return new Promise((resolve, reject) => {
    console.log('🔍 Debugging current user...\n');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          console.log(`✅ Current user: ${user.email} (ID: ${user.uid})\n`);
          
          // Check for user document in Firestore
          console.log('=== Checking User Document ===');
          try {
            const userDoc = await getDocs(query(collection(db, 'users'), where('id', '==', user.uid)));
            if (!userDoc.empty) {
              const userData = userDoc.docs[0].data();
              console.log(`User document found:`);
              console.log(`  Name: ${userData.name}`);
              console.log(`  Role: ${userData.role}`);
              console.log(`  Institution: ${userData.institutionDomain || 'N/A'}\n`);
            } else {
              console.log('❌ User document not found in Firestore\n');
            }
          } catch (error) {
            console.log(`⚠️ Error checking user document: ${error.message}\n`);
          }
          
          // Check for interviews for this user
          console.log('=== Checking User Interviews ===');
          try {
            const interviewsSnapshot = await getDocs(query(collection(db, 'interviews'), where('studentId', '==', user.uid)));
            console.log(`Found ${interviewsSnapshot.size} interviews for current user\n`);
            
            if (!interviewsSnapshot.empty) {
              console.log('Interviews:');
              interviewsSnapshot.forEach((doc, index) => {
                const interviewData = doc.data();
                console.log(`${index + 1}. ID: ${doc.id}`);
                console.log(`   Status: ${interviewData.status || 'N/A'}`);
                console.log(`   Type: ${interviewData.type || 'N/A'}`);
                console.log(`   Score: ${interviewData.score || 'N/A'}`);
                console.log(`   Created: ${interviewData.createdAt ? new Date(interviewData.createdAt._seconds * 1000) : 'N/A'}`);
                console.log('');
              });
            } else {
              console.log('No interviews found for current user\n');
            }
          } catch (error) {
            console.log(`⚠️ Error checking user interviews: ${error.message}\n`);
          }
          
          // Check for interview feedback for this user
          console.log('=== Checking User Feedback ===');
          try {
            const feedbackSnapshot = await getDocs(query(collection(db, 'interview-feedback'), where('studentId', '==', user.uid)));
            console.log(`Found ${feedbackSnapshot.size} feedback records for current user\n`);
            
            if (!feedbackSnapshot.empty) {
              console.log('Feedback records:');
              feedbackSnapshot.forEach((doc, index) => {
                const feedbackData = doc.data();
                console.log(`${index + 1}. ID: ${doc.id}`);
                console.log(`   Interview ID: ${feedbackData.interviewId || 'N/A'}`);
                console.log(`   Overall Score: ${feedbackData.overallScore || 'N/A'}`);
                console.log(`   Created: ${feedbackData.createdAt ? new Date(feedbackData.createdAt._seconds * 1000) : 'N/A'}`);
                console.log('');
              });
            } else {
              console.log('No feedback records found for current user\n');
            }
          } catch (error) {
            console.log(`⚠️ Error checking user feedback: ${error.message}\n`);
          }
        } else {
          console.log('❌ No user is currently signed in\n');
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

// Run the debug
debugCurrentUser().catch(error => {
  console.error('❌ Error during debug:', error.message);
});