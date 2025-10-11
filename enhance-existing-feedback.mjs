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

// Mock categories for generating feedback when it's missing
const mockCategories = [
  { name: "Communication", description: "Clarity, articulation, and effectiveness of verbal communication" },
  { name: "Technical Knowledge", description: "Understanding of relevant technical concepts and skills" },
  { name: "Problem Solving", description: "Approach to analyzing and solving complex problems" },
  { name: "Adaptability", description: "Ability to adjust approach based on new information or changing circumstances" },
  { name: "Professionalism", description: "Overall professional demeanor and interview presence" }
];

// Mock strengths and improvements for generating feedback
const mockStrengths = [
  "Clear and articulate responses",
  "Good technical foundation",
  "Strong problem-solving approach",
  "Professional demeanor",
  "Effective communication skills",
  "Relevant experience examples",
  "Confident presentation style"
];

const mockImprovements = [
  "Provide more specific examples",
  "Speak more confidently",
  "Improve technical depth in some areas",
  "Better structure responses using STAR method",
  "Address follow-up questions more directly",
  "Provide more concrete metrics and results",
  "Enhance storytelling with clearer narratives"
];

// Mock recommendations for improvement
const mockRecommendations = [
  "Practice with the STAR method for behavioral questions",
  "Review technical concepts in your field",
  "Record practice interviews to identify areas for improvement",
  "Prepare specific examples for common interview questions",
  "Work on speaking more confidently and clearly",
  "Study successful interview responses in your industry"
];

async function enhanceExistingFeedback() {
  try {
    console.log('🔄 Enhancing existing feedback data...\n');
    
    // Get all interviews for the user that don't have feedback yet
    const interviewsSnapshot = await db.collection('interviews')
      .where('studentId', '==', 'xVoQq94Gk3YoBKnnt5TzDrlPtZ72')
      .get();
    
    console.log(`Found ${interviewsSnapshot.size} interviews for user xVoQq94Gk3YoBKnnt5TzDrlPtZ72`);
    
    let enhancedCount = 0;
    
    for (const interviewDoc of interviewsSnapshot.docs) {
      const interview = { id: interviewDoc.id, ...interviewDoc.data() };
      
      // Check if feedback already exists for this interview
      const existingFeedback = await db.collection('interview-feedback')
        .where('interviewId', '==', interview.id)
        .limit(1)
        .get();
      
      if (!existingFeedback.empty) {
        console.log(`   ℹ️ Feedback already exists for interview ${interview.id}, skipping...`);
        continue;
      }
      
      // Get the corresponding analysis record
      const analysisSnapshot = await db.collection('end-of-call-analysis')
        .where('vapiCallId', '==', interview.vapiCallId)
        .limit(1)
        .get();
      
      let analysis = null;
      if (!analysisSnapshot.empty) {
        analysis = analysisSnapshot.docs[0].data();
      }
      
      // Generate mock feedback data
      const mockScore = Math.floor(Math.random() * 30) + 60; // Random score between 60-89
      
      // Generate mock categories with random scores
      const categories = mockCategories.map(category => ({
        name: category.name,
        score: Math.floor(Math.random() * 40) + 60, // Random score between 60-99
        weight: 0.2, // Equal weight for all categories
        description: category.description
      }));
      
      // Randomly select some strengths and improvements
      const strengths = mockStrengths
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 3) + 2); // 2-4 strengths
      
      const improvements = mockImprovements
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 3) + 1); // 1-3 improvements
      
      // Select recommendations
      const recommendations = mockRecommendations
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 2) + 2); // 2-3 recommendations
      
      // Use analysis summary if available, otherwise generate a generic one
      const detailedAnalysis = analysis?.summary || 
        `Based on the interview conversation, here is a comprehensive analysis of your performance. ` +
        `You demonstrated strong communication skills and relevant technical knowledge. ` +
        `Areas for improvement include providing more specific examples and speaking with greater confidence.`;
      
      // Create feedback record
      const feedbackData = {
        interviewId: interview.id,
        studentId: interview.studentId,
        overallScore: mockScore,
        categories: categories,
        strengths: strengths,
        improvements: improvements,
        recommendations: recommendations,
        detailedAnalysis: detailedAnalysis,
        aiModelVersion: 'enhanced-mock-v1.0',
        confidenceScore: 0.75, // Lower confidence since it's mock data
        createdAt: new Date()
      };
      
      // Save the feedback
      await db.collection('interview-feedback').add(feedbackData);
      console.log(`   ✅ Enhanced feedback for interview ${interview.id} with score ${mockScore}`);
      enhancedCount++;
    }
    
    console.log(`\n🎉 Successfully enhanced ${enhancedCount} feedback records!`);
    
  } catch (error) {
    console.error('❌ Error enhancing feedback data:', error.message);
  }
}

// Run the enhancement
enhanceExistingFeedback();