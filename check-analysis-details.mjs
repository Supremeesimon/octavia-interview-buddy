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

async function checkAnalysisDetails() {
  try {
    console.log('🔍 Checking detailed end-of-call analysis records...\n');
    
    // Get all end-of-call-analysis records for the user
    const analysisSnapshot = await db.collection('end-of-call-analysis')
      .where('studentId', '==', 'xVoQq94Gk3YoBKnnt5TzDrlPtZ72')
      .get();
    
    console.log(`Found ${analysisSnapshot.size} analysis records for user xVoQq94Gk3YoBKnnt5TzDrlPtZ72`);
    
    if (analysisSnapshot.empty) {
      console.log('No analysis records found for this user');
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
        console.log(`   Has Structured Data: ${!!(analysis.structuredData && Object.keys(analysis.structuredData).length > 0)}`);
        if (analysis.structuredData) {
          console.log(`   Categories Count: ${analysis.structuredData.categories ? analysis.structuredData.categories.length : 0}`);
          console.log(`   Strengths Count: ${analysis.structuredData.strengths ? analysis.structuredData.strengths.length : 0}`);
          console.log(`   Improvements Count: ${analysis.structuredData.improvements ? analysis.structuredData.improvements.length : 0}`);
        }
      });
    }
    
    // Also check anonymous records (empty studentId)
    console.log('\n=== Anonymous Analysis Records ===');
    const anonymousSnapshot = await db.collection('end-of-call-analysis')
      .where('studentId', '==', '')
      .get();
    
    console.log(`Found ${anonymousSnapshot.size} anonymous analysis records`);
    
    if (!anonymousSnapshot.empty) {
      // Convert to array and sort by timestamp manually
      const anonymousAnalyses = [];
      anonymousSnapshot.forEach(doc => {
        const data = doc.data();
        anonymousAnalyses.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp ? new Date(data.timestamp._seconds * 1000) : 
                     data.createdAt ? new Date(data.createdAt._seconds * 1000) : null
        });
      });
      
      // Sort by timestamp descending
      anonymousAnalyses.sort((a, b) => (b.timestamp || new Date(0)) - (a.timestamp || new Date(0)));
      
      anonymousAnalyses.forEach((analysis, index) => {
        console.log(`\n${index + 1}. Analysis ID: ${analysis.id}`);
        console.log(`   Call ID: ${analysis.callId || 'N/A'}`);
        console.log(`   Student ID: ${analysis.studentId || 'N/A'} (Empty = Anonymous)`);
        console.log(`   Overall Score: ${analysis.overallScore || analysis.successEvaluation?.score || 'N/A'}`);
        console.log(`   Duration: ${analysis.duration || 'N/A'} seconds`);
        console.log(`   Timestamp: ${analysis.timestamp || 'N/A'}`);
        console.log(`   Has Summary: ${!!analysis.summary}`);
        console.log(`   Has Transcript: ${!!analysis.transcript}`);
        console.log(`   Has Recording: ${!!analysis.recordingUrl}`);
        console.log(`   Has Structured Data: ${!!(analysis.structuredData && Object.keys(analysis.structuredData).length > 0)}`);
        if (analysis.structuredData) {
          console.log(`   Categories Count: ${analysis.structuredData.categories ? analysis.structuredData.categories.length : 0}`);
          console.log(`   Strengths Count: ${analysis.structuredData.strengths ? analysis.structuredData.strengths.length : 0}`);
          console.log(`   Improvements Count: ${analysis.structuredData.improvements ? analysis.structuredData.improvements.length : 0}`);
        }
      });
    }
    
    console.log('\n✅ Analysis details check complete!');
    
  } catch (error) {
    console.error('❌ Error checking analysis details:', error.message);
  }
}

// Run the check
checkAnalysisDetails();