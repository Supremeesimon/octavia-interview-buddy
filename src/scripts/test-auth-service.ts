import { FirebaseAuthService } from '../services/firebase-auth.service';
import { InstitutionHierarchyService } from '../services/institution-hierarchy.service';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { collection, doc, setDoc, Timestamp } from 'firebase/firestore';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Set environment to production for this test
process.env.NODE_ENV = 'production';

async function testAuthService() {
  console.log('=== Testing Authentication Service (Production Mode) ===\n');
  
  // Check if we have valid Firebase configuration
  const hasValidConfig = process.env.VITE_FIREBASE_API_KEY && 
                        process.env.VITE_FIREBASE_API_KEY !== 'your_firebase_api_key_here';
  
  if (!hasValidConfig) {
    console.warn('⚠️  WARNING: Firebase configuration appears to be using placeholder values.');
    console.warn('   Please update your .env.local file with valid production credentials.');
    console.warn('   Skipping production tests.\n');
    return;
  }
  
  console.log('✅ Firebase configuration detected. Running production tests...\n');
  
  const authService = new FirebaseAuthService();
  
  try {
    // Test 1: Register a new user
    console.log('Test 1: Registering a new user...');
    const testUserEmail = `test-user-${Date.now()}@example.com`;
    const testUserPassword = 'testpassword123';
    const testUserName = 'Test User';
    
    const registerResult = await authService.register({
      name: testUserName,
      email: testUserEmail,
      password: testUserPassword,
    });
    
    console.log('✓ User registration successful');
    console.log(`  User ID: ${registerResult.user.id}`);
    console.log(`  User Name: ${registerResult.user.name}`);
    console.log(`  User Email: ${registerResult.user.email}`);
    console.log(`  User Role: ${registerResult.user.role}`);
    
    // Test 2: Login with registered user
    console.log('\nTest 2: Logging in with registered user...');
    
    // First logout to ensure clean state
    await signOut(auth);
    
    const loginResult = await authService.login({
      email: testUserEmail,
      password: testUserPassword,
    });
    
    console.log('✓ User login successful');
    console.log(`  User ID: ${loginResult.user.id}`);
    console.log(`  User Name: ${loginResult.user.name}`);
    console.log(`  User Email: ${loginResult.user.email}`);
    console.log(`  User Role: ${loginResult.user.role}`);
    console.log(`  Token: ${loginResult.token.substring(0, 20)}...`);
    
    // Test 3: Register a platform admin
    console.log('\nTest 3: Registering a platform admin...');
    const adminEmail = `admin-${Date.now()}@example.com`;
    const adminPassword = 'adminpassword123';
    const adminName = 'Test Admin';
    
    const adminRegisterResult = await authService.register({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'platform_admin',
    });
    
    console.log('✓ Platform admin registration successful');
    console.log(`  Admin ID: ${adminRegisterResult.user.id}`);
    console.log(`  Admin Name: ${adminRegisterResult.user.name}`);
    console.log(`  Admin Email: ${adminRegisterResult.user.email}`);
    console.log(`  Admin Role: ${adminRegisterResult.user.role}`);
    
    // Test 4: Login with platform admin
    console.log('\nTest 4: Logging in with platform admin...');
    
    // First logout to ensure clean state
    await signOut(auth);
    
    const adminLoginResult = await authService.login({
      email: adminEmail,
      password: adminPassword,
    });
    
    console.log('✓ Platform admin login successful');
    console.log(`  Admin ID: ${adminLoginResult.user.id}`);
    console.log(`  Admin Name: ${adminLoginResult.user.name}`);
    console.log(`  Admin Email: ${adminLoginResult.user.email}`);
    console.log(`  Admin Role: ${adminLoginResult.user.role}`);
    
    // Test 5: Test InstitutionHierarchyService.findUserById
    console.log('\nTest 5: Testing InstitutionHierarchyService.findUserById...');
    
    // Create a platform admin in Firestore directly for testing findUserById
    const platformAdminData = {
      name: 'Direct Platform Admin',
      email: `direct-admin-${Date.now()}@example.com`,
      role: 'platform_admin',
      emailVerified: true,
      isEmailVerified: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    const platformAdminDocRef = doc(collection(db, 'platformAdmins'));
    await setDoc(platformAdminDocRef, platformAdminData);
    const platformAdminId = platformAdminDocRef.id;
    console.log('✓ Created platform admin directly in Firestore');
    
    const userSearchResult = await InstitutionHierarchyService.findUserById(platformAdminId);
    console.log('✓ InstitutionHierarchyService.findUserById test successful');
    console.log(`  Found user: ${userSearchResult ? 'YES' : 'NO'}`);
    if (userSearchResult) {
      console.log(`  User ID: ${userSearchResult.user.id}`);
      console.log(`  User Name: ${userSearchResult.user.name}`);
      console.log(`  User Role: ${userSearchResult.role}`);
    }
    
    // Test 6: Logout
    console.log('\nTest 6: Testing logout...');
    await authService.logout();
    console.log('✓ Logout successful');
    
    console.log('\n=== All Authentication Service Tests Completed Successfully ===');
    
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

testAuthService();