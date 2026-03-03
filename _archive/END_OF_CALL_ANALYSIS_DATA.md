# End-of-Call Analysis Data

This document lists all the information captured from VAPI end-of-call analysis reports.

## Core Call Information

1. **Call ID** - Unique identifier for the call
2. **Started At** - ISO 8601 timestamp when the call started
3. **Ended At** - ISO 8601 timestamp when the call ended
4. **Ended Reason** - Reason the call ended (e.g., customer-ended-call, assistant-ended-call)
5. **Duration** - Duration of the call in seconds
6. **Cost** - Cost of the call

## Analysis Data

### Summary
- Natural language summary of the interview performance

### Success Evaluation
- **Score** - Overall success score (0-100)
- **Passed** - Boolean indicating if the interview met success criteria

### Structured Data
- **Categories** - List of evaluated categories with scores:
  - Category name
  - Score (0-100)
  - Weight (importance factor)
- **Strengths** - List of identified strengths
- **Improvements** - List of areas for improvement
- **Recommendations** - List of specific recommendations

## Compliance Data

- **PII Violations** - Count of Personally Identifiable Information violations
- **PCI Violations** - Count of Payment Card Industry violations

## Media

- **Recording URL** - URL to the call recording
- **Transcript** - Full transcript of the call

## Metadata

- **Student ID** - Identifier for the student (if authenticated)
- **Department ID** - Identifier for the department
- **Institution ID** - Identifier for the institution
- **Interview Type** - Type of interview (e.g., general, technical_frontend)

## Data Storage

All end-of-call analysis data is stored in the Firestore collection `end-of-call-analysis` with server-side timestamps for creation tracking.

## Notes

- For authenticated users, all metadata fields are populated
- For anonymous users, metadata fields may be empty
- All data is captured automatically via VAPI webhooks
- Data is available immediately after the call ends
- The webhook approach is more reliable than client-side data capture