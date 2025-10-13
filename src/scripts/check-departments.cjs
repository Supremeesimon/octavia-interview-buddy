#!/usr/bin/env node
/**
 * Script to check departments in Firestore
 * Run with: node src/scripts/check-departments.cjs
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
    console.log('Service account key file not found, checking if we can access via default credentials...');
    
    // Try to initialize with default credentials (for development environments)
    admin.initializeApp({
      projectId: "octavia-practice-interviewer"
    });
    
    console.log('Firebase Admin SDK initialized with default credentials');
  }
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  process.exit(1);
}

const db = getFirestore();

async function checkDepartments() {
  try {
    console.log('=== Checking Departments ===');
    
    // Check departments collection
    const departmentsSnapshot = await db.collection('departments').get();
    
    if (departmentsSnapshot.empty) {
      console.log('No departments found in the database.');
    } else {
      console.log(`Found ${departmentsSnapshot.size} departments:`);
      departmentsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`- ${data.name} (${doc.id})`);
        console.log(`  Institution ID: ${data.institutionId || 'None'}`);
        console.log(`  Teacher ID: ${data.teacherId || 'None'}`);
        console.log('');
      });
    }
    
    // Check institutions collection
    console.log('=== Checking Institutions ===');
    const institutionsSnapshot = await db.collection('institutions').get();
    
    if (institutionsSnapshot.empty) {
      console.log('No institutions found in the database.');
    } else {
      console.log(`Found ${institutionsSnapshot.size} institutions:`);
      institutionsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`- ${data.name} (${doc.id})`);
        console.log(`  Domain: ${data.domain || 'None'}`);
        console.log(`  Active: ${data.isActive ? 'Yes' : 'No'}`);
        console.log('');
      });
    }
    
    // Check users collection
    console.log('=== Checking Users ===');
    const usersSnapshot = await db.collection('users').get();
    
    if (usersSnapshot.empty) {
      console.log('No users found in the database.');
    } else {
      console.log(`Found ${usersSnapshot.size} users:`);
      usersSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`- ${data.email} (${data.role})`);
        console.log(`  Institution ID: ${data.institutionId || 'None'}`);
        console.log(`  Department ID: ${data.departmentId || 'None'}`);
        console.log(`  Department: ${data.department || 'None'}`);
        if (data.role === 'student') {
          console.log(`  Teacher ID: ${data.teacherId || 'None'}`);
        }
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('Error checking departments:', error);
  }
}

// Run the script
checkDepartments();