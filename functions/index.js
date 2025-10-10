const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp();

// VAPI Webhook Function
exports.vapiWebhook = functions.https.onRequest(async (req, res) => {
  try {
    // Log the incoming request for debugging
    console.log('VAPI Webhook received:', {
      method: req.method,
      headers: req.headers,
      body: req.body
    });

    // Only handle POST requests
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    const message = req.body.message;

    // Validate the message structure
    if (!message) {
      console.warn('Invalid webhook payload: missing message');
      res.status(400).send('Invalid payload: missing message');
      return;
    }

    // Only handle end-of-call reports
    if (message.type === 'end-of-call-report') {
      console.log('Processing end-of-call report for call:', message.callId);
      
      const report = {
        callId: message.callId || null,
        startedAt: message.startedAt,
        endedAt: message.endedAt,
        endedReason: message.endedReason,
        cost: message.cost,
        compliance: message.compliance || {},
        transcript: message.transcript || '',
        recordingUrl: message.recordingUrl || null,
        summary: message.summary || '',
        structuredData: message.structuredData || {},
        successEvaluation: message.successEvaluation || {},
        duration: message.duration || 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        // Add metadata fields that might be useful for data isolation
        studentId: message.metadata?.studentId || '',
        departmentId: message.metadata?.departmentId || '',
        institutionId: message.metadata?.institutionId || '',
        interviewType: message.metadata?.interviewType || 'general'
      };

      // Save to Firestore in the end-of-call-analysis collection
      const docRef = await admin.firestore().collection('end-of-call-analysis').add(report);
      console.log('Saved end-of-call report with ID:', docRef.id);

      // Also save to Cloud Storage as JSON backup (optional)
      try {
        const storage = admin.storage();
        const bucket = storage.bucket(); // Uses default bucket
        const fileName = `callReports/${message.callId || docRef.id}.json`;
        const file = bucket.file(fileName);
        
        await file.save(JSON.stringify(report, null, 2), {
          metadata: {
            contentType: 'application/json'
          }
        });
        
        console.log('Saved end-of-call report to Cloud Storage:', fileName);
      } catch (storageError) {
        console.warn('Failed to save report to Cloud Storage:', storageError);
        // Continue even if Cloud Storage save fails
      }

      res.status(200).send('Report processed successfully');
    } else {
      console.log('Received non end-of-call-report message type:', message.type);
      res.status(200).send('Message received but not processed (not an end-of-call report)');
    }
  } catch (error) {
    console.error('Error processing VAPI webhook:', error);
    res.status(500).send('Internal server error');
  }
});