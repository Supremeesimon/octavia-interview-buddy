import { InstitutionDashboardService } from '@/services/institution-dashboard.service';

// Test function to verify all InstitutionDashboardService methods
async function testInstitutionDashboardServiceExtended() {
  try {
    console.log('Testing InstitutionDashboardService methods...');
    
    // Test with a sample institution ID
    const testInstitutionId = 'test-institution-id';
    
    // Test getInstitutionStudents
    console.log('1. Testing getInstitutionStudents...');
    const students = await InstitutionDashboardService.getInstitutionStudents(testInstitutionId);
    console.log('   Students found:', students.length);
    
    // Test getInstitutionTeachers
    console.log('2. Testing getInstitutionTeachers...');
    const teachers = await InstitutionDashboardService.getInstitutionTeachers(testInstitutionId);
    console.log('   Teachers found:', teachers.length);
    
    // Test getInstitutionScheduledInterviews
    console.log('3. Testing getInstitutionScheduledInterviews...');
    const interviews = await InstitutionDashboardService.getInstitutionScheduledInterviews(testInstitutionId);
    console.log('   Scheduled interviews found:', interviews.length);
    
    // Test getStudentAnalytics
    console.log('4. Testing getStudentAnalytics...');
    const studentAnalytics = await InstitutionDashboardService.getStudentAnalytics(testInstitutionId);
    console.log('   Student analytics:', studentAnalytics);
    
    // Test getLicenseInfo
    console.log('5. Testing getLicenseInfo...');
    const sessionInfo = await InstitutionDashboardService.getLicenseInfo(testInstitutionId);
    console.log('   Interview session info:', sessionInfo);
    
    // Test getLicenseStatistics
    console.log('6. Testing getLicenseStatistics...');
    const sessionStatistics = await InstitutionDashboardService.getLicenseStatistics(testInstitutionId);
    console.log('   Interview session statistics:', sessionStatistics);
    
    console.log('All InstitutionDashboardService methods executed successfully!');
    
    return {
      studentsCount: students.length,
      teachersCount: teachers.length,
      interviewsCount: interviews.length,
      studentAnalytics,
      sessionInfo,
      sessionStatistics
    };
  } catch (error) {
    console.error('Error testing InstitutionDashboardService:', error);
    return {
      studentsCount: 0,
      teachersCount: 0,
      interviewsCount: 0,
      studentAnalytics: null,
      sessionInfo: null,
      sessionStatistics: null
    };
  }
}

// Run the test
testInstitutionDashboardServiceExtended().then(result => {
  console.log('InstitutionDashboardService test result:', result);
});

export default testInstitutionDashboardServiceExtended;