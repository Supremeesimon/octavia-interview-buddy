import { PlatformSettingsService } from '@/services/platform-settings.service';

async function debugPricingService() {
  console.log('Debugging PlatformSettingsService...');
  
  try {
    const settings = await PlatformSettingsService.getAllSettings();
    console.log('Platform settings:', settings);
    
    if (settings) {
      const calculatedPrice = settings.vapiCostPerMinute * (1 + settings.markupPercentage / 100);
      console.log('Calculated price per minute: $' + calculatedPrice.toFixed(2));
    } else {
      console.log('No settings returned from service');
    }
  } catch (error) {
    console.error('Error fetching platform settings:', error);
  }
}

debugPricingService();