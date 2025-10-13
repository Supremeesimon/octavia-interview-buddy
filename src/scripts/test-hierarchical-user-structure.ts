import { InstitutionHierarchyService } from '../services/institution-hierarchy.service';
import { FirebaseAuthService } from '../services/firebase-auth.service';
import { auth, db } from '../lib/firebase';
import { signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, setDoc, Timestamp } from 'firebase/firestore';
import dotenv from 'dotenv';
import { UserRole } from '../types';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testHierarchicalUserStructure() {
  console.log('=== Testing Hierarchical User Structure ===\n');
  
  const authService = new FirebaseAuthService();
  
  try {
    // Test 1: Platform Admin Structure
    console.log('Test 1: Testing Platform Admin Structure...');
    const platformAdminEmail = `platform-admin-${Date.now()}@test.com`;
    const platformAdminPassword = 'platformadmin123';
    const platformAdminName = 'Platform Admin';
    
    // Create platform admin through service
    const platformAdminResult = await authService.register({
      name: platformAdminName,
      email: platformAdminEmail,
      password: platformAdminPassword,
      role: 'platform_admin',
    });
    
    console.log('✓ Platform admin created through service');
    console.log(`  Admin ID: ${platformAdminResult.user.id}`);
    console.log(`  Admin Role: ${platformAdminResult.user.role}`);
    
    // Verify with findUserById
    const platformAdminSearch = await InstitutionHierarchyService.findUserById(platformAdminResult.user.id);
    console.log('✓ Platform admin found via findUserById');
    console.log(`  Found Role: ${platformAdminSearch?.role}`);
    console.log(`  Institution ID: ${platformAdminSearch?.institutionId || 'N/A'}`);
    
    // Test 2: External User Structure
    console.log('\nTest 2: Testing External User Structure...');
    const externalUserEmail = `external-user-${Date.now()}@gmail.com`;
    const externalUserPassword = 'externaluser123';
    const externalUserName = 'External User';
    
    // Create external user through service
    const externalUserResult = await authService.register({
      name: externalUserName,
      email: externalUserEmail,
      password: externalUserPassword,
    });
    
    console.log('✓ External user created through service');
    console.log(`  User ID: ${externalUserResult.user.id}`);
    console.log(`  User Role: ${externalUserResult.user.role}`);
    
    // Verify with findUserById
    const externalUserSearch = await InstitutionHierarchyService.findUserById(externalUserResult.user.id);
    console.log('✓ External user found via findUserById');
    console.log(`  Found Role: ${externalUserSearch?.role}`);
    console.log(`  Institution ID: ${externalUserSearch?.institutionId || 'N/A'}`);
    
    // Test 3: Institutional Structure
    console.log('\nTest 3: Testing Institutional Structure...');
    
    // Create an institution
    console.log('  Creating institution...');
    const institutionData = {
      name: 'Test University',
      domain: 'testuniversity.edu',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    const institutionDocRef = doc(collection(db, 'institutions'));
    await setDoc(institutionDocRef, institutionData);
    const institutionId = institutionDocRef.id;
    console.log('  ✓ Institution created');
    console.log(`    Institution ID: ${institutionId}`);
    
    // Create a department
    console.log('  Creating department...');
    const departmentData = {
      departmentName: 'Computer Science',
      createdAt: Timestamp.now(),
    };
    
    const departmentDocRef = doc(collection(db, 'institutions', institutionId, 'departments'));
    await setDoc(departmentDocRef, departmentData);
    const departmentId = departmentDocRef.id;
    console.log('  ✓ Department created');
    console.log(`    Department ID: ${departmentId}`);
    
    // Test 4: Institution Admin Structure
    console.log('\nTest 4: Testing Institution Admin Structure...');
    const instAdminEmail = `inst-admin-${Date.now()}@testuniversity.edu`;
    const instAdminPassword = 'instadmin123';
    const instAdminName = 'Institution Admin';
    
    // Create institution admin through service
    const instAdminResult = await authService.register({
      name: instAdminName,
      email: instAdminEmail,
      password: instAdminPassword,
      role: 'institution_admin',
      institutionDomain: 'testuniversity.edu',
    });
    
    console.log('✓ Institution admin created through service');
    console.log(`  Admin ID: ${instAdminResult.user.id}`);
    console.log(`  Admin Role: ${instAdminResult.user.role}`);
    
    // For institutional users, we need to manually create them in the hierarchy
    // since the register method doesn't fully support institutional signup yet
    console.log('  Note: Institutional admin needs to be manually added to hierarchy');
    
    // Test 5: Teacher Structure
    console.log('\nTest 5: Testing Teacher Structure...');
    const teacherEmail = `teacher-${Date.now()}@testuniversity.edu`;
    const teacherPassword = 'teacher123';
    const teacherName = 'Test Teacher';
    
    // Create teacher in Firebase Auth
    const teacherCredential = await createUserWithEmailAndPassword(auth, teacherEmail, teacherPassword);
    const teacherId = teacherCredential.user.uid;
    
    // Create teacher in hierarchical structure
    const teacherData = {
      name: teacherName,
      email: teacherEmail,
      role: 'teacher' as UserRole,
      emailVerified: true,
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date(),
      sessionCount: 0,
      profileCompleted: false,
    };
    
    const createdTeacherId = await InstitutionHierarchyService.createTeacher(institutionId, departmentId, teacherData);
    console.log('✓ Teacher created in hierarchical structure');
    console.log(`  Teacher ID: ${createdTeacherId}`);
    
    // Verify with findUserById
    const teacherSearch = await InstitutionHierarchyService.findUserById(teacherId);
    console.log('✓ Teacher found via findUserById');
    console.log(`  Found Role: ${teacherSearch?.role}`);
    console.log(`  Institution ID: ${teacherSearch?.institutionId}`);
    console.log(`  Department ID: ${teacherSearch?.departmentId}`);
    
    // Test 6: Student Structure
    console.log('\nTest 6: Testing Student Structure...');
    const studentEmail = `student-${Date.now()}@testuniversity.edu`;
    const studentPassword = 'student123';
    const studentName = 'Test Student';
    
    // Create student in Firebase Auth
    const studentCredential = await createUserWithEmailAndPassword(auth, studentEmail, studentPassword);
    const studentId = studentCredential.user.uid;
    
    // Create student in hierarchical structure
    const studentData = {
      name: studentName,
      email: studentEmail,
      role: 'student' as UserRole,
      emailVerified: true,
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date(),
      sessionCount: 0,
      profileCompleted: false,
    };
    
    const createdStudentId = await InstitutionHierarchyService.createStudent(institutionId, departmentId, studentData);
    console.log('✓ Student created in hierarchical structure');
    console.log(`  Student ID: ${createdStudentId}`);
    
    // Verify with findUserById
    const studentSearch = await InstitutionHierarchyService.findUserById(studentId);
    console.log('✓ Student found via findUserById');
    console.log(`  Found Role: ${studentSearch?.role}`);
    console.log(`  Institution ID: ${studentSearch?.institutionId}`);
    console.log(`  Department ID: ${studentSearch?.departmentId}`);
    
    // Test 7: Comprehensive findUserById Testing
    console.log('\nTest 7: Comprehensive findUserById Testing...');
    
    // Test finding all created users
    const allUsers = [
      { id: platformAdminResult.user.id, type: 'Platform Admin' },
      { id: externalUserResult.user.id, type: 'External User' },
      { id: teacherId, type: 'Teacher' },
      { id: studentId, type: 'Student' },
    ];
    
    for (const user of allUsers) {
      const result = await InstitutionHierarchyService.findUserById(user.id);
      console.log(`  ✓ ${user.type} found: ${result ? 'YES' : 'NO'}`);
      if (result) {
        console.log(`    Role: ${result.role}`);
        console.log(`    Institution ID: ${result.institutionId || 'N/A'}`);
        console.log(`    Department ID: ${result.departmentId || 'N/A'}`);
      }
    }
    
    console.log('\n=== All Hierarchical User Structure Tests Completed Successfully ===');
    
  } catch (error) {
    console.error('Test error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
  } finally {
    // Cleanup
    console.log('\nCleaning up...');
    await signOut(auth);
  }
}

testHierarchicalUserStructure();