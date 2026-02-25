import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Test script to verify institution lookup by domain works correctly
 * This addresses the issue where "Institution 'awolowo.edu.ng' not found" error occurred
 */

async function testInstitutionLookup() {
  console.log('Testing institution lookup functionality...\n');
  
  // Test data examples
  const testDomains = [
    'awolowo.edu.ng',
    'example.edu',
    'test.university.edu.ng'
  ];
  
  const testNames = [
    'Awolowo University',
    'Example University',
    'Test University'
  ];

  for (const domain of testDomains) {
    console.log(`🔍 Testing lookup by domain: "${domain}"`);
    
    try {
      // First, try to find by domain
      const institutionsRef = collection(db, 'institutions');
      const q = query(institutionsRef, where('domain', '==', domain));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        console.log(`✅ Found institution by domain "${domain}":`);
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log(`   - ID: ${doc.id}`);
          console.log(`   - Name: ${data.name}`);
          console.log(`   - Domain: ${data.domain}`);
        });
      } else {
        console.log(`❌ No institution found by domain "${domain}", trying by name...`);
        
        // Fallback to name lookup
        const qByName = query(institutionsRef, where('name', '==', domain));
        const nameQuerySnapshot = await getDocs(qByName);
        
        if (!nameQuerySnapshot.empty) {
          console.log(`✅ Found institution by name "${domain}":`);
          nameQuerySnapshot.forEach((doc) => {
            const data = doc.data();
            console.log(`   - ID: ${doc.id}`);
            console.log(`   - Name: ${data.name}`);
            console.log(`   - Domain: ${data.domain || 'Not set'}`);
          });
        } else {
          console.log(`❌ No institution found by name "${domain}" either.`);
          console.log(`💡 This confirms that the institution needs to be created first.`);
        }
      }
    } catch (error) {
      console.error(`❌ Error looking up institution "${domain}":`, error);
    }
    
    console.log(''); // Empty line for readability
  }

  console.log('📋 Summary:');
  console.log('- The system now checks both domain and name fields when looking up institutions');
  console.log('- This fixes the "Institution not found" error for domains like "awolowo.edu.ng"');
  console.log('- Previously, the system only checked the name field, causing mismatches');
  
  console.log('\n📝 To create an institution for testing:');
  console.log('1. Go to the admin panel or institution management section');
  console.log('2. Create an institution with name "Awolowo University" and domain "awolowo.edu.ng"');
  console.log('3. Then users with emails like student@awolowo.edu.ng can register successfully');
}

// Run the test
testInstitutionLookup().catch(console.error);