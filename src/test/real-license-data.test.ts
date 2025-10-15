import { InstitutionDashboardService } from '@/services/institution-dashboard.service';

// Test function to verify real interview session data fetching
async function testRealInterviewSessionData() {
  try {
    console.log('Testing real interview session data fetching...');
    
    // Use a real institution ID from the test output
    const realInstitutionId = 'o27XAYG3ifHmWKM56aTV';
    
    // Test getLicenseInfo with real institution ID
    console.log('Testing getLicenseInfo with real institution ID...');
    const sessionInfo = await InstitutionDashboardService.getLicenseInfo(realInstitutionId);
    console.log('   Real interview session info:', sessionInfo);
    
    // Test getStudentAnalytics with real institution ID
    console.log('Testing getStudentAnalytics with real institution ID...');
    const studentAnalytics = await InstitutionDashboardService.getStudentAnalytics(realInstitutionId);
    console.log('   Real student analytics:', studentAnalytics);
    
    console.log('Real data fetching test completed!');
    
    return {
      sessionInfo,
      studentAnalytics
    };
  } catch (error) {
    console.error('Error testing real data fetching:', error);
    return {
      sessionInfo: null,
      studentAnalytics: null
    };
  }
}

// Run the test
testRealInterviewSessionData().then(result => {
  console.log('Real interview session data test result:', result);
});

export default testRealInterviewSessionData;