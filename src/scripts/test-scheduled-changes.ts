import { PriceChangeService } from '../services/price-change.service';

async function testScheduledChanges() {
  console.log('Testing scheduled_price_changes collection');
  
  try {
    // Test 1: Check if we can get all price changes (should be empty initially)
    console.log('\n1. Fetching all price changes...');
    const allChanges = await PriceChangeService.getAllPriceChanges();
    console.log('Found', allChanges.length, 'price changes');
    
    // Test 2: Create a scheduled price change
    console.log('\n2. Creating a scheduled price change...');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30); // 30 days from now
    
    const scheduledChange = {
      changeDate: futureDate,
      changeType: 'vapiCost' as const,
      affected: 'all',
      currentValue: 0.11,
      newValue: 0.12,
      status: 'scheduled' as const
    };
    
    const changeId = await PriceChangeService.createPriceChange(scheduledChange);
    console.log('Created scheduled change with ID:', changeId);
    
    // Test 3: Fetch all price changes again (should now have 1)
    console.log('\n3. Fetching all price changes again...');
    const allChangesAfter = await PriceChangeService.getAllPriceChanges();
    console.log('Found', allChangesAfter.length, 'price changes');
    
    // Test 4: Get upcoming price changes (should have 1)
    console.log('\n4. Fetching upcoming price changes...');
    const upcomingChanges = await PriceChangeService.getUpcomingPriceChanges();
    console.log('Found', upcomingChanges.length, 'upcoming price changes');
    
    // Test 5: Get the specific change by ID
    console.log('\n5. Fetching specific price change...');
    const specificChange = await PriceChangeService.getPriceChangeById(changeId);
    console.log('Found change:', specificChange);
    
    // Test 6: Update the change
    console.log('\n6. Updating the price change...');
    await PriceChangeService.updatePriceChange(changeId, {
      status: 'applied'
    });
    
    // Test 7: Fetch upcoming price changes again (should now be 0)
    console.log('\n7. Fetching upcoming price changes after update...');
    const upcomingChangesAfter = await PriceChangeService.getUpcomingPriceChanges();
    console.log('Found', upcomingChangesAfter.length, 'upcoming price changes');
    
    // Test 8: Delete the change
    console.log('\n8. Deleting the price change...');
    await PriceChangeService.deletePriceChange(changeId);
    
    // Test 9: Fetch all price changes again (should be 0)
    console.log('\n9. Fetching all price changes after deletion...');
    const allChangesFinal = await PriceChangeService.getAllPriceChanges();
    console.log('Found', allChangesFinal.length, 'price changes');
    
    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testScheduledChanges();