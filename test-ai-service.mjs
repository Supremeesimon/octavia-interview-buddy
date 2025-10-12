// Test the AI analytics service directly
console.log('Testing AI Analytics Service...');
console.log('============================');

// Import the AI analytics service
import('./src/services/ai-analytics.service.ts')
  .then(module => {
    const { aiAnalyticsService } = module;
    
    console.log('✅ AI Analytics Service imported successfully');
    
    // Test getSkillGapsData method
    console.log('\n🧪 Testing getSkillGapsData() method...');
    return aiAnalyticsService.getSkillGapsData();
  })
  .then(skillGapsData => {
    console.log(`✅ getSkillGapsData() returned ${skillGapsData.length} items`);
    console.log('Skill Gaps Data:', JSON.stringify(skillGapsData, null, 2));
  })
  .catch(error => {
    console.log('❌ Error testing AI analytics service:', error.message);
    console.log('Error stack:', error.stack);
  });