import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

async function comprehensiveFirebaseTest() {
  console.log('=== COMPREHENSIVE FIREBASE TEST ===');
  
  // Check auth state
  console.log('Current auth state:', auth.currentUser ? 'Authenticated' : 'Not authenticated');
  if (auth.currentUser) {
    console.log('User ID:', auth.currentUser.uid);
    console.log('User email:', auth.currentUser.email);
    
    // Try to get a fresh token
    try {
      const token = await auth.currentUser.getIdToken(true);
      console.log('Successfully obtained Firebase token');
    } catch (error) {
      console.error('Failed to obtain Firebase token:', error);
    }
  }
  
  // Test reading system_config
  try {
    console.log('Testing system_config read access...');
    const docRef = doc(db, 'system_config', 'pricing');
    const docSnap = await getDoc(docRef);
    console.log('system_config/pricing exists:', docSnap.exists());
    if (docSnap.exists()) {
      console.log('system_config/pricing data:', docSnap.data());
    }
  } catch (error: any) {
    console.error('Failed to read system_config/pricing:', error.code, error.message);
  }
  
  // Test reading institutions (should work for authenticated users)
  try {
    console.log('Testing institutions read access...');
    const institutionsRef = collection(db, 'institutions');
    const institutionsSnap = await getDocs(institutionsRef);
    console.log('Number of institutions:', institutionsSnap.size);
  } catch (error: any) {
    console.error('Failed to read institutions:', error.code, error.message);
  }
}

// Wait for auth state to be ready, then run test
console.log('Setting up auth state listener...');
const unsubscribe = onAuthStateChanged(auth, (user) => {
  console.log('Auth state changed:', user ? 'User signed in' : 'User signed out');
  if (user) {
    // Run test after a short delay to ensure everything is initialized
    setTimeout(comprehensiveFirebaseTest, 1000);
  } else {
    console.log('No user signed in, cannot test authenticated access');
  }
  unsubscribe();
});