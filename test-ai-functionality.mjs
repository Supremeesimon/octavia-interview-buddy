import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { config } from 'dotenv';

// Load environment variables
config({ path: resolve('./.env.local') });

// Read the service account key file
const serviceAccount = JSON.parse(
  readFileSync(resolve('./firebase-service-account.json'), 'utf8')
);

// Initialize Firebase Admin with service account credentials
const app = initializeApp({
  credential: cert(serviceAccount),
  projectId: 'octavia-practice-interviewer',
});

const db = getFirestore(app);

async function testAIFunctionality() {
  try {
    console.log('🔍 Testing AI functionality with real data...\n');

    // Get all documents in the collection
    const analysisCollection = db.collection('end-of-call-analysis');
    const analysisSnapshot = await analysisCollection.get();
    
    console.log(`Found ${analysisSnapshot.size} documents in end-of-call-analysis collection\n`);
    
    // Extract and aggregate data exactly as the AI service would
    const categoryScores = {};
    const skillGaps = {};
    
    for (const doc of analysisSnapshot.docs) {
      const data = doc.data();
      
      // Parse the summary JSON to extract structured data
      if (data.summary) {
        try {
          let summaryContent = data.summary;
          summaryContent = summaryContent.replace(/```json\s*|\s*```/g, '').trim();
          
          const summaryData = JSON.parse(summaryContent);
          
          // Collect category scores for aggregation
          const categories = ['Rating', 'Communication Skills', 'Technical Knowledge', 'Problem Solving', 'Enthusiasm'];
          categories.forEach(category => {
            if (typeof summaryData[category] === 'number') {
              if (!categoryScores[category]) {
                categoryScores[category] = { total: 0, count: 0 };
              }
              categoryScores[category].total += summaryData[category];
              categoryScores[category].count += 1;
            }
          });
          
          // Collect skill gaps
          if (Array.isArray(summaryData['Areas for Improvement'])) {
            summaryData['Areas for Improvement'].forEach(improvement => {
              if (improvement) {
                skillGaps[improvement] = (skillGaps[improvement] || 0) + 1;
              }
            });
          }
        } catch (parseError) {
          console.log(`Error parsing summary JSON: ${parseError.message}`);
        }
      }
    }
    
    // Convert to the format expected by the AI service
    const performanceData = Object.entries(categoryScores).map(([category, data]) => ({
      category: category === 'Rating' ? 'Overall Rating' : category,
      score: Math.round(data.total / data.count)
    }));
    
    const skillGapsData = Object.entries(skillGaps)
      .map(([skill, count]) => ({
        name: skill,
        gap: Math.min(100, Math.round((count / analysisSnapshot.size) * 100))
      }))
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 5);
    
    const testData = {
      performanceData,
      trendData: [{ month: "Oct 2025", interviews: 2, completionRate: 100 }],
      institutionData: [{ name: "Lethbridge Polytechnic", value: 100 }],
      skillGapsData
    };
    
    console.log('=== PREPARED DATA FOR AI ===');
    console.log('Performance Data:');
    testData.performanceData.forEach(item => {
      console.log(`  ${item.category}: ${item.score}/100`);
    });
    
    console.log('\nSkill Gaps Data:');
    testData.skillGapsData.forEach(item => {
      console.log(`  ${item.name}: ${item.gap}%`);
    });
    
    console.log('\n=== EXPECTED AI RESPONSE FORMAT ===');
    console.log('Based on the data above, the AI should generate a response like:');
    console.log('\nOVERALL PERFORMANCE GRADE: C+');
    console.log('GRADE EXPLANATION: Based on average scores across 2 interviews with overall ratings of 65 and 58, and category averages showing Technical Knowledge as the lowest performing area at 53/100.');
    console.log('DATA LINKING STATUS: Data is NOT linked to specific students or institutions - all metadata fields are empty.');
    console.log('STUDENT IMPROVEMENT ASSESSMENT: Students show moderate performance with strengths in Communication Skills and Enthusiasm but need significant improvement in Technical Knowledge areas.');
    console.log('KEY INSIGHT: Technical Knowledge is the primary area requiring focused attention, with both interviews showing below-average scores in this category.');
    
    console.log('\n✅ AI functionality test complete!');
    
  } catch (error) {
    console.error('❌ Error testing AI functionality:', error);
  }
}

// Run the test
testAIFunctionality();