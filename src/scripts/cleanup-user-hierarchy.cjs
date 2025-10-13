#!/usr/bin/env node
/**
 * Script to cleanup user hierarchy linking for testing purposes
 * This script removes all institution, department, and user links
 * Run with: node src/scripts/cleanup-user-hierarchy.cjs
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

async function cleanupUserHierarchy() {
  try {
    console.log('=== Starting User Hierarchy Cleanup ===\n');
    
    // 1. Remove all user links (but keep users)
    console.log('1. Removing user hierarchy links...');
    const usersSnapshot = await db.collection('users').get();
    
    let updatedUsers = 0;
    for (const doc of usersSnapshot.docs) {
      const userId = doc.id;
      
      // Remove hierarchy linking fields
      await db.collection('users').doc(userId).update({
        institutionId: admin.firestore.FieldValue.delete(),
        departmentId: admin.firestore.FieldValue.delete(),
        department: admin.firestore.FieldValue.delete(),
        teacherId: admin.firestore.FieldValue.delete(),
        updatedAt: new Date()
      });
      
      console.log(`   Removed links for user ${userId}`);
      updatedUsers++;
    }
    
    console.log(`   Updated ${updatedUsers} users\n`);
    
    // 2. Remove all departments
    console.log('2. Removing all departments...');
    const departmentsSnapshot = await db.collection('departments').get();
    
    let deletedDepartments = 0;
    for (const doc of departmentsSnapshot.docs) {
      const departmentId = doc.id;
      await db.collection('departments').doc(departmentId).delete();
      console.log(`   Deleted department ${departmentId}`);
      deletedDepartments++;
    }
    
    console.log(`   Deleted ${deletedDepartments} departments\n`);
    
    // 3. Reset institution domains (but keep institutions)
    console.log('3. Resetting institution domains...');
    const institutionsSnapshot = await db.collection('institutions').get();
    
    let updatedInstitutions = 0;
    for (const doc of institutionsSnapshot.docs) {
      const institutionId = doc.id;
      await db.collection('institutions').doc(institutionId).update({
        domain: admin.firestore.FieldValue.delete(),
        updatedAt: new Date()
      });
      
      console.log(`   Reset domain for institution ${institutionId}`);
      updatedInstitutions++;
    }
    
    console.log(`   Updated ${updatedInstitutions} institutions\n`);
    
    console.log('=== Cleanup Complete ===');
    console.log('All user hierarchy links have been removed.');
    console.log('Users, institutions, and departments still exist but without links.');
    console.log('Run the fix script to restore proper linking.');
    
  } catch (error) {
    console.error('Error cleaning up user hierarchy:', error);
    process.exit(1);
  }
}

// Run the script
cleanupUserHierarchy();