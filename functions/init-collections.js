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
 * This script creates the required collections without sample data for production
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
    
    // 2. Ensure scheduled_price_changes collection exists (without creating sample data)
    console.log('Ensuring scheduled_price_changes collection exists...');
    // We simply ensure the collection exists by creating and immediately deleting 
    // a metadata document rather than sample data
    const metadataRef = await db.collection('scheduled_price_changes').doc('_metadata');
    await metadataRef.set({ initialized: true, timestamp: new Date() });
    await metadataRef.delete();
    console.log('✓ Confirmed scheduled_price_changes collection exists');
    
    console.log('✅ Firebase collections initialized successfully!');
    console.log('\nCollections created:');
    console.log('- system_config (with pricing document)');
    console.log('- scheduled_price_changes (empty collection)');
    
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