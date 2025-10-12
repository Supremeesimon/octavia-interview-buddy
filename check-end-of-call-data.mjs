import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

// Firebase configuration from your .env.example
const firebaseConfig = {
  apiKey: "your_firebase_api_key_here",
  authDomain: "octavia-practice-interviewer.firebaseapp.com",
  projectId: "octavia-practice-interviewer",
  storageBucket: "octavia-practice-interviewer.appspot.com",
  messagingSenderId: "your_messaging_sender_id",
  appId: "your_firebase_app_id",
  measurementId: "your_measurement_id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkEndOfCallAnalysisData() {
  try {
    console.log('🔍 Checking end-of-call-analysis collection...\n');

    // Query the end-of-call-analysis collection
    const analysisCollection = collection(db, 'end-of-call-analysis');
    const q = query(analysisCollection, orderBy('timestamp', 'desc'), limit(5));
    const analysisSnapshot = await getDocs(q);
    
    console.log(`Found ${analysisSnapshot.size} documents in end-of-call-analysis collection\n`);
    
    if (analysisSnapshot.empty) {
      console.log('No documents found\n');
      return;
    }

    // Process each document
    for (const [index, doc] of analysisSnapshot.docs.entries()) {
      const data = doc.data();
      
      console.log(`=== Document ${index + 1}: ${doc.id} ===`);
      console.log(`Call ID: ${data.callId || 'N/A'}`);
      console.log(`Student ID: ${data.studentId || 'N/A'}`);
      console.log(`Department ID: ${data.departmentId || 'N/A'}`);
      console.log(`Institution ID: ${data.institutionId || 'N/A'}`);
      console.log(`Interview Type: ${data.interviewType || 'N/A'}`);
      console.log(`Timestamp: ${data.timestamp ? new Date(data.timestamp).toISOString() : 'N/A'}`);
      console.log(`Created At: ${data.createdAt ? new Date(data.createdAt.seconds * 1000).toISOString() : 'N/A'}`);
      
      // Check analysis data
      console.log(`Has summary: ${!!data.summary}`);
      console.log(`Has transcript: ${!!data.transcript}`);
      console.log(`Has recordingUrl: ${!!data.recordingUrl}`);
      console.log(`Duration: ${data.duration || 'N/A'}`);
      
      if (data.successEvaluation) {
        console.log(`Success Evaluation Score: ${data.successEvaluation.score || 'N/A'}`);
        console.log(`Success Evaluation Passed: ${data.successEvaluation.passed || 'N/A'}`);
      }
      
      if (data.structuredData) {
        console.log(`Structured Data Categories: ${data.structuredData.categories ? data.structuredData.categories.length : 0}`);
        if (data.structuredData.categories && data.structuredData.categories.length > 0) {
          data.structuredData.categories.forEach((category, i) => {
            console.log(`  Category ${i + 1}: ${category.name} - Score: ${category.score}/100`);
          });
        }
        console.log(`Structured Data Strengths: ${data.structuredData.strengths ? data.structuredData.strengths.length : 0}`);
        if (data.structuredData.strengths && data.structuredData.strengths.length > 0) {
          console.log(`  Strengths: ${data.structuredData.strengths.join(', ')}`);
        }
        console.log(`Structured Data Improvements: ${data.structuredData.improvements ? data.structuredData.improvements.length : 0}`);
        if (data.structuredData.improvements && data.structuredData.improvements.length > 0) {
          console.log(`  Improvements: ${data.structuredData.improvements.join(', ')}`);
        }
      }
      
      // Show a snippet of the summary if it exists
      if (data.summary) {
        console.log(`Summary (first 200 chars): ${data.summary.substring(0, 200)}${data.summary.length > 200 ? '...' : ''}`);
      }
      
      console.log(''); // Empty line for readability
    }
    
    console.log('✅ Analysis complete!');
    
  } catch (error) {
    console.error('❌ Error checking documents:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
  }
}

// Run the check
checkEndOfCallAnalysisData();