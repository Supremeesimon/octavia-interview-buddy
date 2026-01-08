/**
 * Account Switcher Debug Script
 * Helps diagnose account switching issues
 */

// This script should be run in the browser console
console.log('=== Account Switcher Debug Info ===');

// Check localStorage data
try {
  const accountData = localStorage.getItem('accountSwitcherData');
  if (accountData) {
    const parsed = JSON.parse(accountData);
    console.log('Stored Accounts:', Object.keys(parsed.accounts || {}));
    console.log('Active Account:', parsed.activeAccount);
    console.log('Full Data:', parsed);
    
    // Check specific account
    const problematicAccountId = 'De55g0qMSRaF0qU1McqWLIq4vX23';
    if (parsed.accounts && parsed.accounts[problematicAccountId]) {
      console.log('Problematic Account Found:', parsed.accounts[problematicAccountId]);
      console.log('Account User ID:', parsed.accounts[problematicAccountId].user?.id);
      console.log('Account Email:', parsed.accounts[problematicAccountId].user?.email);
      console.log('Token Length:', parsed.accounts[problematicAccountId].token?.length || 'No token');
    } else {
      console.log('Problematic account NOT found in storage');
    }
  } else {
    console.log('No account switcher data found in localStorage');
  }
} catch (error) {
  console.error('Error parsing account switcher data:', error);
}

// Check current Firebase auth state
try {
  // This would be available in browser environment
  if (typeof firebase !== 'undefined' && firebase.auth) {
    const currentUser = firebase.auth().currentUser;
    console.log('Current Firebase User:', currentUser ? currentUser.uid : 'None');
  } else {
    console.log('Firebase not available in this context');
  }
} catch (error) {
  console.error('Error checking Firebase auth:', error);
}

// Check for common issues
console.log('\n=== Common Issue Checks ===');
console.log('1. Check if account exists in storage');
console.log('2. Verify token validity');
console.log('3. Check Firebase auth state');
console.log('4. Validate account session structure');

// Diagnostic function to test account switching
function diagnoseAccountSwitch(accountId) {
  console.log(`\n=== Diagnosing Account Switch for ${accountId} ===`);
  
  // Check if account exists
  const accountData = localStorage.getItem('accountSwitcherData');
  if (!accountData) {
    console.log('❌ No account switcher data found');
    return;
  }
  
  try {
    const parsed = JSON.parse(accountData);
    const account = parsed.accounts?.[accountId];
    
    if (!account) {
      console.log('❌ Account not found in storage');
      return;
    }
    
    console.log('✅ Account found in storage');
    console.log('User ID:', account.user?.id);
    console.log('Email:', account.user?.email);
    console.log('Role:', account.user?.role);
    console.log('Token present:', !!account.token);
    console.log('Last used:', account.lastUsed);
    
    // Check token validity (basic check)
    if (account.token) {
      try {
        const payload = JSON.parse(atob(account.token.split('.')[1]));
        const exp = new Date(payload.exp * 1000);
        const now = new Date();
        console.log('Token expires:', exp);
        console.log('Token expired:', exp < now);
      } catch (tokenError) {
        console.log('❌ Token parsing failed:', tokenError.message);
      }
    }
    
  } catch (parseError) {
    console.log('❌ Error parsing account data:', parseError.message);
  }
}

// Run diagnosis for the problematic account
diagnoseAccountSwitch('De55g0qMSRaF0qU1McqWLIq4vX23');

console.log('\n=== Debug Commands ===');
console.log('// Clear all account switcher data:');
console.log('localStorage.removeItem("accountSwitcherData");');
console.log('// Check raw data:');
console.log('localStorage.getItem("accountSwitcherData");');
console.log('// Remove specific account:');
console.log('const data = JSON.parse(localStorage.getItem("accountSwitcherData")); delete data.accounts["De55g0qMSRaF0qU1McqWLIq4vX23"]; localStorage.setItem("accountSwitcherData", JSON.stringify(data));');