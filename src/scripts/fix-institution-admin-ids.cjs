const admin = require('firebase-admin');
const serviceAccount = require('../../functions/service-account-key.json');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://octavia-practice-interviewer.firebaseio.com'
  });
}

const db = admin.firestore();

async function fixInstitutionAdminIds() {
  try {
    console.log('Checking institutions for missing admin IDs...\n');
    
    // Get all platform admins to find the default admin
    const adminSnapshot = await db.collection('platformAdmins').get();
    let defaultAdminId = null;
    
    if (!adminSnapshot.empty) {
      // Use the first platform admin as the default
      defaultAdminId = adminSnapshot.docs[0].id;
      const adminData = adminSnapshot.docs[0].data();
      console.log(`Default admin found: ${adminData.name} (${adminData.email}) - ID: ${defaultAdminId}`);
    } else {
      console.log('No platform admins found!');
      return;
    }
    
    // Get all institutions
    const institutionSnapshot = await db.collection('institutions').get();
    console.log(`\nFound ${institutionSnapshot.size} institutions.`);
    
    let fixedCount = 0;
    
    // Check each institution
    for (const doc of institutionSnapshot.docs) {
      const data = doc.data();
      console.log(`\nChecking institution: ${data.name} (ID: ${doc.id})`);
      console.log(`  Current Admin ID: ${data.adminId || 'NOT SET'}`);
      
      // If adminId is not set, update it
      if (!data.adminId || data.adminId === '') {
        try {
          await db.collection('institutions').doc(doc.id).update({
            adminId: defaultAdminId
          });
          console.log(`  ✅ Updated institution with admin ID: ${defaultAdminId}`);
          fixedCount++;
        } catch (updateError) {
          console.error(`  ❌ Failed to update institution:`, updateError.message);
        }
      } else {
        console.log(`  ℹ️  Admin ID already set`);
      }
    }
    
    console.log(`\n--- Fix Complete ---`);
    console.log(`Updated ${fixedCount} institutions with admin IDs.`);
    
  } catch (error) {
    console.error('Error fixing institution admin IDs:', error);
  } finally {
    // Clean up the app
    if (admin.apps.length > 0) {
      admin.app().delete();
    }
  }
}

// Run the fix
fixInstitutionAdminIds().catch(console.error);