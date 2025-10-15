const admin = require('firebase-admin');
const serviceAccount = require('../../functions/service-account-key.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/**
 * Audit script to examine the complete Firestore structure
 * This script implements the audit requirements from Completion phase.txt
 */
async function auditFirestoreStructure() {
  console.log('=== FIRESTORE STRUCTURE AUDIT ===\n');
  
  try {
    // 1. Check institutions collection
    console.log('1. Checking institutions collection...');
    const institutionsSnapshot = await db.collection('institutions').get();
    console.log(`📊 Institutions: ${institutionsSnapshot.size} documents`);
    
    // Show details for first few institutions
    let institutionCount = 0;
    for (const instDoc of institutionsSnapshot.docs) {
      if (institutionCount >= 3) break; // Limit output for readability
      
      const instId = instDoc.id;
      const instData = instDoc.data();
      console.log(`\nInstitution: ${instData.name || instData.institutionName || 'Unnamed'} (${instId})`);
      console.log(`  Fields:`, Object.keys(instData));
      
      // Check admins subcollection
      try {
        const adminsSnapshot = await db
          .collection('institutions')
          .doc(instId)
          .collection('admins')
          .get();
        console.log(`  └─ Admins: ${adminsSnapshot.size}`);
      } catch (error) {
        console.log(`  └─ Admins: Error accessing - ${error.message}`);
      }
      
      // Check departments subcollection
      try {
        const deptsSnapshot = await db
          .collection('institutions')
          .doc(instId)
          .collection('departments')
          .get();
        console.log(`  └─ Departments: ${deptsSnapshot.size}`);
        
        // Show details for first few departments
        let deptCount = 0;
        for (const deptDoc of deptsSnapshot.docs) {
          if (deptCount >= 2) break; // Limit output for readability
          
          const deptId = deptDoc.id;
          const deptData = deptDoc.data();
          console.log(`      └─ ${deptData.departmentName || 'Unnamed Department'} (${deptId})`);
          
          // Check teachers
          try {
            const teachersSnapshot = await db
              .collection('institutions')
              .doc(instId)
              .collection('departments')
              .doc(deptId)
              .collection('teachers')
              .get();
            console.log(`          └─ Teachers: ${teachersSnapshot.size}`);
          } catch (error) {
            console.log(`          └─ Teachers: Error accessing - ${error.message}`);
          }
          
          // Check students
          try {
            const studentsSnapshot = await db
              .collection('institutions')
              .doc(instId)
              .collection('departments')
              .doc(deptId)
              .collection('students')
              .get();
            console.log(`          └─ Students: ${studentsSnapshot.size}`);
          } catch (error) {
            console.log(`          └─ Students: Error accessing - ${error.message}`);
          }
          
          deptCount++;
        }
      } catch (error) {
        console.log(`  └─ Departments: Error accessing - ${error.message}`);
      }
      
      institutionCount++;
    }
    
    // 2. Check interviews collection
    console.log('\n2. Checking interviews collection...');
    try {
      const interviewsSnapshot = await db.collection('interviews').get();
      console.log(`📊 Interviews: ${interviewsSnapshot.size} documents`);
      if (interviewsSnapshot.size > 0) {
        const sampleInterview = interviewsSnapshot.docs[0].data();
        console.log(`  Sample fields:`, Object.keys(sampleInterview));
      }
    } catch (error) {
      console.log(`📊 Interviews: Error accessing - ${error.message}`);
    }
    
    // 3. Check end-of-call-analysis collection
    console.log('\n3. Checking end-of-call-analysis collection...');
    try {
      const analysisSnapshot = await db.collection('end-of-call-analysis').get();
      console.log(`📊 End-of-Call Analysis: ${analysisSnapshot.size} documents`);
      if (analysisSnapshot.size > 0) {
        const sampleAnalysis = analysisSnapshot.docs[0].data();
        console.log(`  Sample fields:`, Object.keys(sampleAnalysis));
      }
    } catch (error) {
      console.log(`📊 End-of-Call Analysis: Error accessing - ${error.message}`);
    }
    
    // 4. Check institution_interests collection
    console.log('\n4. Checking institution_interests collection...');
    try {
      const interestsSnapshot = await db.collection('institution_interests').get();
      console.log(`📊 Institution Interests: ${interestsSnapshot.size} documents`);
    } catch (error) {
      console.log(`📊 Institution Interests: Error accessing - ${error.message}`);
    }
    
    // 5. Check financial_analytics collection
    console.log('\n5. Checking financial_analytics collection...');
    try {
      const financialSnapshot = await db.collection('financial_analytics').get();
      console.log(`📊 Financial Analytics: ${financialSnapshot.size} documents`);
    } catch (error) {
      console.log(`📊 Financial Analytics: Error accessing - ${error.message}`);
    }
    
    // 6. Check system_config collection
    console.log('\n6. Checking system_config collection...');
    try {
      const configSnapshot = await db.collection('system_config').get();
      console.log(`📊 System Config: ${configSnapshot.size} documents`);
      if (configSnapshot.size > 0) {
        configSnapshot.forEach(doc => {
          console.log(`  ${doc.id}:`, doc.data());
        });
      }
    } catch (error) {
      console.log(`📊 System Config: Error accessing - ${error.message}`);
    }
    
    // 7. Check users collection (legacy)
    console.log('\n7. Checking users collection (legacy)...');
    try {
      const usersSnapshot = await db.collection('users').get();
      console.log(`📊 Users (legacy): ${usersSnapshot.size} documents`);
    } catch (error) {
      console.log(`📊 Users (legacy): Error accessing - ${error.message}`);
    }
    
    // 8. Check any other collections that might exist
    console.log('\n8. Checking for other collections...');
    try {
      const collections = await db.listCollections();
      const collectionIds = collections.map(col => col.id);
      const knownCollections = [
        'institutions', 'interviews', 'end-of-call-analysis', 
        'institution_interests', 'financial_analytics', 'system_config', 'users'
      ];
      const unknownCollections = collectionIds.filter(id => !knownCollections.includes(id));
      
      if (unknownCollections.length > 0) {
        console.log(`📊 Other collections found: ${unknownCollections.join(', ')}`);
      } else {
        console.log(`📊 No other collections found`);
      }
    } catch (error) {
      console.log(`📊 Other collections: Error accessing - ${error.message}`);
    }
    
    console.log('\n=== AUDIT COMPLETE ===');
    
  } catch (error) {
    console.error('❌ Error during audit:', error);
  } finally {
    // Clean up
    await admin.app().delete();
  }
}

// Run the audit
auditFirestoreStructure();