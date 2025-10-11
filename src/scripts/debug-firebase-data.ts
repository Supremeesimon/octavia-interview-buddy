import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

async function debugFirebaseData() {
  try {
    console.log('=== Debugging Firebase Data ===');
    
    // Check if we can access the database
    console.log('Firestore instance:', !!db);
    
    // Try to list collections
    console.log('Attempting to list collections...');
    
    // Check interviews collection
    try {
      const interviewsRef = collection(db, 'interviews');
      const interviewsQuery = query(interviewsRef, orderBy('createdAt', 'desc'), limit(5));
      const interviewsSnapshot = await getDocs(interviewsQuery);
      console.log('Interviews count:', interviewsSnapshot.size);
      
      interviewsSnapshot.docs.forEach((doc, index) => {
        console.log(`Interview ${index + 1}:`, {
          id: doc.id,
          data: doc.data()
        });
      });
    } catch (error) {
      console.error('Error fetching interviews:', error);
    }
    
    // Check end-of-call-analysis collection
    try {
      const analysisRef = collection(db, 'end-of-call-analysis');
      const analysisQuery = query(analysisRef, orderBy('timestamp', 'desc'), limit(5));
      const analysisSnapshot = await getDocs(analysisQuery);
      console.log('End-of-call analysis count:', analysisSnapshot.size);
      
      analysisSnapshot.docs.forEach((doc, index) => {
        console.log(`Analysis ${index + 1}:`, {
          id: doc.id,
          data: doc.data()
        });
      });
    } catch (error) {
      console.error('Error fetching end-of-call analysis:', error);
    }
    
    // Check users collection
    try {
      const usersRef = collection(db, 'users');
      const usersQuery = query(usersRef, limit(5));
      const usersSnapshot = await getDocs(usersQuery);
      console.log('Users count:', usersSnapshot.size);
      
      usersSnapshot.docs.forEach((doc, index) => {
        console.log(`User ${index + 1}:`, {
          id: doc.id,
          data: doc.data()
        });
      });
    } catch (error) {
      console.error('Error fetching users:', error);
    }
    
  } catch (error) {
    console.error('General error:', error);
  }
}

// Run the debug function
debugFirebaseData();