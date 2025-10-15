import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

async function checkInstitutionData(institutionId: string) {
  try {
    console.log('Checking institution data for ID:', institutionId);
    
    // Fetch the institution document
    const institutionRef = doc(db, 'institutions', institutionId);
    const institutionSnap = await getDoc(institutionRef);
    
    if (institutionSnap.exists()) {
      const data = institutionSnap.data();
      console.log('Institution data:', JSON.stringify(data, null, 2));
      
      // Check specifically for sessionPool data
      if (data.sessionPool) {
        console.log('Session Pool data:', JSON.stringify(data.sessionPool, null, 2));
      } else {
        console.log('No sessionPool data found in institution document');
      }
    } else {
      console.log('No institution found with ID:', institutionId);
    }
  } catch (error) {
    console.error('Error checking institution data:', error);
  }
}

// Using one of the institution IDs from our database
checkInstitutionData('WxD3cWTybNsqkpj7OwW4');

export { checkInstitutionData };