const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

// Initialize Firebase Admin SDK
let firebaseAdmin;

try {
  console.log('Initializing Firebase Admin SDK...');
  
  // Check if we're in a production environment
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Try to initialize with service account from file first
  const serviceAccountPath = path.join(__dirname, '../../functions/service-account-key.json');
  
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
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    console.log('Using service account from environment variable');
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
    // Initialize with default credentials (for development)
    console.log('Initializing with default credentials (for development)');
    firebaseAdmin = admin.initializeApp();
    console.log('Firebase Admin initialized with default credentials');
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

module.exports = firebaseAdmin;