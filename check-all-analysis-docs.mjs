import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Read the service account key file
const serviceAccount = JSON.parse(
  readFileSync(resolve('./firebase-service-account.json'), 'utf8')
);

// Initialize Firebase Admin with service account credentials
const app = initializeApp({
  credential: cert(serviceAccount),
  projectId: 'octavia-practice-interviewer',
});

const db = getFirestore(app);

async function checkAllAnalysisDocs() {
  try {
    console.log('🔍 Checking all end-of-call-analysis documents...\n');

    // Get all documents in the collection
    const analysisCollection = db.collection('end-of-call-analysis');
    const analysisSnapshot = await analysisCollection.get();
    
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
      console.log(`Resume ID: ${data.resumeId || 'N/A'}`);
      console.log(`Session ID: ${data.sessionId || 'N/A'}`);
      console.log(`Timestamp: ${data.createdAt ? new Date(data.createdAt._seconds * 1000).toISOString() : 'N/A'}`);
      
      // Check if metadata exists
      console.log(`Has metadata: ${!!data.metadata}`);
      if (data.metadata) {
        console.log(`Metadata studentId: ${data.metadata.studentId || 'N/A'}`);
        console.log(`Metadata departmentId: ${data.metadata.departmentId || 'N/A'}`);
        console.log(`Metadata institutionId: ${data.metadata.institutionId || 'N/A'}`);
        console.log(`Metadata interviewType: ${data.metadata.interviewType || 'N/A'}`);
        console.log(`Metadata resumeId: ${data.metadata.resumeId || 'N/A'}`);
        console.log(`Metadata sessionId: ${data.metadata.sessionId || 'N/A'}`);
      }
      
      // Check analysis data
      console.log(`Has summary: ${!!data.summary}`);
      console.log(`Has transcript: ${!!data.transcript}`);
      console.log(`Has recordingUrl: ${!!data.recordingUrl}`);
      console.log(`Duration: ${data.duration || 'N/A'}`);
      
      // Parse the summary JSON to extract structured data
      if (data.summary) {
        try {
          // The summary is a JSON string wrapped in markdown code blocks
          let summaryContent = data.summary;
          // Remove markdown code block wrappers if present
          summaryContent = summaryContent.replace(/```json\s*|\s*```/g, '').trim();
          
          const summaryData = JSON.parse(summaryContent);
          console.log(`Parsed Summary Rating: ${summaryData.Rating || 'N/A'}`);
          console.log(`Parsed Communication Skills: ${summaryData['Communication Skills'] || 'N/A'}`);
          console.log(`Parsed Technical Knowledge: ${summaryData['Technical Knowledge'] || 'N/A'}`);
          console.log(`Parsed Problem Solving: ${summaryData['Problem Solving'] || 'N/A'}`);
          console.log(`Parsed Enthusiasm: ${summaryData.Enthusiasm || 'N/A'}`);
          console.log(`Parsed Interview Outcome: ${summaryData['Interview Outcome'] || 'N/A'}`);
          console.log(`Parsed Strengths Count: ${summaryData.Strengths ? summaryData.Strengths.length : 0}`);
          console.log(`Parsed Areas for Improvement Count: ${summaryData['Areas for Improvement'] ? summaryData['Areas for Improvement'].length : 0}`);
          console.log(`Parsed Recommendations Count: ${summaryData.Recommendations ? summaryData.Recommendations.length : 0}`);
        } catch (parseError) {
          console.log(`Error parsing summary JSON: ${parseError.message}`);
        }
      }
      
      if (data.successEvaluation) {
        console.log(`Success Evaluation Score: ${data.successEvaluation.score || 'N/A'}`);
      }
      
      if (data.structuredData) {
        console.log(`Structured Data Categories: ${data.structuredData.categories ? data.structuredData.categories.length : 0}`);
        console.log(`Structured Data Strengths: ${data.structuredData.strengths ? data.structuredData.strengths.length : 0}`);
        console.log(`Structured Data Improvements: ${data.structuredData.improvements ? data.structuredData.improvements.length : 0}`);
      }
      
      // Show the actual summary content
      if (data.summary) {
        console.log(`\nSUMMARY CONTENT:`);
        console.log(data.summary);
      }
      
      console.log(''); // Empty line for readability
      
      // Limit detailed output to first 2 documents
      if (index >= 1) {
        console.log(`... (${analysisSnapshot.size - 2} more documents not shown in detail)`);
        break;
      }
    }
    
    console.log('✅ Analysis complete!');
    
  } catch (error) {
    console.error('❌ Error checking documents:', error);
  }
}

// Run the check
checkAllAnalysisDocs();