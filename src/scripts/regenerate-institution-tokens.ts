import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { v4 as uuidv4 } from 'uuid';

async function regenerateInstitutionTokens() {
  try {
    console.log('Starting token regeneration for all institutions...');
    
    // Get all institutions
    const institutionsRef = collection(db, 'institutions');
    const snapshot = await getDocs(institutionsRef);
    
    console.log(`Found ${snapshot.size} institutions to update`);
    
    let updatedCount = 0;
    
    for (const docSnap of snapshot.docs) {
      try {
        // Generate new token and link
        const newToken = uuidv4();
        const newLink = `${window.location.origin}/signup-institution/${newToken}`;
        
        // Update the institution document
        await updateDoc(doc(db, 'institutions', docSnap.id), {
          customSignupToken: newToken,
          customSignupLink: newLink,
          updatedAt: new Date()
        });
        
        console.log(`Updated institution ${docSnap.id} with new token`);
        updatedCount++;
      } catch (error) {
        console.error(`Error updating institution ${docSnap.id}:`, error);
      }
    }
    
    console.log(`Successfully updated ${updatedCount} institutions`);
  } catch (error) {
    console.error('Error regenerating institution tokens:', error);
  }
}

// Run the function
regenerateInstitutionTokens().then(() => {
  console.log('Token regeneration complete');
}).catch((error) => {
  console.error('Token regeneration failed:', error);
});