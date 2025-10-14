const { InstitutionHierarchyService } = require('../services/institution-hierarchy.service');

async function findUser() {
  try {
    // The Platform Admin ID for Lethbridge Polytechnic from the database check
    const userId = 'NZpAsyNn0kWL4qV1vPhizF4tCrc2';
    
    console.log(`Looking up user with ID: ${userId}`);
    
    const result = await InstitutionHierarchyService.findUserById(userId);
    
    if (result) {
      console.log('User found:');
      console.log(`  Name: ${result.user.name}`);
      console.log(`  Email: ${result.user.email}`);
      console.log(`  Role: ${result.role}`);
      if (result.institutionId) {
        console.log(`  Institution ID: ${result.institutionId}`);
      }
    } else {
      console.log('User not found');
    }
  } catch (error) {
    console.error('Error finding user:', error);
  }
}

findUser();