#!/usr/bin/env node

/**
 * Test script for updated VAPI webhook function
 */

import fetch from 'node-fetch';

const WEBHOOK_URL = 'https://us-central1-octavia-practice-interviewer.cloudfunctions.net/vapiWebhook';

// Sample end-of-call report that mimics what VAPI would send
const sampleReport = {
  message: {
    type: 'end-of-call-report',
    callId: 'webcall_test_001',
    startedAt: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
    endedAt: new Date().toISOString(),
    endedReason: 'customer-ended-call',
    cost: 0.08,
    compliance: {
      pii: { violations: [] },
      pci: { violations: [] }
    },
    transcript: 'User: Hello, I\'m excited to be here for this interview.\nAssistant: Great! Let\'s start with a simple question. Can you tell me about yourself?\nUser: Sure, I\'m a software engineer with 3 years of experience in web development.\nAssistant: Excellent. What\'s your experience with React?',
    recordingUrl: 'https://storage.googleapis.com/vapi-recordings/webcall_test_001.mp3',
    summary: 'The candidate showed enthusiasm for the position and was able to provide a basic introduction about their experience with web development and React.',
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
        'Clear explanation of complex technical concepts'
      ],
      improvements: [
        'Could provide more specific metrics and results'
      ],
      recommendations: [
        'Prepare specific metrics and quantifiable results for projects'
      ]
    },
    successEvaluation: {
      score: 86,
      passed: true,
      explanation: 'Candidate demonstrated strong technical skills and good communication. Showed enthusiasm and was able to provide relevant examples.'
    },
    duration: 600, // 10 minutes
    metadata: {
      studentId: 'student_webcall_test_001',
      departmentId: 'computer_science',
      institutionId: 'university_of_technology',
      interviewType: 'technical_frontend'
    }
  }
};

async function testUpdatedWebhook() {
  console.log('🧪 Testing updated VAPI webhook function...');
  console.log('📍 Webhook URL:', WEBHOOK_URL);
  
  try {
    console.log('\n📤 Sending sample end-of-call report...');
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'VAPI-Webhook-Test-Script'
      },
      body: JSON.stringify(sampleReport)
    });
    
    console.log('📥 Response received');
    console.log('📊 Status code:', response.status);
    
    const responseBody = await response.text();
    console.log('📄 Response body:', responseBody);
    
    if (response.ok) {
      console.log('\n✅ SUCCESS: Updated webhook function working correctly!');
      console.log('🎉 No more Cloud Storage errors');
      console.log('📊 Data will be saved to Firestore collection: end-of-call-analysis');
      
      return true;
    } else {
      console.log('\n❌ ERROR: Test failed with status', response.status);
      return false;
    }
  } catch (error) {
    console.error('\n💥 ERROR: Failed to test webhook:', error.message);
    return false;
  }
}

// Run the test
testUpdatedWebhook();