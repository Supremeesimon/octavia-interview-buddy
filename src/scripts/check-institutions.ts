import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

async function checkInstitutions() {
  try {
    console.log('Checking institutions in database...');
    const institutionsRef = collection(db, 'institutions');
    const snapshot = await getDocs(institutionsRef);
    
    console.log(`Found ${snapshot.size} institutions:`);
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`- ID: ${doc.id}, Name: ${data.name}`);
    });
    
    if (snapshot.empty) {
      console.log('No institutions found in database');
    }
  } catch (error) {
    console.error('Error checking institutions:', error);
  }
}

// Run the function
checkInstitutions();