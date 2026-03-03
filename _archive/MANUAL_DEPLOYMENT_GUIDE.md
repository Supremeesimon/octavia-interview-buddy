# Manual Deployment Guide for Firebase Functions

Since we're experiencing issues with the automated deployment script, here's a step-by-step manual guide to deploy your Firebase Functions.

## Prerequisites

1. Install Firebase CLI globally:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

## Manual Deployment Steps

### 1. Navigate to the functions directory
```bash
cd functions
```

### 2. Install dependencies
```bash
npm install
```

### 3. Deploy the functions
```bash
firebase deploy --only functions
```

## Expected Output

When you run the deployment command, you should see output similar to:
```
=== Deploying to 'octavia-practice-interviewer'...

i  deploying functions
Running command: npm --prefix "$RESOURCE_DIR" run build

✔  functions: Finished running predeploy script.
i  functions: ensuring required API cloudfunctions.googleapis.com is enabled...
i  functions: ensuring required API cloudbuild.googleapis.com is enabled...
✔  functions: required APIs are enabled
i  functions: preparing functions directory for uploading...
i  functions: packaged functions (44.44 KB) for uploading
✔  functions: functions folder uploaded successfully
i  functions: updating Node.js 18 function vapiWebhook(us-central1)...
✔  functions[vapiWebhook(us-central1)]: Successful update operation.

✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/octavia-practice-interviewer/overview
Function URL (vapiWebhook): https://us-central1-octavia-practice-interviewer.cloudfunctions.net/vapiWebhook
```

## Getting Your Webhook URL

After successful deployment, look for a line in the output that looks like:
```
Function URL (vapiWebhook): https://us-central1-octavia-practice-interviewer.cloudfunctions.net/vapiWebhook
```

This is your webhook URL that you'll need to add to your VAPI Dashboard.

## Adding Webhook to VAPI Dashboard

1. Go to your VAPI Dashboard
2. Navigate to the Webhooks section
3. Add a new webhook with the URL you got from the deployment
4. Select "End of Call Report" events

## Testing the Webhook

After setting up the webhook, you can test it by making a test call with your VAPI assistant. When the call ends, the end-of-call report should be automatically sent to your Firebase Function and stored in Firestore.

## Troubleshooting

If you encounter any issues:

1. Make sure you're in the correct directory (functions)
2. Ensure all dependencies are installed (npm install)
3. Check that you're logged into Firebase (firebase login)
4. Verify your project ID in .firebaserc matches your Firebase project

## Alternative: Using Firebase Emulator for Testing

If you want to test locally before deploying:

1. Start the emulator:
   ```bash
   firebase emulators:start --only functions
   ```

2. The function will be available at:
   ```
   http://localhost:5001/octavia-practice-interviewer/us-central1/vapiWebhook
   ```

Note: This is only for local testing and cannot be used as your production webhook URL.