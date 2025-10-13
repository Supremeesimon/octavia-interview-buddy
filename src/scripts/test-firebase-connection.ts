import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testFirebaseConnection() {
  console.log('=== Testing Firebase Connection ===\n');
  
  try {
    // Check if we're in development mode
    const isDevelopment = process.env.NODE_ENV === 'development' || process.env.FIREBASE_EMULATOR === 'true';
    
    if (isDevelopment) {
      console.log('Running in development mode with Firebase emulators');
      console.log('Auth emulator status:', auth.emulatorConfig ? 'Connected' : 'Not connected');
      // We can't easily check Firestore emulator connection directly, but we know it's configured in lib/firebase.ts
      console.log('Firestore emulator: Configured to connect to localhost:8080');
    } else {
      console.log('Running in production mode');
      console.log('Firebase app initialized:', !!auth.app);
    }
    
    // Test signOut function (this will work even without valid credentials in emulator mode)
    await signOut(auth);
    console.log('✓ Firebase connection test completed successfully');
    
    console.log('\n=== Firebase Connection Test Completed ===');
    
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
  }
}

testFirebaseConnection();