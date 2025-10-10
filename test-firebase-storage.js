// Test Firebase Storage bucket with Admin SDK
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Try to use service account file
    const serviceAccount = require('./firebase-service-account.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: 'octavia-practice-interviewer.appspot.com',
    });
    console.log('Firebase Admin initialized with service account');
  } catch (error) {
    console.log('Service account not found, using default initialization');
    admin.initializeApp({
      storageBucket: 'octavia-practice-interviewer.appspot.com',
    });
  }
}

const bucket = admin.storage().bucket();
console.log('Bucket name:', bucket.name);

// Check if bucket exists
bucket.exists()
  .then(([exists]) => {
    console.log('Bucket exists:', exists);
    if (exists) {
      // Try to upload a test file
      const testContent = 'This is a test file for Firebase Storage upload';
      const file = bucket.file('test/test-upload.txt');
      
      return file.save(testContent, {
        metadata: {
          contentType: 'text/plain',
        },
      });
    } else {
      throw new Error('Bucket does not exist');
    }
  })
  .then(() => {
    console.log('File uploaded successfully using Admin SDK');
    
    // Try to get the file
    const file = bucket.file('test/test-upload.txt');
    return file.getMetadata();
  })
  .then(([metadata]) => {
    console.log('File metadata:', metadata);
  })
  .catch((error) => {
    console.error('Error:', error.message);
    console.error('Error code:', error.code);
  });