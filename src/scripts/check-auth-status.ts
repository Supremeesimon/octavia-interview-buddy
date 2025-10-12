import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

console.log('Checking Firebase authentication status...');

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('User is signed in:');
    console.log('- UID:', user.uid);
    console.log('- Email:', user.email);
    console.log('- Display Name:', user.displayName);
    
    // Note: We can't directly access custom claims here
    // Custom claims are only available in the ID token
    user.getIdTokenResult().then((idTokenResult) => {
      console.log('- Role (from custom claims):', idTokenResult.claims.role || 'Not set');
      console.log('- Admin (from custom claims):', idTokenResult.claims.admin || 'Not set');
    }).catch((error) => {
      console.error('Error getting ID token:', error);
    });
  } else {
    console.log('No user is signed in.');
  }
});