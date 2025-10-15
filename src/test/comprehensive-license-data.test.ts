import { InstitutionDashboardService } from '@/services/institution-dashboard.service';

// Test function to verify comprehensive interview session data fetching
async function testComprehensiveInterviewSessionData() {
  try {
    console.log('Testing comprehensive interview session data fetching...');
    
    // Use a real institution ID from the test output
    const realInstitutionId = 'o27XAYG3ifHmWKM56aTV';
    
    // Test getLicenseInfo with real institution ID
    console.log('Testing getLicenseInfo with real institution ID...');
    const sessionInfo = await InstitutionDashboardService.getLicenseInfo(realInstitutionId);
    console.log('   Interview session info:', sessionInfo);
    
    // Test getLicenseStatistics with real institution ID
    console.log('Testing getLicenseStatistics with real institution ID...');
    const sessionStatistics = await InstitutionDashboardService.getLicenseStatistics(realInstitutionId);
    console.log('   Interview session statistics:', sessionStatistics);
    
    console.log('Comprehensive interview session data fetching test completed!');
    
    return {
      sessionInfo,
      sessionStatistics
    };
  } catch (error) {
    console.error('Error testing comprehensive interview session data fetching:', error);
    return {
      sessionInfo: null,
      sessionStatistics: null
    };
  }
}

// Run the test
testComprehensiveInterviewSessionData().then(result => {
  console.log('Comprehensive interview session data test result:', result);
});

export default testComprehensiveInterviewSessionData;