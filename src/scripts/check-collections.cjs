#!/usr/bin/env node
/**
 * Script to check all collections in Firestore
 * Run with: node src/scripts/check-collections.cjs
 */

// Import Firebase Admin SDK
const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// Try to initialize Firebase Admin SDK with service account key
try {
  // Path to service account key file
  const serviceAccountPath = path.join(__dirname, '..', '..', 'functions', 'service-account-key.json');
  
  // Check if service account key file exists
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    
    // Initialize Firebase Admin SDK
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://octavia-practice-interviewer.firebaseio.com"
    });
    
    console.log('Firebase Admin SDK initialized successfully with service account key');
  } else {
    console.error('Service account key file not found at:', serviceAccountPath);
    process.exit(1);
  }
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  process.exit(1);
}

const db = getFirestore();

async function checkCollections() {
  try {
    console.log('=== Checking All Collections ===');
    
    // List all collections
    const collections = await db.listCollections();
    console.log('Available collections:');
    collections.forEach(collection => {
      console.log(`- ${collection.id}`);
    });
    
    // Check if signup_links collection exists
    console.log('\n=== Checking for signup_links collection ===');
    try {
      const signupLinksCollection = db.collection('signup_links');
      const signupLinksSnapshot = await signupLinksCollection.limit(1).get();
      console.log(`signup_links collection exists: ${!signupLinksSnapshot.empty ? 'Yes (with data)' : 'Yes (empty)'}`);
    } catch (error) {
      console.log('signup_links collection: Does not exist or inaccessible');
    }
    
  } catch (error) {
    console.error('Error checking collections:', error);
  }
}

// Run the script
checkCollections();