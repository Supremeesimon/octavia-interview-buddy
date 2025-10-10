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

async function checkStructuredData() {
  try {
    // Get all documents ordered by creation time
    const snapshot = await db.collection('end-of-call-analysis')
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();
    
    if (snapshot.empty) {
      console.log('No documents found in end-of-call-analysis collection');
      return;
    }
    
    console.log('=== STRUCTURED DATA FROM VAPI ===\n');
    
    // Process each document
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      console.log(`--- Document ID: ${doc.id} ---`);
      console.log(`Call ID: ${data.callId || 'N/A'}`);
      console.log(`Student ID: ${data.studentId || 'N/A'}`);
      console.log(`Interview Type: ${data.interviewType || 'N/A'}`);
      console.log(`Created At: ${data.createdAt?.toDate()?.toString() || 'N/A'}`);
      console.log('');
      
      // Show structured data if available
      if (data.structuredData && Object.keys(data.structuredData).length > 0) {
        console.log('--- STRUCTURED DATA ---');
        console.log(JSON.stringify(data.structuredData, null, 2));
      } else {
        console.log('--- NO STRUCTURED DATA ---');
      }
      
      // Show success evaluation if available
      if (data.successEvaluation && Object.keys(data.successEvaluation).length > 0) {
        console.log('\n--- SUCCESS EVALUATION ---');
        console.log(JSON.stringify(data.successEvaluation, null, 2));
      }
      
      // Show summary
      if (data.summary) {
        console.log('\n--- SUMMARY ---');
        console.log(data.summary);
      }
      
      console.log('\n' + '='.repeat(50));
      console.log('');
    }
    
  } catch (error) {
    console.error('Error retrieving structured data:', error);
  }
}

checkStructuredData();