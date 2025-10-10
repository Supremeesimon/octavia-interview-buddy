#!/usr/bin/env node

/**
 * Script to check if VAPI analysis data is being saved to Firestore
 * This helps verify that the end-to-end integration is working correctly
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

// Firebase configuration - replace with your actual config
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

async function checkFirestoreData() {
  console.log('🔍 Checking Firestore for VAPI analysis data...');
  console.log('📚 Looking in collection: end-of-call-analysis');
  
  try {
    // Query the end-of-call-analysis collection
    const q = query(
      collection(db, 'end-of-call-analysis'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    
    const querySnapshot = await getDocs(q);
    
    console.log(`📊 Found ${querySnapshot.size} documents in the collection`);
    
    if (querySnapshot.empty) {
      console.log('⚠️  No documents found in end-of-call-analysis collection');
      console.log('\n📋 This could mean:');
      console.log('   1. No interviews have been completed yet');
      console.log('   2. The webhook is not receiving data');
      console.log('   3. There might be an issue with the Firebase Function');
      console.log('\n🔧 Troubleshooting steps:');
      console.log('   1. Run a test interview');
      console.log('   2. Check Firebase Function logs: firebase functions:log');
      console.log('   3. Verify webhook URL in VAPI Dashboard');
      return;
    }
    
    console.log('\n📄 Recent documents:');
    querySnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n--- Document ${index + 1} ---`);
      console.log(`ID: ${doc.id}`);
      console.log(`Call ID: ${data.callId || 'N/A'}`);
      console.log(`Timestamp: ${data.createdAt ? data.createdAt.toDate() : 'N/A'}`);
      console.log(`Student ID: ${data.studentId || 'N/A'}`);
      console.log(`Interview Type: ${data.interviewType || 'N/A'}`);
      
      if (data.summary) {
        console.log(`Summary: ${data.summary.substring(0, 100)}...`);
      }
      
      if (data.successEvaluation) {
        console.log(`Success Score: ${data.successEvaluation.score || 'N/A'}`);
      }
      
      if (data.structuredData && data.structuredData.categories) {
        console.log(`Categories: ${data.structuredData.categories.length} found`);
      }
    });
    
    console.log('\n✅ Firestore integration verified!');
    console.log('🎉 Data is being successfully saved from VAPI to Firestore');
    
  } catch (error) {
    console.error('❌ Error checking Firestore:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('   1. Verify Firebase configuration in .env files');
    console.log('   2. Check if Firebase credentials are properly set up');
    console.log('   3. Ensure Firestore rules allow read access');
    console.log('   4. Run: firebase functions:log (to check for errors)');
  }
}

// Run the check
checkFirestoreData();