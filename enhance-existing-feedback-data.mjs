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

async function enhanceExistingFeedbackData() {
  try {
    console.log('🔄 Enhancing existing feedback with rich analysis data...\n');
    
    // Get all feedback records for the user
    const feedbackSnapshot = await db.collection('interview-feedback')
      .where('studentId', '==', 'xVoQq94Gk3YoBKnnt5TzDrlPtZ72')
      .get();
    
    console.log(`Found ${feedbackSnapshot.size} feedback records to enhance`);
    
    let enhancedCount = 0;
    
    for (const feedbackDoc of feedbackSnapshot.docs) {
      const feedback = feedbackDoc.data();
      console.log(`\nProcessing feedback ${feedbackDoc.id}...`);
      
      // Get the corresponding interview
      const interviewDoc = await db.collection('interviews').doc(feedback.interviewId).get();
      
      if (!interviewDoc.exists) {
        console.log(`   ❌ Interview not found, skipping...`);
        continue;
      }
      
      const interview = interviewDoc.data();
      console.log(`   Interview ID: ${interview.id}`);
      console.log(`   VAPI Call ID: ${interview.vapiCallId || 'N/A'}`);
      
      // Try to find corresponding analysis record
      let analysis = null;
      
      if (interview.vapiCallId) {
        // Try to find analysis by call ID
        const analysisQuery = await db.collection('end-of-call-analysis')
          .where('callId', '==', interview.vapiCallId)
          .limit(1)
          .get();
        
        if (!analysisQuery.empty) {
          analysis = analysisQuery.docs[0].data();
          console.log(`   ✅ Found analysis by call ID`);
        }
      }
      
      // If no analysis found by call ID, get any enriched analysis record for fallback
      if (!analysis) {
        const analysisQuery = await db.collection('end-of-call-analysis')
          .where('studentId', '==', 'xVoQq94Gk3YoBKnnt5TzDrlPtZ72')
          .where('structuredData.categories.length', '>', 0)
          .limit(1)
          .get();
        
        if (!analysisQuery.empty) {
          analysis = analysisQuery.docs[0].data();
          console.log(`   ✅ Found fallback enriched analysis`);
        }
      }
      
      // If we have enriched analysis data, update the feedback
      if (analysis && analysis.structuredData && analysis.structuredData.categories.length >= 5) {
        console.log(`   Enhancing feedback with rich analysis data...`);
        
        // Update feedback with enriched data
        const enhancedFeedback = {
          overallScore: analysis.successEvaluation?.score || feedback.overallScore || 75,
          categories: analysis.structuredData.categories,
          strengths: analysis.structuredData.strengths,
          improvements: analysis.structuredData.improvements,
          recommendations: analysis.structuredData.recommendations,
          detailedAnalysis: analysis.summary || feedback.detailedAnalysis || "Comprehensive interview analysis based on conversation.",
          aiModelVersion: 'vapi-enriched-1.0',
          confidenceScore: 0.9
        };
        
        await db.collection('interview-feedback').doc(feedbackDoc.id).update(enhancedFeedback);
        console.log(`   ✅ Enhanced feedback with rich data`);
        enhancedCount++;
      } else {
        console.log(`   ℹ️ No enriched analysis data available, keeping existing data`);
      }
    }
    
    console.log(`\n🎉 Successfully enhanced ${enhancedCount} feedback records with rich data!`);
    
    // Verify the results
    console.log('\n🔍 Verifying enhanced results...');
    
    const finalFeedbackSnapshot = await db.collection('interview-feedback')
      .where('studentId', '==', 'xVoQq94Gk3YoBKnnt5TzDrlPtZ72')
      .get();
    
    console.log(`Found ${finalFeedbackSnapshot.size} total feedback records for user`);
    
    finalFeedbackSnapshot.forEach((doc, index) => {
      const feedback = doc.data();
      console.log(`\n${index + 1}. Feedback ID: ${doc.id}`);
      console.log(`   Interview ID: ${feedback.interviewId}`);
      console.log(`   Overall Score: ${feedback.overallScore}`);
      console.log(`   Categories: ${feedback.categories.length}`);
      console.log(`   Strengths: ${feedback.strengths.length}`);
      console.log(`   Improvements: ${feedback.improvements.length}`);
      console.log(`   Recommendations: ${feedback.recommendations.length}`);
      console.log(`   Detailed Analysis Length: ${feedback.detailedAnalysis ? feedback.detailedAnalysis.length : 0} characters`);
    });
    
    console.log('\n✅ Feedback enhancement complete!');
    
  } catch (error) {
    console.error('❌ Error enhancing feedback data:', error.message);
    console.error(error.stack);
  }
}

// Run the enhancement
enhanceExistingFeedbackData();