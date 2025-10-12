import { db } from '@/lib/firebase';
import { doc, setDoc, collection, addDoc, Timestamp } from 'firebase/firestore';
import { PlatformPricingSettings } from '@/services/platform-settings.service';

/**
 * Initialize Firebase collections for the financial management system
 * This script creates the required collections and sample data
 */

async function initializeCollections() {
  try {
    console.log('Initializing Firebase collections...');
    
    // 1. Initialize system_config collection with default pricing settings
    console.log('Creating system_config/pricing document...');
    const pricingSettings: PlatformPricingSettings = {
      vapiCostPerMinute: 0.11,
      markupPercentage: 36.36,
      annualLicenseCost: 19.96,
      updatedAt: new Date()
    };
    
    await setDoc(doc(db, 'system_config', 'pricing'), {
      ...pricingSettings,
      updatedAt: Timestamp.fromDate(pricingSettings.updatedAt)
    });
    console.log('✓ Created system_config/pricing document');
    
    // 2. Ensure scheduled_price_changes collection exists (it will be created automatically when first document is added)
    console.log('Creating sample scheduled_price_changes document...');
    const sampleChange = {
      changeDate: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 days from now
      changeType: 'vapiCost',
      affected: 'all',
      currentValue: 0.11,
      newValue: 0.12,
      status: 'scheduled',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const docRef = await addDoc(collection(db, 'scheduled_price_changes'), sampleChange);
    console.log('✓ Created sample scheduled_price_changes document with ID:', docRef.id);
    
    // 3. Delete the sample document (we just wanted to ensure the collection exists)
    // await deleteDoc(docRef);
    // console.log('✓ Cleaned up sample document');
    
    console.log('✅ Firebase collections initialized successfully!');
    console.log('\nCollections created:');
    console.log('- system_config (with pricing document)');
    console.log('- scheduled_price_changes');
    
  } catch (error) {
    console.error('❌ Error initializing Firebase collections:', error);
    throw error;
  }
}

// Run the initialization
if (typeof window === 'undefined') {
  // Only run in Node.js environment
  initializeCollections()
    .then(() => {
      console.log('Firebase collections setup completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Firebase collections setup failed:', error);
      process.exit(1);
    });
}

export default initializeCollections;