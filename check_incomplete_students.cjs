const admin = require('firebase-admin');
const serviceAccount = require('./src/service-account-key.json');

// Initialize Firebase Admin with service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'octavia-practice-interviewer',
  storageBucket: 'octavia-practice-interviewer.appspot.com'
});

const db = admin.firestore();

async function checkIncompleteStudents() {
  try {
    console.log('=== Checking for Incomplete Student Documents ===\n');
    
    // Get institutions
    const institutionsSnapshot = await db.collection('institutions').get();
    
    for (const institutionDoc of institutionsSnapshot.docs) {
      const institutionData = institutionDoc.data();
      console.log(`Institution: ${institutionData.name || 'Unnamed'} (ID: ${institutionDoc.id})`);
      
      // Get departments
      const departmentsSnapshot = await db.collection('institutions').doc(institutionDoc.id).collection('departments').get();
      
      for (const departmentDoc of departmentsSnapshot.docs) {
        const departmentData = departmentDoc.data();
        console.log(`  Department: ${departmentData.departmentName || 'Unnamed'} (ID: ${departmentDoc.id})`);
        
        // Get students
        const studentsSnapshot = await db.collection('institutions').doc(institutionDoc.id).collection('departments').doc(departmentDoc.id).collection('students').get();
        
        for (const studentDoc of studentsSnapshot.docs) {
          const studentData = studentDoc.data();
          console.log(`    Student ID: ${studentDoc.id}`);
          
          // Check for undefined or null fields
          const keys = Object.keys(studentData);
          let hasUndefinedField = false;
          
          for (const key of keys) {
            if (studentData[key] === undefined) {
              console.log(`      WARNING: Field "${key}" is undefined`);
              hasUndefinedField = true;
            }
          }
          
          if (!hasUndefinedField) {
            console.log(`      All fields are properly defined`);
          }
          
          console.log('---');
        }
      }
    }
    
    // Also check for any students that might be missing required fields
    console.log('\n=== Checking for Missing Required Fields ===\n');
    
    for (const institutionDoc of institutionsSnapshot.docs) {
      const institutionData = institutionDoc.data();
      console.log(`Institution: ${institutionData.name || 'Unnamed'} (ID: ${institutionDoc.id})`);
      
      const departmentsSnapshot = await db.collection('institutions').doc(institutionDoc.id).collection('departments').get();
      
      for (const departmentDoc of departmentsSnapshot.docs) {
        const departmentData = departmentDoc.data();
        console.log(`  Department: ${departmentData.departmentName || 'Unnamed'} (ID: ${departmentDoc.id})`);
        
        const studentsSnapshot = await db.collection('institutions').doc(institutionDoc.id).collection('departments').doc(departmentDoc.id).collection('students').get();
        
        for (const studentDoc of studentsSnapshot.docs) {
          const studentData = studentDoc.data();
          console.log(`    Student ID: ${studentDoc.id}`);
          
          // Check for required fields
          const requiredFields = ['name', 'email', 'role', 'institutionId', 'departmentId'];
          const missingFields = requiredFields.filter(field => !(field in studentData));
          
          if (missingFields.length > 0) {
            console.log(`      MISSING FIELDS: ${missingFields.join(', ')}`);
          } else {
            console.log(`      All required fields present`);
          }
          
          console.log('---');
        }
      }
    }
    
  } catch (error) {
    console.error('Error checking incomplete students:', error);
  } finally {
    // Clean up
    await admin.app().delete();
  }
}

checkIncompleteStudents();