#!/usr/bin/env node
/**
 * Script to check if an institution has departments and students
 * Run with: node src/scripts/check-institution-students.cjs [institutionId]
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

async function checkInstitutionStudents(institutionId) {
  try {
    console.log(`=== Checking Institution ${institutionId} ===`);
    
    // Fetch the institution document
    const institutionRef = db.collection('institutions').doc(institutionId);
    const institutionSnap = await institutionRef.get();
    
    if (!institutionSnap.exists) {
      console.log(`No institution found with ID: ${institutionId}`);
      return;
    }
    
    const institutionData = institutionSnap.data();
    console.log(`Institution Name: ${institutionData.name}`);
    
    // Check if institution has departments
    const departmentsRef = db.collection('institutions').doc(institutionId).collection('departments');
    const departmentsSnapshot = await departmentsRef.get();
    
    if (departmentsSnapshot.empty) {
      console.log('No departments found for this institution');
      return;
    }
    
    console.log(`Found ${departmentsSnapshot.size} department(s):`);
    
    let totalStudents = 0;
    
    // Check each department for students
    for (const departmentDoc of departmentsSnapshot.docs) {
      const departmentData = departmentDoc.data();
      console.log(`\nDepartment: ${departmentData.departmentName || 'Unnamed Department'} (ID: ${departmentDoc.id})`);
      
      // Check for teachers in this department
      const teachersRef = db.collection('institutions').doc(institutionId).collection('departments').doc(departmentDoc.id).collection('teachers');
      const teachersSnapshot = await teachersRef.get();
      console.log(`  Teachers: ${teachersSnapshot.size}`);
      
      // Check for students in this department
      const studentsRef = db.collection('institutions').doc(institutionId).collection('departments').doc(departmentDoc.id).collection('students');
      const studentsSnapshot = await studentsRef.get();
      console.log(`  Students: ${studentsSnapshot.size}`);
      
      totalStudents += studentsSnapshot.size;
      
      // Show sample students if any exist
      if (!studentsSnapshot.empty) {
        console.log('  Sample students:');
        const sampleStudents = studentsSnapshot.docs.slice(0, 3); // Show first 3 students
        sampleStudents.forEach(studentDoc => {
          const studentData = studentDoc.data();
          console.log(`    - ${studentData.name || studentData.email} (${studentDoc.id})`);
        });
        if (studentsSnapshot.docs.length > 3) {
          console.log(`    ... and ${studentsSnapshot.docs.length - 3} more`);
        }
      }
    }
    
    console.log(`\nTotal students in institution: ${totalStudents}`);
    
  } catch (error) {
    console.error('Error checking institution students:', error);
  }
}

// Get institution ID from command line arguments or use a default
const institutionId = process.argv[2] || 'WxD3cWTybNsqkpj7OwW4'; // Default to a known institution ID

checkInstitutionStudents(institutionId);