import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

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

async function testFirebaseConnection() {
  try {
    console.log('Testing Firebase connection...');
    
    // Test connection by querying a collection
    const q = query(
      collection(db, 'end-of-call-analysis'),
      orderBy('timestamp', 'desc'),
      limit(5)
    );
    
    const querySnapshot = await getDocs(q);
    console.log(`Found ${querySnapshot.size} documents in end-of-call-analysis collection`);
    
    querySnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\nDocument ${index + 1}:`);
      console.log(`  ID: ${doc.id}`);
      console.log(`  Call ID: ${data.callId || 'N/A'}`);
      console.log(`  Student ID: ${data.studentId || 'N/A'}`);
      console.log(`  Timestamp: ${data.timestamp?.toDate?.() || data.timestamp || 'N/A'}`);
    });
    
    console.log('\nFirebase connection test completed successfully!');
  } catch (error) {
    console.error('Firebase connection test failed:', error);
  }
}

testFirebaseConnection();