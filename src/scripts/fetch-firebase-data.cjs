const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
console.log('Initializing Firebase Admin...');

// Try to initialize with service account
try {
  // First check if we're already initialized
  if (admin.apps.length === 0) {
    // Try to use service account file
    const serviceAccount = require('../../firebase-service-account.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: 'octavia-practice-interviewer.appspot.com',
    });
    console.log('Firebase Admin initialized with service account');
  } else {
    console.log('Firebase Admin already initialized');
  }
} catch (error) {
  console.log('Service account not found, trying default initialization...');
  try {
    if (admin.apps.length === 0) {
      admin.initializeApp();
      console.log('Firebase Admin initialized with default credentials');
    }
  } catch (initError) {
    console.error('Error initializing Firebase Admin:', initError.message);
    process.exit(1);
  }
}

const db = getFirestore();

async function fetchCollectionData(collectionName, limit = 10) {
  try {
    console.log(`\n=== ${collectionName.toUpperCase()} COLLECTION ===`);
    const snapshot = await db.collection(collectionName).limit(limit).get();
    
    if (snapshot.empty) {
      console.log('No documents found in this collection.');
      return;
    }
    
    console.log(`Found ${snapshot.size} documents:`);
    
    let count = 0;
    snapshot.forEach(doc => {
      count++;
      console.log(`\n${count}. Document ID: ${doc.id}`);
      console.log('   Data:', JSON.stringify(doc.data(), null, 2));
    });
    
    if (snapshot.size > count) {
      console.log(`\n... and ${snapshot.size - count} more documents`);
    }
  } catch (error) {
    console.error(`Error fetching ${collectionName} collection:`, error.message);
  }
}

async function main() {
  console.log('Fetching latest data from Firebase collections...\n');
  
  // Fetch data from key collections
  await fetchCollectionData('institutions', 5);
  await fetchCollectionData('scheduled_price_changes', 10);
  await fetchCollectionData('platform_settings', 5);
  
  // You can add more collections here as needed
  // await fetchCollectionData('users', 5);
  // await fetchCollectionData('interviews', 5);
  
  console.log('\nData fetching completed.');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nGracefully shutting down...');
  process.exit(0);
});

// Run the script
main().catch(error => {
  console.error('Script error:', error);
  process.exit(1);
});