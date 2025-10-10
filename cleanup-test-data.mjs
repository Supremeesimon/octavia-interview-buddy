#!/usr/bin/env node

/**
 * Script to clean up test data from Firestore
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "your_firebase_api_key_here",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "your_firebase_auth_domain_here",
  projectId: process.env.FIREBASE_PROJECT_ID || "octavia-practice-interviewer",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "your_firebase_storage_bucket_here",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "your_firebase_messaging_sender_id_here",
  appId: process.env.FIREBASE_APP_ID || "your_firebase_app_id_here"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanupTestData() {
  console.log('🧹 Cleaning up test data from Firestore...');
  
  try {
    // Query for test documents in end-of-call-analysis collection
    const testQuery = query(
      collection(db, 'end-of-call-analysis'),
      where('callId', 'in', [
        'test123',
        'test_call_12345',
        'test_call_structured_12345',
        'vapi_dashboard_config_test_001'
      ])
    );
    
    const testSnapshot = await getDocs(testQuery);
    console.log(`Found ${testSnapshot.size} test documents to delete`);
    
    // Delete test documents
    const deletePromises = [];
    testSnapshot.forEach((doc) => {
      console.log(`Deleting test document: ${doc.id}`);
      deletePromises.push(deleteDoc(doc.ref));
    });
    
    await Promise.all(deletePromises);
    console.log('✅ Test data cleanup completed');
    
    // Also query for documents with callId containing 'test'
    const patternQuery = query(
      collection(db, 'end-of-call-analysis')
    );
    
    const patternSnapshot = await getDocs(patternQuery);
    const patternDeletePromises = [];
    
    patternSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.callId && (data.callId.includes('test') || data.callId.includes('sample') || data.callId.includes('demo'))) {
        console.log(`Deleting pattern-matched document: ${doc.id} (callId: ${data.callId})`);
        patternDeletePromises.push(deleteDoc(doc.ref));
      }
    });
    
    if (patternDeletePromises.length > 0) {
      await Promise.all(patternDeletePromises);
      console.log(`✅ Deleted ${patternDeletePromises.length} additional pattern-matched documents`);
    }
    
    console.log('✨ All test data has been removed from Firestore');
    
  } catch (error) {
    console.error('❌ Error cleaning up test data:', error.message);
  }
}

// Run the cleanup
cleanupTestData();