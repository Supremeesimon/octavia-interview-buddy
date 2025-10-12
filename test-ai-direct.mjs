// Test direct AI call with the actual data
const testData = {
  "performanceData": [
    {
      "category": "Overall Rating",
      "score": 62
    },
    {
      "category": "Communication Skills",
      "score": 68
    },
    {
      "category": "Technical Knowledge",
      "score": 53
    },
    {
      "category": "Problem Solving",
      "score": 63
    },
    {
      "category": "Enthusiasm",
      "score": 68
    }
  ],
  "trendData": [
    {
      "month": "Oct 2025",
      "interviews": 2,
      "completionRate": 100
    }
  ],
  "institutionData": [
    {
      "name": "Lethbridge Polytechnic",
      "value": 100
    }
  ],
  "skillGapsData": [
    {
      "name": "Providing more specific examples and details in answers",
      "gap": 50
    },
    {
      "name": "Structuring responses more effectively (e.g., STAR method)",
      "gap": 50
    },
    {
      "name": "Expanding on technical knowledge and key areas for checks",
      "gap": 50
    },
    {
      "name": "Providing more structured and detailed answers to technical questions.",
      "gap": 50
    },
    {
      "name": "Deepening technical knowledge, especially regarding core WordPress concepts like themes vs. plugins.",
      "gap": 50
    }
  ]
};

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

Analyze the following interview platform data and provide your assessment:

Performance Data (category scores out of 100):
${testData.performanceData?.map((item) => `- ${item.category}: ${item.score}/100`).join('\n') || 'No data available'}

Trend Data (monthly usage):
${testData.trendData?.map((item) => `- ${item.month}: ${item.interviews} interviews, ${item.completionRate}% completion rate`).join('\n') || 'No data available'}

Institution Data (usage distribution):
${testData.institutionData?.map((item) => `- ${item.name}: ${item.value}% usage`).join('\n') || 'No data available'}

Skill Gaps (areas needing improvement):
${testData.skillGapsData?.map((item) => `- ${item.name}: ${item.gap}% of students need improvement`).join('\n') || 'No data available'}

Format your response exactly as follows:
OVERALL PERFORMANCE GRADE: [Letter Grade A-F]
GRADE EXPLANATION: [Brief explanation of how the grade was calculated]
DATA LINKING STATUS: [Whether data is linked to institutions/students or not]
STUDENT IMPROVEMENT ASSESSMENT: [High-level assessment of student performance improvement]
KEY INSIGHT: [One key insight from the data]`;

console.log('Test prompt:');
console.log(prompt);
console.log('\n---\n');

// Test the parsing logic with a sample response
const sampleResponse = `OVERALL PERFORMANCE GRADE: C+
GRADE EXPLANATION: Based on average scores across 2 interviews with overall ratings of 62/100, and category averages showing Technical Knowledge as the lowest performing area at 53/100.
DATA LINKING STATUS: Data is NOT linked to specific students or institutions - all metadata fields are empty.
STUDENT IMPROVEMENT ASSESSMENT: Students show moderate performance with strengths in Communication Skills and Enthusiasm but need significant improvement in Technical Knowledge areas.
KEY INSIGHT: Technical Knowledge is the primary area requiring focused attention, with both interviews showing below-average scores in this category.`;

console.log('Sample response:');
console.log(sampleResponse);
console.log('\n---\n');

// Test parsing
const parsed = {
  overallPerformanceGrade: 'N/A',
  gradeExplanation: 'No grade explanation available.',
  dataLinkingStatus: 'Unknown data linking status.',
  studentImprovementAssessment: 'No student improvement assessment available.',
  keyInsight: 'No key insight available.'
};

// Extract sections using precise regex patterns for the new format
const gradeMatch = sampleResponse.match(/OVERALL PERFORMANCE GRADE:\s*([A-Fa-f])/i);
console.log('Grade match:', gradeMatch);
if (gradeMatch && gradeMatch[1]) {
  parsed.overallPerformanceGrade = gradeMatch[1].toUpperCase();
}

const explanationMatch = sampleResponse.match(/GRADE EXPLANATION:(.*?)(?=\nDATA LINKING STATUS:|\n[A-Z\s]+:|$)/s);
console.log('Explanation match:', explanationMatch && explanationMatch[1].substring(0, 50) + '...');
if (explanationMatch && explanationMatch[1].trim()) {
  parsed.gradeExplanation = explanationMatch[1].trim();
}

const linkingStatusMatch = sampleResponse.match(/DATA LINKING STATUS:(.*?)(?=\nSTUDENT IMPROVEMENT ASSESSMENT:|\n[A-Z\s]+:|$)/s);
console.log('Linking status match:', linkingStatusMatch && linkingStatusMatch[1].substring(0, 50) + '...');
if (linkingStatusMatch && linkingStatusMatch[1].trim()) {
  parsed.dataLinkingStatus = linkingStatusMatch[1].trim();
}

const improvementMatch = sampleResponse.match(/STUDENT IMPROVEMENT ASSESSMENT:(.*?)(?=\nKEY INSIGHT:|\n[A-Z\s]+:|$)/s);
console.log('Improvement match:', improvementMatch && improvementMatch[1].substring(0, 50) + '...');
if (improvementMatch && improvementMatch[1].trim()) {
  parsed.studentImprovementAssessment = improvementMatch[1].trim();
}

const insightMatch = sampleResponse.match(/KEY INSIGHT:(.*?)(?=\n[A-Z\s]+:|$)/s);
console.log('Insight match:', insightMatch && insightMatch[1].substring(0, 50) + '...');
if (insightMatch && insightMatch[1].trim()) {
  parsed.keyInsight = insightMatch[1].trim();
}

console.log('\nParsed result:');
console.log(JSON.stringify(parsed, null, 2));