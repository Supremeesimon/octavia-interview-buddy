import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy, limit, doc, getDoc } from 'firebase/firestore';

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

async function checkAnalysisDocumentsDetailed() {
  try {
    console.log('🔍 Checking end-of-call-analysis documents in detail...\n');

    // Query the end-of-call-analysis collection
    const analysisCollection = collection(db, 'end-of-call-analysis');
    const q = query(analysisCollection, orderBy('timestamp', 'desc'));
    const analysisSnapshot = await getDocs(q);
    
    console.log(`Found ${analysisSnapshot.size} documents in end-of-call-analysis collection\n`);
    
    if (analysisSnapshot.empty) {
      console.log('No documents found\n');
      return;
    }

    // Process each document
    for (const [index, docSnapshot] of analysisSnapshot.docs.entries()) {
      const docId = docSnapshot.id;
      const data = docSnapshot.data();
      
      console.log(`=== Document ${index + 1}: ${docId} ===`);
      console.log(`Call ID: ${data.callId || 'N/A'}`);
      console.log(`Student ID: ${data.studentId || 'N/A'}`);
      console.log(`Department ID: ${data.departmentId || 'N/A'}`);
      console.log(`Institution ID: ${data.institutionId || 'N/A'}`);
      console.log(`Interview Type: ${data.interviewType || 'N/A'}`);
      
      // Handle different timestamp formats
      let timestampStr = 'N/A';
      if (data.timestamp) {
        if (data.timestamp instanceof Date) {
          timestampStr = data.timestamp.toISOString();
        } else if (data.timestamp._seconds) {
          timestampStr = new Date(data.timestamp._seconds * 1000).toISOString();
        } else if (typeof data.timestamp === 'string') {
          timestampStr = new Date(data.timestamp).toISOString();
        }
      }
      console.log(`Timestamp: ${timestampStr}`);
      
      let createdAtStr = 'N/A';
      if (data.createdAt) {
        if (data.createdAt instanceof Date) {
          createdAtStr = data.createdAt.toISOString();
        } else if (data.createdAt._seconds) {
          createdAtStr = new Date(data.createdAt._seconds * 1000).toISOString();
        } else if (data.createdAt.seconds) {
          createdAtStr = new Date(data.createdAt.seconds * 1000).toISOString();
        } else if (typeof data.createdAt === 'string') {
          createdAtStr = new Date(data.createdAt).toISOString();
        }
      }
      console.log(`Created At: ${createdAtStr}`);
      
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
            console.log(`  Category ${i + 1}: ${category.name} - Score: ${category.score}/100 (Weight: ${category.weight || 'N/A'})`);
          });
        }
        console.log(`Structured Data Strengths: ${data.structuredData.strengths ? data.structuredData.strengths.length : 0}`);
        if (data.structuredData.strengths && data.structuredData.strengths.length > 0) {
          console.log(`  Strengths: ${data.structuredData.strengths.slice(0, 3).join(', ')}${data.structuredData.strengths.length > 3 ? '...' : ''}`);
        }
        console.log(`Structured Data Improvements: ${data.structuredData.improvements ? data.structuredData.improvements.length : 0}`);
        if (data.structuredData.improvements && data.structuredData.improvements.length > 0) {
          console.log(`  Improvements: ${data.structuredData.improvements.slice(0, 3).join(', ')}${data.structuredData.improvements.length > 3 ? '...' : ''}`);
        }
        console.log(`Structured Data Recommendations: ${data.structuredData.recommendations ? data.structuredData.recommendations.length : 0}`);
        if (data.structuredData.recommendations && data.structuredData.recommendations.length > 0) {
          console.log(`  Recommendations: ${data.structuredData.recommendations.slice(0, 3).join(', ')}${data.structuredData.recommendations.length > 3 ? '...' : ''}`);
        }
      }
      
      // Show a snippet of the summary if it exists
      if (data.summary) {
        console.log(`Summary (first 300 chars): ${data.summary.substring(0, 300)}${data.summary.length > 300 ? '...' : ''}`);
      }
      
      console.log(''); // Empty line for readability
      
      // Limit output to first 3 documents for readability
      if (index >= 2) {
        console.log(`... (${analysisSnapshot.size - 3} more documents not shown)`);
        break;
      }
    }
    
    console.log('✅ Analysis complete!');
    
  } catch (error) {
    console.error('❌ Error checking documents:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the check
checkAnalysisDocumentsDetailed();