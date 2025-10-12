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

async function testQueryFix() {
  try {
    console.log('🔍 Testing query with and without orderBy clause...');
    
    // Test 1: Query with orderBy (current implementation)
    console.log('\n🧪 Test 1: Query with orderBy(\'timestamp\', \'desc\')');
    try {
      const analysisCollection = db.collection('end-of-call-analysis').orderBy('timestamp', 'desc').limit(100);
      const snapshot1 = await analysisCollection.get();
      console.log(`  ✅ Query with orderBy returned ${snapshot1.size} documents`);
    } catch (error) {
      console.log(`  ❌ Query with orderBy failed: ${error.message}`);
    }
    
    // Test 2: Query without orderBy (simplified)
    console.log('\n🧪 Test 2: Query without orderBy');
    try {
      const analysisCollection = db.collection('end-of-call-analysis').limit(100);
      const snapshot2 = await analysisCollection.get();
      console.log(`  ✅ Query without orderBy returned ${snapshot2.size} documents`);
    } catch (error) {
      console.log(`  ❌ Query without orderBy failed: ${error.message}`);
    }
    
    // Test 3: Query with orderBy on createdAt (alternative)
    console.log('\n🧪 Test 3: Query with orderBy(\'createdAt\', \'desc\')');
    try {
      const analysisCollection = db.collection('end-of-call-analysis').orderBy('createdAt', 'desc').limit(100);
      const snapshot3 = await analysisCollection.get();
      console.log(`  ✅ Query with orderBy(createdAt) returned ${snapshot3.size} documents`);
    } catch (error) {
      console.log(`  ❌ Query with orderBy(createdAt) failed: ${error.message}`);
    }
    
    console.log('\n✅ Query testing complete!');
    
  } catch (error) {
    console.error('❌ Error testing queries:', error);
  }
}

// Run the test
testQueryFix();