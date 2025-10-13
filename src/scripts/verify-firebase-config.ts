import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function verifyFirebaseConfig() {
  console.log('=== Verifying Firebase Configuration ===\n');
  
  try {
    // Check if we have valid Firebase configuration
    const apiKey = process.env.VITE_FIREBASE_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️  WARNING: Firebase API key is missing.');
    } else if (apiKey === 'your_firebase_api_key_here') {
      console.warn('⚠️  WARNING: Firebase configuration appears to be using placeholder values.');
      console.warn('   Your current API key is:', apiKey);
      console.warn('   Please update your .env.local file with valid production credentials.\n');
    } else {
      console.log('✅ Firebase configuration detected with what appears to be valid credentials.');
      console.log('   API Key:', apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 5));
      console.log('   Project ID:', process.env.VITE_FIREBASE_PROJECT_ID);
      console.log('   Auth Domain:', process.env.VITE_FIREBASE_AUTH_DOMAIN);
      console.log('');
    }
    
    // Check Firebase app initialization
    if (auth && auth.app) {
      console.log('✅ Firebase Auth initialized successfully');
      console.log('   Auth provider:', auth.app.options.authDomain);
      console.log('   Project ID:', auth.app.options.projectId);
    } else {
      console.log('❌ Firebase Auth initialization failed');
    }
    
    if (db && db.app) {
      console.log('✅ Firestore initialized successfully');
      console.log('   Project ID:', db.app.options.projectId);
    } else {
      console.log('❌ Firestore initialization failed');
    }
    
    // Test signOut function (this will work even without valid credentials)
    await signOut(auth);
    console.log('✅ Firebase functions are accessible');
    
    console.log('\n=== Firebase Configuration Verification Complete ===');
    console.log('\nNext steps:');
    console.log('1. Run a test authentication script: npm run test-auth-service');
    console.log('2. Or run the mocked test: npm run test-auth-service-mocked');
    
  } catch (error) {
    console.error('Firebase configuration verification failed:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
  }
}

verifyFirebaseConfig();