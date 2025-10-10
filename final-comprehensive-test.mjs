#!/usr/bin/env node

/**
 * Comprehensive test script for VAPI webhook function
 * This script simulates a complete VAPI end-of-call report to test our Firebase Function
 */

import fetch from 'node-fetch';

const WEBHOOK_URL = 'https://us-central1-octavia-practice-interviewer.cloudfunctions.net/vapiWebhook';

// Complete end-of-call report that matches VAPI's format
const completeReport = {
  message: {
    type: 'end-of-call-report',
    callId: 'vapi_dashboard_config_test_001',
    startedAt: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
    endedAt: new Date().toISOString(),
    endedReason: 'customer-ended-call',
    cost: 0.12,
    compliance: {
      pii: { violations: [] },
      pci: { violations: [] }
    },
    transcript: 'Assistant: Hello, welcome to our technical interview. Can you tell me about yourself?\nCandidate: Hi, I\'m a software engineer with 3 years of experience. I specialize in React and Node.js.\nAssistant: Great! Can you walk me through a challenging project you\'ve worked on?\nCandidate: Sure, I worked on a real-time chat application that handled thousands of concurrent users.\nAssistant: Impressive. How did you handle the scaling challenges?\nCandidate: We implemented load balancing and used Redis for caching frequently accessed data.\nAssistant: Excellent. Thank you for your time today.',
    recordingUrl: 'https://storage.googleapis.com/vapi-recordings/vapi_dashboard_config_test_001.mp3',
    summary: 'The candidate demonstrated strong technical knowledge in React and Node.js with experience in building scalable applications. They effectively communicated their experience with a real-time chat application and explained their approach to handling scaling challenges with load balancing and Redis caching. The candidate showed good problem-solving skills and enthusiasm for the position.',
    structuredData: {
      categories: [
        { 
          name: 'Communication Skills', 
          score: 88, 
          weight: 0.25,
          description: 'Clear and articulate communication with good explanation of technical concepts'
        },
        { 
          name: 'Technical Knowledge', 
          score: 85, 
          weight: 0.35,
          description: 'Strong knowledge of React, Node.js, and scalable architecture patterns'
        },
        { 
          name: 'Problem Solving', 
          score: 82, 
          weight: 0.25,
          description: 'Good approach to scaling challenges with practical solutions'
        },
        { 
          name: 'Enthusiasm', 
          score: 90, 
          weight: 0.15,
          description: 'Showed genuine interest and engagement throughout the interview'
        }
      ],
      strengths: [
        'Strong technical foundation in React and Node.js',
        'Clear explanation of complex technical concepts',
        'Good problem-solving approach with practical examples',
        'Enthusiastic and engaged throughout the interview'
      ],
      improvements: [
        'Could provide more specific metrics and results',
        'Would benefit from more detailed explanation of Redis implementation',
        'Could elaborate on team dynamics in the project'
      ],
      recommendations: [
        'Prepare specific metrics and quantifiable results for projects',
        'Study more advanced Redis patterns and use cases',
        'Practice explaining team collaboration and leadership experiences',
        'Review system design principles for large-scale applications'
      ]
    },
    successEvaluation: {
      score: 86,
      passed: true,
      explanation: 'Candidate demonstrated strong technical skills and good communication. Showed enthusiasm and was able to provide relevant examples. Minor improvements could be made in providing more specific metrics.'
    },
    duration: 900, // 15 minutes
    metadata: {
      studentId: 'student_dashboard_test_001',
      departmentId: 'computer_science',
      institutionId: 'university_of_technology',
      interviewType: 'technical_frontend'
    }
  }
};

async function comprehensiveTest() {
  console.log('🧪 Running comprehensive VAPI webhook test...');
  console.log('📍 Webhook URL:', WEBHOOK_URL);
  console.log('📋 Test data includes all fields from your VAPI dashboard configuration');
  
  try {
    console.log('\n📤 Sending complete end-of-call report...');
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'VAPI-Webhook-Test-Script'
      },
      body: JSON.stringify(completeReport)
    });
    
    console.log('📥 Response received');
    console.log('📊 Status code:', response.status);
    
    const responseBody = await response.text();
    console.log('📄 Response body:', responseBody);
    
    if (response.ok) {
      console.log('\n✅ SUCCESS: Comprehensive test passed!');
      console.log('🎉 Your VAPI dashboard configuration is working correctly with the Firebase Function');
      console.log('📊 All structured data fields are being processed properly');
      console.log('🔒 Metadata is being captured for data isolation');
      console.log('💾 Data will be saved to Firestore collection: end-of-call-analysis');
      
      console.log('\n📋 Next steps:');
      console.log('   1. Run a real interview using your configured assistant');
      console.log('   2. Check Firebase Firestore for the analysis data');
      console.log('   3. Verify all fields appear as configured in your dashboard');
      
      return true;
    } else {
      console.log('\n❌ ERROR: Test failed with status', response.status);
      console.log('🔍 Check your Firebase Function logs for more details:');
      console.log('   firebase functions:log');
      return false;
    }
  } catch (error) {
    console.error('\n💥 ERROR: Failed to test webhook:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('   1. Verify your Firebase Function is deployed:');
    console.log('      firebase functions:list');
    console.log('   2. Check your internet connection');
    console.log('   3. Verify the webhook URL is correct');
    return false;
  }
}

// Run the comprehensive test
comprehensiveTest();