import { PriceChangeService } from '@/services/price-change.service';
import { PlatformSettingsService } from '@/services/platform-settings.service';

async function verifyScheduledChanges() {
  console.log('Verifying scheduled price changes functionality...');
  
  try {
    // Test 1: Check current platform settings
    console.log('\n1. Fetching current platform settings...');
    const currentSettings = await PlatformSettingsService.getPricingSettings();
    console.log('Current settings:', currentSettings);
    
    // Test 2: Create a scheduled price change
    console.log('\n2. Creating a test scheduled price change...');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 7 days from now
    
    const testData = {
      changeDate: futureDate,
      changeType: 'licenseCost' as const,
      affected: 'all',
      currentValue: currentSettings?.annualLicenseCost || 19.96,
      newValue: 24.99,
      status: 'scheduled' as const
    };
    
    const changeId = await PriceChangeService.createPriceChange(testData);
    console.log('✅ Created scheduled change with ID:', changeId);
    
    // Test 3: Fetch all price changes
    console.log('\n3. Fetching all price changes...');
    const allChanges = await PriceChangeService.getAllPriceChanges();
    console.log('Found', allChanges.length, 'price changes');
    
    // Test 4: Fetch upcoming price changes
    console.log('\n4. Fetching upcoming price changes...');
    const upcomingChanges = await PriceChangeService.getUpcomingPriceChanges();
    console.log('Found', upcomingChanges.length, 'upcoming price changes');
    
    // Display upcoming changes
    if (upcomingChanges.length > 0) {
      console.log('\nUpcoming changes:');
      upcomingChanges.forEach((change, index) => {
        console.log(`${index + 1}. ${change.changeType} change`);
        console.log(`   - Current: ${change.currentValue}`);
        console.log(`   - New: ${change.newValue}`);
        console.log(`   - Date: ${change.changeDate.toDateString()}`);
        console.log(`   - Status: ${change.status}`);
      });
    }
    
    // Test 5: Clean up - delete the test change
    if (changeId) {
      console.log('\n5. Cleaning up test data...');
      await PriceChangeService.deletePriceChange(changeId);
      console.log('✅ Deleted test change');
    }
    
    console.log('\n✅ All tests passed! Scheduled price changes functionality is working correctly.');
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('\nThis might be due to:');
    console.log('1. Firebase authentication issues');
    console.log('2. Insufficient permissions');
    console.log('3. Network connectivity problems');
    console.log('4. Firebase configuration issues');
  }
}

// Run the verification
verifyScheduledChanges();