const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Load service account key
const serviceAccountPath = path.join(__dirname, '..', '..', 'functions', 'service-account-key.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkPricingSettings() {
  try {
    console.log('Checking platform pricing settings...\n');
    
    // Fetch the pricing settings document
    const settingsRef = db.collection('system_config').doc('pricing');
    const settingsSnap = await settingsRef.get();
    
    if (settingsSnap.exists) {
      const data = settingsSnap.data();
      console.log('Platform Pricing Settings:', JSON.stringify(data, null, 2));
      
      // Calculate the price per minute
      if (data.vapiCostPerMinute && data.markupPercentage) {
        const pricePerMinute = data.vapiCostPerMinute * (1 + data.markupPercentage / 100);
        console.log(`\nCalculated Price Per Minute: $${pricePerMinute.toFixed(2)}`);
      }
    } else {
      console.log('No pricing settings found in database. Using default values:');
      console.log('vapiCostPerMinute: 0.11');
      console.log('markupPercentage: 36.36');
      console.log('Calculated Price Per Minute: $0.15');
    }
  } catch (error) {
    console.error('Error checking pricing settings:', error);
  }
}

checkPricingSettings();