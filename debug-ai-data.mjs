import { config } from 'dotenv';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load environment variables
config({ path: '.env.local' });

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

async function debugAIData() {
  try {
    console.log('🔍 Debugging AI data preparation...\n');

    // Get all documents in the collection
    const analysisCollection = db.collection('end-of-call-analysis');
    const analysisSnapshot = await analysisCollection.get();
    
    console.log(`Found ${analysisSnapshot.size} documents in end-of-call-analysis collection\n`);
    
    // Simulate what the AI analytics service does
    console.log('=== SIMULATING AI ANALYTICS SERVICE DATA EXTRACTION ===\n');
    
    // Performance Data Extraction
    console.log('PERFORMANCE DATA EXTRACTION:');
    const categoryScores = {};
    
    analysisSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`Document ${index + 1}: ${doc.id}`);
      
      // Parse the summary JSON to extract structured data
      if (data.summary) {
        try {
          // Remove markdown code block wrappers if present
          let summaryContent = data.summary;
          summaryContent = summaryContent.replace(/```json\s*|\s*```/g, '').trim();
          
          const summaryData = JSON.parse(summaryContent);
          console.log(`  Parsed Rating: ${summaryData.Rating || 'N/A'}`);
          console.log(`  Parsed Communication Skills: ${summaryData['Communication Skills'] || 'N/A'}`);
          console.log(`  Parsed Technical Knowledge: ${summaryData['Technical Knowledge'] || 'N/A'}`);
          console.log(`  Parsed Problem Solving: ${summaryData['Problem Solving'] || 'N/A'}`);
          console.log(`  Parsed Enthusiasm: ${summaryData.Enthusiasm || 'N/A'}`);
          
          // Collect category scores
          if (typeof summaryData['Rating'] === 'number') {
            if (!categoryScores['Overall Rating']) {
              categoryScores['Overall Rating'] = { total: 0, count: 0 };
            }
            categoryScores['Overall Rating'].total += summaryData['Rating'];
            categoryScores['Overall Rating'].count += 1;
          }
          
          if (typeof summaryData['Communication Skills'] === 'number') {
            if (!categoryScores['Communication Skills']) {
              categoryScores['Communication Skills'] = { total: 0, count: 0 };
            }
            categoryScores['Communication Skills'].total += summaryData['Communication Skills'];
            categoryScores['Communication Skills'].count += 1;
          }
          
          if (typeof summaryData['Technical Knowledge'] === 'number') {
            if (!categoryScores['Technical Knowledge']) {
              categoryScores['Technical Knowledge'] = { total: 0, count: 0 };
            }
            categoryScores['Technical Knowledge'].total += summaryData['Technical Knowledge'];
            categoryScores['Technical Knowledge'].count += 1;
          }
          
          if (typeof summaryData['Problem Solving'] === 'number') {
            if (!categoryScores['Problem Solving']) {
              categoryScores['Problem Solving'] = { total: 0, count: 0 };
            }
            categoryScores['Problem Solving'].total += summaryData['Problem Solving'];
            categoryScores['Problem Solving'].count += 1;
          }
          
          if (typeof summaryData['Enthusiasm'] === 'number') {
            if (!categoryScores['Enthusiasm']) {
              categoryScores['Enthusiasm'] = { total: 0, count: 0 };
            }
            categoryScores['Enthusiasm'].total += summaryData['Enthusiasm'];
            categoryScores['Enthusiasm'].count += 1;
          }
        } catch (parseError) {
          console.log(`  Error parsing summary JSON: ${parseError.message}`);
        }
      }
      console.log('');
    });
    
    // Convert to array format
    const performanceData = Object.entries(categoryScores).map(([category, data]) => ({
      category,
      score: Math.round(data.total / data.count)
    }));
    
    console.log('FINAL PERFORMANCE DATA FOR AI:');
    performanceData.forEach(item => {
      console.log(`  ${item.category}: ${item.score}/100`);
    });
    console.log('');
    
    // Skill Gaps Data Extraction
    console.log('SKILL GAPS DATA EXTRACTION:');
    const skillGaps = {};
    
    analysisSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      
      // Parse the summary JSON to extract improvement areas
      if (data.summary) {
        try {
          // Remove markdown code block wrappers if present
          let summaryContent = data.summary;
          summaryContent = summaryContent.replace(/```json\s*|\s*```/g, '').trim();
          
          const summaryData = JSON.parse(summaryContent);
          
          // Extract areas for improvement from the parsed summary
          if (Array.isArray(summaryData['Areas for Improvement'])) {
            console.log(`Document ${index + 1} Areas for Improvement:`);
            summaryData['Areas for Improvement'].forEach((improvement, i) => {
              console.log(`  ${i + 1}. ${improvement}`);
              if (improvement) {
                skillGaps[improvement] = (skillGaps[improvement] || 0) + 1;
              }
            });
          }
        } catch (parseError) {
          console.log(`  Error parsing summary JSON for skill gaps: ${parseError.message}`);
        }
      }
      console.log('');
    });
    
    // Convert to array format and sort by frequency
    const skillGapsData = Object.entries(skillGaps)
      .map(([skill, count]) => ({
        name: skill,
        gap: Math.min(100, Math.round((count / analysisSnapshot.docs.length) * 100))
      }))
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 5); // Top 5 skill gaps
    
    console.log('FINAL SKILL GAPS DATA FOR AI:');
    skillGapsData.forEach(item => {
      console.log(`  ${item.name}: ${item.gap}% of students need improvement`);
    });
    console.log('');
    
    // Institution Data
    console.log('INSTITUTION DATA:');
    console.log('  Lethbridge Polytechnic: 100% usage (assumed from having one institutional partner)');
    console.log('');
    
    // Trend Data
    console.log('TREND DATA:');
    console.log('  October 2025: 2 interviews, completion rate unknown');
    console.log('');
    
    console.log('✅ Debug complete!');
    
  } catch (error) {
    console.error('❌ Error debugging AI data:', error);
  }
}

// Run the debug
debugAIData();