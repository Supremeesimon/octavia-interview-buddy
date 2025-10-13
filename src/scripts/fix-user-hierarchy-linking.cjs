#!/usr/bin/env node
/**
 * Script to fix the complete user hierarchy linking:
 * Institutions -> Departments -> Teachers -> Students
 * Run with: node src/scripts/fix-user-hierarchy-linking.cjs
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

async function fixUserHierarchyLinking() {
  try {
    console.log('=== Starting Complete User Hierarchy Linking Fix ===\n');
    
    // Step 1: Fix the existing institution
    console.log('1. Fixing existing institution...');
    const institutionsSnapshot = await db.collection('institutions').get();
    
    let institutionId = null;
    let institutionData = null;
    
    if (!institutionsSnapshot.empty) {
      // Get the first (and only) institution
      const institutionDoc = institutionsSnapshot.docs[0];
      institutionId = institutionDoc.id;
      institutionData = institutionDoc.data();
      
      // Update institution with proper domain if missing
      if (!institutionData.domain || institutionData.domain === 'No domain') {
        await db.collection('institutions').doc(institutionId).update({
          domain: 'lethbridgepolytechnic.ca',
          updatedAt: new Date()
        });
        console.log(`   Updated institution ${institutionId} with proper domain`);
      }
    } else {
      // Create a new institution if none exists
      const institutionRef = await db.collection('institutions').add({
        name: 'Lethbridge Polytechnic',
        domain: 'lethbridgepolytechnic.ca',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      institutionId = institutionRef.id;
      console.log(`   Created new institution: Lethbridge Polytechnic (${institutionId})`);
    }
    
    // Step 2: Create departments
    console.log('\n2. Creating departments...');
    const departmentsSnapshot = await db.collection('departments').get();
    
    let departments = [];
    
    if (departmentsSnapshot.empty) {
      // Create sample departments
      const departmentNames = [
        'Computer Science',
        'Business Administration', 
        'Engineering',
        'Health Sciences',
        'Arts & Humanities'
      ];
      
      for (const deptName of departmentNames) {
        const deptRef = await db.collection('departments').add({
          name: deptName,
          institutionId: institutionId,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        departments.push({
          id: deptRef.id,
          name: deptName
        });
        
        console.log(`   Created department: ${deptName} (${deptRef.id})`);
      }
    } else {
      // Use existing departments
      departmentsSnapshot.forEach((doc) => {
        departments.push({
          id: doc.id,
          name: doc.data().name,
          institutionId: doc.data().institutionId
        });
      });
      console.log(`   Found ${departments.length} existing departments`);
    }
    
    // Step 3: Link all users to the institution and assign departments
    console.log('\n3. Linking users to institution and departments...');
    const usersSnapshot = await db.collection('users').get();
    
    // Categorize users by role
    const teachers = [];
    const students = [];
    const admins = [];
    
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      const userId = doc.id;
      
      switch (userData.role) {
        case 'teacher':
        case 'institution_admin':
          teachers.push({ id: userId, ...userData });
          break;
        case 'student':
          students.push({ id: userId, ...userData });
          break;
        case 'platform_admin':
          admins.push({ id: userId, ...userData });
          break;
        default:
          // Default to student if no role is set
          students.push({ id: userId, ...userData });
      }
    });
    
    console.log(`   Found ${teachers.length} teachers, ${students.length} students, ${admins.length} admins`);
    
    // Assign departments to users
    console.log('\n4. Assigning departments to users...');
    
    // Assign teachers to departments (one teacher per department for demo)
    for (let i = 0; i < teachers.length; i++) {
      const teacher = teachers[i];
      const department = departments[i % departments.length]; // Rotate through departments
      
      await db.collection('users').doc(teacher.id).update({
        institutionId: institutionId,
        departmentId: department.id,
        department: department.name,
        updatedAt: new Date()
      });
      
      // Also update the department with the teacher reference
      await db.collection('departments').doc(department.id).update({
        teacherId: teacher.id,
        updatedAt: new Date()
      });
      
      console.log(`   Assigned teacher ${teacher.email} to ${department.name}`);
    }
    
    // Assign students to departments (distribute evenly)
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      const department = departments[i % departments.length]; // Rotate through departments
      
      await db.collection('users').doc(student.id).update({
        institutionId: institutionId,
        departmentId: department.id,
        department: department.name,
        updatedAt: new Date()
      });
      
      console.log(`   Assigned student ${student.email} to ${department.name}`);
    }
    
    // Update admins with institution link (but no department)
    for (const admin of admins) {
      await db.collection('users').doc(admin.id).update({
        institutionId: institutionId,
        updatedAt: new Date()
      });
      console.log(`   Linked admin ${admin.email} to institution`);
    }
    
    // Step 5: Create teacher-student relationships
    console.log('\n5. Creating teacher-student relationships...');
    
    // For each department, link students to their teacher
    for (const department of departments) {
      // Get the teacher for this department
      const teacherQuery = await db.collection('users')
        .where('departmentId', '==', department.id)
        .where('role', 'in', ['teacher', 'institution_admin'])
        .limit(1)
        .get();
      
      if (!teacherQuery.empty) {
        const teacher = teacherQuery.docs[0].data();
        const teacherId = teacherQuery.docs[0].id;
        
        // Get students in this department
        const studentsQuery = await db.collection('users')
          .where('departmentId', '==', department.id)
          .where('role', '==', 'student')
          .get();
        
        // Create student-teacher relationships
        for (const studentDoc of studentsQuery.docs) {
          const studentId = studentDoc.id;
          
          // Update student with teacher reference
          await db.collection('users').doc(studentId).update({
            teacherId: teacherId,
            updatedAt: new Date()
          });
          
          console.log(`   Linked student ${studentDoc.data().email} to teacher ${teacher.email}`);
        }
      }
    }
    
    console.log('\n=== Verification ===');
    
    // Verify institution
    const verifyInstitution = await db.collection('institutions').doc(institutionId).get();
    console.log(`Institution: ${verifyInstitution.data().name} (${verifyInstitution.id})`);
    
    // Verify departments
    const verifyDepartments = await db.collection('departments').get();
    console.log(`Departments: ${verifyDepartments.size} total`);
    verifyDepartments.forEach((doc) => {
      const data = doc.data();
      console.log(`  - ${data.name} (${doc.id})`);
    });
    
    // Verify users
    const verifyUsers = await db.collection('users').get();
    console.log(`\nUsers: ${verifyUsers.size} total`);
    for (const doc of verifyUsers.docs) {
      const data = doc.data();
      console.log(`  - ${data.email} (${data.role})`);
      console.log(`    Institution: ${data.institutionId ? 'Linked' : 'Not linked'}`);
      console.log(`    Department: ${data.department || 'None'} (${data.departmentId || 'None'})`);
      if (data.role === 'student') {
        console.log(`    Teacher: ${data.teacherId ? 'Linked' : 'Not linked'}`);
      }
      console.log('');
    }
    
    console.log('=== User Hierarchy Linking Fix Completed Successfully ===');
    
  } catch (error) {
    console.error('Error fixing user hierarchy linking:', error);
    process.exit(1);
  }
}

// Run the script
fixUserHierarchyLinking();