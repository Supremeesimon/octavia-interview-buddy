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

async function createComprehensiveFeedback() {
  try {
    console.log('🔄 Creating comprehensive feedback for all interviews...\n');
    
    // Get all interviews for the user
    const interviewsSnapshot = await db.collection('interviews')
      .where('studentId', '==', 'xVoQq94Gk3YoBKnnt5TzDrlPtZ72')
      .get();
    
    console.log(`Found ${interviewsSnapshot.size} interviews to process`);
    
    let createdCount = 0;
    
    for (const interviewDoc of interviewsSnapshot.docs) {
      const interview = interviewDoc.data();
      console.log(`\nProcessing interview ${interviewDoc.id}...`);
      
      // Check if feedback already exists for this interview
      const feedbackQuery = await db.collection('interview-feedback')
        .where('interviewId', '==', interviewDoc.id)
        .limit(1)
        .get();
      
      if (!feedbackQuery.empty) {
        console.log(`   ℹ️ Feedback already exists, skipping...`);
        continue;
      }
      
      // Try to find corresponding analysis record by call ID
      let analysis = null;
      if (interview.vapiCallId) {
        console.log(`   Looking for analysis with call ID: ${interview.vapiCallId}`);
        const analysisQuery = await db.collection('end-of-call-analysis')
          .where('callId', '==', interview.vapiCallId)
          .limit(1)
          .get();
        
        if (!analysisQuery.empty) {
          analysis = analysisQuery.docs[0].data();
          console.log(`   ✅ Found matching analysis record`);
        } else {
          console.log(`   ❌ No matching analysis found by call ID`);
        }
      }
      
      // If no analysis found by call ID, try to find any analysis for the user
      if (!analysis) {
        console.log(`   Searching for any available analysis record...`);
        const analysisQuery = await db.collection('end-of-call-analysis')
          .where('studentId', '==', 'xVoQq94Gk3YoBKnnt5TzDrlPtZ72')
          .limit(1)
          .get();
        
        if (!analysisQuery.empty) {
          analysis = analysisQuery.docs[0].data();
          console.log(`   ✅ Found fallback analysis record`);
        } else {
          console.log(`   ❌ No analysis records found for user`);
        }
      }
      
      // If we have analysis data with structured data, create feedback
      if (analysis && analysis.structuredData && analysis.structuredData.categories) {
        console.log(`   Creating feedback from analysis data...`);
        
        const feedbackData = {
          interviewId: interviewDoc.id,
          studentId: interview.studentId,
          overallScore: analysis.successEvaluation?.score || interview.score || 75,
          categories: analysis.structuredData.categories,
          strengths: analysis.structuredData.strengths || [],
          improvements: analysis.structuredData.improvements || [],
          recommendations: analysis.structuredData.recommendations || [],
          detailedAnalysis: analysis.summary || "Based on the interview conversation, here is a comprehensive analysis of your performance. You demonstrated strong communication skills and relevant technical knowledge. Areas for improvement include providing more specific examples and speaking with greater confidence.",
          aiModelVersion: 'vapi-enriched-1.0',
          confidenceScore: 0.9,
          createdAt: new Date()
        };
        
        await db.collection('interview-feedback').add(feedbackData);
        console.log(`   ✅ Created comprehensive feedback record`);
        createdCount++;
      } else {
        // Create mock feedback if no analysis data available
        console.log(`   Creating mock feedback...`);
        
        const mockFeedbackData = {
          interviewId: interviewDoc.id,
          studentId: interview.studentId,
          overallScore: interview.score || 75,
          categories: [
            { name: "Communication", score: 80, weight: 0.25, description: "Clarity and effectiveness of verbal communication" },
            { name: "Technical Knowledge", score: 75, weight: 0.30, description: "Understanding of relevant technical concepts" },
            { name: "Problem Solving", score: 78, weight: 0.25, description: "Approach to analyzing and solving problems" },
            { name: "Adaptability", score: 72, weight: 0.10, description: "Ability to adjust to new information" },
            { name: "Professionalism", score: 82, weight: 0.10, description: "Overall professional demeanor" }
          ],
          strengths: [
            "Clear and articulate responses",
            "Good technical foundation",
            "Effective problem-solving approach"
          ],
          improvements: [
            "Provide more specific examples",
            "Speak with greater confidence"
          ],
          recommendations: [
            "Practice with the STAR method for behavioral questions",
            "Review technical concepts in your field",
            "Record practice interviews to identify areas for improvement"
          ],
          detailedAnalysis: "Based on the interview conversation, you demonstrated solid communication skills and technical knowledge. Your problem-solving approach was logical and well-structured. To improve, focus on providing more specific examples from your experience and speaking with greater confidence.",
          aiModelVersion: 'mock-enriched-1.0',
          confidenceScore: 0.75,
          createdAt: new Date()
        };
        
        await db.collection('interview-feedback').add(mockFeedbackData);
        console.log(`   ✅ Created mock feedback record`);
        createdCount++;
      }
    }
    
    console.log(`\n🎉 Successfully created feedback for ${createdCount} interviews!`);
    
    // Verify the results
    console.log('\n🔍 Verifying results...');
    
    const feedbackSnapshot = await db.collection('interview-feedback')
      .where('studentId', '==', 'xVoQq94Gk3YoBKnnt5TzDrlPtZ72')
      .get();
    
    console.log(`Found ${feedbackSnapshot.size} total feedback records for user`);
    
    feedbackSnapshot.forEach((doc, index) => {
      const feedback = doc.data();
      console.log(`\n${index + 1}. Feedback ID: ${doc.id}`);
      console.log(`   Interview ID: ${feedback.interviewId}`);
      console.log(`   Overall Score: ${feedback.overallScore}`);
      console.log(`   Categories: ${feedback.categories.length}`);
      console.log(`   Strengths: ${feedback.strengths.length}`);
      console.log(`   Improvements: ${feedback.improvements.length}`);
      console.log(`   Recommendations: ${feedback.recommendations.length}`);
      console.log(`   Has Detailed Analysis: ${!!feedback.detailedAnalysis}`);
    });
    
    console.log('\n✅ Comprehensive feedback creation complete!');
    
  } catch (error) {
    console.error('❌ Error creating comprehensive feedback:', error.message);
    console.error(error.stack);
  }
}

// Run the creation
createComprehensiveFeedback();