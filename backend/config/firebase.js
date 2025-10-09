const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Firebase Admin SDK
let firebaseAdmin;

try {
  // Try to initialize with service account
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
  
  if (Object.keys(serviceAccount).length > 0) {
    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
    console.log('Firebase Admin initialized successfully');
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