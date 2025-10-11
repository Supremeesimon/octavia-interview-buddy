// This script can be run after completing an interview to verify that our fixes are working

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

async function testFixesAfterInterview() {
  try {
    console.log('=== Testing Fixes After Interview ===\n');

    // Check all collections for recent data
    console.log('1. Checking end-of-call-analysis collection...');
    const analysisCollection = db.collection('end-of-call-analysis');
    const analysisSnapshot = await analysisCollection
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
    
    if (analysisSnapshot.empty) {
      console.log('   ❌ No documents found');
      return;
    }
    
    const analysisDoc = analysisSnapshot.docs[0];
    const analysisData = analysisDoc.data();
    console.log(`   ✅ Found document: ${analysisDoc.id}`);
    console.log(`   Student ID: '${analysisData.studentId}'`);
    console.log(`   Has summary: ${!!analysisData.summary}`);
    
    // Check interviews collection
    console.log('\n2. Checking interviews collection...');
    const interviewsCollection = db.collection('interviews');
    const interviewsSnapshot = await interviewsCollection
      .where('studentId', '==', analysisData.studentId || 'NO_STUDENT_ID')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
    
    if (interviewsSnapshot.empty) {
      console.log('   ❌ No documents found - FIX NOT WORKING');
    } else {
      const interviewDoc = interviewsSnapshot.docs[0];
      const interviewData = interviewDoc.data();
      console.log(`   ✅ Found document: ${interviewDoc.id}`);
      console.log(`   Student ID: '${interviewData.studentId}'`);
      console.log(`   Status: ${interviewData.status}`);
      console.log(`   Score: ${interviewData.score || 'N/A'}`);
    }
    
    // Check interview-feedback collection
    console.log('\n3. Checking interview-feedback collection...');
    const feedbackCollection = db.collection('interview-feedback');
    const feedbackSnapshot = await feedbackCollection
      .where('studentId', '==', analysisData.studentId || 'NO_STUDENT_ID')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
    
    if (feedbackSnapshot.empty) {
      console.log('   ❌ No documents found - FIX NOT WORKING');
    } else {
      const feedbackDoc = feedbackSnapshot.docs[0];
      const feedbackData = feedbackDoc.data();
      console.log(`   ✅ Found document: ${feedbackDoc.id}`);
      console.log(`   Student ID: '${feedbackData.studentId}'`);
      console.log(`   Overall Score: ${feedbackData.overallScore || 'N/A'}`);
      console.log(`   Has Categories: ${!!(feedbackData.categories && feedbackData.categories.length > 0)}`);
    }
    
    // Summary
    console.log('\n=== Summary ===');
    const hasInterviews = !interviewsSnapshot.empty;
    const hasFeedback = !feedbackSnapshot.empty;
    
    if (hasInterviews && hasFeedback) {
      console.log('✅ SUCCESS: All fixes are working correctly!');
      console.log('   - Data is being saved to all three collections');
      console.log('   - Student dashboard should now display complete information');
    } else {
      console.log('❌ ISSUE: Fixes may not be working');
      if (!hasInterviews) {
        console.log('   - No data in interviews collection');
      }
      if (!hasFeedback) {
        console.log('   - No data in interview-feedback collection');
      }
      console.log('   - Check that metadata is being properly passed through VAPI events');
    }
    
  } catch (error) {
    console.error('❌ Error testing fixes:', error);
  }
}

// Run the test
testFixesAfterInterview();