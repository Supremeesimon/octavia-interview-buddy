import { InstitutionDashboardService } from '../services/institution-dashboard.service';
import { InstitutionService } from '../services/institution.service';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function checkSpecificInstitutionStudents(institutionId: string) {
  try {
    console.log(`=== Checking Institution ${institutionId} ===`);
    
    // Fetch the institution details
    const institution = await InstitutionService.getInstitutionById(institutionId);
    
    if (!institution) {
      console.log(`No institution found with ID: ${institutionId}`);
      return;
    }
    
    console.log(`Institution Name: ${institution.name}`);
    
    // Check if institution has departments
    const hasDepartments = await InstitutionDashboardService.institutionHasDepartments(institutionId);
    console.log(`Has departments: ${hasDepartments}`);
    
    if (hasDepartments) {
      // Fetch students if departments exist
      const students = await InstitutionDashboardService.getInstitutionStudents(institutionId);
      console.log(`Total students: ${students.length}`);
      
      // Fetch teachers if departments exist
      const teachers = await InstitutionDashboardService.getInstitutionTeachers(institutionId);
      console.log(`Total teachers: ${teachers.length}`);
      
      if (students.length > 0) {
        console.log('\nSample students:');
        students.slice(0, 5).forEach((student, index) => {
          console.log(`  ${index + 1}. ${student.name} (${student.email})`);
        });
        if (students.length > 5) {
          console.log(`  ... and ${students.length - 5} more`);
        }
      }
      
      if (teachers.length > 0) {
        console.log('\nSample teachers:');
        teachers.slice(0, 5).forEach((teacher, index) => {
          console.log(`  ${index + 1}. ${teacher.name} (${teacher.email})`);
        });
        if (teachers.length > 5) {
          console.log(`  ... and ${teachers.length - 5} more`);
        }
      }
    } else {
      console.log('No departments found. Students and teachers can only be created within departments.');
    }
    
  } catch (error) {
    console.error('Error checking institution students:', error);
  }
}

// Get institution ID from command line arguments or use a default
const institutionId = process.argv[2] || 'WxD3cWTybNsqkpj7OwW4'; // Default to a known institution ID

checkSpecificInstitutionStudents(institutionId);