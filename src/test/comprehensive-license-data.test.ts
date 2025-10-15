import { InstitutionDashboardService } from '@/services/institution-dashboard.service';

// Test function to verify comprehensive license data fetching
async function testComprehensiveLicenseData() {
  try {
    console.log('Testing comprehensive license data fetching...');
    
    // Use a real institution ID from the test output
    const realInstitutionId = 'o27XAYG3ifHmWKM56aTV';
    
    // Test getLicenseInfo with real institution ID
    console.log('Testing getLicenseInfo with real institution ID...');
    const licenseInfo = await InstitutionDashboardService.getLicenseInfo(realInstitutionId);
    console.log('   License info:', licenseInfo);
    
    // Test getLicenseStatistics with real institution ID
    console.log('Testing getLicenseStatistics with real institution ID...');
    const licenseStatistics = await InstitutionDashboardService.getLicenseStatistics(realInstitutionId);
    console.log('   License statistics:', licenseStatistics);
    
    console.log('Comprehensive license data fetching test completed!');
    
    return {
      licenseInfo,
      licenseStatistics
    };
  } catch (error) {
    console.error('Error testing comprehensive license data fetching:', error);
    return {
      licenseInfo: null,
      licenseStatistics: null
    };
  }
}

// Run the test
testComprehensiveLicenseData().then(result => {
  console.log('Comprehensive license data test result:', result);
});

export default testComprehensiveLicenseData;