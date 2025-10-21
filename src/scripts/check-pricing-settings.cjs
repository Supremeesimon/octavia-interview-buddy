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
    console.log('=== PLATFORM PRICING VERIFICATION ===\n');
    
    // Fetch the pricing settings document
    const settingsRef = db.collection('system_config').doc('pricing');
    const settingsSnap = await settingsRef.get();
    
    if (settingsSnap.exists) {
      const data = settingsSnap.data();
      console.log('Platform Pricing Settings:', JSON.stringify(data, null, 2));
      
      // Validate pricing values
      const issues = [];
      
      // VAPI cost validation
      if (typeof data.vapiCostPerMinute !== 'number' || data.vapiCostPerMinute < 0.05 || data.vapiCostPerMinute > 0.25) {
        issues.push(`VAPI cost out of acceptable range (0.05-0.25): ${data.vapiCostPerMinute}`);
      }
      
      // Markup percentage validation
      if (typeof data.markupPercentage !== 'number' || data.markupPercentage < 10 || data.markupPercentage > 100) {
        issues.push(`Markup percentage out of acceptable range (10-100): ${data.markupPercentage}`);
      }
      
      // License cost validation
      if (typeof data.annualLicenseCost !== 'number' || data.annualLicenseCost < 0) {
        issues.push(`License cost cannot be negative: ${data.annualLicenseCost}`);
      }
      
      // Calculate the price per minute
      if (data.vapiCostPerMinute && data.markupPercentage) {
        const pricePerMinute = data.vapiCostPerMinute * (1 + data.markupPercentage / 100);
        console.log(`\nCalculated Price Per Minute: $${pricePerMinute.toFixed(2)}`);
        
        // Check for reasonable pricing
        if (pricePerMinute < 0.05 || pricePerMinute > 0.50) {
          issues.push(`Calculated price per minute seems unreasonable: $${pricePerMinute.toFixed(2)}`);
        }
      }
      
      // Report issues
      if (issues.length > 0) {
        console.log('\n⚠️  PRICING ISSUES DETECTED:');
        issues.forEach((issue, index) => {
          console.log(`  ${index + 1}. ${issue}`);
        });
      } else {
        console.log('\n✅ All pricing values are within acceptable ranges');
      }
    } else {
      console.log('No pricing settings found in database. Using default values:');
      console.log('vapiCostPerMinute: 0.11');
      console.log('markupPercentage: 36.36');
      console.log('Calculated Price Per Minute: $0.15');
    }
    
    // Check for scheduled price changes
    console.log('\n=== SCHEDULED PRICE CHANGES ===');
    try {
      const scheduledChangesRef = db.collection('scheduled_price_changes');
      const scheduledChangesSnap = await scheduledChangesRef.where('status', '==', 'scheduled').get();
      
      if (!scheduledChangesSnap.empty) {
        console.log(`Found ${scheduledChangesSnap.size} scheduled price changes:`);
        scheduledChangesSnap.forEach(doc => {
          const change = doc.data();
          console.log(`  - ${change.changeType}: ${change.currentValue} → ${change.newValue} on ${change.changeDate.toDate().toISOString()}`);
        });
      } else {
        console.log('No scheduled price changes found');
      }
    } catch (error) {
      console.error('Error checking scheduled price changes:', error);
    }
    
    // Check institution pricing overrides
    console.log('\n=== INSTITUTION PRICING OVERRIDES ===');
    try {
      const institutionsRef = db.collection('institutions');
      const institutionsSnap = await institutionsRef.get();
      
      let overrideCount = 0;
      let invalidOverrideCount = 0;
      
      for (const doc of institutionsSnap.docs) {
        const institution = doc.data();
        if (institution.pricingOverride && institution.pricingOverride.isEnabled) {
          overrideCount++;
          
          const override = institution.pricingOverride;
          const issues = [];
          
          // Validate override values
          if (typeof override.customVapiCost !== 'number' || override.customVapiCost < 0.05 || override.customVapiCost > 0.25) {
            issues.push(`VAPI cost out of range: ${override.customVapiCost}`);
          }
          
          if (typeof override.customMarkupPercentage !== 'number' || override.customMarkupPercentage < 10 || override.customMarkupPercentage > 100) {
            issues.push(`Markup percentage out of range: ${override.customMarkupPercentage}`);
          }
          
          if (typeof override.customLicenseCost !== 'number' || override.customLicenseCost < 0) {
            issues.push(`License cost negative: ${override.customLicenseCost}`);
          }
          
          if (issues.length > 0) {
            invalidOverrideCount++;
            console.log(`  ⚠️  ${institution.name} (${doc.id}):`);
            issues.forEach(issue => console.log(`    - ${issue}`));
          }
        }
      }
      
      console.log(`Found ${overrideCount} institutions with pricing overrides (${invalidOverrideCount} with issues)`);
    } catch (error) {
      console.error('Error checking institution pricing overrides:', error);
    }
    
    console.log('\n=== VERIFICATION COMPLETE ===');
  } catch (error) {
    console.error('Error checking pricing settings:', error);
  }
}

checkPricingSettings();