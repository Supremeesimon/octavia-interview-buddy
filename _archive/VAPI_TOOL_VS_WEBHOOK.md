# VAPI Tool vs Webhook Configuration

## Understanding the Difference

Based on your screenshot, you're looking at a **Tool Configuration** interface, not a **Webhook Configuration** interface. These are two different features in VAPI:

### Webhooks (What we deployed)
- Automatically send data from VAPI to your endpoint when events occur
- One-way communication (VAPI → Your system)
- No response expected
- Used for notifications and data collection

### Tools (What you're seeing)
- Allow the AI assistant to call your API during a conversation
- Two-way communication (VAPI ↔ Your system)
- Expects a response that can influence the conversation
- Used for real-time interactions and dynamic behavior

## For Your Use Case

Since you want to capture end-of-call reports automatically, you should be configuring a **Webhook**, not a Tool.

## How to Find Webhook Configuration

1. Look for a "Webhooks" section in the VAPI Dashboard sidebar or navigation
2. It's usually under "Settings" or "Integrations"
3. The interface should look different from the Tool configuration you're currently viewing

## If You Want to Use the Tool Approach Instead

If you prefer to use the Tool approach (though it's not recommended for your use case), you would:

1. Keep the Request URL as:
   ```
   https://us-central1-octavia-practice-interviewer.cloudfunctions.net/vapiWebhook
   ```

2. Set HTTP Method to: POST

3. For Request Body, you only need:
   ```
   Name: message
   Type: object
   Description: Contains the webhook payload
   ```

But again, this is not the correct approach for capturing end-of-call reports.

## Recommended Approach

1. Navigate to the Webhooks section in VAPI Dashboard
2. Create a new webhook with the URL:
   ```
   https://us-central1-octavia-practice-interviewer.cloudfunctions.net/vapiWebhook
   ```
3. Select "End of Call Report" events
4. No need to configure request body schema for webhooks