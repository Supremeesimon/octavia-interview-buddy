# VAPI Webhook Integration with Firebase

This document explains how the VAPI webhook integration works with Firebase to automatically capture and store end-of-call reports.

## Current Implementation vs. Recommended Approach

### Current Implementation (Client-Side)
Our current implementation captures end-of-call analysis data directly in the client-side VAPI service and sends it to Firebase through our interview service. This approach has some limitations:

1. **Reliability**: If the user closes the browser before the data is sent, the analysis is lost
2. **Network Issues**: If there are network problems during data transmission, the analysis may not be saved
3. **Security**: The client is responsible for sending the data, which could be intercepted or manipulated

### Recommended Approach (Webhook-Based)
The recommended approach uses VAPI webhooks to automatically send end-of-call reports to our Firebase Function, which then saves the data to Firestore. This approach is more reliable and secure:

1. **Reliability**: VAPI sends the data directly to our webhook, regardless of client behavior
2. **Security**: Data transmission happens server-to-server
3. **Automation**: No client-side code needed to save the data

## How It Works

1. **VAPI Sends Webhook**: When a call ends, VAPI automatically sends an end-of-call report to our Firebase Function via HTTP POST
2. **Firebase Function Processes**: Our Firebase Function receives the webhook, validates the data, and saves it to Firestore
3. **Data Available**: The analysis data is immediately available in Firestore for our application to use

## Implementation Details

### Firebase Function
The Firebase Function (`functions/index.js`) handles the webhook:

```javascript
exports.vapiWebhook = functions.https.onRequest(async (req, res) => {
  // Process VAPI webhook
  // Save data to Firestore
  // Optional: Save to Cloud Storage as backup
});
```

### Data Structure
The end-of-call report is saved with the following structure:

```javascript
const report = {
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
};
```

## Setting Up the Webhook

1. **Deploy the Function**: Deploy the Firebase Function to get the webhook URL
2. **Configure VAPI**: Add the webhook URL to the VAPI dashboard
3. **Select Events**: Configure VAPI to send "End of Call Report" events

## Benefits of This Approach

1. **Reliability**: Data is captured even if the user closes the browser
2. **Security**: Server-to-server communication is more secure
3. **Scalability**: Firebase Functions automatically scale
4. **Backup**: Optional Cloud Storage backup for additional data security
5. **Real-time**: Data is available immediately after the call ends

## Migration Plan

To migrate from the current client-side approach to the webhook approach:

1. Keep the current client-side implementation as a fallback
2. Implement and deploy the Firebase Function
3. Configure the VAPI webhook
4. Monitor both approaches to ensure data consistency
5. Eventually remove the client-side implementation if the webhook approach proves reliable

## Testing

To test the webhook integration:

1. Make a test call using the VAPI assistant
2. End the call
3. Check Firestore for the end-of-call analysis
4. Verify the data matches what was sent by VAPI

## Monitoring

Monitor the Firebase Function logs to ensure webhooks are being processed correctly:

```bash
firebase functions:log
```