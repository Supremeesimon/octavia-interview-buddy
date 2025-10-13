#!/usr/bin/env node
/**
 * Script to check existing users and their relationships to institutions and departments
 * Run with: node src/scripts/check-users-institutions.cjs
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

async function checkAllCollections() {
  try {
    console.log('=== Checking All Collections ===');
    
    // List all collections
    const collections = await db.listCollections();
    console.log('Available collections:');
    collections.forEach(collection => {
      console.log(`- ${collection.id}`);
    });
    
    console.log('\n=== Detailed User-Institution Relationships ===');
    
    // Fetch all institutions first to build a map
    const institutionsQuery = db.collection('institutions');
    const institutionsSnapshot = await institutionsQuery.get();
    
    const institutionMap = {};
    institutionsSnapshot.forEach((doc) => {
      institutionMap[doc.id] = {
        id: doc.id,
        ...doc.data()
      };
    });
    
    // Fetch all users from Firestore
    const usersQuery = db.collection('users');
    const usersSnapshot = await usersQuery.get();
    
    console.log(`\nFound ${usersSnapshot.size} users in Firestore:`);
    
    // Display detailed information for each user
    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      console.log('\n--------------------------------------------------');
      console.log(`User ID: ${doc.id}`);
      console.log(`Email: ${userData.email || 'No email'}`);
      console.log(`Name: ${userData.name || 'No name'}`);
      console.log(`Role: ${userData.role || 'No role'}`);
      
      // Institution information
      let institutionInfo = 'None';
      if (userData.institutionId) {
        const institution = institutionMap[userData.institutionId];
        if (institution) {
          institutionInfo = `${institution.name || institution.domain || 'Unnamed Institution'} (ID: ${userData.institutionId})`;
        } else {
          institutionInfo = `Unknown (ID: ${userData.institutionId})`;
        }
      } else if (userData.institutionDomain) {
        institutionInfo = userData.institutionDomain;
      }
      console.log(`Institution: ${institutionInfo}`);
      
      // Department information
      console.log(`Department: ${userData.department || 'None'}`);
      
      // Additional user information
      console.log(`Email Verified: ${userData.emailVerified || userData.isEmailVerified || false}`);
      console.log(`Profile Completed: ${userData.profileCompleted || false}`);
      if (userData.createdAt) {
        console.log(`Created At: ${userData.createdAt.toDate ? userData.createdAt.toDate().toISOString() : userData.createdAt}`);
      }
      if (userData.lastLoginAt) {
        console.log(`Last Login: ${userData.lastLoginAt.toDate ? userData.lastLoginAt.toDate().toISOString() : userData.lastLoginAt}`);
      }
    }
    
    console.log('\n==================================================');
    console.log('INSTITUTION DETAILS');
    console.log('==================================================');
    
    console.log(`Found ${institutionsSnapshot.size} institutions in Firestore:`);
    
    // Display detailed information for each institution
    for (const doc of institutionsSnapshot.docs) {
      const institutionData = doc.data();
      console.log('\n--------------------------------------------------');
      console.log(`Institution ID: ${doc.id}`);
      console.log(`Name: ${institutionData.name || 'No name'}`);
      console.log(`Domain: ${institutionData.domain || 'No domain'}`);
      console.log(`Active: ${institutionData.isActive || false}`);
      
      // Count users associated with this institution
      const usersInInstitution = [];
      usersSnapshot.forEach((userDoc) => {
        const userData = userDoc.data();
        if (userData.institutionId === doc.id || userData.institutionDomain === institutionData.domain) {
          usersInInstitution.push({
            id: userDoc.id,
            name: userData.name,
            email: userData.email,
            role: userData.role
          });
        }
      });
      
      console.log(`Associated Users: ${usersInInstitution.length}`);
      usersInInstitution.forEach(user => {
        console.log(`  - ${user.name} (${user.email}) - ${user.role}`);
      });
    }
    
    // Check for departments collection
    console.log('\n==================================================');
    console.log('DEPARTMENTS COLLECTION');
    console.log('==================================================');
    
    try {
      const departmentsQuery = db.collection('departments');
      const departmentsSnapshot = await departmentsQuery.get();
      
      console.log(`Found ${departmentsSnapshot.size} departments in Firestore:`);
      
      if (departmentsSnapshot.empty) {
        console.log('No departments found.');
      } else {
        departmentsSnapshot.forEach((doc) => {
          const departmentData = doc.data();
          console.log(`- ${departmentData.name || 'Unnamed Department'} (ID: ${doc.id})`);
          if (departmentData.institutionId) {
            const institution = institutionMap[departmentData.institutionId];
            console.log(`  Institution: ${institution ? institution.name : departmentData.institutionId}`);
          }
        });
      }
    } catch (error) {
      console.log('Departments collection not accessible or does not exist:', error.message);
    }
    
    console.log('\n==================================================');
    console.log('SUMMARY STATISTICS');
    console.log('==================================================');
    
    // Role distribution
    const roleCounts = {};
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      const role = userData.role || 'unknown';
      roleCounts[role] = (roleCounts[role] || 0) + 1;
    });
    
    console.log('Users by Role:');
    for (const [role, count] of Object.entries(roleCounts)) {
      console.log(`  ${role}: ${count}`);
    }
    
    // Institution distribution
    const institutionCounts = {};
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      let institutionKey = 'None';
      if (userData.institutionId) {
        const institution = institutionMap[userData.institutionId];
        institutionKey = institution ? institution.name || institution.domain || userData.institutionId : userData.institutionId;
      } else if (userData.institutionDomain) {
        institutionKey = userData.institutionDomain;
      }
      institutionCounts[institutionKey] = (institutionCounts[institutionKey] || 0) + 1;
    });
    
    console.log('\nUsers by Institution:');
    for (const [institution, count] of Object.entries(institutionCounts)) {
      console.log(`  ${institution}: ${count}`);
    }
    
    console.log('\n==================================================');
    console.log('TOTAL COUNTS');
    console.log('==================================================');
    console.log(`Total Users: ${usersSnapshot.size}`);
    console.log(`Total Institutions: ${institutionsSnapshot.size}`);
    
  } catch (error) {
    console.error('Error checking collections:', error);
  }
}

// Run the script
checkAllCollections();