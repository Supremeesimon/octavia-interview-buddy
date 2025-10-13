#!/usr/bin/env node
/**
 * Script to remove mock departments and reset the system
 * Run with: node src/scripts/remove-mock-departments.cjs
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

async function removeMockDepartments() {
  try {
    console.log('=== Removing Mock Departments ===');
    
    // Define the mock department names that were created
    const mockDepartmentNames = [
      'Computer Science',
      'Business Administration', 
      'Engineering',
      'Health Sciences',
      'Arts & Humanities'
    ];
    
    // Find and delete mock departments
    let deletedDepartments = 0;
    
    for (const deptName of mockDepartmentNames) {
      const departmentsQuery = await db.collection('departments')
        .where('name', '==', deptName)
        .get();
      
      for (const doc of departmentsQuery.docs) {
        // Remove department reference from any users
        const usersWithDepartment = await db.collection('users')
          .where('departmentId', '==', doc.id)
          .get();
        
        for (const userDoc of usersWithDepartment.docs) {
          await db.collection('users').doc(userDoc.id).update({
            departmentId: null,
            department: null,
            updatedAt: new Date()
          });
          console.log(`Removed department reference from user ${userDoc.data().email}`);
        }
        
        // Delete the department document
        await db.collection('departments').doc(doc.id).delete();
        console.log(`Deleted department: ${deptName} (${doc.id})`);
        deletedDepartments++;
      }
    }
    
    console.log(`\nDeleted ${deletedDepartments} mock departments.`);
    
    // Reset any users that might have been linked to these departments
    console.log('\n=== Resetting User Department References ===');
    const usersSnapshot = await db.collection('users').get();
    
    let updatedUsers = 0;
    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      
      // If user has a departmentId but it's from our mock departments, remove it
      if (userData.departmentId) {
        const deptDoc = await db.collection('departments').doc(userData.departmentId).get();
        if (!deptDoc.exists) {
          // Department no longer exists, remove reference
          await db.collection('users').doc(doc.id).update({
            departmentId: null,
            department: null,
            updatedAt: new Date()
          });
          console.log(`Reset department reference for user ${userData.email}`);
          updatedUsers++;
        }
      }
    }
    
    console.log(`Updated ${updatedUsers} users with reset department references.`);
    
    console.log('\n=== Verification ===');
    
    // Verify departments
    const departmentsSnapshot = await db.collection('departments').get();
    console.log(`Departments remaining: ${departmentsSnapshot.size}`);
    departmentsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`- ${data.name} (${doc.id})`);
    });
    
    // Verify users
    const usersVerifySnapshot = await db.collection('users').get();
    console.log(`\nUsers: ${usersVerifySnapshot.size} total`);
    for (const doc of usersVerifySnapshot.docs) {
      const data = doc.data();
      console.log(`- ${data.email} (${data.role})`);
      console.log(`  Institution: ${data.institutionId ? 'Linked' : 'Not linked'}`);
      console.log(`  Department: ${data.department || 'None'} (${data.departmentId || 'None'})`);
      if (data.role === 'student') {
        console.log(`  Teacher: ${data.teacherId ? 'Linked' : 'Not linked'}`);
      }
      console.log('');
    }
    
    console.log('=== Mock Departments Removal Completed Successfully ===');
    
  } catch (error) {
    console.error('Error removing mock departments:', error);
    process.exit(1);
  }
}

// Run the script
removeMockDepartments();