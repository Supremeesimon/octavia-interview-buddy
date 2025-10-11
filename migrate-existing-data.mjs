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

async function migrateExistingData() {
  try {
    console.log('🔄 Starting data migration...\n');
    
    // Get the user ID for oluwaferanmionabanjo@gmail.com
    console.log('=== Finding Target User ===');
    const usersSnapshot = await db.collection('users')
      .where('email', '==', 'oluwaferanmionabanjo@gmail.com')
      .limit(1)
      .get();
    
    if (usersSnapshot.empty) {
      console.log('❌ No user found with email: oluwaferanmionabanjo@gmail.com');
      return;
    }
    
    const userDoc = usersSnapshot.docs[0];
    const userId = userDoc.id;
    const userData = userDoc.data();
    
    console.log(`✅ Found user: ${userData.name} (${userData.email})`);
    console.log(`   User ID: ${userId}\n`);
    
    // Get all existing end-of-call-analysis records without studentId
    console.log('=== Migrating End-of-Call Analysis Records ===');
    const analysisSnapshot = await db.collection('end-of-call-analysis')
      .where('studentId', '==', '')
      .get();
    
    console.log(`Found ${analysisSnapshot.size} anonymous analysis records to migrate`);
    
    let migratedCount = 0;
    let batch = db.batch();
    
    for (const doc of analysisSnapshot.docs) {
      const data = doc.data();
      
      // Update the document to assign it to the target user
      batch.update(doc.ref, {
        studentId: userId,
        departmentId: data.departmentId || 'default-department',
        institutionId: data.institutionId || 'default-institution',
        migratedAt: new Date(),
        migratedBy: 'data-migration-script'
      });
      
      migratedCount++;
      
      // Process in batches of 500 to avoid Firestore limits
      if (migratedCount % 500 === 0) {
        await batch.commit();
        console.log(`   ✅ Migrated ${migratedCount} records so far...`);
        batch = db.batch(); // Start a new batch
      }
    }
    
    // Commit any remaining updates
    if (migratedCount % 500 !== 0) {
      await batch.commit();
    }
    
    console.log(`✅ Successfully migrated ${migratedCount} end-of-call analysis records\n`);
    
    // Now, create corresponding interview and feedback records for each migrated analysis
    console.log('=== Creating Interview and Feedback Records ===');
    const updatedAnalysisSnapshot = await db.collection('end-of-call-analysis')
      .where('studentId', '==', userId)
      .get();
    
    console.log(`Processing ${updatedAnalysisSnapshot.size} analysis records for interview creation`);
    
    let interviewCreatedCount = 0;
    let feedbackCreatedCount = 0;
    
    for (const doc of updatedAnalysisSnapshot.docs) {
      const analysis = doc.data();
      
      // Check if interview already exists for this analysis
      const existingInterviewQuery = await db.collection('interviews')
        .where('vapiCallId', '==', analysis.callId || '')
        .where('studentId', '==', userId)
        .limit(1)
        .get();
      
      if (existingInterviewQuery.empty) {
        // Create interview record
        const interviewData = {
          studentId: userId,
          resumeId: analysis.resumeId || '',
          sessionId: analysis.sessionId || 'vapi-session-' + Date.now(),
          scheduledAt: new Date(),
          startedAt: analysis.startedAt ? new Date(analysis.startedAt) : new Date(),
          endedAt: analysis.endedAt ? new Date(analysis.endedAt) : new Date(),
          duration: analysis.duration || 0,
          status: 'completed',
          type: analysis.interviewType || 'general',
          vapiCallId: analysis.callId || '',
          recordingUrl: analysis.recordingUrl || '',
          recordingDuration: analysis.duration || 0,
          transcript: analysis.transcript || '',
          score: analysis.successEvaluation?.score || 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const interviewRef = await db.collection('interviews').add(interviewData);
        interviewCreatedCount++;
        
        // Create feedback record if there's a score
        if (analysis.successEvaluation?.score > 0) {
          // Extract categories from structured data
          const categories = [];
          if (analysis.structuredData?.categories && Array.isArray(analysis.structuredData.categories)) {
            analysis.structuredData.categories.forEach(cat => {
              categories.push({
                name: cat.name || 'Unnamed Category',
                score: cat.score || 0,
                weight: cat.weight || 0,
                description: cat.description || ''
              });
            });
          }
          
          const feedbackData = {
            interviewId: interviewRef.id,
            studentId: userId,
            overallScore: analysis.successEvaluation.score || 0,
            categories: categories,
            strengths: analysis.structuredData?.strengths || [],
            improvements: analysis.structuredData?.improvements || [],
            recommendations: analysis.structuredData?.recommendations || [],
            detailedAnalysis: analysis.summary || '',
            aiModelVersion: 'vapi-webhook-1.0',
            confidenceScore: 0.85,
            createdAt: new Date()
          };
          
          await db.collection('interview-feedback').add(feedbackData);
          feedbackCreatedCount++;
        }
      }
    }
    
    console.log(`✅ Created ${interviewCreatedCount} interview records`);
    console.log(`✅ Created ${feedbackCreatedCount} feedback records\n`);
    
    console.log('🎉 Data migration complete!');
    
  } catch (error) {
    console.error('❌ Error during data migration:', error.message);
    console.error(error.stack);
  }
}

// Run the migration
migrateExistingData();