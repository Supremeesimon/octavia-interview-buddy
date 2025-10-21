import { PlatformSettingsService } from '@/services/platform-settings.service';

async function debugPlatformSettings() {
  console.log('=== DEBUGGING PLATFORM SETTINGS ===');
  
  try {
    console.log('Calling PlatformSettingsService.getAllSettings()...');
    const settings = await PlatformSettingsService.getAllSettings();
    console.log('Result:', settings);
    
    if (settings) {
      const calculatedPrice = settings.vapiCostPerMinute * (1 + settings.markupPercentage / 100);
      console.log('Calculated price per minute:', calculatedPrice);
    }
  } catch (error) {
    console.error('Error fetching platform settings:', error);
  }
}

// Run the debug function
debugPlatformSettings();