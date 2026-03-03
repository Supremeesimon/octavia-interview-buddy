const admin = require('firebase-admin');
const serviceAccount = require('./functions/service-account-key.json');
const { v4: uuidv4 } = require('uuid');

// Initialize Firebase Admin SDK with service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function testCustomLinks() {
  try {
    console.log('🔍 Testing custom link system functionality...');
    
    // Test 1: Check institution signup links
    console.log('\n=== Testing Institution Signup Links ===');
    const institutionsRef = db.collection('institutions');
    const institutionsSnapshot = await institutionsRef.get();
    
    for (const institutionDoc of institutionsSnapshot.docs) {
      const institutionData = institutionDoc.data();
      console.log(`\nInstitution: ${institutionData.name} (${institutionDoc.id})`);
      
      // Check if custom signup link exists
      if (institutionData.customSignupLink) {
        console.log(`  ✅ Custom signup link: ${institutionData.customSignupLink}`);
      } else {
        console.log(`  ❌ No custom signup link found`);
      }
      
      // Check if custom signup token exists
      if (institutionData.customSignupToken) {
        console.log(`  ✅ Custom signup token: ${institutionData.customSignupToken}`);
      } else {
        console.log(`  ❌ No custom signup token found`);
      }
      
      // Test token validation
      if (institutionData.customSignupToken) {
        const q = db.collection('institutions').where('customSignupToken', '==', institutionData.customSignupToken);
        const querySnapshot = await q.get();
        
        if (!querySnapshot.empty) {
          console.log(`  ✅ Token validation successful`);
        } else {
          console.log(`  ❌ Token validation failed`);
        }
      }
    }
    
    // Test 2: Check department signup links
    console.log('\n=== Testing Department Signup Links ===');
    
    for (const institutionDoc of institutionsSnapshot.docs) {
      const institutionData = institutionDoc.data();
      console.log(`\nInstitution: ${institutionData.name} (${institutionDoc.id})`);
      
      // Get departments
      const departmentsRef = db.collection('institutions').doc(institutionDoc.id).collection('departments');
      const departmentsSnapshot = await departmentsRef.get();
      
      for (const departmentDoc of departmentsSnapshot.docs) {
        const departmentData = departmentDoc.data();
        console.log(`\n  Department: ${departmentData.departmentName} (${departmentDoc.id})`);
        
        // Check if department signup link exists
        if (departmentData.departmentSignupLink) {
          console.log(`    ✅ Department signup link: ${departmentData.departmentSignupLink}`);
        } else {
          console.log(`    ❌ No department signup link found`);
        }
        
        // Check if department signup token exists
        if (departmentData.departmentSignupToken) {
          console.log(`    ✅ Department signup token: ${departmentData.departmentSignupToken}`);
        } else {
          console.log(`    ❌ No department signup token found`);
        }
        
        // Test token validation
        if (departmentData.departmentSignupToken) {
          const q = db.collection('institutions').doc(institutionDoc.id).collection('departments').where('departmentSignupToken', '==', departmentData.departmentSignupToken);
          const querySnapshot = await q.get();
          
          if (!querySnapshot.empty) {
            console.log(`    ✅ Token validation successful`);
          } else {
            console.log(`    ❌ Token validation failed`);
          }
        }
      }
    }
    
    console.log('\n✅ Custom link system test completed!');
    
  } catch (error) {
    console.error('❌ Error during custom link system test:', error);
  } finally {
    // Clean up
    await admin.app().delete();
  }
}

testCustomLinks();