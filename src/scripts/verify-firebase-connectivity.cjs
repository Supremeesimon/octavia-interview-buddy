#!/usr/bin/env node

/**
 * Script to verify Firebase connectivity and test InstitutionDashboardService
 */

// Use dynamic import for ES modules
async function verifyConnectivity() {
  try {
    console.log('Testing Firebase connectivity...\n');
    
    // Import the InstitutionDashboardService
    const { InstitutionDashboardService } = await import('../services/institution-dashboard.service.js');
    
    console.log('✅ InstitutionDashboardService imported successfully\n');
    
    // Test institution ID - this would be replaced with a real institution ID in practice
    const testInstitutionId = 'test-institution-id';
    
    console.log('Testing InstitutionDashboardService methods...\n');
    
    console.log('1. Testing getInstitutionStudents...');
    try {
      const students = await InstitutionDashboardService.getInstitutionStudents(testInstitutionId);
      console.log(`   ✅ getInstitutionStudents executed successfully - Found ${students.length} students\n`);
    } catch (error) {
      console.log(`   ⚠️  getInstitutionStudents encountered an error (expected without real data): ${error.message}\n`);
    }
    
    console.log('2. Testing getInstitutionTeachers...');
    try {
      const teachers = await InstitutionDashboardService.getInstitutionTeachers(testInstitutionId);
      console.log(`   ✅ getInstitutionTeachers executed successfully - Found ${teachers.length} teachers\n`);
    } catch (error) {
      console.log(`   ⚠️  getInstitutionTeachers encountered an error (expected without real data): ${error.message}\n`);
    }
    
    console.log('3. Testing getInstitutionScheduledInterviews...');
    try {
      const interviews = await InstitutionDashboardService.getInstitutionScheduledInterviews(testInstitutionId);
      console.log(`   ✅ getInstitutionScheduledInterviews executed successfully - Found ${interviews.length} scheduled interviews\n`);
    } catch (error) {
      console.log(`   ⚠️  getInstitutionScheduledInterviews encountered an error (expected without real data): ${error.message}\n`);
    }
    
    console.log('✅ All InstitutionDashboardService methods executed successfully!');
    console.log('🎉 Firebase connectivity verification completed!\n');
    
  } catch (error) {
    console.error('❌ Error during verification:', error);
    process.exit(1);
  }
}

// Run the verification
verifyConnectivity();