/**
 * Token Exchange Debug Script
 * Helps diagnose token exchange failures
 */

// Run this in browser console to debug token exchange issues

console.log('=== Token Exchange Debug ===');

// Check current auth state
if (typeof firebase !== 'undefined' && firebase.auth) {
  const currentUser = firebase.auth().currentUser;
  console.log('Current Firebase User:', currentUser ? {
    uid: currentUser.uid,
    email: currentUser.email,
    emailVerified: currentUser.emailVerified
  } : 'None');
  
  if (currentUser) {
    // Test getting Firebase token
    currentUser.getIdToken(true)
      .then(token => {
        console.log('Firebase Token obtained successfully');
        console.log('Token length:', token.length);
        console.log('Token preview:', token.substring(0, 100) + '...');
        
        // Test token exchange
        fetch(`${import.meta.env?.VITE_API_URL || 'http://localhost:3005'}/api/auth/exchange-firebase-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ firebaseToken: token })
        })
        .then(response => {
          console.log('Token exchange response status:', response.status);
          return response.json();
        })
        .then(data => {
          console.log('Token exchange result:', data);
          if (data.success) {
            console.log('✅ Token exchange successful');
          } else {
            console.log('❌ Token exchange failed:', data.message);
          }
        })
        .catch(error => {
          console.error('❌ Token exchange network error:', error);
        });
      })
      .catch(error => {
        console.error('❌ Failed to get Firebase token:', error);
      });
  }
} else {
  console.log('Firebase not available');
}

// Check localStorage for account data
try {
  const accountData = localStorage.getItem('accountSwitcherData');
  if (accountData) {
    const parsed = JSON.parse(accountData);
    console.log('Account switcher data found:');
    console.log('- Total accounts:', Object.keys(parsed.accounts || {}).length);
    console.log('- Active account:', parsed.activeAccount);
    
    // Look for the problematic account
    const problematicAccountId = 'NZpAsyNn0kWL4qV1vPhizF4tCrc2';
    if (parsed.accounts?.[problematicAccountId]) {
      const account = parsed.accounts[problematicAccountId];
      console.log('Problematic account details:');
      console.log('- User ID:', account.user?.id);
      console.log('- Email:', account.user?.email);
      console.log('- Role:', account.user?.role);
      console.log('- Has token:', !!account.token);
      console.log('- Last used:', account.lastUsed);
    } else {
      console.log('Problematic account not found in storage');
    }
  } else {
    console.log('No account switcher data found');
  }
} catch (error) {
  console.error('Error reading account switcher data:', error);
}

console.log('\n=== Debug Commands ===');
console.log('// Clear problematic account:');
console.log('const data = JSON.parse(localStorage.getItem("accountSwitcherData")); delete data.accounts["NZpAsyNn0kWL4qV1vPhizF4tCrc2"]; localStorage.setItem("accountSwitcherData", JSON.stringify(data));');
console.log('// Force re-authentication:');
console.log('firebase.auth().signOut().then(() => console.log("Signed out"));');