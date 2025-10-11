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

async function updateInterviewsAndFeedback() {
  try {
    console.log('🔄 Updating interviews and feedback with enriched data...\n');
    
    // Get all interviews for the user
    const interviewsSnapshot = await db.collection('interviews')
      .where('studentId', '==', 'xVoQq94Gk3YoBKnnt5TzDrlPtZ72')
      .get();
    
    console.log(`Found ${interviewsSnapshot.size} interviews to process`);
    
    let updatedCount = 0;
    
    for (const interviewDoc of interviewsSnapshot.docs) {
      const interview = interviewDoc.data();
      console.log(`\nProcessing interview ${interviewDoc.id}...`);
      
      // Find corresponding analysis record
      const analysisQuery = await db.collection('end-of-call-analysis')
        .where('vapiCallId', '==', interview.vapiCallId)
        .limit(1)
        .get();
      
      if (!analysisQuery.empty) {
        const analysisDoc = analysisQuery.docs[0];
        const analysis = analysisDoc.data();
        
        console.log(`   Found corresponding analysis ${analysisDoc.id}`);
        
        // Check if analysis has enriched structured data
        if (analysis.structuredData && analysis.structuredData.categories.length > 0) {
          console.log(`   Analysis has enriched data, updating interview and feedback...`);
          
          // Update interview with score if not already set
          if (!interview.score || interview.score === 0) {
            const newScore = analysis.successEvaluation?.score || 75;
            await db.collection('interviews').doc(interviewDoc.id).update({
              score: newScore
            });
            console.log(`   ✅ Updated interview score to ${newScore}`);
          }
          
          // Check if feedback already exists for this interview
          const feedbackQuery = await db.collection('interview-feedback')
            .where('interviewId', '==', interviewDoc.id)
            .limit(1)
            .get();
          
          if (feedbackQuery.empty) {
            // Create feedback record with enriched data
            const feedbackData = {
              interviewId: interviewDoc.id,
              studentId: interview.studentId,
              overallScore: analysis.successEvaluation?.score || 75,
              categories: analysis.structuredData.categories,
              strengths: analysis.structuredData.strengths,
              improvements: analysis.structuredData.improvements,
              recommendations: analysis.structuredData.recommendations,
              detailedAnalysis: analysis.summary || "No detailed analysis available",
              aiModelVersion: 'vapi-enriched-1.0',
              confidenceScore: 0.9,
              createdAt: new Date()
            };
            
            await db.collection('interview-feedback').add(feedbackData);
            console.log(`   ✅ Created enriched feedback record`);
            updatedCount++;
          } else {
            console.log(`   ℹ️ Feedback already exists, skipping...`);
          }
        } else {
          console.log(`   ℹ️ Analysis doesn't have enriched data, skipping...`);
        }
      } else {
        console.log(`   ❌ No corresponding analysis found`);
      }
    }
    
    console.log(`\n🎉 Successfully updated ${updatedCount} interviews with enriched feedback!`);
    
    // Verify the results
    console.log('\n🔍 Verifying results...');
    
    const feedbackSnapshot = await db.collection('interview-feedback')
      .where('studentId', '==', 'xVoQq94Gk3YoBKnnt5TzDrlPtZ72')
      .get();
    
    console.log(`Found ${feedbackSnapshot.size} feedback records for user`);
    
    feedbackSnapshot.forEach((doc, index) => {
      const feedback = doc.data();
      console.log(`\n${index + 1}. Feedback ID: ${doc.id}`);
      console.log(`   Interview ID: ${feedback.interviewId}`);
      console.log(`   Overall Score: ${feedback.overallScore}`);
      console.log(`   Categories: ${feedback.categories.length}`);
      console.log(`   Strengths: ${feedback.strengths.length}`);
      console.log(`   Improvements: ${feedback.improvements.length}`);
      console.log(`   Recommendations: ${feedback.recommendations.length}`);
    });
    
    console.log('\n✅ Update process complete!');
    
  } catch (error) {
    console.error('❌ Error updating interviews and feedback:', error.message);
    console.error(error.stack);
  }
}

// Run the update
updateInterviewsAndFeedback();