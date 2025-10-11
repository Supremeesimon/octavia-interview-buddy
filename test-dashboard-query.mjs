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

async function testDashboardQuery() {
  try {
    console.log('🔍 Testing dashboard query for user: oluwaferanmionabanjo@gmail.com\n');
    
    // First, find your user document
    console.log('=== Looking for your user ===');
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
    
    // Test the exact query that the dashboard uses
    console.log('=== Testing Dashboard Query (with ordering) ===');
    try {
      const interviewsSnapshot = await db.collection('interviews')
        .where('studentId', '==', userDoc.id)
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get();
      
      console.log(`Found ${interviewsSnapshot.size} interviews with ordered query\n`);
      
      if (!interviewsSnapshot.empty) {
        console.log('Interviews:');
        interviewsSnapshot.forEach((doc, index) => {
          const interviewData = doc.data();
          console.log(`${index + 1}. ID: ${doc.id}`);
          console.log(`   Status: ${interviewData.status}`);
          console.log(`   Type: ${interviewData.type}`);
          console.log(`   Score: ${interviewData.score || 'N/A'}`);
          console.log(`   Created: ${interviewData.createdAt ? new Date(interviewData.createdAt._seconds * 1000) : 'N/A'}`);
          console.log(`   Student ID: ${interviewData.studentId}`);
          console.log('');
        });
      }
    } catch (error) {
      console.log('❌ Error with ordered query:', error.message);
      console.log('');
    }
    
    // Test without ordering (to see if that works)
    console.log('=== Testing Query Without Ordering ===');
    try {
      const interviewsSnapshot = await db.collection('interviews')
        .where('studentId', '==', userDoc.id)
        .get();
      
      console.log(`Found ${interviewsSnapshot.size} interviews without ordering\n`);
      
      if (!interviewsSnapshot.empty) {
        console.log('Interviews:');
        interviewsSnapshot.forEach((doc, index) => {
          const interviewData = doc.data();
          console.log(`${index + 1}. ID: ${doc.id}`);
          console.log(`   Status: ${interviewData.status}`);
          console.log(`   Type: ${interviewData.type}`);
          console.log(`   Score: ${interviewData.score || 'N/A'}`);
          console.log(`   Created: ${interviewData.createdAt ? new Date(interviewData.createdAt._seconds * 1000) : 'N/A'}`);
          console.log(`   Student ID: ${interviewData.studentId}`);
          console.log('');
        });
      }
    } catch (error) {
      console.log('❌ Error with unordered query:', error.message);
      console.log('');
    }
    
    // Check the actual data structure of your interviews
    console.log('=== Checking Detailed Interview Data Structure ===');
    const allInterviewsSnapshot = await db.collection('interviews')
      .where('studentId', '==', userDoc.id)
      .get();
    
    if (!allInterviewsSnapshot.empty) {
      console.log('Detailed interview data:');
      for (const doc of allInterviewsSnapshot.docs) {
        const interviewData = doc.data();
        console.log(`\nInterview ID: ${doc.id}`);
        console.log('Full data structure:');
        Object.keys(interviewData).forEach(key => {
          const value = interviewData[key];
          if (value && typeof value === 'object' && value._seconds) {
            console.log(`  ${key}: ${new Date(value._seconds * 1000)}`);
          } else {
            console.log(`  ${key}: ${JSON.stringify(value)}`);
          }
        });
      }
    }
    
    console.log('\n✅ Query test complete!');
    
  } catch (error) {
    console.error('❌ Error testing dashboard query:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testDashboardQuery();