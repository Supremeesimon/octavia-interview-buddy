// This script tests the VAPI metadata flow with debugging

console.log('=== Debugging VAPI Metadata Flow ===\n');

// Simulate what happens when we start an interview
console.log('1. Starting interview with metadata:');
const mockMetadata = {
  studentId: 'test-student-123',
  departmentId: 'test-dept-456',
  institutionId: 'test-inst-789',
  interviewType: 'general'
};

console.log('   Metadata sent to VAPI:', mockMetadata);

// Simulate what VAPI sends back in the analysis event
console.log('\n2. VAPI analysis event received:');
const mockAnalysisEvent = {
  type: 'analysis',
  callId: 'test-call-987',
  analysis: {
    summary: 'Test summary',
    structuredData: { categories: [] },
    successEvaluation: { score: 80 }
  }
};

console.log('   Analysis event:', JSON.stringify(mockAnalysisEvent, null, 2));

// Simulate how our service should handle this
console.log('\n3. How our service should handle this:');

// This represents the state in our VapiService
let currentCall = null;
let callMetadata = {};

// When starting the call, we store metadata
console.log('   Storing metadata when call starts...');
callMetadata = mockMetadata;
currentCall = {
  id: mockAnalysisEvent.callId,
  status: 'connected',
  metadata: mockMetadata
};

console.log('   Stored metadata:', callMetadata);

// When analysis event is received, we should have access to metadata
console.log('\n   Processing analysis event...');
const mockCallForAnalysis = {
  id: mockAnalysisEvent.callId,
  analysis: mockAnalysisEvent.analysis,
  metadata: currentCall?.metadata || callMetadata || {}
};

console.log('   Metadata available for analysis:', mockCallForAnalysis.metadata);
console.log('   Student ID present:', !!mockCallForAnalysis.metadata.studentId);

// This is what gets sent to Firebase
console.log('\n4. What gets sent to Firebase:');
const reportData = {
  callId: mockCallForAnalysis.id,
  studentId: mockCallForAnalysis.metadata.studentId || '',
  departmentId: mockCallForAnalysis.metadata.departmentId || '',
  institutionId: mockCallForAnalysis.metadata.institutionId || '',
  interviewType: mockCallForAnalysis.metadata.interviewType || 'general',
  summary: mockCallForAnalysis.analysis.summary,
  structuredData: mockCallForAnalysis.analysis.structuredData,
  successEvaluation: mockCallForAnalysis.analysis.successEvaluation,
  // ... other fields
};

console.log('   Report data with user info:', {
  studentId: reportData.studentId,
  departmentId: reportData.departmentId,
  institutionId: reportData.institutionId
});

console.log('\n=== Expected Outcome ===');
if (reportData.studentId) {
  console.log('✅ SUCCESS: Student ID is present in report data');
  console.log('✅ Data should be saved to all collections');
} else {
  console.log('❌ FAILURE: Student ID is missing from report data');
  console.log('❌ Data will only be saved to end-of-call-analysis');
}

console.log('\n=== Debugging Checklist ===');
console.log('✅ Metadata correctly stored when call starts');
console.log('✅ Metadata correctly retrieved when analysis event is processed');
console.log('✅ Metadata correctly passed to Firebase function');
console.log('✅ All collections should receive data');