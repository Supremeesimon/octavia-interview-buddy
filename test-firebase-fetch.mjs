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

async function testFirebaseFetch() {
  try {
    console.log('🔍 Testing Firebase data fetch...');
    
    // Directly fetch from the end-of-call-analysis collection
    const analysisCollection = db.collection('end-of-call-analysis');
    const analysisSnapshot = await analysisCollection.orderBy('timestamp', 'desc').limit(100).get();
    
    console.log(`Found ${analysisSnapshot.size} documents in end-of-call-analysis collection`);
    
    if (analysisSnapshot.empty) {
      console.log('❌ No documents found in the collection');
      return;
    }
    
    console.log('📄 Document IDs:');
    analysisSnapshot.docs.forEach((doc, index) => {
      console.log(`  ${index + 1}. ${doc.id}`);
    });
    
    // Examine the actual data structure
    console.log('\n🔍 Examining document structure...');
    for (const [index, doc] of analysisSnapshot.docs.entries()) {
      const data = doc.data();
      console.log(`\n=== Document ${index + 1}: ${doc.id} ===`);
      console.log(`Call ID: ${data.callId || 'N/A'}`);
      console.log(`Student ID: ${data.studentId || 'N/A'}`);
      console.log(`Has summary: ${!!data.summary}`);
      console.log(`Has transcript: ${!!data.transcript}`);
      console.log(`Timestamp: ${data.timestamp ? new Date(data.timestamp._seconds * 1000).toISOString() : 'N/A'}`);
      
      if (data.summary) {
        try {
          // Parse the summary JSON
          let summaryContent = data.summary;
          summaryContent = summaryContent.replace(/```json\s*|\s*```/g, '').trim();
          const summaryData = JSON.parse(summaryContent);
          console.log(`Parsed Summary Rating: ${summaryData.Rating || 'N/A'}`);
          console.log(`Parsed Communication Skills: ${summaryData['Communication Skills'] || 'N/A'}`);
          console.log(`Parsed Areas for Improvement count: ${summaryData['Areas for Improvement'] ? summaryData['Areas for Improvement'].length : 0}`);
        } catch (parseError) {
          console.log(`Error parsing summary: ${parseError.message}`);
        }
      }
      
      // Show a snippet of the summary
      if (data.summary) {
        console.log(`Summary snippet: ${data.summary.substring(0, 100)}...`);
      }
      
      if (index >= 1) {
        console.log('... (more documents not shown)');
        break;
      }
    }
    
    console.log('\n✅ Firebase data fetch test complete!');
    
  } catch (error) {
    console.error('❌ Error testing Firebase fetch:', error);
  }
}

// Run the test
testFirebaseFetch();