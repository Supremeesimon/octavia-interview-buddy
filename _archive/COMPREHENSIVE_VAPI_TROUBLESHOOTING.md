# Comprehensive VAPI Webhook Troubleshooting Guide

## 🎯 Current Status

Based on our investigation:
1. ✅ Firebase Function is deployed and working (test data saved successfully)
2. ✅ Webhook URL is correct: `https://us-central1-octavia-practice-interviewer.cloudfunctions.net/vapiWebhook`
3. ✅ Function processes data correctly when it receives it
4. ❌ Your actual interviews are not triggering the webhook

## 🔍 Detailed Troubleshooting Steps

### Step 1: Verify VAPI Dashboard Configuration

You need to provide information about your VAPI Dashboard configuration. Please check:

1. **Assistant Configuration**:
   - Go to VAPI Dashboard → Assistants → Your Octavia assistant
   - Check if there's a "Server URL" section
   - Verify the webhook URL is set at the **assistant level**, not just account level

2. **Webhook Configuration**:
   - Go to VAPI Dashboard → Webhooks
   - Check if your webhook is configured for:
     - URL: `https://us-central1-octavia-practice-interviewer.cloudfunctions.net/vapiWebhook`
     - Event: "End of Call Report"
     - Call Types: "webCall" (specifically)

### Step 2: Check Call Type and Completion

The most common issue is that web calls aren't completing properly. Please verify:

1. **How are you ending calls?**
   - Are you clicking the "End Interview" button in your UI?
   - Are you closing the browser tab?
   - Are you letting the AI end the interview?

2. **Are calls reaching "ended" state?**
   - In your VAPI Dashboard → Logs, check if recent calls show as "completed"
   - Look for the call IDs from your recent interviews

### Step 3: Add Debugging to Your Application

Let's add logging to see exactly what's happening in your application:

#### In your VAPI service (`src/services/vapi.service.ts`), add this logging:

```typescript
// Add this to the setupEventListeners method
this.vapi.on('call-end', async (call: any) => {
  console.log('📞 VAPI call-end event received:', {
    callId: call.id,
    callType: call.type, // This should be "webCall"
    hasAnalysis: !!call.analysis,
    status: call.status,
    endedReason: call.endedReason
  });
  
  // ... rest of existing code
});

// Add this to see all events
this.vapi.on('*', (event: string, data: any) => {
  console.log('📡 VAPI event:', event, data);
});
```

### Step 4: Check VAPI Analysis Configuration

Make sure your assistant is configured to generate end-of-call reports:

1. In VAPI Dashboard → Your Assistant → Analysis tab
2. Ensure "Summary", "Success Evaluation", and "Structured Data" are all enabled
3. Check that the prompts are set up to generate reports

### Step 5: Verify Call Flow in Your Application

Let's trace exactly what happens when you start and end an interview:

#### In `src/components/InterviewInterface.tsx`:

Add logging to `handleStartInterview`:
```typescript
const handleStartInterview = async () => {
  try {
    console.log('🎬 Starting interview...');
    // ... existing code
    
    const call = await startInterview(
      resumeData, 
      'general',
      studentId,
      departmentId,
      institutionId
    );
    
    console.log('✅ Interview started successfully:', call);
  } catch (error) {
    console.error('💥 Failed to start interview:', error);
    // ... existing error handling
  }
};
```

Add logging to `handleEndInterview`:
```typescript
const handleEndInterview = useCallback(async () => {
  try {
    console.log('⏹️ Ending interview...');
    const result = await endInterview();
    console.log('✅ Interview ended successfully:', result);
    setInterviewEnded(true);
    clearError();
  } catch (error) {
    console.error('💥 Failed to end interview:', error);
    // ... existing error handling
  }
}, [endInterview, clearError]);
```

### Step 6: Test with VAPI's Built-in Testing

Use VAPI's assistant testing feature:

1. Go to VAPI Dashboard → Your Assistant → Test tab
2. Click "Start Web Call"
3. Complete a short conversation
4. End the call properly
5. Check if a webhook is triggered

### Step 7: Check Network Requests

In your browser's Developer Tools:

1. Open Network tab
2. Start an interview
3. Look for requests to `vapi.ai` domain
4. When you end the interview, check if there's a request to your webhook URL

## 🧪 Diagnostic Information Needed

To give you a concrete fix, I need you to provide:

### 1. VAPI Dashboard Screenshots/Information:
- Screenshot of your assistant's "Server URL" configuration
- Screenshot of your webhook configuration
- Details about your analysis settings (Summary, Success Evaluation, Structured Data)

### 2. Browser Console Logs:
- Complete console logs from starting to ending an interview
- Look specifically for any VAPI-related messages

### 3. VAPI Dashboard Logs:
- Screenshot of recent call logs showing call completion
- Look for the call IDs of your recent interviews

### 4. Call Ending Method:
- Exactly how are you ending the calls? 
  - Clicking the "End Interview" button?
  - Closing the browser tab?
  - Letting the AI end the conversation?

## 🛠️ Immediate Fixes to Try

### Fix 1: Explicitly Request End-of-Call Report

Modify your `endInterview` method in `src/services/vapi.service.ts`:

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
    console.log('⏹️ Stopping VAPI call...');
    
    // For web calls, explicitly request end-of-call processing
    if (this.vapi && typeof this.vapi.send === 'function') {
      try {
        console.log('📡 Sending end-call request to VAPI...');
        // Send a message to ensure proper call ending
        await this.vapi.send({
          type: 'end-session',
          message: 'Interview completed'
        });
        console.log('✅ End-call request sent successfully');
      } catch (sendError) {
        console.warn('⚠️ Could not send end-call request:', sendError);
      }
    }
    
    // Stop the call
    await this.vapi.stop();
    console.log('✅ VAPI call stopped successfully');
    return this.currentCall;
  } catch (error: any) {
    console.error('💥 Failed to end VAPI call:', error);
    // ... existing error handling
  }
}
```

### Fix 2: Add Analysis Event Handler

Make sure you're capturing the analysis event in your VAPI service:

```typescript
// In setupEventListeners method
this.vapi.on('analysis', async (analysis: any) => {
  console.log('📊 Analysis event received:', {
    hasSummary: !!analysis?.summary,
    hasStructuredData: !!analysis?.structuredData,
    hasSuccessEvaluation: !!analysis?.successEvaluation
  });
  
  // Even if this isn't the end-of-call, log it for debugging
  if (analysis && (analysis.summary || analysis.structuredData)) {
    console.log('📈 Analysis data available:', analysis);
  }
});
```

## 📋 Action Plan

1. **Provide the diagnostic information** listed above
2. **Try the immediate fixes** I've suggested
3. **Run another test interview** with enhanced logging
4. **Share the results** so I can give you a concrete fix

The key is to determine:
- Is VAPI generating the end-of-call report?
- Is VAPI sending it to your webhook?
- Is your webhook receiving it but not processing it?
- Or is something preventing the webhook from being triggered at all?

Once we have this information, I can give you the exact fix for your specific situation.