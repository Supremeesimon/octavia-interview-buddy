#!/usr/bin/env node
/**
 * Script to fix platform admin linking
 * Platform admins should not be linked to specific institutions
 * Run with: node src/scripts/fix-platform-admin-linking.cjs
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

async function fixPlatformAdminLinking() {
  try {
    console.log('=== Starting Platform Admin Linking Fix ===\n');
    
    // Find all platform admins
    const platformAdminsQuery = await db.collection('users')
      .where('role', '==', 'platform_admin')
      .get();
    
    if (platformAdminsQuery.empty) {
      console.log('No platform admins found');
      return;
    }
    
    console.log(`Found ${platformAdminsQuery.size} platform admin(s)`);
    
    // Remove institution linking for all platform admins
    let updatedAdmins = 0;
    for (const doc of platformAdminsQuery.docs) {
      const adminData = doc.data();
      const adminId = doc.id;
      
      console.log(`Processing platform admin: ${adminData.email}`);
      
      // Remove institution linking fields
      await db.collection('users').doc(adminId).update({
        institutionId: admin.firestore.FieldValue.delete(),
        departmentId: admin.firestore.FieldValue.delete(),
        department: admin.firestore.FieldValue.delete(),
        teacherId: admin.firestore.FieldValue.delete(),
        institutionDomain: admin.firestore.FieldValue.delete(),
        updatedAt: new Date()
      });
      
      console.log(`  ✅ Removed institution linking for ${adminData.email}`);
      updatedAdmins++;
    }
    
    console.log(`\n=== Summary ===`);
    console.log(`Updated ${updatedAdmins} platform admin(s)`);
    console.log('Platform admins no longer linked to specific institutions');
    
    // Verify the fixes
    console.log('\n=== Verification ===');
    const verifyQuery = await db.collection('users')
      .where('role', '==', 'platform_admin')
      .get();
    
    for (const doc of verifyQuery.docs) {
      const data = doc.data();
      console.log(`${data.email}:`);
      console.log(`  Institution ID: ${data.institutionId || 'None'}`);
      console.log(`  Institution Domain: ${data.institutionDomain || 'None'}`);
      console.log(`  Department: ${data.department || 'None'}`);
    }
    
    console.log('\n=== Platform Admin Linking Fix Completed ===');
    
  } catch (error) {
    console.error('Error fixing platform admin linking:', error);
    process.exit(1);
  }
}

// Run the script
fixPlatformAdminLinking();