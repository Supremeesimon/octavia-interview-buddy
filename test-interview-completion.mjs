import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const serviceAccount = require('./firebase-service-account.json');

// Initialize Firebase Admin with service account
const app = initializeApp({
  credential: cert(serviceAccount),
  projectId: 'octavia-practice-interviewer'
});

const db = getFirestore(app);

// Simulate the exact data structure that would be sent by the VAPI service
async function simulateInterviewCompletion() {
  try {
    console.log('Simulating interview completion process...');
    
    // This is the exact data structure that handleEndOfCallAnalysis would receive
    const mockCallData = {
      id: 'vapi_call_' + Date.now(),
      duration: 425, // seconds
      transcript: 'User: Hello, I\'d like to apply for the position.\nAI: Great! Can you tell me about your experience?\nUser: I have 3 years of experience in web development.\nAI: That\'s excellent. What technologies do you work with?\nUser: I work with React, Node.js, and MongoDB.',
      recordingUrl: 'https://storage.googleapis.com/octavia-recordings/call_12345.mp3',
      analysis: {
        summary: 'The candidate demonstrated good communication skills and relevant technical experience. They clearly articulated their 3 years of web development experience and mentioned specific technologies like React, Node.js, and MongoDB. The conversation flowed naturally with good engagement from both parties.',
        structuredData: {
          categories: [
            { name: 'Communication', score: 85, weight: 0.3 },
            { name: 'Technical Knowledge', score: 78, weight: 0.4 },
            { name: 'Problem Solving', score: 82, weight: 0.3 }
          ],
          strengths: [
            'Clear articulation of experience',
            'Good technical foundation',
            'Engaging communication style'
          ],
          improvements: [
            'Could provide more specific project examples',
            'Would benefit from discussing challenges faced'
          ],
          recommendations: [
            'Prepare specific examples using the STAR method',
            'Practice discussing technical challenges and solutions',
            'Review core concepts of mentioned technologies'
          ]
        },
        successEvaluation: {
          score: 82,
          feedback: 'Strong overall performance with clear technical knowledge. Focus on providing more detailed examples in future interviews.'
        }
      },
      metadata: {
        interviewType: 'general',
        startTime: new Date(Date.now() - 425000).toISOString(), // 425 seconds ago
        // No studentId, departmentId, or institutionId for anonymous user
      }
    };
    
    console.log('Mock call data prepared:');
    console.log('  Call ID:', mockCallData.id);
    console.log('  Duration:', mockCallData.duration, 'seconds');
    console.log('  Has transcript:', !!mockCallData.transcript);
    console.log('  Has analysis:', !!mockCallData.analysis);
    console.log('  Has metadata:', !!mockCallData.metadata);
    
    // Simulate the handleEndOfCallAnalysis method from vapi.service.ts
    console.log('\n--- Simulating handleEndOfCallAnalysis ---');
    
    const analysis = mockCallData.analysis;
    const callId = mockCallData.id;
    const metadata = mockCallData.metadata || {};
    
    // Extract data exactly as vapi.service.ts does
    const analysisData = {
      callId,
      summary: analysis.summary || '',
      structuredData: analysis.structuredData || {},
      successEvaluation: analysis.successEvaluation || {},
      transcript: mockCallData.transcript || '',
      recordingUrl: mockCallData.recordingUrl || '',
      duration: mockCallData.duration || 0,
      timestamp: new Date(),
      studentId: metadata.studentId || '', // Empty for anonymous users
      departmentId: metadata.departmentId || metadata.department || '',
      institutionId: metadata.institutionId || '',
      interviewType: metadata.interviewType || 'general',
      overallScore: analysis.successEvaluation?.score || 0,
      categories: analysis.structuredData?.categories || [],
      strengths: analysis.structuredData?.strengths || [],
      improvements: analysis.structuredData?.improvements || [],
      recommendations: analysis.structuredData?.recommendations || []
    };
    
    console.log('Analysis data prepared for saving:');
    console.log('  Call ID:', analysisData.callId);
    console.log('  Student ID:', analysisData.studentId ? 'Present' : 'Empty (anonymous)');
    console.log('  Interview Type:', analysisData.interviewType);
    console.log('  Overall Score:', analysisData.overallScore);
    console.log('  Has Summary:', !!analysisData.summary);
    console.log('  Has Transcript:', !!analysisData.transcript);
    console.log('  Has Recording URL:', !!analysisData.recordingUrl);
    
    // Simulate saving to Firebase exactly as interview.service.ts does
    console.log('\n--- Simulating saveEndOfCallAnalysis ---');
    
    const analysisId = db.collection('end-of-call-analysis').doc().id;
    
    const analysisRecord = {
      id: analysisId,
      ...analysisData,
      createdAt: new Date() // Using regular Date instead of serverTimestamp for admin SDK
    };
    
    console.log('Attempting to save analysis record to Firestore...');
    await db.collection('end-of-call-analysis').doc(analysisId).set(analysisRecord);
    console.log('✅ Analysis data saved successfully to Firestore!');
    console.log('  Document ID:', analysisId);
    
    // Also simulate creating an interview record
    console.log('\n--- Simulating interview record creation ---');
    
    const interviewId = db.collection('interviews').doc().id;
    const interviewRecord = {
      id: interviewId,
      studentId: analysisData.studentId || '',
      type: analysisData.interviewType || 'general',
      status: 'completed',
      transcript: analysisData.transcript || '',
      recordingUrl: analysisData.recordingUrl || '',
      recordingDuration: analysisData.duration || 0,
      overallScore: analysisData.overallScore || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('Attempting to save interview record to Firestore...');
    await db.collection('interviews').doc(interviewId).set(interviewRecord);
    console.log('✅ Interview data saved successfully to Firestore!');
    console.log('  Document ID:', interviewId);
    
    // Verify the data was saved
    console.log('\n--- Verifying saved data ---');
    
    const savedAnalysis = await db.collection('end-of-call-analysis').doc(analysisId).get();
    if (savedAnalysis.exists) {
      const data = savedAnalysis.data();
      console.log('✅ Analysis data verified:');
      console.log('  Call ID:', data.callId);
      console.log('  Student ID:', data.studentId ? 'Present' : 'Empty (anonymous)');
      console.log('  Score:', data.overallScore);
      console.log('  Has Summary:', !!data.summary);
      console.log('  Has Transcript:', !!data.transcript);
    }
    
    const savedInterview = await db.collection('interviews').doc(interviewId).get();
    if (savedInterview.exists) {
      const data = savedInterview.data();
      console.log('✅ Interview data verified:');
      console.log('  Type:', data.type);
      console.log('  Student ID:', data.studentId ? 'Present' : 'Empty (anonymous)');
      console.log('  Score:', data.overallScore);
      console.log('  Status:', data.status);
    }
    
    console.log('\n🎉 Interview completion simulation completed successfully!');
    console.log('Both end-of-call analysis and interview records were saved to Firebase.');
    console.log('This confirms that the data saving mechanism works correctly.');
    console.log('The issue must be in the actual application code during interview completion.');
    
  } catch (error) {
    console.error('❌ Error during interview completion simulation:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
  }
}

simulateInterviewCompletion();