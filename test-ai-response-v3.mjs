// Test the updated AI response parsing
const aiResponse = `EXECUTIVE SUMMARY: The platform successfully processed and generated rich structured analysis reports for exactly two interviews today, confirming the core analytical functionality is operational. However, the critical absence of metadata linkage means the valuable performance data cannot currently be attributed to specific students or Lethbridge Polytechnic institutional cohorts, severely limiting immediate educational oversight and accountability. Immediate action is required to resolve the data association technical debt to unlock the platform's strategic value for workforce development tracking.

KEY OBSERVATIONS: 
- Operational Validation: Two complete analysis reports were successfully generated today, validating the platform's core interview processing and analytical capabilities.
- Critical Metadata Gap: All structured performance data (scores, strengths, improvements) exists but cannot be linked to specific students or institutional cohorts due to missing metadata association.
- Limited Institutional Visibility: While Lethbridge Polytechnic is confirmed as the sole institutional partner (100% usage), no student-level performance tracking is possible without data linking.
- Rich Data Content: Despite the linking limitation, each report contains comprehensive structured analysis including overall ratings, category scores, strengths, and targeted improvement recommendations.

STRATEGIC RECOMMENDATIONS: 
1. Prioritize Metadata Association Pipeline: Immediately implement the student ID and institutional linking mechanism to transform anonymous reports into actionable educational artifacts with proper data lineage.
2. Establish Data Quality Assurance: Implement automated validation checks to ensure all generated reports contain complete structured data fields (ratings, categories, strengths, improvements) before storage.
3. Prepare Cohort Analytics Framework: Develop institutional dashboard templates now that can immediately utilize linked data once the association pipeline is operational.
4. Create Data Migration Strategy: Design a process to retroactively link existing anonymous reports to their respective users to preserve historical analysis value.

FORECASTED IMPACT: Resolving the metadata linking limitation will transform the platform from a simple interview practice tool into a comprehensive workforce development intelligence engine. This will enable Lethbridge Polytechnic to track individual student competency progression, identify cohort-wide skill gaps, and make data-driven curriculum adjustments that directly improve workforce readiness outcomes.`;

console.log('Testing updated AI response parsing...');
console.log('AI Response:');
console.log(aiResponse);
console.log('\n---\n');

// Test the updated parsing logic
const parsed = {
  executiveSummary: 'No executive summary available.',
  keyObservations: ['No observations available.'],
  strategicRecommendations: ['No recommendations available.'],
  forecastedImpact: 'No forecast available.'
};

// Extract sections using more precise regex patterns
const execSummaryMatch = aiResponse.match(/EXECUTIVE SUMMARY:(.*?)(?=\nKEY OBSERVATIONS:|\n\d+\.|\n[A-Z\s]+:|$)/s);
console.log('Executive Summary Match:', execSummaryMatch && execSummaryMatch[1].trim().substring(0, 100) + '...');
if (execSummaryMatch && execSummaryMatch[1].trim()) {
  parsed.executiveSummary = execSummaryMatch[1].trim();
}

const observationsMatch = aiResponse.match(/KEY OBSERVATIONS:(.*?)(?=\nSTRATEGIC RECOMMENDATIONS:|\n\d+\.|\n[A-Z\s]+:|$)/s);
console.log('Observations Match length:', observationsMatch && observationsMatch[1].trim().length);
if (observationsMatch && observationsMatch[1].trim()) {
  const observationsText = observationsMatch[1].trim();
  // Split by bulleted list or line breaks
  parsed.keyObservations = observationsText
    .split(/\n-/)
    .map(obs => obs.trim())
    .filter(obs => obs.length > 0)
    .map(obs => obs.replace(/^-/, '').trim()); // Remove leading dash if any
  
  // If no items found, just use the whole text
  if (parsed.keyObservations.length === 0) {
    parsed.keyObservations = [observationsText];
  }
}

const recommendationsMatch = aiResponse.match(/STRATEGIC RECOMMENDATIONS:(.*?)(?=\nFORECASTED IMPACT:|\n[A-Z\s]+:|$)/s);
console.log('Recommendations Match length:', recommendationsMatch && recommendationsMatch[1].trim().length);
if (recommendationsMatch && recommendationsMatch[1].trim()) {
  const recommendationsText = recommendationsMatch[1].trim();
  console.log('Recommendations Text:', recommendationsText.substring(0, 200) + '...');
  // Split by numbered list (handling both formats)
  let recommendations = [];
  const numberedItems = recommendationsText.match(/\d+\.\s+[^\n]+/g);
  console.log('Numbered items found:', numberedItems && numberedItems.length);
  if (numberedItems && numberedItems.length > 0) {
    recommendations = numberedItems.map(item => {
      // Remove the number and period
      return item.replace(/^\d+\.\s+/, '').trim();
    });
  } else {
    // Fallback to splitting by line breaks
    recommendations = recommendationsText
      .split(/\n/)
      .map(rec => rec.trim())
      .filter(rec => rec.length > 0 && !/^\d+\.\s*$/.test(rec));
  }
  
  if (recommendations.length > 0) {
    parsed.strategicRecommendations = recommendations;
  }
}

const forecastMatch = aiResponse.match(/FORECASTED IMPACT:(.*?)(?=\n\d+\.|\n[A-Z\s]+:|$)/s);
console.log('Forecast Match:', forecastMatch && forecastMatch[1].trim().substring(0, 100) + '...');
if (forecastMatch && forecastMatch[1].trim()) {
  parsed.forecastedImpact = forecastMatch[1].trim();
}

console.log('\nParsed Result:');
console.log(JSON.stringify(parsed, null, 2));