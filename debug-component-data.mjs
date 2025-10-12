// Debug script to simulate component data fetching
console.log('Component Data Fetching Debug:');
console.log('============================');

// Simulate what the component should receive
const mockAnalyses = [
  {
    summary: JSON.stringify({
      "Rating": 65,
      "Communication Skills": 70,
      "Technical Knowledge": 60,
      "Problem Solving": 65,
      "Enthusiasm": 75,
      "Interview Outcome": "Completed",
      "Strengths": [
        "Proactive approach to critical issues",
        "Strong focus on safety and resident welfare",
        "Clear communication of thought process"
      ],
      "Areas for Improvement": [
        "Providing more specific examples and details in answers",
        "Structuring responses more effectively (e.g., STAR method)",
        "Expanding on technical knowledge and key areas for checks"
      ],
      "Recommendations": [
        "Practice using the STAR method to structure behavioral and situational responses.",
        "Prepare specific examples from past experiences to illustrate skills and achievements.",
        "Research and be ready to articulate key technical areas for maintenance checks in a building."
      ]
    })
  },
  {
    summary: JSON.stringify({
      "Rating": 58,
      "Communication Skills": 65,
      "Technical Knowledge": 45,
      "Problem Solving": 60,
      "Enthusiasm": 60,
      "Interview Outcome": "Completed",
      "Strengths": [
        "Demonstrated understanding of customer satisfaction and communication importance.",
        "Showed willingness to adapt to project changes.",
        "Acknowledged limitations honestly when unsure of an answer."
      ],
      "Areas for Improvement": [
        "Providing more structured and detailed answers to technical questions.",
        "Deepening technical knowledge, especially regarding core WordPress concepts like themes vs. plugins.",
        "Elaborating more on problem-solving steps and motivations."
      ],
      "Recommendations": [
        "Practice explaining technical concepts clearly and thoroughly.",
        "Prepare for common WordPress-specific technical questions (e.g., themes vs. plugins, hooks, custom post types).",
        "Utilize frameworks like STAR (Situation, Task, Action, Result) to structure behavioral and situational answers."
      ]
    })
  }
];

console.log('Mock analyses count:', mockAnalyses.length);

// Simulate skill gap extraction logic
const skillGaps = {};

mockAnalyses.forEach((analysis, index) => {
  console.log(`Processing analysis ${index + 1}:`);
  if (analysis.summary) {
    try {
      const summaryData = JSON.parse(analysis.summary);
      console.log(`  Parsed summary data keys:`, Object.keys(summaryData));
      
      if (Array.isArray(summaryData['Areas for Improvement'])) {
        console.log(`  Areas for Improvement count:`, summaryData['Areas for Improvement'].length);
        summaryData['Areas for Improvement'].forEach((improvement, i) => {
          console.log(`    ${i + 1}. ${improvement}`);
          skillGaps[improvement] = (skillGaps[improvement] || 0) + 1;
        });
      }
    } catch (parseError) {
      console.log(`  Error parsing summary JSON:`, parseError.message);
    }
  }
});

console.log('\nExtracted skill gaps:', skillGaps);

// Convert to array format
const skillGapsArray = Object.entries(skillGaps)
  .map(([skill, count]) => ({
    name: skill,
    gap: Math.min(100, Math.round((count / mockAnalyses.length) * 100))
  }))
  .sort((a, b) => b.gap - a.gap)
  .slice(0, 5);

console.log('\nFinal skill gaps array:');
skillGapsArray.forEach((item, index) => {
  console.log(`  ${index + 1}. ${item.name}: ${item.gap}%`);
});

console.log('\n✅ Component data fetching simulation complete!');