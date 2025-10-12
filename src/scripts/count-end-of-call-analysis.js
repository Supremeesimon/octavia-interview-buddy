import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../lib/firebase.js';

async function countEndOfCallAnalysisDocuments() {
  try {
    console.log('Counting documents in end-of-call-analysis collection...');
    
    // Create query for the end-of-call-analysis collection
    const q = query(collection(db, 'end-of-call-analysis'));
    
    // Get all documents
    const querySnapshot = await getDocs(q);
    
    console.log(`Found ${querySnapshot.size} documents in end-of-call-analysis collection`);
    
    // Log details of each document
    querySnapshot.forEach((doc, index) => {
      console.log(`Document ${index + 1}: ID = ${doc.id}`);
      // Limit the data output to avoid too much logging
      const data = doc.data();
      console.log(`Document ${index + 1} data:`, {
        id: doc.id,
        createdAt: data.createdAt,
        studentId: data.studentId || 'anonymous',
        overallScore: data.overallScore,
        // Only show first 200 characters of summary if it exists
        summary: data.summary ? data.summary.substring(0, 200) + '...' : 'No summary'
      });
    });
    
    return querySnapshot.size;
  } catch (error) {
    console.error('Error counting end-of-call-analysis documents:', error);
    return 0;
  }
}

// Run the function
countEndOfCallAnalysisDocuments().then(count => {
  console.log(`Total documents in end-of-call-analysis collection: ${count}`);
});

export default countEndOfCallAnalysisDocuments;