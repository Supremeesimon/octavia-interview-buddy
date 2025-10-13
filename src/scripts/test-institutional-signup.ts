import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(
  readFileSync(resolve(__dirname, '../service-account-key.json'), 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://octavia-ai-interview-buddy.firebaseio.com'
});

const db = admin.firestore();

// Test institution ID from production database (Lethbridge Polytechnic)
const TEST_INSTITUTION_ID = 'WxD3cWTybNsqkpj7OwW4';
const TEST_DEPARTMENT_NAME = 'Engineering';

/**
 * Test 1: First User Creates Department
 */
const testFirstUserCreatesDepartment = async () => {
  console.log('\n=== Test 1: First User Creates Department ===');
  
  try {
    // Check current departments in PRODUCTION
    const deptsBefore = await db
      .collection('institutions')
      .doc(TEST_INSTITUTION_ID)
      .collection('departments')
      .get();
    
    console.log(`Departments before: ${deptsBefore.size}`);
    console.log('Existing departments:');
    deptsBefore.docs.forEach(doc => {
      console.log(`  - ${doc.data().departmentName} (${doc.id})`);
    });
    
    console.log('\n=== Manual Verification Required ===');
    console.log('1. Get institutional signup link for the institution');
    console.log(`2. Sign up as teacher/student with department: "${TEST_DEPARTMENT_NAME}"`);
    console.log('3. Run Test 2 to verify department creation');
    
  } catch (error) {
    console.error('Error in testFirstUserCreatesDepartment:', error);
  }
};

/**
 * Test 2: Second User Joins Existing Department
 */
const testSecondUserJoinsExisting = async () => {
  console.log('\n=== Test 2: Second User Joins Existing Department ===');
  
  try {
    // Get existing department ID from PRODUCTION
    const deptsSnapshot = await db
      .collection('institutions')
      .doc(TEST_INSTITUTION_ID)
      .collection('departments')
      .where('departmentName', '==', TEST_DEPARTMENT_NAME)
      .get();
    
    if (deptsSnapshot.empty) {
      console.log(`Department "${TEST_DEPARTMENT_NAME}" not found in PRODUCTION`);
      console.log('Please run Test 1 first to create it.');
      return;
    }
    
    const deptId = deptsSnapshot.docs[0].id;
    console.log(`Department: ${TEST_DEPARTMENT_NAME} (${deptId})`);
    
    // Count teachers in PRODUCTION before
    const teachersBefore = await db
      .collection('institutions')
      .doc(TEST_INSTITUTION_ID)
      .collection('departments')
      .doc(deptId)
      .collection('teachers')
      .get();
    
    console.log(`Teachers before: ${teachersBefore.size}`);
    teachersBefore.docs.forEach(doc => {
      const teacher = doc.data();
      console.log(`  - ${teacher.name} (${teacher.email})`);
    });
    
    console.log('\n=== Manual Verification Required ===');
    console.log('1. Use institutional signup link');
    console.log(`2. Sign up as teacher with EXISTING department: "${TEST_DEPARTMENT_NAME}"`);
    console.log('3. The dropdown should show the department');
    console.log('4. Select it (don\'t create new one)');
    console.log('5. Run Test 3 to verify user joining');
    
  } catch (error) {
    console.error('Error in testSecondUserJoinsExisting:', error);
  }
};

/**
 * Test 3: Dropdown Shows Existing Departments
 */
const testDropdownShowsDepartments = async () => {
  console.log('\n=== Test 3: Dropdown Shows Existing Departments ===');
  
  try {
    // Fetch REAL departments from PRODUCTION
    const deptsSnapshot = await db
      .collection('institutions')
      .doc(TEST_INSTITUTION_ID)
      .collection('departments')
      .get();
    
    console.log(`Total departments: ${deptsSnapshot.size}`);
    
    const departments = deptsSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().departmentName,
      createdAt: doc.data().createdAt,
      createdBy: doc.data().createdBy
    }));
    
    console.log('\nDepartments that should appear in dropdown:');
    departments.forEach((dept, index) => {
      console.log(`${index + 1}. ${dept.name} (ID: ${dept.id})`);
    });
    
    console.log('\n=== Manual Verification Required ===');
    console.log('1. Open institutional signup page');
    console.log('2. Check department dropdown');
    console.log(`3. Verify ALL ${deptsSnapshot.size} departments above are shown`);
    
    if (deptsSnapshot.size > 0) {
      console.log(`✅ Found ${deptsSnapshot.size} departments in PRODUCTION database`);
    } else {
      console.log('⚠️ No departments found - signup first to create them');
    }
    
  } catch (error) {
    console.error('Error in testDropdownShowsDepartments:', error);
  }
};

/**
 * Test 4: Sign In Link Preserves Token
 */
const testSignInLinkPreservesToken = async () => {
  console.log('\n=== Test 4: Sign In Link Preserves Token ===');
  
  try {
    // Get REAL signup token from PRODUCTION
    const institutionDoc = await db
      .collection('institutions')
      .doc(TEST_INSTITUTION_ID)
      .get();
    
    const institutionData = institutionDoc.data();
    const realToken = institutionData?.customSignupToken;
    
    console.log(`Institution: ${institutionData?.name}`);
    console.log(`Signup Token: ${realToken}`);
    console.log(`Signup URL: ${institutionData?.customSignupLink}`);
    
    console.log('\n=== Manual Verification Required ===');
    console.log(`1. Visit signup URL: ${institutionData?.customSignupLink}`);
    console.log('2. Look for "Already have an account? Sign in" link');
    console.log(`3. Verify link href contains token: ${realToken}`);
    console.log(`4. Expected format: /login-institution?token=${realToken}`);
    console.log('5. Click link and verify it goes to institutional login (not external)');
    
    console.log(`\n✅ Token from PRODUCTION: ${realToken}`);
    
  } catch (error) {
    console.error('Error in testSignInLinkPreservesToken:', error);
  }
};

/**
 * Test 5: Institutional Login Validates Token
 */
const testInstitutionalLoginValidatesToken = async () => {
  console.log('\n=== Test 5: Institutional Login Validates Token ===');
  
  try {
    // Use REAL token from PRODUCTION
    const institutionDoc = await db
      .collection('institutions')
      .doc(TEST_INSTITUTION_ID)
      .get();
    
    const validToken = institutionDoc.data()?.customSignupToken;
    const invalidToken = 'invalid-token-this-does-not-exist-999';
    
    console.log(`\nToken Validation Test`);
    
    // 1. Test with REAL valid token from PRODUCTION
    const institutionWithValidToken = await db
      .collection('institutions')
      .where('customSignupToken', '==', validToken)
      .get();
    
    console.log(`Valid token (${validToken}):`);
    if (!institutionWithValidToken.empty) {
      console.log(`  ✅ Found institution: ${institutionWithValidToken.docs[0].data().name}`);
    } else {
      console.log(`  ❌ FAILED: Valid token should find institution`);
    }
    
    // 2. Test with invalid token
    const institutionWithInvalidToken = await db
      .collection('institutions')
      .where('customSignupToken', '==', invalidToken)
      .get();
    
    console.log(`\nInvalid token (${invalidToken}):`);
    if (institutionWithInvalidToken.empty) {
      console.log(`  ✅ Correctly rejected invalid token`);
    } else {
      console.log(`  ❌ FAILED: Invalid token should not find institution`);
    }
    
    console.log('\n=== Manual Verification Required ===');
    console.log(`1. Visit: /login-institution?token=${invalidToken}`);
    console.log('2. Should show error: "Invalid or expired link"');
    console.log('3. Should redirect to external login');
    
  } catch (error) {
    console.error('Error in testInstitutionalLoginValidatesToken:', error);
  }
};

/**
 * Test 6: Institutional Login Blocks External Users
 */
const testInstitutionalLoginBlocksExternal = async () => {
  console.log('\n=== Test 6: Institutional Login Blocks External Users ===');
  
  try {
    // Get REAL external users from PRODUCTION
    const externalUsersSnapshot = await db
      .collection('externalUsers')
      .limit(1)
      .get();
    
    console.log(`\nExternal User Check`);
    
    if (externalUsersSnapshot.empty) {
      console.log('⚠️ No external users in PRODUCTION database yet');
      console.log('Create an external user first by signing up at /signup');
      return;
    }
    
    const externalUser = externalUsersSnapshot.docs[0];
    const externalUserId = externalUser.id;
    const externalUserData = externalUser.data();
    
    console.log(`External user: ${externalUserData.email} (${externalUserId})`);
    
    // Check if this user exists in the institution
    const departments = await db
      .collection('institutions')
      .doc(TEST_INSTITUTION_ID)
      .collection('departments')
      .get();
    
    let foundInInstitution = false;
    
    for (const deptDoc of departments.docs) {
      const deptId = deptDoc.id;
      
      // Check teachers
      const teacherDoc = await db
        .collection('institutions')
        .doc(TEST_INSTITUTION_ID)
        .collection('departments')
        .doc(deptId)
        .collection('teachers')
        .doc(externalUserId)
        .get();
      
      if (teacherDoc.exists) {
        foundInInstitution = true;
        break;
      }
      
      // Check students
      const studentDoc = await db
        .collection('institutions')
        .doc(TEST_INSTITUTION_ID)
        .collection('departments')
        .doc(deptId)
        .collection('students')
        .doc(externalUserId)
        .get();
      
      if (studentDoc.exists) {
        foundInInstitution = true;
        break;
      }
    }
    
    if (!foundInInstitution) {
      console.log(`✅ External user is NOT in institution (correct)`);
    } else {
      console.log(`❌ External user found in institution (should not happen)`);
    }
    
    console.log('\n=== Manual Verification Required ===');
    console.log('1. Try to log in to institutional login with external user email');
    console.log(`   Email: ${externalUserData.email}`);
    console.log('2. Login should be REJECTED');
    console.log('3. Error: "You are not authorized to access this institution"');
    
  } catch (error) {
    console.error('Error in testInstitutionalLoginBlocksExternal:', error);
  }
};

// Run all tests
const runAllTests = async () => {
  console.log('Running Institutional Signup and Login Tests');
  console.log('=============================================');
  
  await testFirstUserCreatesDepartment();
  await testSecondUserJoinsExisting();
  await testDropdownShowsDepartments();
  await testSignInLinkPreservesToken();
  await testInstitutionalLoginValidatesToken();
  await testInstitutionalLoginBlocksExternal();
  
  console.log('\n=== All Tests Completed ===');
};

// Run the tests
runAllTests().catch(console.error);