import admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  // In production, use service account key
  if (process.env.NODE_ENV === 'production') {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: 'octavia-practice-interviewer',
        clientEmail: 'firebase-adminsdk-fbsvc@octavia-practice-interviewer.iam.gserviceaccount.com',
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      storageBucket: 'octavia-practice-interviewer.appspot.com',
    });
  } else {
    // In development, use service account file
    const serviceAccount = require('../../firebase-service-account.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: 'octavia-practice-interviewer.appspot.com',
    });
  }
}

// Export admin services
export const adminAuth = getAuth();
export const adminDb = getFirestore();
export const adminStorage = getStorage();

// Export default admin instance
export default admin;