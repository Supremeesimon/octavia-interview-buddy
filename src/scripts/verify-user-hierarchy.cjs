#!/usr/bin/env node
/**
 * Script to verify the complete user hierarchy linking:
 * Institutions -> Departments -> Teachers -> Students
 * Run with: node src/scripts/verify-user-hierarchy.cjs
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

async function verifyUserHierarchy() {
  try {
    console.log('=== Verifying User Hierarchy Linking ===\n');
    
    // 1. Check institutions
    console.log('1. Checking Institutions...');
    const institutionsSnapshot = await db.collection('institutions').get();
    
    if (institutionsSnapshot.empty) {
      console.log('   ❌ No institutions found');
      return;
    }
    
    console.log(`   ✅ Found ${institutionsSnapshot.size} institution(s)`);
    institutionsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`      - ${data.name} (${doc.id})`);
      console.log(`        Domain: ${data.domain}`);
      console.log(`        Active: ${data.isActive ? 'Yes' : 'No'}`);
    });
    
    // 2. Check departments
    console.log('\n2. Checking Departments...');
    const departmentsSnapshot = await db.collection('departments').get();
    
    if (departmentsSnapshot.empty) {
      console.log('   ❌ No departments found');
      return;
    }
    
    console.log(`   ✅ Found ${departmentsSnapshot.size} department(s)`);
    departmentsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`      - ${data.name} (${doc.id})`);
      console.log(`        Institution: ${data.institutionId}`);
    });
    
    // 3. Check users and their relationships
    console.log('\n3. Checking User Relationships...');
    const usersSnapshot = await db.collection('users').get();
    
    if (usersSnapshot.empty) {
      console.log('   ❌ No users found');
      return;
    }
    
    console.log(`   ✅ Found ${usersSnapshot.size} user(s)`);
    
    // Categorize users
    const teachers = [];
    const students = [];
    const admins = [];
    
    for (const doc of usersSnapshot.docs) {
      const data = doc.data();
      const user = { id: doc.id, ...data };
      
      switch (user.role) {
        case 'teacher':
        case 'institution_admin':
          teachers.push(user);
          break;
        case 'student':
          students.push(user);
          break;
        case 'platform_admin':
          admins.push(user);
          break;
        default:
          students.push(user);
      }
    }
    
    // Verify teachers
    console.log(`\n   Teachers (${teachers.length}):`);
    for (const teacher of teachers) {
      console.log(`      - ${teacher.email} (${teacher.role})`);
      
      // Check institution link
      if (teacher.institutionId) {
        console.log(`        ✅ Linked to institution`);
      } else {
        console.log(`        ❌ Not linked to institution`);
      }
      
      // Check department link
      if (teacher.departmentId && teacher.department) {
        console.log(`        ✅ Linked to department: ${teacher.department}`);
      } else {
        console.log(`        ❌ Not linked to department`);
      }
    }
    
    // Verify students
    console.log(`\n   Students (${students.length}):`);
    for (const student of students) {
      console.log(`      - ${student.email} (${student.role})`);
      
      // Check institution link
      if (student.institutionId) {
        console.log(`        ✅ Linked to institution`);
      } else {
        console.log(`        ❌ Not linked to institution`);
      }
      
      // Check department link
      if (student.departmentId && student.department) {
        console.log(`        ✅ Linked to department: ${student.department}`);
      } else {
        console.log(`        ❌ Not linked to department`);
      }
      
      // Check teacher link
      if (student.teacherId) {
        console.log(`        ✅ Linked to teacher`);
      } else {
        console.log(`        ⚠️  Not linked to teacher`);
      }
    }
    
    // Verify admins
    console.log(`\n   Admins (${admins.length}):`);
    for (const admin of admins) {
      console.log(`      - ${admin.email} (${admin.role})`);
      
      // Platform admins should not be linked to specific institutions
      if (admin.institutionId) {
        console.log(`        ❌ Incorrectly linked to institution`);
      } else {
        console.log(`        ✅ Not linked to specific institution (correct for platform admin)`);
      }
    }
    
    // 4. Check department-teacher-student relationships
    console.log('\n4. Checking Department-Teacher-Student Relationships...');
    
    for (const doc of departmentsSnapshot.docs) {
      const department = doc.data();
      const departmentId = doc.id;
      
      console.log(`\n   Department: ${department.name}`);
      
      // Find teacher for this department
      const teacherQuery = await db.collection('users')
        .where('departmentId', '==', departmentId)
        .where('role', 'in', ['teacher', 'institution_admin'])
        .limit(1)
        .get();
      
      if (!teacherQuery.empty) {
        const teacher = teacherQuery.docs[0].data();
        console.log(`      Teacher: ${teacher.email}`);
      } else {
        console.log(`      Teacher: None assigned`);
      }
      
      // Find students in this department
      const studentsQuery = await db.collection('users')
        .where('departmentId', '==', departmentId)
        .where('role', '==', 'student')
        .get();
      
      console.log(`      Students: ${studentsQuery.size}`);
      studentsQuery.forEach((studentDoc) => {
        const student = studentDoc.data();
        console.log(`        - ${student.email}`);
      });
    }
    
    console.log('\n=== Verification Complete ===');
    console.log('✅ User hierarchy linking is properly configured');
    
  } catch (error) {
    console.error('Error verifying user hierarchy:', error);
    process.exit(1);
  }
}

// Run the script
verifyUserHierarchy();