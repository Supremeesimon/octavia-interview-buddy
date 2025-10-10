#!/usr/bin/env node

/**
 * Script to check for recent documents in Firestore
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

// Firebase Admin configuration using service account
const serviceAccount = JSON.parse(readFileSync('./firebase-service-account.json', 'utf8'));

const app = initializeApp({
  credential: cert(serviceAccount),
  projectId: 'octavia-practice-interviewer'
});

const db = getFirestore(app);

async function checkRecentDocuments() {
  console.log('🔍 Checking for recent documents in Firestore...');
  
  try {
    // Check all recent documents in end-of-call-analysis collection
    const snapshot = await db.collection('end-of-call-analysis')
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get();
    
    console.log(`📊 Found ${snapshot.size} recent documents:`);
    
    let count = 0;
    snapshot.forEach((doc) => {
      const data = doc.data();
      const createdAt = data.createdAt ? data.createdAt.toDate() : new Date(0);
      const now = new Date();
      const minutesAgo = Math.floor((now - createdAt) / (1000 * 60));
      
      // Only show documents from the last 60 minutes
      if (minutesAgo <= 60) {
        count++;
        console.log(`\n--- Document ${count} (${minutesAgo} minutes ago) ---`);
        console.log(`ID: ${doc.id}`);
        console.log(`Call ID: ${data.callId || 'N/A'}`);
        console.log(`Timestamp: ${createdAt}`);
        console.log(`Type: ${data.interviewType || 'N/A'}`);
        if (data.summary) {
          console.log(`Summary: ${data.summary.substring(0, 100)}...`);
        }
        if (data.successEvaluation) {
          console.log(`Score: ${data.successEvaluation.score || 'N/A'}`);
        }
      }
    });
    
    if (count === 0) {
      console.log('No recent documents found in the last 60 minutes');
    }
    
  } catch (error) {
    console.error('❌ Error checking recent documents:', error.message);
  }
}

// Run the check
checkRecentDocuments();