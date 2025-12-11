import { db } from './lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';

async function checkFirebaseUsers() {
  try {
    console.log('Fetching users from Firebase Firestore...');
    
    // Fetch all institutions
    console.log('\n=== FETCHING INSTITUTIONS ===');
    const institutionsQuery = query(collection(db, 'institutions'));
    const institutionsSnapshot = await getDocs(institutionsQuery);
    
    console.log(`Found ${institutionsSnapshot.size} institutions:`);
    institutionsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`- Institution: ${data.name || 'Unnamed'} (ID: ${doc.id})`);
      console.log(`  Domain: ${data.domain || 'No domain'}`);
      console.log(`  Status: ${data.approvalStatus || 'No status'}`);
      console.log(`  Created: ${data.createdAt?.toDate()?.toString() || 'No date'}`);
      console.log('');
    });
    
    // Fetch platform settings
    console.log('\n=== FETCHING PLATFORM SETTINGS ===');
    const settingsQuery = query(collection(db, 'system_config'));
    const settingsSnapshot = await getDocs(settingsQuery);
    
    console.log(`Found ${settingsSnapshot.size} settings documents:`);
    settingsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`- Document ID: ${doc.id}`);
      console.log(`  VAPI Cost: ${data.vapiCostPerMinute || 'Not set'}`);
      console.log(`  Markup: ${data.markupPercentage || 'Not set'}%`);
      console.log(`  Updated: ${data.updatedAt?.toDate()?.toString() || 'No date'}`);
      console.log('');
    });
    
    console.log('✅ Firebase data fetch completed successfully');
    
  } catch (error) {
    console.error('❌ Error fetching Firebase data:', error);
  }
}

// Also check the backend database for users
async function checkPostgreSQLUsers() {
  try {
    console.log('\n=== CHECKING POSTGRESQL USERS ===');
    console.log('To check PostgreSQL users, you would need to run a query like:');
    console.log('SELECT id, email, name, role, institution_id, firebase_uid FROM users;');
    console.log('This requires direct database access which is not available in this frontend script.');
  } catch (error) {
    console.error('Error with PostgreSQL check:', error);
  }
}

// Run the checks
checkFirebaseUsers()
  .then(() => checkPostgreSQLUsers())
  .then(() => {
    console.log('\n🔍 Summary:');
    console.log('- Institutions and platform settings have been fetched from Firebase');
    console.log('- For detailed user information, check the PostgreSQL database directly');
    console.log('- User emails and roles are stored in the PostgreSQL "users" table');
    console.log('- Firebase is used primarily for authentication and institutional data');
  });