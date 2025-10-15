import { InstitutionService } from '@/services/institution.service';

// Test function to verify signup link functionality
async function testSignupLinkFunctionality() {
  try {
    console.log('Testing signup link functionality...');
    
    // Use a real institution ID from the test output
    const realInstitutionId = 'o27XAYG3ifHmWKM56aTV';
    
    // Fetch the institution document
    console.log('Fetching institution document...');
    const institution = await InstitutionService.getInstitutionById(realInstitutionId);
    
    if (institution) {
      console.log('Institution name:', institution.name);
      console.log('Custom signup token:', institution.customSignupToken);
      console.log('Custom signup link:', institution.customSignupLink);
      
      // Test regenerating the signup token
      console.log('Regenerating signup token...');
      const { token, link } = await InstitutionService.regenerateSignupToken(realInstitutionId);
      
      console.log('New token:', token);
      console.log('New link:', link);
      
      // Verify the new link is different
      if (link !== institution.customSignupLink) {
        console.log('✅ Signup link successfully regenerated!');
      } else {
        console.log('❌ Signup link was not regenerated');
      }
      
      // Test the link format
      if (link.startsWith('http://localhost:8080/signup-institution/')) {
        console.log('✅ Link format is correct');
      } else {
        console.log('❌ Link format is incorrect');
      }
      
      // Test that the link contains a UUID
      const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
      if (uuidRegex.test(link)) {
        console.log('✅ Link contains a valid UUID');
      } else {
        console.log('❌ Link does not contain a valid UUID');
      }
    } else {
      console.log('Institution not found');
    }
    
    console.log('Signup link functionality test completed!');
    
  } catch (error) {
    console.error('Error testing signup link functionality:', error);
  }
}

// Run the test
testSignupLinkFunctionality();

export default testSignupLinkFunctionality;