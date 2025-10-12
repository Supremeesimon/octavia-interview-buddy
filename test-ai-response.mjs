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

// Import the AI analytics service
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { AIAnalyticsService } = require('./src/services/ai-analytics.service.ts');

async function testAIResponse() {
  try {
    console.log('🔍 Testing AI response with updated prompt...\n');

    // Create an instance of the AI analytics service
    const aiService = AIAnalyticsService.getInstance();
    
    // Set the Gemini API key if available
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (geminiApiKey) {
      aiService.setGeminiApiKey(geminiApiKey);
      console.log('✅ Gemini API key set');
    } else {
      console.log('⚠️  No Gemini API key found, using mock data');
    }

    // Prepare the data exactly as it would be sent to the AI
    const testData = {
      performanceData: [
        { category: "Overall Rating", score: 62 },
        { category: "Communication Skills", score: 68 },
        { category: "Technical Knowledge", score: 53 },
        { category: "Problem Solving", score: 63 },
        { category: "Enthusiasm", score: 68 }
      ],
      trendData: [
        { month: "Oct 2025", interviews: 2, completionRate: 100 }
      ],
      institutionData: [
        { name: "Lethbridge Polytechnic", value: 100 }
      ],
      skillGapsData: [
        { name: "Providing more specific examples and details in answers", gap: 50 },
        { name: "Structuring responses more effectively (e.g., STAR method)", gap: 50 },
        { name: "Expanding on technical knowledge and key areas for checks", gap: 50 },
        { name: "Providing more structured and detailed answers to technical questions.", gap: 50 },
        { name: "Deepening technical knowledge, especially regarding core WordPress concepts like themes vs. plugins.", gap: 50 }
      ]
    };

    console.log('=== DATA BEING SENT TO AI ===');
    console.log(JSON.stringify(testData, null, 2));
    console.log('');

    // Generate AI insights
    console.log('🤖 Generating AI insights...');
    const insights = await aiService.generateAIInsights(testData);
    
    console.log('=== AI RESPONSE ===');
    console.log(JSON.stringify(insights, null, 2));
    console.log('');
    
    console.log('✅ AI response test complete!');
    
  } catch (error) {
    console.error('❌ Error testing AI response:', error);
  }
}

// Run the test
testAIResponse();