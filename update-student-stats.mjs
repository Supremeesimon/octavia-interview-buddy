import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load service account credentials
const serviceAccount = JSON.parse(readFileSync(resolve('firebase-service-account.json'), 'utf8'));

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert(serviceAccount),
  projectId: 'octavia-practice-interviewer',
});

const db = getFirestore(app);

async function updateStudentStats() {
  try {
    console.log('🔍 Updating student stats for user: oluwaferanmionabanjo@gmail.com\n');
    
    // First, find the user ID for onabanjo oluwaferanmi
    console.log('=== Looking for user ===');
    const usersSnapshot = await db.collection('users')
      .where('email', '==', 'oluwaferanmionabanjo@gmail.com')
      .get();
    
    if (usersSnapshot.empty) {
      console.log('❌ User not found in database');
      return;
    }
    
    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();
    console.log(`✅ Found user: ${userData.email} (ID: ${userDoc.id})\n`);
    
    // Get all end-of-call analysis records for this user
    console.log('=== Getting End-of-Call Analysis Records ===');
    const analysisSnapshot = await db.collection('end-of-call-analysis')
      .where('studentId', '==', userDoc.id)
      .get();
    
    console.log(`Found ${analysisSnapshot.size} end-of-call analysis records\n`);
    
    // Calculate stats from analysis data
    let totalScore = 0;
    let validScores = 0;
    let lastInterviewDate = null;
    
    analysisSnapshot.forEach(doc => {
      const analysisData = doc.data();
      // Extract score from various possible locations
      const score = analysisData.successEvaluation?.score || 
                   analysisData.overallScore || 
                   (analysisData.evaluation ? Math.round((analysisData.evaluation.communicationSkills + analysisData.evaluation.technicalKnowledge + analysisData.evaluation.problemSolving) / 3) : 0);
      
      if (score > 0) {
        totalScore += score;
        validScores++;
      }
      
      // Update last interview date
      if (analysisData.timestamp) {
        const timestamp = analysisData.timestamp._seconds ? new Date(analysisData.timestamp._seconds * 1000) : new Date(analysisData.timestamp);
        if (!lastInterviewDate || timestamp > lastInterviewDate) {
          lastInterviewDate = timestamp;
        }
      }
    });
    
    const averageScore = validScores > 0 ? Math.round(totalScore / validScores) : 0;
    
    console.log(`Calculated stats from ${analysisSnapshot.size} analysis records:`);
    console.log(`  Total Interviews: ${analysisSnapshot.size}`);
    console.log(`  Completed Interviews: ${analysisSnapshot.size}`);
    console.log(`  Average Score: ${averageScore}`);
    console.log(`  Valid Scores: ${validScores}`);
    console.log(`  Last Interview Date: ${lastInterviewDate || 'N/A'}\n`);
    
    // Update student stats document
    console.log('=== Updating Student Stats ===');
    const statsRef = db.collection('student-stats').doc(userDoc.id);
    
    await statsRef.set({
      totalInterviews: analysisSnapshot.size,
      completedInterviews: analysisSnapshot.size,
      averageScore: averageScore,
      lastInterviewDate: lastInterviewDate,
      updatedAt: new Date()
    }, { merge: true });
    
    console.log('✅ Student stats updated successfully!');
    
  } catch (error) {
    console.error('❌ Error updating student stats:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the update
updateStudentStats();