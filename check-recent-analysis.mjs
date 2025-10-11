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

async function checkRecentAnalysis() {
  try {
    console.log('🔍 Checking recent end-of-call analysis...\n');
    
    // Get recent documents from end-of-call-analysis collection
    const analysisSnapshot = await db.collection('end-of-call-analysis')
      .limit(10)
      .get();
    
    console.log(`Found ${analysisSnapshot.size} recent analysis records`);
    
    if (analysisSnapshot.empty) {
      console.log('No recent analysis records found');
    } else {
      // Convert to array and sort by timestamp manually
      const analyses = [];
      analysisSnapshot.forEach(doc => {
        const data = doc.data();
        analyses.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp ? new Date(data.timestamp._seconds * 1000) : 
                     data.createdAt ? new Date(data.createdAt._seconds * 1000) : null
        });
      });
      
      // Sort by timestamp descending
      analyses.sort((a, b) => (b.timestamp || new Date(0)) - (a.timestamp || new Date(0)));
      
      analyses.forEach((analysis, index) => {
        console.log(`\n${index + 1}. Analysis ID: ${analysis.id}`);
        console.log(`   Call ID: ${analysis.callId || 'N/A'}`);
        console.log(`   Student ID: ${analysis.studentId || 'N/A'}`);
        console.log(`   Overall Score: ${analysis.overallScore || analysis.successEvaluation?.score || 'N/A'}`);
        console.log(`   Duration: ${analysis.duration || 'N/A'} seconds`);
        console.log(`   Timestamp: ${analysis.timestamp || 'N/A'}`);
        console.log(`   Has Summary: ${!!analysis.summary}`);
        console.log(`   Has Transcript: ${!!analysis.transcript}`);
        console.log(`   Has Recording: ${!!analysis.recordingUrl}`);
      });
    }
    
    console.log('\n✅ Recent analysis check complete!');
    
  } catch (error) {
    console.error('❌ Error checking recent analysis:', error.message);
  }
}

// Run the check
checkRecentAnalysis();