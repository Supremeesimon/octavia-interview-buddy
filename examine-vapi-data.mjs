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

async function examineVapiData() {
  try {
    console.log('🔍 Examining VAPI data for user: oluwaferanmionabanjo@gmail.com\n');
    
    // Get all analysis records for the user
    const analysisSnapshot = await db.collection('end-of-call-analysis')
      .where('studentId', '==', 'xVoQq94Gk3YoBKnnt5TzDrlPtZ72')
      .get();
    
    console.log(`Found ${analysisSnapshot.size} analysis records`);
    
    analysisSnapshot.forEach((doc, index) => {
      const analysis = doc.data();
      console.log(`\n${index + 1}. Analysis ID: ${doc.id}`);
      console.log(`   Call ID: ${analysis.callId || 'N/A'}`);
      console.log(`   Has Summary: ${!!analysis.summary}`);
      console.log(`   Summary Length: ${analysis.summary ? analysis.summary.length : 0} characters`);
      console.log(`   Has Transcript: ${!!analysis.transcript}`);
      console.log(`   Transcript Length: ${analysis.transcript ? analysis.transcript.length : 0} characters`);
      console.log(`   Has Recording URL: ${!!analysis.recordingUrl}`);
      console.log(`   Has Success Evaluation: ${!!(analysis.successEvaluation)}`);
      console.log(`   Success Score: ${analysis.successEvaluation?.score || 'N/A'}`);
      console.log(`   Has Structured Data: ${!!(analysis.structuredData)}`);
      console.log(`   Structured Categories: ${analysis.structuredData?.categories ? analysis.structuredData.categories.length : 0}`);
      console.log(`   Has Strengths: ${!!(analysis.structuredData?.strengths)}`);
      console.log(`   Strengths Count: ${analysis.structuredData?.strengths ? analysis.structuredData.strengths.length : 0}`);
      console.log(`   Has Improvements: ${!!(analysis.structuredData?.improvements)}`);
      console.log(`   Improvements Count: ${analysis.structuredData?.improvements ? analysis.structuredData.improvements.length : 0}`);
      console.log(`   Duration: ${analysis.duration || 'N/A'} seconds`);
    });
    
    console.log('\n✅ Data examination complete!');
    
  } catch (error) {
    console.error('❌ Error examining VAPI data:', error.message);
  }
}

// Run the examination
examineVapiData();