import { db } from './lib/firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';

async function testFirebaseConnection() {
  try {
    console.log('Testing Firebase connection...');
    
    // Test Firestore connection by trying to access a collection
    const testQuery = query(collection(db, 'institutions'), limit(1));
    const snapshot = await getDocs(testQuery);
    
    console.log('✅ Firebase connection successful!');
    console.log(`Found ${snapshot.size} documents in institutions collection`);
    
    // Try to get platform settings
    const settingsQuery = query(collection(db, 'system_config'), limit(1));
    const settingsSnapshot = await getDocs(settingsQuery);
    
    console.log(`Found ${settingsSnapshot.size} documents in system_config collection`);
    
    return true;
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
    return false;
  }
}

// Run the test immediately
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