#!/usr/bin/env tsx

/**
 * Test script for MailerSend integration
 * This script tests the MailerSend integration by sending a test email
 */

import { MessagingService } from '@/services/messaging.service';

async function testMailerSend() {
  console.log('Testing MailerSend integration...');
  
  try {
    // Test sending a simple email
    console.log('Sending test email...');
    const result = await MessagingService.sendEmail(
      'test@example.com',
      'Test Email from Octavia Interview Buddy',
      '<h1>Test Email</h1><p>This is a test email sent through MailerSend integration.</p>',
      'Test Email\nThis is a test email sent through MailerSend integration.'
    );
    
    console.log('Email sent successfully:', result);
    
    // Test sending an SMS (placeholder)
    console.log('Sending test SMS...');
    const smsResult = await MessagingService.sendSMS(
      '+1234567890',
      'This is a test SMS from Octavia Interview Buddy'
    );
    
    console.log('SMS sent successfully:', smsResult);
    
    console.log('MailerSend integration test completed successfully!');
  } catch (error) {
    console.error('MailerSend integration test failed:', error);
    process.exit(1);
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testMailerSend().catch(console.error);
}

export default testMailerSend;