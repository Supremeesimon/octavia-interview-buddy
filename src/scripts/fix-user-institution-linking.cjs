#!/usr/bin/env node
/**
 * Script to fix user-institution-department linking issues
 * This script will properly link existing users to institutions and departments
 * Run with: node src/scripts/fix-user-institution-linking.cjs
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

async function fixUserInstitutionLinking() {
  try {
    console.log('=== Starting User-Institution-Department Linking Fix ===\n');
    
    // Fetch all institutions first to build a map
    const institutionsQuery = db.collection('institutions');
    const institutionsSnapshot = await institutionsQuery.get();
    
    if (institutionsSnapshot.empty) {
      console.log('No institutions found in database. Creating a default institution...');
      // Create a default institution
      const institutionRef = await db.collection('institutions').add({
        name: 'Lethbridge Polytechnic',
        domain: 'lethbridgepolytechnic.ca',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log(`Created institution: Lethbridge Polytechnic (ID: ${institutionRef.id})`);
    }
    
    // Re-fetch institutions after potential creation
    const updatedInstitutionsSnapshot = await db.collection('institutions').get();
    const institutionMap = {};
    let defaultInstitutionId = null;
    
    updatedInstitutionsSnapshot.forEach((doc) => {
      institutionMap[doc.id] = {
        id: doc.id,
        ...doc.data()
      };
      
      // Set the first institution as default if we don't have one
      if (!defaultInstitutionId) {
        defaultInstitutionId = doc.id;
      }
    });
    
    console.log(`Found ${updatedInstitutionsSnapshot.size} institution(s) in Firestore`);
    
    // Create departments collection if it doesn't exist
    console.log('\n=== Creating Departments ===');
    const departmentsData = [
      { name: 'Computer Science', institutionId: defaultInstitutionId },
      { name: 'Business Administration', institutionId: defaultInstitutionId },
      { name: 'Engineering', institutionId: defaultInstitutionId },
      { name: 'Arts & Humanities', institutionId: defaultInstitutionId },
      { name: 'Health Sciences', institutionId: defaultInstitutionId }
    ];
    
    // Check if departments already exist
    const departmentsSnapshot = await db.collection('departments').get();
    if (departmentsSnapshot.empty) {
      console.log('Creating departments...');
      for (const dept of departmentsData) {
        const deptRef = await db.collection('departments').add({
          ...dept,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`Created department: ${dept.name} (ID: ${deptRef.id})`);
      }
    } else {
      console.log(`Found ${departmentsSnapshot.size} existing department(s)`);
    }
    
    // Fetch all users from Firestore
    const usersQuery = db.collection('users');
    const usersSnapshot = await usersQuery.get();
    
    console.log(`\nFound ${usersSnapshot.size} users in Firestore. Fixing links...\n`);
    
    // Get department IDs for assignment
    const departmentsQuery = db.collection('departments').where('institutionId', '==', defaultInstitutionId);
    const departmentsListSnapshot = await departmentsQuery.get();
    const departmentsList = [];
    departmentsListSnapshot.forEach((doc) => {
      departmentsList.push({ id: doc.id, ...doc.data() });
    });
    
    // Process each user
    let updatedUsers = 0;
    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      const userId = doc.id;
      
      console.log(`Processing user: ${userData.email || 'No email'} (${userData.role || 'No role'})`);
      
      // Prepare update data
      const updateData = {
        institutionId: defaultInstitutionId,
        updatedAt: new Date()
      };
      
      // Assign department based on role
      if (userData.role === 'student' || userData.role === 'institution_admin') {
        // Assign a random department from the list
        if (departmentsList.length > 0) {
          const randomDept = departmentsList[Math.floor(Math.random() * departmentsList.length)];
          updateData.department = randomDept.name;
          updateData.departmentId = randomDept.id;
          console.log(`  -> Assigned to department: ${randomDept.name}`);
        }
      }
      
      // Update user document
      try {
        await db.collection('users').doc(userId).update(updateData);
        console.log(`  -> Updated user ${userId} with institution and department links`);
        updatedUsers++;
      } catch (error) {
        console.error(`  -> Error updating user ${userId}:`, error.message);
      }
    }
    
    console.log(`\n=== Summary ===`);
    console.log(`Updated ${updatedUsers} users with proper institution and department links`);
    console.log(`All users are now linked to institution: ${institutionMap[defaultInstitutionId]?.name || defaultInstitutionId}`);
    
    // Verify the fixes
    console.log('\n=== Verification ===');
    const verifyUsersSnapshot = await db.collection('users').get();
    for (const doc of verifyUsersSnapshot.docs) {
      const userData = doc.data();
      console.log(`${userData.email} -> Institution: ${userData.institutionId ? 'Linked' : 'Not linked'}, Department: ${userData.department || 'None'}`);
    }
    
    console.log('\n=== Linking Fix Completed Successfully ===');
    
  } catch (error) {
    console.error('Error fixing user-institution linking:', error);
    process.exit(1);
  }
}

// Run the script
fixUserInstitutionLinking();