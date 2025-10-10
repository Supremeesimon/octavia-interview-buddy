#!/usr/bin/env node

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Load service account credentials
const serviceAccount = require('./firebase-service-account.json');

// Initialize Firebase Admin SDK with service account
const app = initializeApp({
  credential: cert(serviceAccount),
  projectId: 'octavia-practice-interviewer'
});
const db = getFirestore(app);

async function checkDetailedDocument() {
  try {
    // Get all documents and find the one with complete data
    const snapshot = await db.collection('end-of-call-analysis')
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();
    
    if (snapshot.empty) {
      console.log('No documents found in end-of-call-analysis collection');
      return;
    }
    
    let targetDoc = null;
    let targetData = null;
    
    // Find the document with the most complete data
    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (data.callId === 'test_call_12345') {
        targetDoc = doc;
        targetData = data;
        break;
      }
    }
    
    // If we didn't find the test document, use the first one
    if (!targetDoc) {
      targetDoc = snapshot.docs[0];
      targetData = targetDoc.data();
    }
    
    console.log('=== FULL TRANSCRIPT FROM END-OF-CALL ANALYSIS ===');
    console.log('Document ID:', targetDoc.id);
    console.log('Call ID:', targetData.callId || 'N/A');
    console.log('Created At:', targetData.createdAt?.toDate()?.toString() || 'N/A');
    console.log('');
    
    console.log('--- FULL TRANSCRIPT ---');
    console.log(targetData.transcript || 'No transcript available');
    console.log('');
    
    console.log('--- CALL METADATA ---');
    console.log('Ended Reason:', targetData.endedReason || 'N/A');
    console.log('Duration (seconds):', targetData.duration || 'N/A');
    console.log('Cost:', targetData.cost || 'N/A');
    
  } catch (error) {
    console.error('Error checking document:', error);
  }
}

checkDetailedDocument();