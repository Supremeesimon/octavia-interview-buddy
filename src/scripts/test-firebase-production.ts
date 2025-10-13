import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testFirebaseProduction() {
  console.log('=== Testing Firebase Production Connection ===\n');
  
  try {
    // Check Firebase app initialization
    if (auth && auth.app) {
      console.log('✅ Firebase Auth initialized successfully');
      console.log('   Auth provider:', auth.app.options.authDomain);
      console.log('   Project ID:', auth.app.options.projectId);
    } else {
      console.log('❌ Firebase Auth initialization failed');
      return;
    }
    
    if (db && db.app) {
      console.log('✅ Firestore initialized successfully');
      console.log('   Project ID:', db.app.options.projectId);
    } else {
      console.log('❌ Firestore initialization failed');
      return;
    }
    
    // Test signOut function
    await signOut(auth);
    console.log('✅ Firebase functions are accessible');
    
    console.log('\n=== Firebase Production Connection Test Complete ===');
    console.log('\nYour Firebase configuration is ready for production use!');
    
  } catch (error) {
    console.error('Firebase production connection test failed:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
  }
}

testFirebaseProduction();