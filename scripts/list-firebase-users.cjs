const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Initialize Firebase Admin SDK
let firebaseAdmin;

try {
  console.log('Initializing Firebase Admin SDK...');
  
  // Check if we're in a production environment
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Try to initialize with service account from file first
  const serviceAccountPath = path.join(__dirname, '../functions/service-account-key.json');
  
  if (fs.existsSync(serviceAccountPath)) {
    console.log('Found service account file at:', serviceAccountPath);
    const serviceAccount = require(serviceAccountPath);
    
    // Initialize with service account file
    const firebaseConfig = {
      credential: admin.credential.cert(serviceAccount),
    };
    
    // Add databaseURL only if it's set
    if (process.env.FIREBASE_DATABASE_URL) {
      firebaseConfig.databaseURL = process.env.FIREBASE_DATABASE_URL;
    }
    
    firebaseAdmin = admin.initializeApp(firebaseConfig);
    console.log('Firebase Admin initialized with service account file');
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    console.log('Using service account from GOOGLE_APPLICATION_CREDENTIALS environment variable');
    // Try to initialize with service account from environment variable
    try {
      const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
      
      // Initialize with service account from environment variable
      const firebaseConfig = {
        credential: admin.credential.cert(serviceAccount),
      };
      
      // Add databaseURL only if it's set
      if (process.env.FIREBASE_DATABASE_URL) {
        firebaseConfig.databaseURL = process.env.FIREBASE_DATABASE_URL;
      }
      
      firebaseAdmin = admin.initializeApp(firebaseConfig);
      console.log('Firebase Admin initialized with service account from environment variable');
    } catch (parseError) {
      console.error('Failed to load service account from GOOGLE_APPLICATION_CREDENTIALS:', parseError.message);
      throw new Error('Invalid service account file from GOOGLE_APPLICATION_CREDENTIALS');
    }
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.log('Using service account from FIREBASE_SERVICE_ACCOUNT environment variable');
    // Try to initialize with service account from environment variable
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      
      // Initialize with service account from environment variable
      const firebaseConfig = {
        credential: admin.credential.cert(serviceAccount),
      };
      
      // Add databaseURL only if it's set
      if (process.env.FIREBASE_DATABASE_URL) {
        firebaseConfig.databaseURL = process.env.FIREBASE_DATABASE_URL;
      }
      
      firebaseAdmin = admin.initializeApp(firebaseConfig);
      console.log('Firebase Admin initialized with service account from environment variable');
    } catch (parseError) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable:', parseError.message);
      throw new Error('Invalid FIREBASE_SERVICE_ACCOUNT environment variable');
    }
  } else {
    // For development, try to use application default credentials
    console.log('Initializing with application default credentials (for development)');
    try {
      // Set the project ID from environment if available
      if (process.env.FIREBASE_PROJECT_ID) {
        process.env.GOOGLE_CLOUD_PROJECT = process.env.FIREBASE_PROJECT_ID;
      }
      
      firebaseAdmin = admin.initializeApp();
      console.log('Firebase Admin initialized with application default credentials');
    } catch (initError) {
      console.error('Failed to initialize with application default credentials:', initError.message);
      
      // In development, we might still want to proceed without Firebase Admin
      if (process.env.NODE_ENV === 'development') {
        console.warn('Proceeding without Firebase Admin in development mode');
        firebaseAdmin = null;
      } else {
        // In production, this is a critical error
        console.error('Critical: Firebase Admin failed to initialize in production');
        firebaseAdmin = null;
      }
    }
  }
} catch (error) {
  console.error('Firebase Admin initialization failed:', error.message);
  console.error('Stack trace:', error.stack);
  
  // In development, we might still want to proceed without Firebase Admin
  if (process.env.NODE_ENV === 'development') {
    console.warn('Proceeding without Firebase Admin in development mode');
    firebaseAdmin = null;
  } else {
    // In production, this is a critical error
    console.error('Critical: Firebase Admin failed to initialize in production');
    firebaseAdmin = null;
  }
}

async function listFirebaseUsers() {
  if (!firebaseAdmin) {
    console.error('Firebase Admin SDK not initialized. Cannot list users.');
    console.log('This may be because:');
    console.log('1. The service account key file is missing at functions/service-account-key.json');
    console.log('2. Environment variables are not properly configured');
    console.log('3. You need to authenticate with Google Cloud first using: gcloud auth application-default login');
    return;
  }

  try {
    console.log('Fetching users from Firebase Authentication...');
    
    let allUsers = [];
    let nextPageToken;

    // Use listUsers to get all users (handles pagination automatically)
    do {
      const result = await firebaseAdmin.auth().listUsers(1000, nextPageToken);
      allUsers = allUsers.concat(result.users);
      nextPageToken = result.pageToken;
    } while (nextPageToken);

    console.log(`\nFound ${allUsers.length} users in Firebase Authentication:\n`);
    
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email || 'No email'}`);
      console.log(`   UID: ${user.uid}`);
      console.log(`   Display Name: ${user.displayName || 'No name'}`);
      console.log(`   Phone Number: ${user.phoneNumber || 'No phone'}`);
      console.log(`   Disabled: ${user.disabled}`);
      console.log(`   Email Verified: ${user.emailVerified}`);
      console.log(`   Creation Time: ${user.metadata.creationTime}`);
      console.log(`   Last Sign-in: ${user.metadata.lastSignInTime || 'Never'}`);
      console.log(`   Provider(s): ${user.providerData.map(provider => provider.providerId).join(', ') || 'None'}`);
      console.log('   ---');
    });

    // Summary
    console.log(`\n=== SUMMARY ===`);
    console.log(`Total users: ${allUsers.length}`);
    console.log(`Users with email: ${allUsers.filter(u => u.email).length}`);
    console.log(`Users with phone: ${allUsers.filter(u => u.phoneNumber).length}`);
    console.log(`Disabled accounts: ${allUsers.filter(u => u.disabled).length}`);
    console.log(`Email verified: ${allUsers.filter(u => u.emailVerified).length}`);
    
  } catch (error) {
    console.error('Error listing Firebase users:', error.message);
    console.error('Error stack:', error.stack);
  }
}

// Run the function
listFirebaseUsers();