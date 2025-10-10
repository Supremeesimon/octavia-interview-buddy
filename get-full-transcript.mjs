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

async function getFullTranscript() {
  try {
    // Get all documents ordered by creation time
    const snapshot = await db.collection('end-of-call-analysis')
      .orderBy('createdAt', 'desc')
      .get();
    
    if (snapshot.empty) {
      console.log('No documents found in end-of-call-analysis collection');
      return;
    }
    
    console.log('=== ALL TRANSCRIPTS IN END-OF-CALL ANALYSIS ===\n');
    
    // Process each document
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      console.log(`--- Document ID: ${doc.id} ---`);
      console.log(`Call ID: ${data.callId || 'N/A'}`);
      console.log(`Created At: ${data.createdAt?.toDate()?.toString() || 'N/A'}`);
      console.log(`Interview Type: ${data.interviewType || 'N/A'}`);
      console.log(`Student ID: ${data.studentId || 'N/A'}`);
      console.log('');
      
      console.log('--- TRANSCRIPT ---');
      if (data.transcript) {
        console.log(data.transcript);
      } else {
        console.log('No transcript available');
      }
      
      console.log('');
      console.log('--- METADATA ---');
      console.log(`Ended Reason: ${data.endedReason || 'N/A'}`);
      console.log(`Duration (seconds): ${data.duration || 'N/A'}`);
      console.log(`Cost: ${data.cost || 'N/A'}`);
      console.log('');
      
      // Show summary if available
      if (data.summary) {
        console.log('--- SUMMARY ---');
        console.log(data.summary);
        console.log('');
      }
      
      console.log('=' .repeat(50));
      console.log('');
    }
    
  } catch (error) {
    console.error('Error retrieving transcripts:', error);
  }
}

getFullTranscript();