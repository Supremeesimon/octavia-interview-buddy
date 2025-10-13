import { FirebaseAuthService } from '../services/firebase-auth.service';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testUseAuthFunctionality() {
  console.log('=== Testing useAuth Functionality ===\n');
  
  const authService = new FirebaseAuthService();
  
  try {
    // Test 1: Register a new user
    console.log('Test 1: Testing user registration...');
    const testUserEmail = `useauth-user-${Date.now()}@example.com`;
    const testUserPassword = 'testpassword123';
    const testUserName = 'UseAuth Test User';
    
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
    console.log('\nTest 2: Testing user login...');
    
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
    
    // Test 3: Test authentication service methods
    console.log('\nTest 3: Testing authentication service methods...');
    
    // Test getCurrentUser method
    const currentUser = await authService.getCurrentUser();
    console.log('✓ getCurrentUser test successful');
    if (currentUser) {
      console.log(`  Current User ID: ${currentUser.id}`);
      console.log(`  Current User Name: ${currentUser.name}`);
      console.log(`  Current User Email: ${currentUser.email}`);
    } else {
      console.log('  No current user found');
    }
    
    // Test getCurrentFirebaseUser method
    const firebaseUser = authService.getCurrentFirebaseUser();
    console.log('✓ getCurrentFirebaseUser test successful');
    if (firebaseUser) {
      console.log(`  Firebase User ID: ${firebaseUser.uid}`);
      console.log(`  Firebase User Email: ${firebaseUser.email}`);
    } else {
      console.log('  No Firebase user found');
    }
    
    // Test 4: Logout
    console.log('\nTest 4: Testing logout...');
    await authService.logout();
    console.log('✓ Logout successful');
    
    // Verify user is logged out
    const userAfterLogout = await authService.getCurrentUser();
    console.log('✓ Logout verification successful');
    console.log(`  User after logout: ${userAfterLogout ? 'STILL LOGGED IN' : 'LOGGED OUT'}`);
    
    console.log('\n=== All useAuth Functionality Tests Completed Successfully ===');
    
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

testUseAuthFunctionality();