const admin = require('firebase-admin');
const serviceAccount = require('./service-account-key.json');

// Initialize Firebase Admin SDK with service account credentials
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'octavia-practice-interviewer'
  });
  console.log('Firebase Admin SDK initialized with service account credentials');
}

const db = admin.firestore();

/**
 * Initialize Firebase collections for the financial management system
 * This script creates the required collections and sample data
 */

async function initializeCollections() {
  try {
    console.log('Initializing Firebase collections...');
    
    // 1. Initialize system_config collection with default pricing settings
    console.log('Creating system_config/pricing document...');
    const pricingSettings = {
      vapiCostPerMinute: 0.11,
      markupPercentage: 36.36,
      annualLicenseCost: 19.96,
      updatedAt: new Date()
    };
    
    await db.collection('system_config').doc('pricing').set(pricingSettings);
    console.log('✓ Created system_config/pricing document');
    
    // 2. Ensure scheduled_price_changes collection exists by adding a sample document
    console.log('Creating sample scheduled_price_changes document...');
    const sampleChange = {
      changeDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      changeType: 'vapiCost',
      affected: 'all',
      currentValue: 0.11,
      newValue: 0.12,
      status: 'scheduled',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await db.collection('scheduled_price_changes').add(sampleChange);
    console.log('✓ Created sample scheduled_price_changes document with ID:', docRef.id);
    
    // 3. Delete the sample document to keep the collection empty but initialized
    await db.collection('scheduled_price_changes').doc(docRef.id).delete();
    console.log('✓ Deleted sample document to keep collection empty');
    
    console.log('✅ Firebase collections initialized successfully!');
    console.log('\nCollections created:');
    console.log('- system_config (with pricing document)');
    console.log('- scheduled_price_changes');
    
    // List all collections to verify
    console.log('\nVerifying collections...');
    const collections = await db.listCollections();
    collections.forEach(collection => {
      console.log('- ' + collection.id);
    });
    
  } catch (error) {
    console.error('❌ Error initializing Firebase collections:', error);
    throw error;
  }
}

// Run the initialization if this script is executed directly
if (require.main === module) {
  initializeCollections()
    .then(() => {
      console.log('\nFirebase collections setup completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\nFirebase collections setup failed:', error);
      process.exit(1);
    });
}

module.exports = initializeCollections;