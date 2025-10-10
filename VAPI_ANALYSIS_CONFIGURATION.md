# VAPI Analysis Configuration Guide

## Understanding Analysis Configuration

The Analysis section in VAPI Dashboard configures what data VAPI extracts from calls automatically. This is separate from webhooks and works together with them.

## Key Components

### 1. Summary Configuration
- **Prompt**: "You are an expert note-taker. You will be given a transcript of a call. Summarize the call in 2-3 sentences, focusing on the candidate's responses, communication skills, and overall interview performance."
- **Timeout**: 10 seconds
- **Minimum messages**: 2 (to ensure there's enough content for a meaningful summary)

### 2. Success Evaluation Configuration
- **Prompt**: "You are an expert interview evaluator. You will be given a transcript of a call and the system prompt of the AI interviewer. Determine if the interview was successful based on whether the candidate provided coherent responses, demonstrated relevant skills, and engaged appropriately with the interviewer."
- **Rubric**: Use a custom rubric for interview evaluation
- **Timeout**: 10 seconds

### 3. Structured Data Extraction
This is where you define what specific data to extract from the interview:

#### Categories (for scoring)
Create fields for:
1. **Communication Skills**
   - Type: Number
   - Description: Clarity, articulation, and professionalism of speech
   - Required: Yes

2. **Technical Knowledge**
   - Type: Number
   - Description: Depth of knowledge in relevant technical areas
   - Required: Yes

3. **Problem Solving**
   - Type: Number
   - Description: Ability to approach and solve complex problems
   - Required: Yes

4. **Enthusiasm**
   - Type: Number
   - Description: Level of interest and engagement in the position
   - Required: Yes

#### Qualitative Feedback
Create fields for:
1. **Strengths**
   - Type: String (Array)
   - Description: List of candidate's strong points
   - Required: Yes

2. **Areas for Improvement**
   - Type: String (Array)
   - Description: Areas where candidate could improve
   - Required: Yes

3. **Recommendations**
   - Type: String (Array)
   - Description: Specific recommendations for candidate development
   - Required: Yes

## Recommended Configuration

### Summary Prompt
```
You are an expert note-taker specializing in job interviews. You will be given a transcript of a call between an AI interviewer and a candidate. Summarize the call in 2-3 sentences, focusing on:
1. The candidate's overall performance
2. Key strengths demonstrated
3. Notable areas for improvement
```

### Success Evaluation Prompt
```
You are an expert HR professional evaluating job interview candidates. You will be given a transcript of a call and the system prompt of the AI interviewer. Determine if the interview was successful based on:
1. Whether the candidate provided coherent, relevant responses
2. Whether the candidate demonstrated appropriate technical knowledge
3. Whether the candidate showed good communication skills
4. Whether the candidate engaged appropriately with the interviewer

Respond with a score from 0-100 and a brief explanation.
```

### Structured Data Schema
```
{
  "categories": [
    {
      "name": "Communication Skills",
      "type": "number",
      "description": "Clarity, articulation, and professionalism of speech",
      "required": true
    },
    {
      "name": "Technical Knowledge",
      "type": "number",
      "description": "Depth of knowledge in relevant technical areas",
      "required": true
    },
    {
      "name": "Problem Solving",
      "type": "number",
      "description": "Ability to approach and solve complex problems",
      "required": true
    },
    {
      "name": "Enthusiasm",
      "type": "number",
      "description": "Level of interest and engagement in the position",
      "required": true
    }
  ],
  "strengths": {
    "type": "array",
    "items": {
      "type": "string"
    },
    "description": "List of candidate's strong points",
    "required": true
  },
  "improvements": {
    "type": "array",
    "items": {
      "type": "string"
    },
    "description": "Areas where candidate could improve",
    "required": true
  },
  "recommendations": {
    "type": "array",
    "items": {
      "type": "string"
    },
    "description": "Specific recommendations for candidate development",
    "required": true
  }
}
```

## How This Works With Webhooks

1. VAPI processes the call and generates the analysis based on your configuration
2. When the call ends, VAPI sends an "End of Call Report" to your webhook
3. Your Firebase Function receives the report and saves it to Firestore
4. Your application can then display this data to users

## Testing Your Configuration

After configuring the analysis:
1. Run a test interview
2. End the call
3. Check your Firebase Firestore for the analysis data in the "end-of-call-analysis" collection
4. Verify that all the fields you configured are present in the saved data

This configuration will ensure that every interview generates meaningful, structured feedback that can be used for both immediate feedback to candidates and long-term analytics.