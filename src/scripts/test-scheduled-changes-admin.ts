import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Try to use service account file from functions directory
    const serviceAccountPath = join(__dirname, '../../functions/service-account-key.json');
    const serviceAccountBuffer = readFileSync(serviceAccountPath);
    const serviceAccount = JSON.parse(serviceAccountBuffer.toString());
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: 'octavia-practice-interviewer.appspot.com',
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    console.log('Please ensure you have the service-account-key.json file in the functions directory');
    process.exit(1);
  }
}

const db = getFirestore();

async function testScheduledChangesAdmin() {
  try {
    console.log('Testing scheduled price changes using Firebase Admin SDK...');
    
    // Test creating a scheduled price change
    console.log('\n1. Creating a test scheduled price change...');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 7 days from now
    
    const testData = {
      changeDate: futureDate,
      changeType: 'licenseCost',
      affected: 'all',
      currentValue: 19.96,
      newValue: 24.99,
      status: 'scheduled',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await db.collection('scheduled_price_changes').add(testData);
    console.log('✅ Created scheduled change with ID:', docRef.id);
    
    // Test fetching all price changes
    console.log('\n2. Fetching all price changes...');
    const snapshot = await db.collection('scheduled_price_changes').orderBy('changeDate', 'asc').get();
    console.log('Found', snapshot.size, 'price changes');
    
    // Display the price changes
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log('- ID:', doc.id);
      console.log('  Change Type:', data.changeType);
      console.log('  Current Value:', data.currentValue);
      console.log('  New Value:', data.newValue);
      console.log('  Status:', data.status);
      console.log('  Change Date:', data.changeDate.toDate().toDateString());
    });
    
    // Clean up - delete the test change
    if (docRef.id) {
      console.log('\n3. Cleaning up test data...');
      await db.collection('scheduled_price_changes').doc(docRef.id).delete();
      console.log('✅ Deleted test change');
    }
    
    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testScheduledChangesAdmin();