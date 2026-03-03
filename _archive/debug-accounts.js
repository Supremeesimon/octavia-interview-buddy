// Debug script to inspect account switcher data
console.log('=== Account Switcher Debug Info ===');

try {
  const accountData = localStorage.getItem('accountSwitcherData');
  if (accountData) {
    const parsed = JSON.parse(accountData);
    console.log('Raw account data:', parsed);
    
    if (parsed.accounts) {
      console.log('\n=== Individual Accounts ===');
      Object.entries(parsed.accounts).forEach(([id, session]) => {
        console.log(`Account ID: ${id}`);
        console.log(`  Email: ${session.user?.email || 'MISSING'}`);
        console.log(`  Name: ${session.user?.name || 'MISSING'}`);
        console.log(`  Role: ${session.user?.role || 'MISSING'}`);
        console.log(`  Has Profile Picture: ${!!session.user?.profilePicture}`);
        console.log(`  Last Used: ${session.lastUsed}`);
        console.log('---');
      });
    }
  } else {
    console.log('No account switcher data found in localStorage');
  }
} catch (error) {
  console.error('Error parsing account data:', error);
}

console.log('\n=== Current Firebase User ===');
try {
  // This would require Firebase to be initialized
  console.log('Check browser console for Firebase user info');
} catch (error) {
  console.log('Firebase not available in this context');
}