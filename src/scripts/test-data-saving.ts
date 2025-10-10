/**
 * Simple test to check if data saving works in the application context
 */

// This will test if the interviewService can save data when run in the application context

async function testDataSaving() {
  try {
    // Dynamically import the interview service to avoid environment issues
    const { interviewService } = await import('@/services/interview.service');
    
    console.log('Testing data saving in application context...');
    
    // Create mock analysis data
    const analysisData = {
      callId: 'test_call_' + Date.now(),
      summary: 'This is a test summary from the application.',
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
      },
      transcript: 'This is a test transcript from the application.',
      recordingUrl: 'https://example.com/recording.mp3',
      duration: 300,
      timestamp: new Date(),
      studentId: '', // Empty for anonymous users
      departmentId: '',
      institutionId: '',
      interviewType: 'general',
      overallScore: 82,
      categories: [
        { name: 'Communication', score: 85 },
        { name: 'Technical Knowledge', score: 78 }
      ],
      strengths: ['Clear communication'],
      improvements: ['Provide more examples'],
      recommendations: ['Practice with STAR method']
    };
    
    console.log('Attempting to save analysis data...');
    try {
      await interviewService.saveEndOfCallAnalysis(analysisData);
      console.log('✅ Data saved successfully through interviewService!');
      
      // Try to read the data back
      console.log('Attempting to read data back...');
      const analyses = await interviewService.getAllAnalyses(5);
      console.log(`✅ Successfully retrieved ${analyses.length} analyses`);
      
      if (analyses.length > 0) {
        console.log('Most recent analysis:');
        console.log(JSON.stringify(analyses[0], null, 2));
      }
      
    } catch (saveError) {
      console.log('❌ Error saving data:', saveError);
    }
    
  } catch (error) {
    console.error('Error in test:', error);
  }
}

testDataSaving();