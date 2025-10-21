const admin = require('firebase-admin');

// Try to initialize with environment variables
try {
  // Get the Firebase config from environment variables
  const firebaseConfig = {
    projectId: process.env.VITE_FIREBASE_PROJECT_ID
  };

  console.log('Firebase Project ID:', firebaseConfig.projectId);

  // Initialize Firebase Admin SDK with default credentials
  admin.initializeApp({
    projectId: firebaseConfig.projectId
  });

  const db = admin.firestore();

  async function checkPricingData() {
    try {
      console.log('Checking pricing data in Firestore...');
      
      // Get the pricing document
      const docRef = db.collection('system_config').doc('pricing');
      const docSnap = await docRef.get();
      
      if (docSnap.exists) {
        const data = docSnap.data();
        console.log('Pricing data found:');
        console.log(JSON.stringify(data, null, 2));
        
        // Calculate the session price
        if (data.vapiCostPerMinute && data.markupPercentage) {
          const sessionPrice = data.vapiCostPerMinute * (1 + data.markupPercentage / 100);
          console.log(`\nCalculated session price: $${sessionPrice.toFixed(4)} per minute`);
          console.log(`For a 15-minute session: $${(sessionPrice * 15).toFixed(2)}`);
        }
      } else {
        console.log('No pricing data found in Firestore');
      }
    } catch (error) {
      console.error('Error checking pricing data:', error);
    } finally {
      // Don't delete the app as it might be needed elsewhere
    }
  }

  checkPricingData();
} catch (error) {
  console.error('Error initializing Firebase:', error);
}