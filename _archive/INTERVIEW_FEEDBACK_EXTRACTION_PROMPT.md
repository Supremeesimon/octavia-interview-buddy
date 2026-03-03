# Interview Feedback Extraction Prompt

## Prompt for Structured Data Extraction

```
You will be given the transcript of a call that occurred between an AI interviewer and a candidate during a practice interview session. Extract the following information about the candidate's performance:

Rating: The overall rating of the candidate's interview performance. The value extracted should be a number from 1 to 100, with 1 being very poor performance and 100 being excellent performance. If you cannot determine a rating, use -1 as the value.

Communication Skills: The candidate's ability to communicate clearly and effectively during the interview. Extract a score from 1 to 100. If you cannot determine this score, use -1 as the value.

Technical Knowledge: The candidate's demonstration of relevant technical knowledge during the interview. Extract a score from 1 to 100. If you cannot determine this score, use -1 as the value.

Problem Solving: The candidate's ability to approach and solve problems discussed during the interview. Extract a score from 1 to 100. If you cannot determine this score, use -1 as the value.

Enthusiasm: The level of interest and engagement the candidate showed during the interview. Extract a score from 1 to 100. If you cannot determine this score, use -1 as the value.

Interview Outcome: Whether or not the candidate successfully completed the interview process. The value extracted should be "Completed" if the candidate went through the full interview process, "Incomplete" if the interview was cut short for any reason, or "N/A" if you cannot determine the outcome.

Strengths: List 2-3 key strengths the candidate demonstrated during the interview. If no strengths are evident, the value should be ["None"].

Areas for Improvement: List 2-3 areas where the candidate could improve their interview performance. If no areas for improvement are evident, the value should be ["None"].

Recommendations: Provide 2-3 specific recommendations for how the candidate can improve their interview skills. If no recommendations can be made, the value should be ["Practice more technical questions", "Prepare specific examples", "Work on communication clarity"].
```

## How This Compares to the Example

The example you provided was for customer service feedback extraction, while ours is for interview performance feedback. Here are the key differences:

### Similarities:
1. Both use a clear structure with specific fields to extract
2. Both provide explicit instructions for handling missing data (-1 or "N/A" values)
3. Both specify data types for each field
4. Both include conditional logic for edge cases

### Differences:
1. **Context**: Customer service feedback vs. interview performance evaluation
2. **Rating Scale**: 1-10 for customer service vs. 1-100 for interview performance
3. **Fields**: Customer service specific fields (Issue Outcome) vs. interview specific fields (Communication Skills, Technical Knowledge, etc.)
4. **Outcome Values**: "Resolved"/"Incomplete" vs. "Completed"/"Incomplete"
5. **Qualitative Feedback**: General suggestions vs. specific interview improvement recommendations

## Implementation in VAPI Dashboard

To implement this in your VAPI Analysis configuration:

1. **Replace the existing Structured Data fields** with these new ones
2. **Update the field types** to match the requirements above
3. **Ensure all fields are marked as Required** to guarantee data consistency
4. **Test with the test-structured-data.mjs script** to verify the configuration works

## Benefits of This Approach

1. **Comprehensive Evaluation**: Covers all key aspects of interview performance
2. **Actionable Feedback**: Provides specific areas for improvement
3. **Quantitative & Qualitative**: Combines numerical scores with descriptive feedback
4. **Consistent Data**: Ensures all interviews generate the same data structure
5. **Institutional Analytics**: Enables aggregation and comparison across interviews