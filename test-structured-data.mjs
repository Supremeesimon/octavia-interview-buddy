#!/usr/bin/env node

/**
 * Test script for VAPI webhook function with structured data
 * This script simulates a VAPI webhook call with structured data to test our Firebase Function
 */

import fetch from 'node-fetch';

// Replace with your actual Firebase Function URL after deployment
const WEBHOOK_URL = 'https://us-central1-octavia-practice-interviewer.cloudfunctions.net/vapiWebhook';

// Sample end-of-call report data with structured data
const sampleReport = {
  message: {
    type: 'end-of-call-report',
    callId: 'test_call_structured_12345',
    startedAt: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
    endedAt: new Date().toISOString(),
    endedReason: 'customer-ended-call',
    cost: 0.08,
    compliance: {
      pii: { violations: [] },
      pci: { violations: [] }
    },
    transcript: 'User: Hello, I\'m excited to be here for this interview.\nAssistant: Great! Let\'s start with a simple question. Can you tell me about yourself?\nUser: Sure, I\'m a software engineer with 3 years of experience in web development.\nAssistant: Excellent. What\'s your experience with React?',
    recordingUrl: 'https://example.com/recording/test_call_structured_12345.mp3',
    summary: 'The candidate showed enthusiasm for the position and was able to provide a basic introduction about their experience with web development and React.',
    structuredData: {
      categories: [
        { name: 'Communication Skills', score: 85, weight: 0.3 },
        { name: 'Technical Knowledge', score: 75, weight: 0.4 },
        { name: 'Problem Solving', score: 70, weight: 0.2 },
        { name: 'Enthusiasm', score: 90, weight: 0.1 }
      ],
      strengths: [
        'Enthusiasm',
        'Clear communication',
        'Basic technical knowledge'
      ],
      improvements: [
        'Provide more detailed technical examples',
        'Show deeper problem-solving approach',
        'Mention specific projects or achievements'
      ],
      recommendations: [
        'Practice more detailed technical explanations',
        'Prepare specific examples of problem-solving',
        'Research the company and role more thoroughly'
      ]
    },
    successEvaluation: {
      score: 80,
      passed: true,
      explanation: 'Candidate demonstrated good communication skills and basic technical knowledge. Enthusiastic but could provide more detailed examples.'
    },
    duration: 600, // 10 minutes
    metadata: {
      studentId: 'student_123',
      departmentId: 'dept_cs_456',
      institutionId: 'inst_university_789',
      interviewType: 'technical'
    }
  }
};

async function testStructuredData() {
  console.log('Testing VAPI webhook function with structured data...');
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
    
    const responseBody = await response.text();
    console.log('Response body:', responseBody);
    
    if (response.ok) {
      console.log('✅ Webhook test with structured data successful!');
      console.log('Your VAPI Analysis Configuration will work correctly with the Firebase Function.');
    } else {
      console.log('❌ Webhook test failed with status:', response.status);
    }
  } catch (error) {
    console.error('❌ Error testing webhook:', error.message);
  }
}

// Run the test
testStructuredData();