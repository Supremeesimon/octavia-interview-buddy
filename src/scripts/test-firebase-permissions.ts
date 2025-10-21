import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

async function testFirebasePermissions() {
  console.log('=== TESTING FIREBASE PERMISSIONS ===');
  
  try {
    console.log('Attempting to read system_config/pricing document...');
    
    // Try to read the system_config document directly
    const docRef = doc(db, 'system_config', 'pricing');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log('SUCCESS: Document exists and is readable');
      console.log('Document data:', JSON.stringify(data, null, 2));
      
      // Calculate the price per minute
      if (data.vapiCostPerMinute && data.markupPercentage) {
        const pricePerMinute = data.vapiCostPerMinute * (1 + data.markupPercentage / 100);
        console.log(`Calculated Price Per Minute: $${pricePerMinute.toFixed(2)}`);
      }
    } else {
      console.log('Document does not exist');
    }
  } catch (error: any) {
    console.error('ERROR: Failed to read document');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Check if it's a permission error
    if (error.code === 'permission-denied') {
      console.error('PERMISSION DENIED: User does not have permission to read system_config');
    }
  }
}

// Run the test
testFirebasePermissions();