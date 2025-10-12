import { interviewService } from '@/services/interview.service';

// Test function to check actual data in Firebase
async function checkFirebaseData() {
  try {
    console.log('Checking Firebase data...');
    
    // Get all analyses
    const analyses = await interviewService.getAllAnalyses(1000);
    console.log('Total analyses found:', analyses.length);
    console.log('Analyses data:', JSON.stringify(analyses, null, 2));
    
    // Get performance data
    const performanceData = await interviewService.getRecentInterviews(1000);
    console.log('Performance data count:', performanceData.length);
    
    return {
      analysesCount: analyses.length,
      performanceDataCount: performanceData.length
    };
  } catch (error) {
    console.error('Error checking Firebase data:', error);
    return {
      analysesCount: 0,
      performanceDataCount: 0
    };
  }
}

// Run the test
checkFirebaseData().then(result => {
  console.log('Firebase data check result:', result);
});

export default checkFirebaseData;