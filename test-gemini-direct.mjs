import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve('./.env.local') });

async function testGeminiDirect() {
  try {
    console.log('🔍 Testing direct Gemini API call...\n');

    // Get the Gemini API key
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      console.log('⚠️  No Gemini API key found');
      return;
    }

    // Use the prompt we generated in the previous test
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
- Overall Rating: 62/100
- Communication Skills: 68/100
- Technical Knowledge: 53/100
- Problem Solving: 63/100
- Enthusiasm: 68/100

Trend Data (monthly usage):
- Oct 2025: 2 interviews, 100% completion rate

Institution Data (usage distribution):
- Lethbridge Polytechnic: 100% usage

Skill Gaps (areas needing improvement):
- Providing more specific examples and details in answers: 50% of students need improvement
- Structuring responses more effectively (e.g., STAR method): 50% of students need improvement
- Expanding on technical knowledge and key areas for checks: 50% of students need improvement
- Providing more structured and detailed answers to technical questions.: 50% of students need improvement
- Deepening technical knowledge, especially regarding core WordPress concepts like themes vs. plugins.: 50% of students need improvement

Format your response exactly as follows:
OVERALL PERFORMANCE GRADE: [Letter Grade A-F]
GRADE EXPLANATION: [Brief explanation of how the grade was calculated]
DATA LINKING STATUS: [Whether data is linked to institutions/students or not]
STUDENT IMPROVEMENT ASSESSMENT: [High-level assessment of student performance improvement]
KEY INSIGHT: [One key insight from the data]`;

    console.log('🤖 Calling Gemini API...');
    
    // Call Gemini API to generate insights
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    console.log('Gemini API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      return;
    }

    const result = await response.json();
    console.log('Gemini API response:', JSON.stringify(result, null, 2));
    
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      console.error('No text returned from Gemini API:', JSON.stringify(result, null, 2));
      return;
    }
    
    console.log('=== AI RESPONSE ===');
    console.log(text);
    console.log('');
    
    console.log('✅ Direct Gemini API test complete!');
    
  } catch (error) {
    console.error('❌ Error testing direct Gemini API call:', error);
  }
}

// Run the test
testGeminiDirect();