#!/usr/bin/env node

/**
 * Script to specifically look for real (non-test) interviews in Firestore
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, orderBy, getDocs } from 'firebase/firestore';

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

async function findRealInterviews() {
  console.log('🔍 Searching for REAL interviews (excluding test data)...');
  console.log('📚 Looking in collection: end-of-call-analysis');
  
  try {
    // Query all documents and filter for real interviews
    const q = query(
      collection(db, 'end-of-call-analysis'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    console.log(`📊 Total documents found: ${querySnapshot.size}`);
    
    let realInterviewCount = 0;
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const callId = data.callId || '';
      
      // Filter out test data
      if (!callId.includes('test') && 
          !callId.includes('sample') && 
          !callId.includes('demo') &&
          callId.length > 10) {
        
        realInterviewCount++;
        const createdAt = data.createdAt ? data.createdAt.toDate() : new Date(0);
        
        console.log(`\n--- REAL INTERVIEW #${realInterviewCount} ---`);
        console.log(`Document ID: ${doc.id}`);
        console.log(`Call ID: ${callId}`);
        console.log(`Timestamp: ${createdAt}`);
        console.log(`Student ID: ${data.studentId || 'N/A'}`);
        console.log(`Interview Type: ${data.interviewType || 'N/A'}`);
        
        if (data.summary) {
          console.log(`Summary: ${data.summary.substring(0, 150)}...`);
        }
        
        if (data.successEvaluation) {
          console.log(`Success Score: ${data.successEvaluation.score || 'N/A'}`);
        }
        
        if (data.transcript) {
          console.log(`Transcript Length: ${data.transcript.length} characters`);
        }
        
        if (data.structuredData && data.structuredData.categories) {
          console.log(`Categories: ${data.structuredData.categories.length} found`);
        }
      }
    });
    
    if (realInterviewCount === 0) {
      console.log('\n⚠️  No real interviews found yet.');
      console.log('This might mean:');
      console.log('  1. The webhook is not receiving data from VAPI');
      console.log('  2. There was an issue during the interview');
      console.log('  3. The interview was completed very recently and data is still processing');
      
      console.log('\n📋 To troubleshoot:');
      console.log('  1. Check if the interview actually completed (did you see the completion screen?)');
      console.log('  2. Verify the webhook URL is correctly configured in VAPI Dashboard');
      console.log('  3. Run another test interview and check again');
    } else {
      console.log(`\n🎉 Found ${realInterviewCount} real interview(s)!`);
      console.log('✅ Your VAPI integration is working correctly!');
    }
    
  } catch (error) {
    console.error('❌ Error searching Firestore:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('   1. Verify Firebase configuration in .env files');
    console.log('   2. Check if Firebase credentials are properly set up');
    console.log('   3. Ensure Firestore rules allow read access');
  }
}

// Run the search
findRealInterviews();