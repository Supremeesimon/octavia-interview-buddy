import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Mock the AIAnalyticsService class to test just the prompt generation
class MockAIAnalyticsService {
  /**
   * Create a prompt for Gemini based on the data
   */
  createPromptFromData(data) {
    const prompt = `You are an AI expert in educational technology and workforce development, analyzing interview practice platform data. 

YOUR PRIMARY TASK: Provide a high-level performance assessment and grade (A-F) for the overall platform performance based on all aggregated interview data. This is for platform administrators to quickly understand how Octavia is improving students.

IMPORTANT CONTEXT ABOUT CURRENT DATA STATE:
1. The platform is in production with Lethbridge Polytechnic as our first and only institutional partner.
2. We have collected exactly 2 interview analysis reports today (October 11, 2025) from users of our platform.
3. CRITICAL: The data is NOT yet linked to specific students or institutions - all metadata fields are empty.
4. This means we're working with aggregate anonymous data from just 2 interviews, not personalized student data.
5. Each analysis contains rich structured data including:
   - Overall ratings (out of 100)
   - Category scores (Communication Skills, Technical Knowledge, Problem Solving, Enthusiasm)
   - Strengths, Areas for Improvement, and Recommendations
6. The data you are receiving is REAL and ACCURATE - do not assume it's missing or incomplete.
7. This is a temporary technical limitation we are actively working to resolve by properly associating data with users.

YOUR SPECIFIC INSTRUCTIONS:
1. Provide a single overall performance grade (A-F) based on all aggregated data
2. Give a brief explanation of how you calculated this grade
3. State clearly whether the data is linked to institutions or not
4. Provide a high-level assessment of student performance improvement
5. Keep your response concise and focused on the overall assessment

Here are the actual structured data documents you are analyzing:

Document 1:
Overall Rating: 65
Communication Skills: 70
Technical Knowledge: 60
Problem Solving: 65
Enthusiasm: 75
3 Strengths
3 Areas for Improvement
3 Recommendations

Document 2:
Overall Rating: 58
Communication Skills: 65
Technical Knowledge: 45
Problem Solving: 60
Enthusiasm: 60
3 Strengths
3 Areas for Improvement
3 Recommendations

Analyze the following interview platform data and provide your assessment:

Performance Data (category scores out of 100):
${data.performanceData?.map((item) => `- ${item.category}: ${item.score}/100`).join('\n') || 'No data available'}

Trend Data (monthly usage):
${data.trendData?.map((item) => `- ${item.month}: ${item.interviews} interviews, ${item.completionRate}% completion rate`).join('\n') || 'No data available'}

Institution Data (usage distribution):
${data.institutionData?.map((item) => `- ${item.name}: ${item.value}% usage`).join('\n') || 'No data available'}

Skill Gaps (areas needing improvement):
${data.skillGapsData?.map((item) => `- ${item.name}: ${item.gap}% of students need improvement`).join('\n') || 'No data available'}

Format your response exactly as follows:
OVERALL PERFORMANCE GRADE: [Letter Grade A-F]
GRADE EXPLANATION: [Brief explanation of how the grade was calculated]
DATA LINKING STATUS: [Whether data is linked to institutions/students or not]
STUDENT IMPROVEMENT ASSESSMENT: [High-level assessment of student performance improvement]
KEY INSIGHT: [One key insight from the data]`;
    
    return prompt;
  }
}

async function testPrompt() {
  try {
    console.log('🔍 Testing prompt generation...\n');

    // Create an instance of the mock AI analytics service
    const aiService = new MockAIAnalyticsService();
    
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

    // Generate the prompt
    console.log('📝 Generating prompt...');
    const prompt = aiService.createPromptFromData(testData);
    
    console.log('=== GENERATED PROMPT ===');
    console.log(prompt);
    console.log('');
    
    console.log('✅ Prompt generation test complete!');
    
  } catch (error) {
    console.error('❌ Error testing prompt generation:', error);
  }
}

// Run the test
testPrompt();