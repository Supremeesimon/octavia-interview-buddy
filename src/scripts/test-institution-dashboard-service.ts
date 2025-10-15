#!/usr/bin/env node

/**
 * Test script for InstitutionDashboardService
 * This script tests the core functionality of the InstitutionDashboardService
 */

import { InstitutionDashboardService } from '../services/institution-dashboard.service';

async function testInstitutionDashboardService() {
  console.log('Testing InstitutionDashboardService...\n');
  
  // Test institution ID - this would be replaced with a real institution ID in practice
  const testInstitutionId = 'test-institution-id';
  
  try {
    console.log('1. Testing getInstitutionStudents...');
    const students = await InstitutionDashboardService.getInstitutionStudents(testInstitutionId);
    console.log(`   Found ${students.length} students\n`);
    
    console.log('2. Testing getInstitutionTeachers...');
    const teachers = await InstitutionDashboardService.getInstitutionTeachers(testInstitutionId);
    console.log(`   Found ${teachers.length} teachers\n`);
    
    console.log('3. Testing getInstitutionScheduledInterviews...');
    const interviews = await InstitutionDashboardService.getInstitutionScheduledInterviews(testInstitutionId);
    console.log(`   Found ${interviews.length} scheduled interviews\n`);
    
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Error during testing:', error);
  }
}

// Run the test
testInstitutionDashboardService();