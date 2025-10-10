#!/usr/bin/env node

/**
 * Verification script for VAPI webhook function
 * This script checks if the Firebase Function is deployed and accessible
 */

import fetch from 'node-fetch';

// Expected webhook URL based on project configuration
const WEBHOOK_URL = 'https://us-central1-octavia-practice-interviewer.cloudfunctions.net/vapiWebhook';

async function verifyWebhook() {
  console.log('Verifying VAPI webhook function...');
  console.log('Expected Webhook URL:', WEBHOOK_URL);
  
  try {
    // Send a simple GET request to check if the function exists
    const response = await fetch(WEBHOOK_URL, {
      method: 'GET',
      headers: {
        'User-Agent': 'Octavia-Interview-Buddy-Verification-Script'
      }
    });
    
    console.log('Response status:', response.status);
    
    // For a Firebase Function that only accepts POST requests, we might get a 405 (Method Not Allowed)
    // which would actually indicate the function exists
    if (response.status === 405) {
      console.log('✅ Webhook function appears to be deployed (returns 405 Method Not Allowed for GET request)');
      console.log('✅ This is expected behavior as the function only accepts POST requests');
      console.log('\n📝 Next steps:');
      console.log('   1. Add this webhook URL to your VAPI Dashboard:');
      console.log('      ', WEBHOOK_URL);
      console.log('   2. Select "End of Call Report" events in VAPI Dashboard');
      return true;
    } else if (response.status === 404) {
      console.log('❌ Webhook function does not appear to be deployed yet (404 Not Found)');
      console.log('\n📝 Next steps:');
      console.log('   1. Wait for the deployment to complete');
      console.log('   2. Or try deploying again with: firebase deploy --only functions');
      return false;
    } else {
      console.log('ℹ️  Webhook function returned status:', response.status);
      const responseBody = await response.text();
      console.log('Response body:', responseBody.substring(0, 200) + (responseBody.length > 200 ? '...' : ''));
      return true;
    }
  } catch (error) {
    console.error('❌ Error verifying webhook:', error.message);
    console.log('\n📝 Troubleshooting steps:');
    console.log('   1. Check your internet connection');
    console.log('   2. Verify you have deployed the Firebase Functions');
    console.log('   3. Check Firebase project permissions');
    return false;
  }
}

// Run the verification
verifyWebhook();