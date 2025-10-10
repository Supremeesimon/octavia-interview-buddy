#!/usr/bin/env node

/**
 * Script to clean up test data from Firestore using Admin SDK
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

async function cleanupTestDataAdmin() {
  console.log('🧹 Cleaning up test data from Firestore using Admin SDK...');
  
  try {
    // Query for documents with callId containing 'test'
    const snapshot = await db.collection('end-of-call-analysis').get();
    console.log(`Found ${snapshot.size} total documents`);
    
    let deletedCount = 0;
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (data.callId && 
          (data.callId.includes('test') || 
           data.callId.includes('sample') || 
           data.callId.includes('demo') ||
           data.callId === 'test123' ||
           data.callId === 'test_call_12345' ||
           data.callId === 'test_call_structured_12345' ||
           data.callId === 'vapi_dashboard_config_test_001')) {
        
        console.log(`Deleting test document: ${doc.id} (callId: ${data.callId})`);
        await doc.ref.delete();
        deletedCount++;
      }
    }
    
    console.log(`✅ Deleted ${deletedCount} test documents`);
    console.log('✨ Test data cleanup completed');
    
  } catch (error) {
    console.error('❌ Error cleaning up test data:', error.message);
    console.log('This might be because we need proper admin credentials');
  }
}

// Run the cleanup
cleanupTestDataAdmin();