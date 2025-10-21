import { PlatformSettingsService } from '@/services/platform-settings.service';

async function checkPricingSettings() {
  try {
    console.log('Checking platform pricing settings...');
    const settings = await PlatformSettingsService.getAllSettings();
    
    if (settings) {
      console.log('Platform Pricing Settings:');
      console.log('- VAPI Cost Per Minute:', settings.vapiCostPerMinute);
      console.log('- Markup Percentage:', settings.markupPercentage);
      console.log('- Annual License Cost:', settings.annualLicenseCost);
      
      // Calculate the session price
      const sessionPrice = settings.vapiCostPerMinute * (1 + settings.markupPercentage / 100);
      console.log('- Calculated Session Price Per Minute:', sessionPrice.toFixed(4));
      
      console.log('\nMargin Alert Settings:');
      console.log('- Low Margin Threshold:', settings.lowMarginThreshold);
      console.log('- High VAPI Cost Threshold:', settings.highVapiCostThreshold);
      console.log('- Auto Price Adjustment:', settings.autoPriceAdjustment);
      console.log('- Email Notifications:', settings.emailNotifications);
    } else {
      console.log('No settings found or error occurred');
    }
  } catch (error) {
    console.error('Error checking pricing settings:', error);
  }
}

// Run the function
checkPricingSettings();