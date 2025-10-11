const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp();

// VAPI Webhook Function
exports.vapiWebhook = functions.https.onRequest(async (req, res) => {
  try {
    // Log the incoming request for debugging
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

    // Validate the message structure
    if (!message) {
      console.warn('⚠️ Invalid webhook payload: missing message');
      res.status(400).send('Invalid payload: missing message');
      return;
    }

    console.log('📄 Message details:', {
      type: message.type,
      callId: message.callId,
      hasAnalysis: !!message.analysis,
      hasTranscript: !!message.transcript
    });

    // Handle different message types
    if (message.type === 'end-of-call-report') {
      console.log('✅ Processing end-of-call report for call:', message.callId);
      
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
      console.log('💾 Saved end-of-call report to Firestore with ID:', docRef.id);

      res.status(200).send('Report processed successfully');
    } else if (message.type === 'analysis') {
      // Handle analysis data (this is the main source of end-of-call analysis)
      console.log('✅ Processing analysis data for call:', message.callId);
      
      const analysis = message.analysis || {};
      
      const report = {
        callId: message.callId || null,
        summary: analysis.summary || '',
        structuredData: analysis.structuredData || {},
        successEvaluation: analysis.successEvaluation || {},
        transcript: message.transcript || '',
        recordingUrl: message.recordingUrl || null,
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
      console.log('💾 Saved analysis data to Firestore with ID:', docRef.id);

      res.status(200).send('Analysis processed successfully');
    } else {
      console.log('ℹ️ Non end-of-call-report/analysis message type received:', message.type);
      res.status(200).send('Message received but not processed (not an end-of-call report or analysis)');
    }
  } catch (error) {
    console.error('💥 Error processing VAPI webhook:', error);
    res.status(500).send('Internal server error');
  }
});