import fetch from 'node-fetch';

// Test the Firebase Function webhook with sample data that includes studentId
async function testWebhook() {
  const testData = {
    message: {
      type: 'analysis',
      callId: 'test-call-' + Date.now(),
      analysis: {
        summary: 'This is a test analysis summary for the webhook.',
        structuredData: {
          categories: [
            { name: 'Communication', score: 85, weight: 0.3, description: 'Clear and articulate responses' },
            { name: 'Technical Knowledge', score: 78, weight: 0.4, description: 'Good understanding of core concepts' },
            { name: 'Problem Solving', score: 82, weight: 0.3, description: 'Approaches problems methodically' }
          ],
          strengths: ['Clear communication', 'Good technical foundation'],
          improvements: ['Provide more specific examples', 'Speak more confidently'],
          recommendations: ['Practice with the STAR method', 'Review technical concepts']
        },
        successEvaluation: {
          score: 82
        }
      },
      transcript: 'This is a test transcript of the interview conversation.',
      recordingUrl: 'https://example.com/recording.mp3',
      duration: 300,
      studentId: 'xVoQq94Gk3YoBKnnt5TzDrlPtZ72', // This is the user ID for oluwaferanmionabanjo@gmail.com
      departmentId: 'default-department',
      institutionId: 'default-institution',
      interviewType: 'general'
    }
  };

  try {
    console.log('Sending test data to webhook...');
    console.log('Test data:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('https://us-central1-octavia-practice-interviewer.cloudfunctions.net/vapiWebhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const responseBody = await response.text();
    console.log('Webhook response status:', response.status);
    console.log('Webhook response body:', responseBody);
    
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