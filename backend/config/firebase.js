const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

// Initialize Firebase Admin SDK
let firebaseAdmin;

try {
  // Try to initialize with service account from file first
  const serviceAccountPath = path.join(__dirname, '../../functions/service-account-key.json');
  
  if (fs.existsSync(serviceAccountPath)) {
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
    // Try to initialize with service account from environment variable
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
  } else {
    // Initialize with default credentials (for development)
    firebaseAdmin = admin.initializeApp();
    console.log('Firebase Admin initialized with default credentials');
  }
} catch (error) {
  console.warn('Firebase Admin initialization failed:', error.message);
  firebaseAdmin = null;
}

module.exports = firebaseAdmin;