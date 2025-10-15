import { InstitutionDashboardService } from '@/services/institution-dashboard.service';

// Test function to verify InstitutionDashboardService methods
async function testInstitutionDashboardService() {
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
    
    console.log('All InstitutionDashboardService methods executed successfully!');
    
    return {
      studentsCount: students.length,
      teachersCount: teachers.length,
      interviewsCount: interviews.length
    };
  } catch (error) {
    console.error('Error testing InstitutionDashboardService:', error);
    return {
      studentsCount: 0,
      teachersCount: 0,
      interviewsCount: 0
    };
  }
}

// Run the test
testInstitutionDashboardService().then(result => {
  console.log('InstitutionDashboardService test result:', result);
});

export default testInstitutionDashboardService;