# Analytics Technical Specification

## Overview

This document details the technical implementation for the advanced analytics features requested for the AI Interview Buddy platform. The implementation builds upon the existing VAPI webhook integration and Firebase data storage.

## Current Data Structure

### Firestore Collection: end-of-call-analysis

```javascript
{
  callId: string,
  startedAt: timestamp,
  endedAt: timestamp,
  endedReason: string,
  cost: number,
  compliance: {
    pii: { violations: array },
    pci: { violations: array }
  },
  transcript: string,
  recordingUrl: string,
  summary: string,
  structuredData: {
    categories: [
      { name: string, score: number, weight: number }
    ],
    strengths: array,
    improvements: array,
    recommendations: array
  },
  successEvaluation: {
    score: number,
    passed: boolean
  },
  duration: number,
  createdAt: timestamp,
  studentId: string,
  departmentId: string,
  institutionId: string,
  interviewType: string
}
```

## Enhanced Data Structure

### New Fields to Add

```javascript
{
  // Timing Analysis
  responseTiming: {
    averageResponseTime: number, // seconds
    longestPause: number, // seconds
    responseConsistency: number // 1-100
  },
  
  // Sentiment Analysis
  sentimentAnalysis: {
    overallSentiment: number, // -100 to 100
    confidenceLevel: number, // 1-100
    emotionalRange: number // 1-100
  },
  
  // Keyword Usage
  keywordUsage: {
    technicalKeywords: array,
    industryKeywords: array,
    buzzwordFrequency: object,
    jargonAppropriateness: number // 1-100
  },
  
  // Mistake Patterns
  commonMistakes: array, // List of identified mistakes
  
  // Performance Metrics
  difficultyTolerance: number, // 1-100
  confidenceScore: number, // 1-100
  stressIndicators: array,
  
  // Progress Tracking
  improvementScore: number, // % improvement
  previousScores: array, // Historical scores for comparison
  
  // Risk Assessment
  riskLevel: string, // "Low" | "Medium" | "High"
  riskFactors: array, // List of identified risk factors
  
  // Question Analysis
  questionTypes: array, // Types of questions asked
  questionDifficulty: number, // 1-100
  answerQuality: number // 1-100
}
```

## VAPI Analysis Configuration Updates

### Enhanced Structured Data Extraction Prompt

```
You are an expert HR professional and data analyst evaluating job interview candidates. You will be given a transcript of a call and the system prompt of the AI interviewer. Extract the following structured data:

1. Communication Skills (1-100): Clarity, articulation, and professionalism of speech
2. Technical Knowledge (1-100): Depth of knowledge in relevant technical areas
3. Problem Solving (1-100): Ability to approach and solve complex problems
4. Enthusiasm (1-100): Level of interest and engagement in the position
5. Response Timing: 
   - Average response time (seconds)
   - Longest pause (seconds)
   - Response consistency (1-100)
6. Sentiment Analysis:
   - Overall sentiment (-100 to 100)
   - Confidence level (1-100)
   - Emotional range (1-100)
7. Keyword Usage:
   - Technical keywords used
   - Industry keywords used
   - Jargon appropriateness (1-100)
8. Common Mistakes: List specific mistakes identified
9. Difficulty Tolerance (1-100): How well candidate handles challenging questions
10. Confidence Score (1-100): Estimated self-assurance level
11. Stress Indicators: List behaviors indicating stress
12. Strengths: 2-3 key strengths demonstrated
13. Areas for Improvement: 2-3 areas needing development
14. Recommendations: 2-3 specific improvement suggestions
15. Question Types: List types of questions addressed
16. Answer Quality (1-100): Overall quality of responses

Respond in JSON format with all fields. Use -1 for any score you cannot determine.
```

## Firebase Function Enhancements

### Enhanced Data Processing

```javascript
// In functions/index.js
exports.vapiWebhook = functions.https.onRequest(async (req, res) => {
  try {
    
    if (message.type === 'end-of-call-report') {
      // Enhanced report processing
      const report = {
        // ... existing fields ...
        
        // New analytics fields
        responseTiming: message.structuredData?.responseTiming || {
          averageResponseTime: -1,
          longestPause: -1,
          responseConsistency: -1
        },
        
        sentimentAnalysis: message.structuredData?.sentimentAnalysis || {
          overallSentiment: -1,
          confidenceLevel: -1,
          emotionalRange: -1
        },
        
        keywordUsage: message.structuredData?.keywordUsage || {
          technicalKeywords: [],
          industryKeywords: [],
          jargonAppropriateness: -1
        },
        
        commonMistakes: message.structuredData?.commonMistakes || [],
        difficultyTolerance: message.structuredData?.difficultyTolerance || -1,
        confidenceScore: message.structuredData?.confidenceScore || -1,
        stressIndicators: message.structuredData?.stressIndicators || [],
        
        // Calculated fields
        improvementScore: await calculateImprovementScore(message.metadata?.studentId),
        riskLevel: calculateRiskLevel(message),
        questionTypes: extractQuestionTypes(message.transcript),
        
        // Metadata for analytics
        analyticsMetadata: {
          processedAt: admin.firestore.FieldValue.serverTimestamp(),
          version: "2.0"
        }
      };
      
      // Save to Firestore
      const docRef = await admin.firestore().collection('end-of-call-analysis').add(report);
      console.log('💾 Saved enhanced end-of-call report to Firestore with ID:', docRef.id);
      
      res.status(200).send('Report processed successfully');
    }
  } catch (error) {
    console.error('💥 Error processing VAPI webhook:', error);
    res.status(500).send('Internal server error');
  }
});

// Helper functions
async function calculateImprovementScore(studentId) {
  if (!studentId) return -1;
  
  try {
    const snapshot = await admin.firestore()
      .collection('end-of-call-analysis')
      .where('studentId', '==', studentId)
      .orderBy('createdAt', 'desc')
      .limit(2)
      .get();
    
    if (snapshot.size < 2) return -1;
    
    const docs = snapshot.docs;
    const currentScore = docs[0].data().successEvaluation?.score || 0;
    const previousScore = docs[1].data().successEvaluation?.score || 0;
    
    return currentScore - previousScore; // Improvement score
  } catch (error) {
    console.error('Error calculating improvement score:', error);
    return -1;
  }
}

function calculateRiskLevel(message) {
  // Simple risk calculation based on multiple factors
  const factors = [];
  let riskScore = 0;
  
  // Low completion rate
  if (message.endedReason === 'customer-ended-call-prematurely') {
    factors.push('Premature ending');
    riskScore += 30;
  }
  
  // Poor scores
  const successScore = message.successEvaluation?.score || 0;
  if (successScore < 50) {
    factors.push('Low success score');
    riskScore += 25;
  }
  
  // Multiple mistakes
  const mistakeCount = message.structuredData?.commonMistakes?.length || 0;
  if (mistakeCount > 3) {
    factors.push('Multiple mistakes');
    riskScore += 20;
  }
  
  // Determine risk level
  let riskLevel = "Low";
  if (riskScore >= 60) riskLevel = "High";
  else if (riskScore >= 30) riskLevel = "Medium";
  
  return {
    level: riskLevel,
    score: riskScore,
    factors: factors
  };
}

function extractQuestionTypes(transcript) {
  // Simple keyword-based question type extraction
  const questionTypes = [];
  
  if (transcript.includes('technical') || transcript.includes('code') || transcript.includes('program')) {
    questionTypes.push('Technical');
  }
  
  if (transcript.includes('behavioral') || transcript.includes('situation') || transcript.includes('experience')) {
    questionTypes.push('Behavioral');
  }
  
  if (transcript.includes('situational') || transcript.includes('scenario')) {
    questionTypes.push('Situational');
  }
  
  return questionTypes;
}
```

## Analytics Aggregation Functions

### Student Performance Aggregation

```javascript
// functions/analytics.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Aggregate student performance data
exports.aggregateStudentPerformance = functions.firestore
  .document('end-of-call-analysis/{analysisId}')
  .onCreate(async (snap, context) => {
    const analysis = snap.data();
    const studentId = analysis.studentId;
    
    if (!studentId) return null;
    
    try {
      // Get all analyses for this student
      const snapshot = await admin.firestore()
        .collection('end-of-call-analysis')
        .where('studentId', '==', studentId)
        .orderBy('createdAt')
        .get();
      
      const analyses = snapshot.docs.map(doc => doc.data());
      
      // Calculate aggregates
      const aggregateData = {
        totalInterviews: analyses.length,
        averageScore: calculateAverage(analyses.map(a => a.successEvaluation?.score || 0)),
        improvementTrend: calculateTrend(analyses.map(a => a.successEvaluation?.score || 0)),
        commonStrengths: findCommonItems(analyses.map(a => a.structuredData?.strengths || [])),
        commonImprovements: findCommonItems(analyses.map(a => a.structuredData?.improvements || [])),
        interviewTypes: getUniqueItems(analyses.map(a => a.interviewType || 'general')),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      };
      
      // Save to student analytics collection
      await admin.firestore()
        .collection('student-analytics')
        .doc(studentId)
        .set(aggregateData, { merge: true });
      
      return null;
    } catch (error) {
      console.error('Error aggregating student performance:', error);
      return null;
    }
  });

// Department/Institution Aggregation
exports.aggregateInstitutionPerformance = functions.pubsub
  .schedule('every 24 hours from 02:00')
  .timeZone('America/New_York')
  .onRun(async (context) => {
    try {
      // Get all recent analyses
      const snapshot = await admin.firestore()
        .collection('end-of-call-analysis')
        .where('createdAt', '>', admin.firestore.Timestamp.fromDate(new Date(Date.now() - 30*24*60*60*1000))) // Last 30 days
        .get();
      
      const analyses = snapshot.docs.map(doc => doc.data());
      
      // Group by department
      const departmentData = {};
      analyses.forEach(analysis => {
        const deptId = analysis.departmentId || 'unknown';
        if (!departmentData[deptId]) {
          departmentData[deptId] = [];
        }
        departmentData[deptId].push(analysis);
      });
      
      // Calculate department aggregates
      for (const [deptId, deptAnalyses] of Object.entries(departmentData)) {
        const aggregate = {
          departmentId: deptId,
          totalInterviews: deptAnalyses.length,
          averageScore: calculateAverage(deptAnalyses.map(a => a.successEvaluation?.score || 0)),
          completionRate: calculateCompletionRate(deptAnalyses),
          commonMistakes: findCommonMistakes(deptAnalyses),
          performanceByType: calculatePerformanceByType(deptAnalyses),
          lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        };
        
        // Save to department analytics collection
        await admin.firestore()
          .collection('department-analytics')
          .doc(deptId)
          .set(aggregate, { merge: true });
      }
      
      return null;
    } catch (error) {
      console.error('Error aggregating institution performance:', error);
      return null;
    }
  });

// Helper functions
function calculateAverage(numbers) {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((a, b) => a + b, 0);
  return Math.round(sum / numbers.length);
}

function calculateTrend(scores) {
  if (scores.length < 2) return 'Insufficient data';
  
  const firstHalf = scores.slice(0, Math.floor(scores.length/2));
  const secondHalf = scores.slice(Math.floor(scores.length/2));
  
  const firstAvg = calculateAverage(firstHalf);
  const secondAvg = calculateAverage(secondHalf);
  
  if (secondAvg > firstAvg + 5) return 'Improving';
  if (secondAvg < firstAvg - 5) return 'Declining';
  return 'Stable';
}

function findCommonItems(arrays) {
  // Implementation to find common items across arrays
  // Returns most frequently occurring items
  return [];
}

function getUniqueItems(items) {
  return [...new Set(items)];
}

function calculateCompletionRate(analyses) {
  const completed = analyses.filter(a => 
    a.endedReason === 'customer-ended-call' || 
    a.endedReason === 'assistant-ended-call'
  ).length;
  
  return Math.round((completed / analyses.length) * 100);
}

function findCommonMistakes(analyses) {
  // Implementation to find most common mistakes
  return [];
}

function calculatePerformanceByType(analyses) {
  // Group by interview type and calculate averages
  const byType = {};
  
  analyses.forEach(analysis => {
    const type = analysis.interviewType || 'general';
    if (!byType[type]) {
      byType[type] = [];
    }
    byType[type].push(analysis.successEvaluation?.score || 0);
  });
  
  const result = {};
  for (const [type, scores] of Object.entries(byType)) {
    result[type] = calculateAverage(scores);
  }
  
  return result;
}
```

## Dashboard Implementation Considerations

### Data Access Patterns

1. **Student Dashboard**: 
   - Individual performance history
   - Improvement tracking
   - Personalized recommendations

2. **Instructor Dashboard**:
   - Class performance overview
   - Individual student tracking
   - Common issue identification

3. **Administrator Dashboard**:
   - Department comparisons
   - Institutional trends
   - Resource allocation insights

### API Endpoints

```javascript
// Example API endpoints for dashboard data
GET /api/analytics/student/:studentId
GET /api/analytics/department/:departmentId
GET /api/analytics/institution/:institutionId
GET /api/analytics/cohort/:cohortId
GET /api/analytics/benchmarks
```

## Implementation Timeline

### Week 1: VAPI Configuration & Testing
- Update VAPI Analysis prompts
- Add new structured data fields
- Test with sample interviews
- Validate data capture

### Week 2: Firebase Function Enhancements
- Implement enhanced data processing
- Add helper functions
- Test data storage
- Validate calculations

### Week 3: Analytics Aggregation Layer
- Implement aggregation functions
- Set up scheduled jobs
- Test data aggregation
- Validate accuracy

### Week 4: Dashboard Development
- Create API endpoints
- Build dashboard components
- Implement visualizations
- Conduct user testing

## Success Metrics

1. **Data Completeness**: 95% of interviews capture all requested analytics
2. **Processing Time**: < 2 seconds for webhook processing
3. **Aggregation Accuracy**: Match manual calculations within 2%
4. **Dashboard Performance**: < 1 second load time for analytics views
5. **User Satisfaction**: 4.5+ star rating for analytics features

This technical specification provides a comprehensive roadmap for implementing all the requested analytics features while building upon the solid foundation already established.