// Use Firebase Admin SDK to check collections
const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK with service account
const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
  projectId: 'octavia-practice-interviewer'
});

const db = admin.firestore();

async function checkAnalysisData() {
  try {
    console.log('=== Checking End-of-Call Analysis Data ===');
    
    // Check a specific analysis document
    console.log('\n--- Checking Specific Analysis Document ---');
    const analysisDoc = await db.collection('end-of-call-analysis').doc('aNOamDDr1nuXlkFr5Xxh').get();
    
    if (analysisDoc.exists) {
      const data = analysisDoc.data();
      console.log('Document ID:', analysisDoc.id);
      console.log('Full Data:', JSON.stringify(data, null, 2));
      
      // Check all fields
      console.log('\n--- Field Analysis ---');
      Object.keys(data).forEach(key => {
        console.log(`  ${key}:`, typeof data[key], data[key]);
      });
    }
    
    // Check feedback documents for the user
    console.log('\n--- Checking User Feedback Documents ---');
    const feedbackQuery = await db.collection('interview-feedback')
      .where('studentId', '==', 'xVoQq94Gk3YoBKnnt5TzDrlPtZ72')
      .get();
    
    console.log('User feedback documents:', feedbackQuery.size);
    
    feedbackQuery.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\nUser Feedback ${index + 1}:`);
      console.log('  ID:', doc.id);
      console.log('  Interview ID:', data.interviewId || 'N/A');
      console.log('  Overall Score:', data.overallScore || 'N/A');
      console.log('  Categories:', data.categories ? data.categories.length : 0);
      console.log('  Strengths:', data.strengths || 'N/A');
      console.log('  Improvements:', data.improvements || 'N/A');
      console.log('  Detailed Analysis:', data.detailedAnalysis || 'N/A');
      if (data.createdAt) {
        console.log('  Created At:', new Date(data.createdAt._seconds * 1000).toISOString());
      }
    });
    
    console.log('\n=== Check Complete ===');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the check
checkAnalysisData();