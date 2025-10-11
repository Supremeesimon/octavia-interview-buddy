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

async function checkStudentStats() {
  try {
    console.log('🔍 Checking student stats for user: oluwaferanmionabanjo@gmail.com\n');
    
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
    
    // Check for student stats
    console.log('=== Checking Student Stats ===');
    const statsDoc = await db.collection('student-stats').doc(userDoc.id).get();
    
    if (statsDoc.exists) {
      const statsData = statsDoc.data();
      console.log('Student stats found:');
      console.log(`  Total Interviews: ${statsData.totalInterviews || 0}`);
      console.log(`  Completed Interviews: ${statsData.completedInterviews || 0}`);
      console.log(`  Average Score: ${statsData.averageScore || 0}`);
      console.log(`  Last Interview Date: ${statsData.lastInterviewDate ? new Date(statsData.lastInterviewDate._seconds * 1000) : 'N/A'}`);
    } else {
      console.log('❌ No student stats found for this user');
    }
    
    console.log('\n✅ Data check complete!');
    
  } catch (error) {
    console.error('❌ Error checking student stats:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the check
checkStudentStats();