import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

async function checkSpecificInstitution(institutionName: string) {
  try {
    console.log(`Checking for institution with name: "${institutionName}"`);
    const institutionsRef = collection(db, 'institutions');
    const q = query(institutionsRef, where('name', '==', institutionName));
    const snapshot = await getDocs(q);
    
    console.log(`Found ${snapshot.size} institutions with that name:`);
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`- ID: ${doc.id}, Name: ${data.name}, Data:`, data);
    });
    
    if (snapshot.empty) {
      console.log('No institutions found with that name');
      
      // Let's also check all institutions to see what names exist
      console.log('\nAll institutions in database:');
      const allInstitutions = await getDocs(institutionsRef);
      allInstitutions.forEach((doc) => {
        const data = doc.data();
        console.log(`- ID: ${doc.id}, Name: "${data.name}"`);
      });
    }
  } catch (error) {
    console.error('Error checking specific institution:', error);
  }
}

// Run the function with a specific institution name
// Replace 'Your Institution Name' with the actual name you're testing with
const institutionName = process.argv[2] || 'Your Institution Name';
checkSpecificInstitution(institutionName);