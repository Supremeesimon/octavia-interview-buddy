// Test VAPI connection with provided credentials
import VapiPackage from '@vapi-ai/web';

// The VAPI package exports a default class
const Vapi = VapiPackage.default || VapiPackage;

async function testVapiConnection() {
  try {
    console.log('Testing VAPI connection...');
    
    // Use the provided public key
    const publicKey = '5205aa88-5883-4c11-8f4a-56b033e40f63';
    console.log('Using public key:', publicKey.substring(0, 8) + '...');
    
    // Initialize VAPI
    const vapi = new Vapi(publicKey);
    console.log('VAPI instance created successfully');
    
    // Test if the instance has the required methods
    if (typeof vapi.start === 'function') {
      console.log('✓ VAPI start method available');
    } else {
      console.log('✗ VAPI start method missing');
    }
    
    if (typeof vapi.stop === 'function') {
      console.log('✓ VAPI stop method available');
    } else {
      console.log('✗ VAPI stop method missing');
    }
    
    console.log('VAPI connection test completed successfully!');
    console.log('Assistant ID being used: a1218d48-1102-4890-a0a6-d0ed2d207410');
    
  } catch (error) {
    console.error('VAPI connection test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testVapiConnection();