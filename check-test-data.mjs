#!/usr/bin/env node

/**
 * Script to specifically check for our test data in Firestore
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

async function checkTestData() {
  console.log('🔍 Checking for test data in Firestore...');
  
  try {
    // Check for our specific test document
    const doc = await db.collection('end-of-call-analysis').doc('aT4De0KlyVa8ge3ZNP8h').get();
    
    if (doc.exists) {
      console.log('✅ Found our test document!');
      console.log('Document data:', doc.data());
    } else {
      console.log('❌ Test document not found');
      
      // Let's check all recent documents
      const snapshot = await db.collection('end-of-call-analysis')
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get();
      
      console.log(`📊 Found ${snapshot.size} recent documents:`);
      
      snapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\n--- Document ${index + 1} ---`);
        console.log(`ID: ${doc.id}`);
        console.log(`Call ID: ${data.callId || 'N/A'}`);
        if (data.callId === 'webcall_test_001') {
          console.log('🎉 This is our test document!');
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking test data:', error.message);
  }
}

// Run the check
checkTestData();