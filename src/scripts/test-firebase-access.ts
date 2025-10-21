import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

async function testFirebaseAccess() {
  console.log('=== TESTING FIREBASE ACCESS ===\n');
  
  try {
    // Check if Firebase is properly initialized
    if (!db) {
      console.log('❌ Firebase is not initialized');
      return;
    }
    
    console.log('Firebase is initialized, attempting to access system_config/pricing...');
    
    // Try to read the system_config document directly
    const docRef = doc(db, 'system_config', 'pricing');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('✅ SUCCESS: Document exists and is readable');
      console.log('Document data:', JSON.stringify(data, null, 2));
      
      // Calculate the price per minute if we have the necessary data
      if (data.vapiCostPerMinute && data.markupPercentage) {
        const pricePerMinute = data.vapiCostPerMinute * (1 + data.markupPercentage / 100);
        console.log(`\n💰 Calculated Price Per Minute: $${pricePerMinute.toFixed(2)}`);
      }
      
      console.log('\n✅ Application should display this data when permissions are correct');
    } else {
      console.log('❌ Document does not exist in Firebase');
      console.log('This would mean the data truly is not available, not a permissions issue');
    }
  } catch (error: any) {
    console.log('❌ ERROR: Failed to read document');
    console.log('Error code:', error.code);
    console.log('Error message:', error.message);
    
    // Check if it's a permission error
    if (error.code === 'permission-denied') {
      console.log('\n🔐 PERMISSION DENIED: This is a security configuration issue, not a data availability issue');
      console.log('The data exists in Firebase but the current user does not have permission to read it');
      console.log('\nTo fix this, you need to:');
      console.log('1. Ensure the user has the correct Firebase authentication');
      console.log('2. Check the Firestore security rules');
      console.log('3. Verify the service account has proper permissions');
    } else {
      console.log('\nThis is a different type of error that needs to be addressed');
    }
  }
  
  console.log('\n=== TEST COMPLETE ===');
}

// Run the test
testFirebaseAccess();