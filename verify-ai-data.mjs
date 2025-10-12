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

async function verifyAIData() {
  try {
    console.log('🔍 Verifying AI data processing...\n');

    // Get all documents in the collection
    const analysisCollection = db.collection('end-of-call-analysis');
    const analysisSnapshot = await analysisCollection.get();
    
    console.log(`Found ${analysisSnapshot.size} documents in end-of-call-analysis collection\n`);
    
    if (analysisSnapshot.empty) {
      console.log('No documents found\n');
      return;
    }

    // Process each document and extract data
    const performanceData = [];
    const skillGapsData = [];
    
    // Category scores for aggregation
    const categoryScores = {};
    const skillGaps = {};
    
    for (const [index, doc] of analysisSnapshot.docs.entries()) {
      const data = doc.data();
      
      console.log(`=== Document ${index + 1}: ${doc.id} ===`);
      
      // Parse the summary JSON to extract structured data
      if (data.summary) {
        try {
          // The summary is a JSON string wrapped in markdown code blocks
          let summaryContent = data.summary;
          // Remove markdown code block wrappers if present
          summaryContent = summaryContent.replace(/```json\s*|\s*```/g, '').trim();
          
          const summaryData = JSON.parse(summaryContent);
          console.log(`Parsed Summary Rating: ${summaryData.Rating || 'N/A'}`);
          console.log(`Parsed Communication Skills: ${summaryData['Communication Skills'] || 'N/A'}`);
          console.log(`Parsed Technical Knowledge: ${summaryData['Technical Knowledge'] || 'N/A'}`);
          console.log(`Parsed Problem Solving: ${summaryData['Problem Solving'] || 'N/A'}`);
          console.log(`Parsed Enthusiasm: ${summaryData.Enthusiasm || 'N/A'}`);
          
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
      
      console.log(''); // Empty line for readability
    }
    
    // Convert category scores to performance data array
    const performanceDataArray = Object.entries(categoryScores).map(([category, data]) => ({
      category: category === 'Rating' ? 'Overall Rating' : category,
      score: Math.round(data.total / data.count)
    }));
    
    console.log('=== AGGREGATED PERFORMANCE DATA ===');
    performanceDataArray.forEach(item => {
      console.log(`${item.category}: ${item.score}/100`);
    });
    
    // Convert skill gaps to array and sort by frequency
    const skillGapsArray = Object.entries(skillGaps)
      .map(([skill, count]) => ({
        name: skill,
        gap: Math.min(100, Math.round((count / analysisSnapshot.size) * 100))
      }))
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 5); // Top 5 skill gaps
    
    console.log('\n=== TOP SKILL GAPS ===');
    skillGapsArray.forEach(item => {
      console.log(`${item.name}: ${item.gap}% of students need improvement`);
    });
    
    console.log('\n✅ Data verification complete!');
    
  } catch (error) {
    console.error('❌ Error verifying AI data:', error);
  }
}

// Run the verification
verifyAIData();