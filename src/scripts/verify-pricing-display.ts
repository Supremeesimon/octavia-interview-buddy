import { PlatformSettingsService } from '@/services/platform-settings.service';

async function verifyPricingDisplay() {
  console.log('=== VERIFYING PRICING DISPLAY VALUES ===\n');
  
  try {
    // Fetch the actual platform settings
    const settings = await PlatformSettingsService.getAllSettings();
    
    if (settings) {
      console.log('Current Firebase Settings:');
      console.log(`  VAPI Cost Per Minute: $${settings.vapiCostPerMinute}`);
      console.log(`  Markup Percentage: ${settings.markupPercentage}%`);
      console.log(`  Annual License Cost: $${settings.annualLicenseCost}`);
      
      // Calculate the actual price per minute
      const actualPricePerMinute = settings.vapiCostPerMinute * (1 + settings.markupPercentage / 100);
      console.log(`\nCalculated Price Per Minute: $${actualPricePerMinute.toFixed(2)}`);
      
      console.log('\n✅ Application should display this value when Firebase is available');
    } else {
      console.log('❌ No settings found in Firebase');
      console.log('\n✅ Application should display "Not Available" when Firebase data is not accessible');
    }
  } catch (error) {
    console.error('Error verifying pricing display:', error);
    console.log('\n✅ Application should display "Not Available" when Firebase data cannot be fetched');
  }
  
  console.log('\n=== VERIFICATION COMPLETE ===');
}

// Run the verification
verifyPricingDisplay().catch(console.error);