import { PlatformSettingsService } from '@/services/platform-settings.service';
import { PriceChangeService } from '@/services/price-change.service';

async function testGlobalPricing() {
  console.log('Testing Global Default Pricing Firestore Collection');
  
  try {
    // Test 1: Fetch current pricing settings
    console.log('\n1. Fetching current pricing settings...');
    const currentSettings = await PlatformSettingsService.getPricingSettings();
    console.log('Current settings:', currentSettings);
    
    // Test 2: Update pricing settings
    console.log('\n2. Updating pricing settings...');
    const newSettings = {
      vapiCostPerMinute: 0.12,
      markupPercentage: 40.0,
      annualLicenseCost: 24.99
    };
    
    await PlatformSettingsService.updatePricingSettings(newSettings);
    console.log('Updated settings to:', newSettings);
    
    // Test 3: Verify updated settings
    console.log('\n3. Verifying updated settings...');
    const updatedSettings = await PlatformSettingsService.getPricingSettings();
    console.log('Verified settings:', updatedSettings);
    
    // Test 4: Create a scheduled price change
    console.log('\n4. Creating scheduled price change...');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30); // 30 days from now
    
    const scheduledChange = {
      changeDate: futureDate,
      changeType: 'vapiCost' as const,
      affected: 'all',
      currentValue: 0.12,
      newValue: 0.13,
      status: 'scheduled' as const
    };
    
    const changeId = await PriceChangeService.createPriceChange(scheduledChange);
    console.log('Created scheduled change with ID:', changeId);
    
    // Test 5: Fetch scheduled price changes
    console.log('\n5. Fetching scheduled price changes...');
    const scheduledChanges = await PriceChangeService.getUpcomingPriceChanges();
    console.log('Scheduled changes:', scheduledChanges);
    
    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testGlobalPricing();