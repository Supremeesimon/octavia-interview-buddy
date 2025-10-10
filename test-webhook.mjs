#!/usr/bin/env node

/**
 * Test script for VAPI webhook function
 * This script simulates a VAPI webhook call to test our Firebase Function
 */

import fetch from 'node-fetch';

// Replace with your actual Firebase Function URL after deployment
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://localhost:5001/octavia-interview-buddy/us-central1/vapiWebhook';

// Sample end-of-call report data
const sampleReport = {
  message: {
    type: 'end-of-call-report',
    callId: 'test_call_12345',
    startedAt: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
    endedAt: new Date().toISOString(),
    endedReason: 'customer-ended-call',
    cost: 0.05,
    compliance: {
      pii: { violations: [] },
      pci: { violations: [] }
    },
    transcript: 'User: Hello, I\'m excited to be here for this interview.\nAssistant: Great! Let\'s start with a simple question. Can you tell me about yourself?',
    recordingUrl: 'https://example.com/recording/test_call_12345.mp3',
    summary: 'The candidate showed enthusiasm for the position and was able to provide a basic introduction about themselves.',
    structuredData: {
      categories: [
        { name: 'Communication', score: 85, weight: 0.3 },
        { name: 'Enthusiasm', score: 90, weight: 0.2 },
        { name: 'Introduction', score: 75, weight: 0.5 }
      ],
      strengths: ['Enthusiasm', 'Clear communication'],
      improvements: ['Provide more detailed introduction', 'Mention specific experiences'],
      recommendations: ['Practice more detailed self-introductions', 'Prepare specific examples']
    },
    successEvaluation: {
      score: 83,
      passed: true
    },
    duration: 300, // 5 minutes
    metadata: {
      studentId: 'test_student_123',
      departmentId: 'dept_cs_456',
      institutionId: 'inst_university_789',
      interviewType: 'general'
    }
  }
};

async function testWebhook() {
  console.log('Testing VAPI webhook function...');
  console.log('Webhook URL:', WEBHOOK_URL);
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sampleReport)
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());
    
    const responseBody = await response.text();
    console.log('Response body:', responseBody);
    
    if (response.ok) {
      console.log('✅ Webhook test successful!');
    } else {
      console.log('❌ Webhook test failed with status:', response.status);
    }
  } catch (error) {
    console.error('❌ Error testing webhook:', error.message);
  }
}

// Run the test
testWebhook();