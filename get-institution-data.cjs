const admin = require('firebase-admin');
const serviceAccount = require('./functions/service-account-key.json');

// Initialize Firebase Admin SDK with service account credentials
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'octavia-practice-interviewer'
});

const db = admin.firestore();

async function getInstitutionData() {
  try {
    console.log('🔍 Fetching institution data from Firestore (Hierarchical Structure)...\n');
    
    // Get institutions collection
    const institutionsCollection = db.collection('institutions');
    const institutionsSnapshot = await institutionsCollection.get();
    
    console.log('=== INSTITUTION DATA ===');
    console.log(`Found ${institutionsSnapshot.size} institution(s):\n`);
    
    if (institutionsSnapshot.empty) {
      console.log('No institutions found in the database.');
      return;
    }
    
    // Show institution details
    institutionsSnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. Institution ID: ${doc.id}`);
      console.log(`   Name: ${data.name || 'N/A'}`);
      console.log(`   Domain: ${data.domain || 'N/A'}`);
      console.log(`   Created At: ${data.createdAt ? new Date(data.createdAt._seconds * 1000).toISOString() : 'N/A'}`);
      console.log('');
    });
    
    // Get users from all collections in the hierarchical structure
    console.log('=== USER DATA (Hierarchical Structure) ===');
    
    // Get platform admins
    console.log('--- Platform Admins ---');
    const platformAdminsCollection = db.collection('platformAdmins');
    const platformAdminsSnapshot = await platformAdminsCollection.get();
    
    console.log(`Found ${platformAdminsSnapshot.size} platform admin(s):\n`);
    
    platformAdminsSnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. Platform Admin ID: ${doc.id}`);
      console.log(`   Name: ${data.name || 'N/A'}`);
      console.log(`   Email: ${data.email || 'N/A'}`);
      console.log(`   Created At: ${data.createdAt ? new Date(data.createdAt._seconds * 1000).toISOString() : 'N/A'}`);
      console.log('');
    });
    
    // Get external users
    console.log('--- External Users ---');
    const externalUsersCollection = db.collection('externalUsers');
    const externalUsersSnapshot = await externalUsersCollection.get();
    
    console.log(`Found ${externalUsersSnapshot.size} external user(s):\n`);
    
    externalUsersSnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. External User ID: ${doc.id}`);
      console.log(`   Name: ${data.name || 'N/A'}`);
      console.log(`   Email: ${data.email || 'N/A'}`);
      console.log(`   Created At: ${data.createdAt ? new Date(data.createdAt._seconds * 1000).toISOString() : 'N/A'}`);
      console.log('');
    });
    
    // Get institutional users
    console.log('--- Institutional Users ---');
    let totalInstitutionalUsers = 0;
    
    for (const institutionDoc of institutionsSnapshot.docs) {
      const institutionId = institutionDoc.id;
      console.log(`\nInstitution: ${institutionId}`);
      
      // Get institution admins
      try {
        const adminsCollection = db.collection('institutions').doc(institutionId).collection('admins');
        const adminsSnapshot = await adminsCollection.get();
        
        if (adminsSnapshot.size > 0) {
          console.log(`  Admins (${adminsSnapshot.size}):`);
          adminsSnapshot.forEach((doc, index) => {
            totalInstitutionalUsers++;
            const data = doc.data();
            console.log(`    ${index + 1}. Admin ID: ${doc.id}`);
            console.log(`       Name: ${data.name || 'N/A'}`);
            console.log(`       Email: ${data.email || 'N/A'}`);
            console.log(`       Created At: ${data.createdAt ? new Date(data.createdAt._seconds * 1000).toISOString() : 'N/A'}`);
          });
        }
      } catch (error) {
        console.error(`  Error fetching admins for institution ${institutionId}:`, error.message);
      }
      
      // Get departments and their users
      try {
        const departmentsCollection = db.collection('institutions').doc(institutionId).collection('departments');
        const departmentsSnapshot = await departmentsCollection.get();
        
        for (const departmentDoc of departmentsSnapshot.docs) {
          const departmentId = departmentDoc.id;
          console.log(`  Department: ${departmentId}`);
          
          // Get teachers
          try {
            const teachersCollection = db.collection('institutions').doc(institutionId).collection('departments').doc(departmentId).collection('teachers');
            const teachersSnapshot = await teachersCollection.get();
            
            if (teachersSnapshot.size > 0) {
              console.log(`    Teachers (${teachersSnapshot.size}):`);
              teachersSnapshot.forEach((doc, index) => {
                totalInstitutionalUsers++;
                const data = doc.data();
                console.log(`      ${index + 1}. Teacher ID: ${doc.id}`);
                console.log(`         Name: ${data.name || 'N/A'}`);
                console.log(`         Email: ${data.email || 'N/A'}`);
                console.log(`         Created At: ${data.createdAt ? new Date(data.createdAt._seconds * 1000).toISOString() : 'N/A'}`);
              });
            }
          } catch (error) {
            console.error(`    Error fetching teachers for department ${departmentId}:`, error.message);
          }
          
          // Get students
          try {
            const studentsCollection = db.collection('institutions').doc(institutionId).collection('departments').doc(departmentId).collection('students');
            const studentsSnapshot = await studentsCollection.get();
            
            if (studentsSnapshot.size > 0) {
              console.log(`    Students (${studentsSnapshot.size}):`);
              studentsSnapshot.forEach((doc, index) => {
                totalInstitutionalUsers++;
                const data = doc.data();
                console.log(`      ${index + 1}. Student ID: ${doc.id}`);
                console.log(`         Name: ${data.name || 'N/A'}`);
                console.log(`         Email: ${data.email || 'N/A'}`);
                console.log(`         Created At: ${data.createdAt ? new Date(data.createdAt._seconds * 1000).toISOString() : 'N/A'}`);
              });
            }
          } catch (error) {
            console.error(`    Error fetching students for department ${departmentId}:`, error.message);
          }
        }
      } catch (error) {
        console.error(`  Error fetching departments for institution ${institutionId}:`, error.message);
      }
    }
    
    console.log(`\nTotal institutional users: ${totalInstitutionalUsers}`);
    console.log('\n✅ Data fetch complete!');
    
  } catch (error) {
    console.error('❌ Error fetching data:', error.message);
  } finally {
    // Clean up the Firebase app
    await admin.app().delete();
  }
}

// Run the function
getInstitutionData();