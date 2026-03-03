# VAPI Webhook Troubleshooting Guide

## 🎯 Problem Identified

Based on your explanation and code review, the issue is that **VAPI web calls from your SaaS application are not triggering the "End-of-Call Report" webhook**, even though:

1. The Firebase Function webhook is deployed and working (tested with manual requests)
2. The VAPI dashboard is configured with the correct webhook URL
3. The webhook works with test data sent manually

## 🔍 Root Cause Analysis

After reviewing your code, I've identified several potential issues:

### 1. **WebCore Call Type Mismatch**
Your application uses VAPI WebCore for web calls, but the webhook might only be configured for specific call types.

In your VAPI service, calls are initiated with:
```javascript
const call = await this.vapi.start(assistantId, { metadata });
```

This creates a `webCall` type, but your webhook configuration might not be set to receive `webCall` events.

### 2. **Assistant-Level vs Account-Level Configuration**
VAPI sometimes requires webhook configuration at the **assistant level**, not just the account level.

### 3. **Call Completion State**
WebCore calls must reach the proper "ended" state to trigger the webhook. If calls are terminated prematurely (browser closed, UI force-stopped), the webhook may not fire.

## 🛠️ Solution Steps

### Step 1: Verify Call Type in VAPI Dashboard

1. Go to your VAPI Dashboard
2. Navigate to your assistant configuration
3. Check the "Server URL" section
4. Ensure the webhook URL is configured at the **assistant level**, not just account level

### Step 2: Enable Correct Event Types

In your VAPI Dashboard webhook configuration:
1. Make sure "End of Call Report" is selected
2. Check if there are specific call type filters (webCall, phoneCall, etc.)
3. Ensure "webCall" events are enabled

### Step 3: Verify Call Completion

In your [InterviewInterface.tsx](file:///Users/simon/AI%20interview%20Buddy%20/octavia-interview-buddy/src/components/InterviewInterface.tsx) file, ensure calls are properly ended:

```javascript
// Current implementation looks correct
const handleEndInterview = useCallback(async () => {
  try {
    await endInterview(); // This calls vapi.stop()
    setInterviewEnded(true);
    clearError();
  } catch (error) {
    // Error handling
  }
}, [endInterview, clearError]);
```

### Step 4: Add Explicit End Call Report Trigger

Modify your VAPI service to explicitly request an end-of-call report:

In [vapi.service.ts](file:///Users/simon/AI%20interview%20Buddy%20/octavia-interview-buddy/src/services/vapi.service.ts), update the `endInterview` method:

```typescript
/**
 * End the current interview call
 */
async endInterview(): Promise<VapiCall | null> {
  if (!this.currentCall) {
    console.warn('No active call to end');
    return null;
  }

  try {
    // Explicitly request end-of-call report before stopping
    if (this.vapi && typeof this.vapi.send === 'function') {
      try {
        // Send a message to trigger end-of-call processing
        await this.vapi.send({
          type: 'end-call-request',
          sendEndCallReport: true
        });
      } catch (e) {
        console.warn('Could not send end-call request:', e);
      }
    }
    
    // Stop the call
    await this.vapi.stop();
    return this.currentCall;
  } catch (error: any) {
    console.error('Failed to end VAPI call:', error);
    // Check if this is a normal disconnection error
    const isNormalDisconnection = error.message && (
      error.message.includes('not connected') || 
      error.message.includes('no active call') ||
      error.message.includes('disconnected') ||
      error.message.includes('already ended')
    );
    
    // If it's a normal disconnection, don't throw an error
    if (isNormalDisconnection) {
      console.log('Call ended normally');
      return this.currentCall;
    }
    
    throw new Error(`Failed to end interview: ${error.message}`);
  }
}
```

### Step 5: Check VAPI Dashboard Logs

1. In your VAPI Dashboard, check the "Logs" or "Monitoring" section
2. Look for your recent web calls
3. Check if they show as "completed" or "ended" properly
4. Look for any error messages related to webhook delivery

### Step 6: Add Debugging to Firebase Function

Update your Firebase Function to add more detailed logging:

```javascript
// In functions/index.js
exports.vapiWebhook = functions.https.onRequest(async (req, res) => {
  try {
    console.log('📥 VAPI Webhook received:', {
      method: req.method,
      headers: req.headers,
      bodyKeys: req.body ? Object.keys(req.body) : 'null',
      userAgent: req.get('User-Agent'),
      contentType: req.get('Content-Type'),
      timestamp: new Date().toISOString()
    });

    // Only handle POST requests
    if (req.method !== 'POST') {
      console.log('❌ Method not allowed:', req.method);
      res.status(405).send('Method Not Allowed');
      return;
    }

    const message = req.body.message;
    
    // Log message structure
    if (message) {
      console.log('📄 Message details:', {
        type: message.type,
        callId: message.callId,
        hasAnalysis: !!message.analysis,
        hasTranscript: !!message.transcript
      });
    }

    // Process end-of-call reports
    if (message && message.type === 'end-of-call-report') {
      console.log('✅ Processing end-of-call report for call:', message.callId);
      // ... rest of processing
    } else {
      console.log('ℹ️ Non end-of-call-report message or missing message');
      console.log('Message type:', message?.type || 'undefined');
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('💥 Error processing VAPI webhook:', error);
    res.status(500).send('Internal server error');
  }
});
```

## 🧪 Testing Procedure

1. **Deploy updated Firebase Function**:
   ```bash
   cd functions && firebase deploy --only functions
   ```

2. **Run a test interview** in your application

3. **Monitor Firebase logs**:
   ```bash
   firebase functions:log --only vapiWebhook
   ```

4. **Check VAPI Dashboard** for call completion status

## 📋 Checklist

- [ ] Webhook URL configured at assistant level in VAPI Dashboard
- [ ] "End of Call Report" event enabled in webhook configuration
- [ ] "webCall" call type enabled (if there are filters)
- [ ] Calls properly completed using `vapi.stop()`
- [ ] Firebase Function deployed with enhanced logging
- [ ] VAPI Dashboard logs checked for call completion
- [ ] Test interview run and monitored

## 🆘 If Still Not Working

If the above steps don't resolve the issue:

1. Contact VAPI support with:
   - Your assistant ID: `a1218d48-1102-4890-a0a6-d0ed2d207410`
   - Example call IDs that didn't trigger webhooks
   - Timestamps of failed calls
   - Your webhook URL: `https://us-central1-octavia-practice-interviewer.cloudfunctions.net/vapiWebhook`

2. Try creating a new assistant specifically for testing webhook functionality

3. Check if there are any geographic or network restrictions preventing VAPI from reaching your webhook

The key insight is that WebCore calls sometimes behave differently from other call types in VAPI, and the webhook configuration needs to be specifically set up to handle them.