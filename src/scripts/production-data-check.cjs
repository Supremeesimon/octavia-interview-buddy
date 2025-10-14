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

async function checkProductionData() {
  try {
    console.log('=== PRODUCTION DATA VERIFICATION ===\n');
    
    // 1. Check system configuration
    console.log('1. SYSTEM CONFIGURATION CHECK');
    try {
      const configDoc = await db.collection('system_config').doc('pricing').get();
      if (configDoc.exists) {
        const configData = configDoc.data();
        console.log('   ✅ System pricing configuration exists');
        console.log(`      VAPI Cost: $${configData.vapiCostPerMinute}`);
        console.log(`      Markup: ${configData.markupPercentage}%`);
        console.log(`      License Cost: $${configData.annualLicenseCost}`);
      } else {
        console.log('   ❌ System pricing configuration MISSING');
      }
    } catch (error) {
      console.log('   ❌ Error checking system configuration:', error.message);
    }
    
    // 2. Check platform admins
    console.log('\n2. PLATFORM ADMINS CHECK');
    try {
      const adminsSnapshot = await db.collection('platformAdmins').get();
      console.log(`   Found ${adminsSnapshot.size} platform admins`);
      if (!adminsSnapshot.empty) {
        adminsSnapshot.forEach(doc => {
          const adminData = doc.data();
          console.log(`   ✅ Admin: ${adminData.name} (${adminData.email})`);
        });
      } else {
        console.log('   ❌ No platform admins found');
      }
    } catch (error) {
      console.log('   ❌ Error checking platform admins:', error.message);
    }
    
    // 3. Check institutions
    console.log('\n3. INSTITUTIONS CHECK');
    try {
      const institutionsSnapshot = await db.collection('institutions').get();
      console.log(`   Found ${institutionsSnapshot.size} institutions`);
      if (!institutionsSnapshot.empty) {
        for (const doc of institutionsSnapshot.docs) {
          const instData = doc.data();
          console.log(`   Institution: ${instData.name}`);
          console.log(`     ID: ${doc.id}`);
          // Updated to check for platform_admin_id instead of admin_id
          console.log(`     Platform Admin ID: ${instData.platform_admin_id || instData.adminId || 'NOT SET'}`);
          console.log(`     Active: ${instData.isActive ? 'Yes' : 'No'}`);
          // Removed domain check as it's not needed anymore
          
          // Check if institution has proper settings
          if (instData.settings) {
            console.log('     ✅ Settings configured');
          } else {
            console.log('     ❌ Settings MISSING');
          }
          
          // Check if institution has session pool
          if (instData.sessionPool) {
            console.log('     ✅ Session pool configured');
          } else {
            console.log('     ❌ Session pool MISSING');
          }
        }
      } else {
        console.log('   ⚠️  No institutions found');
      }
    } catch (error) {
      console.log('   ❌ Error checking institutions:', error.message);
    }
    
    // 4. Check institution interests
    console.log('\n4. INSTITUTION INTERESTS CHECK');
    try {
      const interestsSnapshot = await db.collection('institution_interests').get();
      console.log(`   Found ${interestsSnapshot.size} institution interests`);
      interestsSnapshot.forEach(doc => {
        const interestData = doc.data();
        console.log(`   Interest from: ${interestData.institutionName}`);
        console.log(`     Status: ${interestData.status}`);
        console.log(`     Contact: ${interestData.contactName} (${interestData.email})`);
      });
    } catch (error) {
      console.log('   ❌ Error checking institution interests:', error.message);
    }
    
    // 5. Check messages and broadcast history
    console.log('\n5. MESSAGES AND BROADCAST CHECK');
    try {
      const messagesSnapshot = await db.collection('messages').get();
      console.log(`   Found ${messagesSnapshot.size} messages`);
      
      const broadcastSnapshot = await db.collection('broadcast_history').get();
      console.log(`   Found ${broadcastSnapshot.size} broadcast records`);
    } catch (error) {
      console.log('   ❌ Error checking messages:', error.message);
    }
    
    // 6. Check end-of-call-analysis
    console.log('\n6. END-OF-CALL ANALYSIS CHECK');
    try {
      const analysisSnapshot = await db.collection('end-of-call-analysis').get();
      console.log(`   Found ${analysisSnapshot.size} analysis records`);
    } catch (error) {
      console.log('   ❌ Error checking analysis data:', error.message);
    }
    
    // 7. Check for essential collections that might be missing
    console.log('\n7. MISSING COLLECTIONS CHECK');
    try {
      const collections = await db.listCollections();
      const collectionNames = collections.map(col => col.id);
      
      const essentialCollections = [
        'institutions',
        'institution_interests',
        'platformAdmins',
        'system_config',
        'messages',
        'broadcast_history',
        'end-of-call-analysis'
      ];
      
      const missingCollections = essentialCollections.filter(col => !collectionNames.includes(col));
      
      if (missingCollections.length === 0) {
        console.log('   ✅ All essential collections present');
      } else {
        console.log('   ❌ Missing collections:', missingCollections.join(', '));
      }
    } catch (error) {
      console.log('   ❌ Error checking collections:', error.message);
    }
    
    // 8. Check for orphaned data (institutions without admins, etc.)
    console.log('\n8. DATA INTEGRITY CHECK');
    try {
      // Check institutions with missing admin references
      const institutionsSnapshot = await db.collection('institutions').get();
      let orphanedInstitutions = 0;
      
      for (const doc of institutionsSnapshot.docs) {
        const instData = doc.data();
        // Updated to check for platform_admin_id instead of admin_id
        const platformAdminId = instData.platform_admin_id || instData.adminId;
        if (platformAdminId) {
          try {
            const adminDoc = await db.collection('platformAdmins').doc(platformAdminId).get();
            if (!adminDoc.exists) {
              console.log(`   ⚠️  Institution ${instData.name} references non-existent platform admin ID: ${platformAdminId}`);
              orphanedInstitutions++;
            }
          } catch (adminError) {
            console.log(`   ⚠️  Error checking admin reference for institution ${instData.name}:`, adminError.message);
          }
        }
      }
      
      if (orphanedInstitutions === 0) {
        console.log('   ✅ No orphaned institution-admin references found');
      }
      
      // Check institution interests with processed status but no corresponding institution
      const interestsSnapshot = await db.collection('institution_interests').get();
      let processedWithoutInstitution = 0;
      
      for (const doc of interestsSnapshot.docs) {
        const interestData = doc.data();
        if (interestData.status === 'processed') {
          try {
            const institutionQuery = await db.collection('institutions')
              .where('name', '==', interestData.institutionName.trim())
              .get();
            
            if (institutionQuery.empty) {
              console.log(`   ⚠️  Processed interest for "${interestData.institutionName}" has no corresponding institution`);
              processedWithoutInstitution++;
            }
          } catch (instError) {
            console.log(`   ⚠️  Error checking institution for processed interest:`, instError.message);
          }
        }
      }
      
      if (processedWithoutInstitution === 0) {
        console.log('   ✅ All processed interests have corresponding institutions');
      }
      
    } catch (error) {
      console.log('   ❌ Error checking data integrity:', error.message);
    }
    
    console.log('\n=== VERIFICATION COMPLETE ===');
    
  } catch (error) {
    console.error('Error during production data check:', error);
  } finally {
    // Clean up the app
    if (admin.apps.length > 0) {
      admin.app().delete();
    }
  }
}

// Run the check
checkProductionData().catch(console.error);