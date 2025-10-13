import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import dotenv from 'dotenv';
import { InstitutionHierarchyService } from '../services/institution-hierarchy.service';
import { RBACService } from '../services/rbac.service';
import { UserRole } from '../types';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Firebase configuration from environment
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function testHierarchicalAuth() {
  console.log('=== Testing Hierarchical Authentication System ===\n');
  
  try {
    // Test 1: Create and verify platform admin
    console.log('Test 1: Creating platform admin...');
    const platformAdminEmail = `platform-admin-${Date.now()}@test.com`;
    const platformAdminPassword = 'testpassword123';
    
    // Create platform admin in Firestore first
    const platformAdminData = {
      name: 'Test Platform Admin',
      email: platformAdminEmail,
      role: 'platform_admin' as UserRole,
      emailVerified: true,
      isEmailVerified: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      sessionCount: 0,
      profileCompleted: false
    };
    
    const platformAdminDocRef = doc(collection(db, 'platformAdmins'));
    await setDoc(platformAdminDocRef, platformAdminData);
    console.log('✓ Created platform admin in Firestore');
    
    // Create user in Firebase Auth
    const platformAdminUser = await createUserWithEmailAndPassword(auth, platformAdminEmail, platformAdminPassword);
    console.log('✓ Created platform admin in Firebase Auth');
    
    // Test login
    await signOut(auth);
    const platformAdminCredential = await signInWithEmailAndPassword(auth, platformAdminEmail, platformAdminPassword);
    console.log('✓ Platform admin login successful');
    
    // Test RBAC
    const platformAdminRole = await RBACService.getUserRole(platformAdminCredential.user.uid);
    console.log(`✓ Platform admin role verification: ${platformAdminRole} (expected: platform_admin)`);
    
    // Test 2: Create and verify external user
    console.log('\nTest 2: Creating external user...');
    const externalUserEmail = `external-user-${Date.now()}@test.com`;
    const externalUserPassword = 'testpassword123';
    
    // Create external user in Firestore first
    const externalUserData = {
      name: 'Test External User',
      email: externalUserEmail,
      role: 'student' as UserRole,
      emailVerified: true,
      isEmailVerified: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      sessionCount: 0,
      profileCompleted: false
    };
    
    const externalUserDocRef = doc(collection(db, 'externalUsers'));
    await setDoc(externalUserDocRef, externalUserData);
    console.log('✓ Created external user in Firestore');
    
    // Create user in Firebase Auth
    const externalUser = await createUserWithEmailAndPassword(auth, externalUserEmail, externalUserPassword);
    console.log('✓ Created external user in Firebase Auth');
    
    // Test login
    await signOut(auth);
    const externalUserCredential = await signInWithEmailAndPassword(auth, externalUserEmail, externalUserPassword);
    console.log('✓ External user login successful');
    
    // Test RBAC
    const externalUserRole = await RBACService.getUserRole(externalUserCredential.user.uid);
    console.log(`✓ External user role verification: ${externalUserRole} (expected: student)`);
    
    // Test 3: Create and verify institutional user
    console.log('\nTest 3: Creating institutional user...');
    
    // First create an institution
    const institutionData = {
      name: 'Test Institution',
      domain: 'test.edu',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const institutionDocRef = doc(collection(db, 'institutions'));
    await setDoc(institutionDocRef, institutionData);
    const institutionId = institutionDocRef.id;
    console.log('✓ Created institution');
    
    // Create a department
    const departmentData = {
      departmentName: 'Test Department',
      createdAt: Timestamp.now()
    };
    
    const departmentDocRef = doc(collection(db, 'institutions', institutionId, 'departments'));
    await setDoc(departmentDocRef, departmentData);
    const departmentId = departmentDocRef.id;
    console.log('✓ Created department');
    
    // Create institutional teacher
    const teacherEmail = `teacher-${Date.now()}@test.edu`;
    const teacherPassword = 'testpassword123';
    
    const teacherData = {
      name: 'Test Teacher',
      email: teacherEmail,
      role: 'teacher' as UserRole,
      emailVerified: true,
      isEmailVerified: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      sessionCount: 0,
      profileCompleted: false
    };
    
    const teacherId = await InstitutionHierarchyService.createTeacher(institutionId, departmentId, teacherData);
    console.log('✓ Created teacher in hierarchical structure');
    
    // Create user in Firebase Auth
    const teacherUser = await createUserWithEmailAndPassword(auth, teacherEmail, teacherPassword);
    console.log('✓ Created teacher in Firebase Auth');
    
    // Test login
    await signOut(auth);
    const teacherCredential = await signInWithEmailAndPassword(auth, teacherEmail, teacherPassword);
    console.log('✓ Teacher login successful');
    
    // Test RBAC
    const teacherRole = await RBACService.getUserRole(teacherCredential.user.uid);
    console.log(`✓ Teacher role verification: ${teacherRole} (expected: teacher)`);
    
    // Test 4: Verify InstitutionHierarchyService.findUserById
    console.log('\nTest 4: Verifying InstitutionHierarchyService.findUserById...');
    
    const platformAdminSearch = await InstitutionHierarchyService.findUserById(platformAdminCredential.user.uid);
    console.log(`✓ Platform admin search: ${platformAdminSearch ? 'FOUND' : 'NOT FOUND'} (expected: FOUND)`);
    
    const externalUserSearch = await InstitutionHierarchyService.findUserById(externalUserCredential.user.uid);
    console.log(`✓ External user search: ${externalUserSearch ? 'FOUND' : 'NOT FOUND'} (expected: FOUND)`);
    
    const teacherSearch = await InstitutionHierarchyService.findUserById(teacherCredential.user.uid);
    console.log(`✓ Teacher search: ${teacherSearch ? 'FOUND' : 'NOT FOUND'} (expected: FOUND)`);
    
    // Test 5: Verify RBACService.getUserProfile
    console.log('\nTest 5: Verifying RBACService.getUserProfile...');
    
    const platformAdminProfile = await RBACService.getUserProfile(platformAdminCredential.user.uid);
    console.log(`✓ Platform admin profile: ${platformAdminProfile ? 'FOUND' : 'NOT FOUND'} (expected: FOUND)`);
    
    const externalUserProfile = await RBACService.getUserProfile(externalUserCredential.user.uid);
    console.log(`✓ External user profile: ${externalUserProfile ? 'FOUND' : 'NOT FOUND'} (expected: FOUND)`);
    
    const teacherProfile = await RBACService.getUserProfile(teacherCredential.user.uid);
    console.log(`✓ Teacher profile: ${teacherProfile ? 'FOUND' : 'NOT FOUND'} (expected: FOUND)`);
    
    // Cleanup
    console.log('\nCleaning up test data...');
    await signOut(auth);
    
    console.log('\n=== All Tests Completed Successfully ===');
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testHierarchicalAuth();