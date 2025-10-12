import { db } from './lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

async function testFirebaseConnection() {
  try {
    console.log('Testing Firebase connection...');
    
    // Test Firestore connection by trying to access a collection
    const testCollection = collection(db, 'test');
    const snapshot = await getDocs(testCollection);
    
    console.log('Firebase connection successful!');
    console.log(`Found ${snapshot.size} documents in test collection`);
    
    return true;
  } catch (error) {
    console.error('Firebase connection failed:', error);
    return false;
  }
}

// Run the test
testFirebaseConnection()
  .then(success => {
    if (success) {
      console.log('✅ Firebase is working correctly');
    } else {
      console.log('❌ Firebase connection issues detected');
    }
  })
  .catch(error => {
    console.error('Unexpected error:', error);
  });

export default testFirebaseConnection;