#!/usr/bin/env node

/**
 * Script to check for recent VAPI interviews in Firestore
 * This will help verify if your actual interview was captured
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';

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

async function checkRecentInterviews() {
  console.log('🔍 Checking Firestore for recent VAPI interviews...');
  console.log('📚 Looking in collection: end-of-call-analysis');
  
  try {
    // Query the end-of-call-analysis collection for very recent documents
    const recentQuery = query(
      collection(db, 'end-of-call-analysis'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    
    const querySnapshot = await getDocs(recentQuery);
    
    console.log(`📊 Found ${querySnapshot.size} recent documents in the collection`);
    
    if (querySnapshot.empty) {
      console.log('⚠️  No documents found in end-of-call-analysis collection');
      return;
    }
    
    console.log('\n📄 Recent documents (sorted by creation time):');
    let foundRecentInterview = false;
    
    querySnapshot.forEach((doc, index) => {
      const data = doc.data();
      const createdAt = data.createdAt ? data.createdAt.toDate() : new Date(0);
      const now = new Date();
      const minutesAgo = Math.floor((now - createdAt) / (1000 * 60));
      
      // Check if this document was created in the last 30 minutes
      if (minutesAgo <= 30) {
        foundRecentInterview = true;
        console.log(`\n--- Document ${index + 1} (Created ${minutesAgo} minutes ago) ---`);
        console.log(`ID: ${doc.id}`);
        console.log(`Call ID: ${data.callId || 'N/A'}`);
        console.log(`Timestamp: ${createdAt}`);
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
        
        // Check if this looks like a real interview (not a test)
        if (data.callId && !data.callId.includes('test') && data.transcript && data.transcript.length > 200) {
          console.log('🎯 This appears to be a REAL interview!');
        }
      }
    });
    
    if (!foundRecentInterview) {
      console.log('\n⚠️  No interviews found in the last 30 minutes');
      console.log('This might mean:');
      console.log('  1. The interview was completed more than 30 minutes ago');
      console.log('  2. The webhook is not receiving data from VAPI');
      console.log('  3. There was an issue during the interview');
    } else {
      console.log('\n✅ Recent interview data found!');
    }
    
  } catch (error) {
    console.error('❌ Error checking Firestore:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('   1. Verify Firebase configuration in .env files');
    console.log('   2. Check if Firebase credentials are properly set up');
    console.log('   3. Ensure Firestore rules allow read access');
  }
}

// Run the check
checkRecentInterviews();