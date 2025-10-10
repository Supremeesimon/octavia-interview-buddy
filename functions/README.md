# Firebase Functions for VAPI Webhook Integration

This directory contains Firebase Functions that handle VAPI webhooks for capturing end-of-call reports.

## Overview

The Firebase Function in this directory receives webhook calls from VAPI when calls end, processes the end-of-call report data, and stores it in Firestore for use by the application.

## Function: vapiWebhook

This function handles HTTP POST requests from VAPI containing end-of-call reports.

### Trigger
- HTTP POST request from VAPI webhook

### Data Processing
1. Validates incoming webhook data
2. Extracts end-of-call report information
3. Saves data to Firestore collection `end-of-call-analysis`
4. Optionally saves data to Cloud Storage as JSON backup

### Data Structure
The function saves data with the following structure:
```javascript
{
  callId: string,
  startedAt: timestamp,
  endedAt: timestamp,
  endedReason: string,
  cost: number,
  compliance: object,
  transcript: string,
  recordingUrl: string,
  summary: string,
  structuredData: object,
  successEvaluation: object,
  duration: number,
  createdAt: serverTimestamp,
  studentId: string,
  departmentId: string,
  institutionId: string,
  interviewType: string
}
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Deploy Functions
```bash
firebase deploy --only functions
```

### 3. Configure VAPI Webhook
1. After deployment, get the webhook URL from the Firebase Console
2. Add it to your VAPI Dashboard under Webhooks
3. Select "End of Call Report" events

## Local Development

### Emulator Setup
```bash
firebase emulators:start --only functions
```

### Testing
You can test the function locally using the emulator and sending POST requests to:
```
http://localhost:5001/{project-id}/{region}/vapiWebhook
```

## Monitoring

### View Logs
```bash
firebase functions:log
```

## Environment Variables

The function uses the default Firebase Admin SDK configuration. No additional environment variables are required.

## Security

The function validates all incoming requests and only processes valid VAPI webhook data. Data is saved to Firestore with appropriate security rules.