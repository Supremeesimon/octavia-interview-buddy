import { InstitutionService } from '@/services/institution.service';

// Test function to debug institution data
async function debugInstitutionData() {
  try {
    console.log('Debugging institution data...');
    
    // Use a real institution ID from the test output
    const realInstitutionId = 'o27XAYG3ifHmWKM56aTV';
    
    // Fetch the institution document
    console.log('Fetching institution document...');
    const institution = await InstitutionService.getInstitutionById(realInstitutionId);
    
    if (institution) {
      console.log('Institution data:', JSON.stringify(institution, null, 2));
      
      // Check if sessionPool exists
      if (institution.sessionPool) {
        console.log('Session pool data:', JSON.stringify(institution.sessionPool, null, 2));
      } else {
        console.log('No session pool data found');
      }
    } else {
      console.log('Institution not found');
    }
    
    console.log('Debug completed!');
    
  } catch (error) {
    console.error('Error debugging institution data:', error);
  }
}

// Run the test
debugInstitutionData();

export default debugInstitutionData;