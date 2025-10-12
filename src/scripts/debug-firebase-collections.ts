import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';

/**
 * Debug script to check Firebase collections for the financial management system
 * This script checks if the required collections exist and have the correct data
 */

async function debugCollections() {
  try {
    console.log('Debugging Firebase collections...\n');
    
    // 1. Check system_config/pricing document
    console.log('1. Checking system_config/pricing document...');
    const pricingDocRef = doc(db, 'system_config', 'pricing');
    const pricingDocSnap = await getDoc(pricingDocRef);
    
    if (pricingDocSnap.exists()) {
      const data = pricingDocSnap.data();
      console.log('✓ system_config/pricing document exists:');
      console.log('  vapiCostPerMinute:', data.vapiCostPerMinute);
      console.log('  markupPercentage:', data.markupPercentage);
      console.log('  annualLicenseCost:', data.annualLicenseCost);
      console.log('  updatedAt:', data.updatedAt?.toDate?.() || data.updatedAt);
    } else {
      console.log('✗ system_config/pricing document does not exist');
    }
    
    // 2. Check scheduled_price_changes collection
    console.log('\n2. Checking scheduled_price_changes collection...');
    try {
      const q = query(
        collection(db, 'scheduled_price_changes'),
        orderBy('changeDate', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      console.log(`✓ scheduled_price_changes collection exists with ${querySnapshot.size} documents`);
      
      if (querySnapshot.size > 0) {
        console.log('  Sample documents:');
        querySnapshot.forEach((doc, index) => {
          if (index < 3) { // Only show first 3 documents
            const data = doc.data();
            console.log(`    ${doc.id}:`, {
              changeDate: data.changeDate?.toDate?.() || data.changeDate,
              changeType: data.changeType,
              status: data.status,
              currentValue: data.currentValue,
              newValue: data.newValue
            });
          }
        });
        if (querySnapshot.size > 3) {
          console.log(`    ... and ${querySnapshot.size - 3} more documents`);
        }
      }
    } catch (error) {
      console.log('✗ Error accessing scheduled_price_changes collection:', error);
    }
    
    // 3. Check other important collections
    console.log('\n3. Checking other important collections...');
    
    const collectionsToCheck = [
      'institutions',
      'users',
      'interviews',
      'sessions'
    ];
    
    for (const collectionName of collectionsToCheck) {
      try {
        const colRef = collection(db, collectionName);
        const colSnapshot = await getDocs(colRef);
        console.log(`  ${collectionName}: ${colSnapshot.size} documents`);
      } catch (error) {
        console.log(`  ${collectionName}: Error accessing collection -`, error.message);
      }
    }
    
    console.log('\n✅ Debug completed!');
    
  } catch (error) {
    console.error('❌ Error during debug:', error);
    throw error;
  }
}

// Run the debug
if (typeof window === 'undefined') {
  // Only run in Node.js environment
  debugCollections()
    .then(() => {
      console.log('\nFirebase collections debug completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\nFirebase collections debug failed:', error);
      process.exit(1);
    });
}

export default debugCollections;