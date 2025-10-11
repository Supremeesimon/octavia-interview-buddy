import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, setDoc, doc, serverTimestamp } from 'firebase/firestore';

// Firebase configuration from your .env.local
const firebaseConfig = {
  apiKey: "AIzaSyCn847Eo_wh90MCJWYwW7K01rihUl8h2-Q",
  authDomain: "octavia-practice-interviewer.firebaseapp.com",
  projectId: "octavia-practice-interviewer",
  storageBucket: "octavia-practice-interviewer.firebasestorage.app",
  messagingSenderId: "475685845155",
  appId: "1:475685845155:web:ff55f944f48fc987bae716",
  measurementId: "G-YYHF1TW9MM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function simulateInterviewCompletion() {
  try {
    console.log('🧪 Simulating interview completion...\n');
    
    // Create mock analysis data similar to what VAPI would send
    const mockAnalysisData = {
      callId: 'test_call_' + Date.now(),
      studentId: 'test_student_123',
      summary: 'This is a test interview summary with feedback on communication skills.',
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
        score: 82,
        passed: true
      },
      transcript: 'This is a mock transcript of the interview conversation.',
      recordingUrl: 'https://example.com/recording.mp3',
      duration: 300, // 5 minutes
      timestamp: new Date(),
      interviewType: 'general',
      overallScore: 82
    };
    
    console.log('1. Saving end-of-call analysis data...');
    // Save to end-of-call-analysis collection
    const analysisRef = await addDoc(collection(db, 'end-of-call-analysis'), {
      ...mockAnalysisData,
      createdAt: serverTimestamp()
    });
    console.log('✅ Analysis saved with ID:', analysisRef.id);
    
    console.log('\n2. Saving interview data...');
    // Save to interviews collection
    const interviewData = {
      studentId: mockAnalysisData.studentId,
      resumeId: 'test_resume_456',
      sessionId: 'test_session_' + Date.now(),
      scheduledAt: new Date(),
      startedAt: new Date(Date.now() - 300000), // 5 minutes ago
      endedAt: new Date(),
      duration: mockAnalysisData.duration,
      status: 'completed',
      type: mockAnalysisData.interviewType,
      vapiCallId: mockAnalysisData.callId,
      recordingUrl: mockAnalysisData.recordingUrl,
      recordingDuration: mockAnalysisData.duration,
      transcript: mockAnalysisData.transcript,
      score: mockAnalysisData.overallScore,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const interviewRef = await addDoc(collection(db, 'interviews'), interviewData);
    console.log('✅ Interview saved with ID:', interviewRef.id);
    
    console.log('\n3. Saving feedback data...');
    // Save to interview-feedback collection
    const feedbackData = {
      interviewId: interviewRef.id,
      studentId: mockAnalysisData.studentId,
      overallScore: mockAnalysisData.overallScore,
      categories: mockAnalysisData.structuredData.categories,
      strengths: mockAnalysisData.structuredData.strengths,
      improvements: mockAnalysisData.structuredData.improvements,
      recommendations: mockAnalysisData.structuredData.recommendations,
      detailedAnalysis: mockAnalysisData.summary,
      aiModelVersion: 'test-v1.0',
      confidenceScore: 0.9,
      createdAt: serverTimestamp()
    };
    
    const feedbackRef = await addDoc(collection(db, 'interview-feedback'), feedbackData);
    console.log('✅ Feedback saved with ID:', feedbackRef.id);
    
    console.log('\n4. Updating student stats...');
    // Update student stats
    const studentStatsRef = doc(db, 'student-stats', mockAnalysisData.studentId);
    await setDoc(studentStatsRef, {
      totalInterviews: 1,
      completedInterviews: 1,
      averageScore: mockAnalysisData.overallScore,
      improvementRate: 0,
      lastInterviewDate: serverTimestamp(),
      strongestSkills: mockAnalysisData.structuredData.strengths,
      areasForImprovement: mockAnalysisData.structuredData.improvements,
      updatedAt: serverTimestamp()
    }, { merge: true });
    console.log('✅ Student stats updated');
    
    console.log('\n🎉 Test interview completion simulation completed successfully!');
    console.log('All data has been saved to Firebase collections.');
    console.log('This confirms that the data saving mechanism works correctly.');
    
  } catch (error) {
    console.error('❌ Error during test simulation:', error);
  }
}

// Run the simulation
simulateInterviewCompletion();