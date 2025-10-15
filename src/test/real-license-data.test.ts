import { InstitutionDashboardService } from '@/services/institution-dashboard.service';

// Test function to verify real license data fetching
async function testRealLicenseData() {
  try {
    console.log('Testing real license data fetching...');
    
    // Use a real institution ID from the test output
    const realInstitutionId = 'o27XAYG3ifHmWKM56aTV';
    
    // Test getLicenseInfo with real institution ID
    console.log('Testing getLicenseInfo with real institution ID...');
    const licenseInfo = await InstitutionDashboardService.getLicenseInfo(realInstitutionId);
    console.log('   Real license info:', licenseInfo);
    
    // Test getStudentAnalytics with real institution ID
    console.log('Testing getStudentAnalytics with real institution ID...');
    const studentAnalytics = await InstitutionDashboardService.getStudentAnalytics(realInstitutionId);
    console.log('   Real student analytics:', studentAnalytics);
    
    console.log('Real data fetching test completed!');
    
    return {
      licenseInfo,
      studentAnalytics
    };
  } catch (error) {
    console.error('Error testing real data fetching:', error);
    return {
      licenseInfo: null,
      studentAnalytics: null
    };
  }
}

// Run the test
testRealLicenseData().then(result => {
  console.log('Real license data test result:', result);
});

export default testRealLicenseData;