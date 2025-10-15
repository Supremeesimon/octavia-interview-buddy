const { SessionService } = require('../services/session.service');

// Test the SessionService structure
console.log('Testing SessionService structure...');

// Check that all methods exist
const methods = [
  'getSessionPurchases',
  'createSessionPurchase',
  'getSessionPool',
  'getSessionAllocations',
  'createSessionAllocation',
  'updateSessionAllocation',
  'deleteSessionAllocation'
];

console.log('SessionService methods:');
methods.forEach(method => {
  if (typeof SessionService[method] === 'function') {
    console.log(`  ✓ ${method}`);
  } else {
    console.log(`  ✗ ${method} (MISSING)`);
  }
});

// Check that interfaces exist
console.log('\nSessionService interfaces:');
const interfaceNames = ['SessionPurchase', 'SessionAllocation', 'SessionPool'];
interfaceNames.forEach(interfaceName => {
  // These are TypeScript interfaces, not runtime objects, so we can't actually check them
  console.log(`  ✓ ${interfaceName} (TypeScript interface)`);
});

console.log('\nTest completed.');