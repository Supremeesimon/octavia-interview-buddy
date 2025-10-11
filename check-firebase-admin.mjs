import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// For demo purposes, we'll try to access without credentials
// This might not work if the project requires authentication
const app = initializeApp({
  projectId: 'octavia-practice-interviewer',
});

const db = getFirestore(app);

async function checkCollections() {
  try {
    console.log('🔍 Checking Firestore collections...\n');
    
    // List all collections
    const collections = await db.listCollections();
    console.log('Available collections:');
    collections.forEach(collection => {
      console.log(`- ${collection.id}`);
    });
    
    console.log('\n=== Checking specific collections ===');
    
    // Check interviews collection
    console.log('\n--- Interviews Collection ---');
    const interviewsSnapshot = await db.collection('interviews').limit(5).get();
    console.log(`Found ${interviewsSnapshot.size} interviews`);
    
    interviewsSnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n${index + 1}. Interview ID: ${doc.id}`);
      console.log(`   Student ID: ${data.studentId || 'N/A'}`);
      console.log(`   Status: ${data.status || 'N/A'}`);
      console.log(`   Type: ${data.type || 'N/A'}`);
      console.log(`   Score: ${data.score || 'N/A'}`);
      console.log(`   Created At: ${data.createdAt ? new Date(data.createdAt._seconds * 1000) : 'N/A'}`);
    });
    
    // Check feedback collection
    console.log('\n--- Feedback Collection ---');
    const feedbackSnapshot = await db.collection('interview-feedback').limit(5).get();
    console.log(`Found ${feedbackSnapshot.size} feedback records`);
    
    feedbackSnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n${index + 1}. Feedback ID: ${doc.id}`);
      console.log(`   Interview ID: ${data.interviewId || 'N/A'}`);
      console.log(`   Student ID: ${data.studentId || 'N/A'}`);
      console.log(`   Overall Score: ${data.overallScore || 'N/A'}`);
      console.log(`   Created At: ${data.createdAt ? new Date(data.createdAt._seconds * 1000) : 'N/A'}`);
    });
    
    console.log('\n✅ Firestore check complete!');
    
  } catch (error) {
    console.error('❌ Error accessing Firestore:', error.message);
    console.log('\nNote: This script requires proper Firebase Admin credentials to access production data.');
    console.log('For security reasons, these credentials are not included in the repository.');
  }
}

checkCollections();