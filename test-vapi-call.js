// Test VAPI call with provided credentials and assistant ID
import VapiPackage from '@vapi-ai/web';

// The VAPI package exports a default class
const Vapi = VapiPackage.default || VapiPackage;

async function testVapiCall() {
  try {
    console.log('Testing VAPI call...');
    
    // Use the provided public key
    const publicKey = '5205aa88-5883-4c11-8f4a-56b033e40f63';
    console.log('Using public key:', publicKey.substring(0, 8) + '...');
    
    // Initialize VAPI
    const vapi = new Vapi(publicKey);
    console.log('VAPI instance created successfully');
    
    // Use the provided assistant ID
    const assistantId = 'a1218d48-1102-4890-a0a6-d0ed2d207410';
    console.log('Using assistant ID:', assistantId);
    
    // Add event listeners to see what happens
    vapi.on('call-start', () => {
      console.log('Call started successfully!');
    });
    
    vapi.on('call-end', () => {
      console.log('Call ended');
    });
    
    vapi.on('error', (error) => {
      console.error('VAPI error:', error);
    });
    
    // Try to start a call (this will likely fail in a test environment without proper setup)
    console.log('Attempting to start call...');
    const call = await vapi.start(assistantId, {
      metadata: {
        test: true,
        timestamp: new Date().toISOString()
      }
    });
    
    console.log('Call started:', call);
    
    // End the call immediately for testing
    setTimeout(async () => {
      console.log('Ending call...');
      await vapi.stop();
      console.log('Call ended successfully');
    }, 2000);
    
  } catch (error) {
    console.error('VAPI call test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testVapiCall();