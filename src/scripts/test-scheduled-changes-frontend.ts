import { PriceChangeService } from '@/services/price-change.service';

async function testScheduledChangesFrontend() {
  console.log('Testing scheduled price changes from frontend...');
  
  try {
    // Test creating a scheduled price change
    console.log('\n1. Creating a test scheduled price change...');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 7 days from now
    
    const testData = {
      changeDate: futureDate,
      changeType: 'licenseCost' as const,
      affected: 'all',
      currentValue: 19.96,
      newValue: 24.99,
      status: 'scheduled' as const
    };
    
    const changeId = await PriceChangeService.createPriceChange(testData);
    console.log('✅ Created scheduled change with ID:', changeId);
    
    // Test fetching all price changes
    console.log('\n2. Fetching all price changes...');
    const allChanges = await PriceChangeService.getAllPriceChanges();
    console.log('Found', allChanges.length, 'price changes');
    
    // Test fetching upcoming price changes
    console.log('\n3. Fetching upcoming price changes...');
    const upcomingChanges = await PriceChangeService.getUpcomingPriceChanges();
    console.log('Found', upcomingChanges.length, 'upcoming price changes');
    
    // Clean up - delete the test change
    if (changeId) {
      console.log('\n4. Cleaning up test data...');
      await PriceChangeService.deletePriceChange(changeId);
      console.log('✅ Deleted test change');
    }
    
    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testScheduledChangesFrontend();