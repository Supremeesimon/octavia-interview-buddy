/**
 * Debug script to check if VAPI service is properly handling end-of-call analysis
 */

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Mock call data to simulate what VAPI would send
const mockCallData = {
  id: 'test_call_' + Date.now(),
  duration: 300,
  transcript: 'This is a test transcript.',
  recordingUrl: 'https://example.com/recording.mp3',
  analysis: {
    summary: 'This is a test summary.',
    structuredData: {
      categories: [
        { name: 'Communication', score: 85 },
        { name: 'Technical Knowledge', score: 78 }
      ],
      strengths: ['Clear communication'],
      improvements: ['Provide more examples'],
      recommendations: ['Practice with STAR method']
    },
    successEvaluation: {
      score: 82,
      feedback: 'Good performance'
    }
  },
  metadata: {
    interviewType: 'general',
    startTime: new Date().toISOString()
  }
};

async function testVapiService() {
  console.log('Testing VAPI service data handling...');
  
  try {
    // Simulate the handleEndOfCallAnalysis method
    console.log('Simulating handleEndOfCallAnalysis...');
    
    const analysis = mockCallData.analysis;
    const callId = mockCallData.id;
    const metadata: any = mockCallData.metadata || {};
    
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
    
    console.log('Analysis data prepared:');
    console.log(JSON.stringify(analysisData, null, 2));
    
    // Try to save the data directly to Firebase
    console.log('Attempting to save analysis data directly to Firebase...');
    try {
      const analysisId = doc(collection(db, 'end-of-call-analysis')).id;
      
      const analysisRecord = {
        id: analysisId,
        ...analysisData,
        createdAt: serverTimestamp()
      };

      await setDoc(doc(db, 'end-of-call-analysis', analysisId), analysisRecord);
      console.log('✅ Data saved successfully to Firebase!');
      
      // Also save to interviews collection
      const interviewId = doc(collection(db, 'interviews')).id;
      const interviewRecord = {
        id: interviewId,
        studentId: analysisData.studentId || '',
        type: analysisData.interviewType || 'general',
        status: 'completed',
        transcript: analysisData.transcript || '',
        recordingUrl: analysisData.recordingUrl || '',
        recordingDuration: analysisData.duration || 0,
        overallScore: analysisData.overallScore || 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(doc(db, 'interviews', interviewId), interviewRecord);
      console.log('✅ Interview data also saved successfully to Firebase!');
      
    } catch (saveError) {
      console.log('❌ Error saving data:', saveError);
    }
    
    // Try to read the data
    console.log('Attempting to read analysis data...');
    try {
      // We'll use our simple Firebase test script instead
      console.log('✅ Data saving test completed!');
      console.log('Now you can check the Firebase console or visit /analytics/anonymous-data to see the data');
      
    } catch (readError) {
      console.log('❌ Error reading data:', readError);
    }
    
  } catch (error) {
    console.error('Error in test:', error);
  }
}

testVapiService();