const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp();

// VAPI Webhook Function (1st Gen)
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
        // Updated to check for metadata in variableValues as well
        studentId: message.studentId || message.metadata?.studentId || message.variableValues?.studentId || '',
        departmentId: message.departmentId || message.metadata?.departmentId || message.variableValues?.departmentId || '',
        institutionId: message.institutionId || message.metadata?.institutionId || message.variableValues?.institutionId || '',
        interviewType: message.interviewType || message.metadata?.interviewType || message.variableValues?.interviewType || 'general',
        resumeId: message.resumeId || message.metadata?.resumeId || message.variableValues?.resumeId || '',
        sessionId: message.sessionId || message.metadata?.sessionId || message.variableValues?.sessionId || ''
      };

      // Save to Firestore in the end-of-call-analysis collection
      const docRef = await admin.firestore().collection('end-of-call-analysis').add(report);
      console.log('💾 Saved end-of-call report to Firestore with ID:', docRef.id);
      
      // Also save to interviews and interview-feedback collections if we have a studentId
      if (report.studentId) {
        console.log('📋 Also saving interview data for student:', report.studentId);
        
        // Save to interviews collection
        const interviewData = {
          studentId: report.studentId,
          resumeId: report.resumeId || '',
          sessionId: report.sessionId || 'vapi-session-' + Date.now(),
          scheduledAt: new Date(),
          startedAt: report.startedAt ? new Date(report.startedAt) : new Date(),
          endedAt: report.endedAt ? new Date(report.endedAt) : new Date(),
          duration: report.duration || 0,
          status: 'completed',
          type: report.interviewType || 'general',
          vapiCallId: report.callId || '',
          recordingUrl: report.recordingUrl || '',
          recordingDuration: report.duration || 0,
          transcript: report.transcript || '',
          score: report.successEvaluation?.score || 0,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        const interviewRef = await admin.firestore().collection('interviews').add(interviewData);
        console.log('✅ Saved interview data with ID:', interviewRef.id);
        
        // Save to interview-feedback collection
        if (report.successEvaluation?.score > 0) {
          // Extract categories from structured data
          const categories = [];
          if (report.structuredData?.categories && Array.isArray(report.structuredData.categories)) {
            report.structuredData.categories.forEach(cat => {
              categories.push({
                name: cat.name || 'Unnamed Category',
                score: cat.score || 0,
                weight: cat.weight || 0,
                description: cat.description || ''
              });
            });
          }
          
          const feedbackData = {
            interviewId: interviewRef.id,
            studentId: report.studentId,
            overallScore: report.successEvaluation.score || 0,
            categories: categories,
            strengths: report.structuredData?.strengths || [],
            improvements: report.structuredData?.improvements || [],
            recommendations: report.structuredData?.recommendations || [],
            detailedAnalysis: report.summary || '',
            aiModelVersion: 'vapi-webhook-1.0',
            confidenceScore: 0.85,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          };
          
          const feedbackRef = await admin.firestore().collection('interview-feedback').add(feedbackData);
          console.log('✅ Saved feedback data with ID:', feedbackRef.id);
        }
      } else {
        console.log('ℹ️ No studentId provided, skipping interview and feedback data save (anonymous user)');
      }

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
        // Updated to check for metadata in variableValues as well
        studentId: message.studentId || message.metadata?.studentId || message.variableValues?.studentId || '',
        departmentId: message.departmentId || message.metadata?.departmentId || message.variableValues?.departmentId || '',
        institutionId: message.institutionId || message.metadata?.institutionId || message.variableValues?.institutionId || '',
        interviewType: message.interviewType || message.metadata?.interviewType || message.variableValues?.interviewType || 'general',
        resumeId: message.resumeId || message.metadata?.resumeId || message.variableValues?.resumeId || '',
        sessionId: message.sessionId || message.metadata?.sessionId || message.variableValues?.sessionId || ''
      };

      // Save to Firestore in the end-of-call-analysis collection
      const docRef = await admin.firestore().collection('end-of-call-analysis').add(report);
      console.log('💾 Saved analysis data to Firestore with ID:', docRef.id);
      
      // Also save to interviews and interview-feedback collections if we have a studentId
      if (report.studentId) {
        console.log('📋 Also saving interview data for student:', report.studentId);
        
        // Save to interviews collection
        const interviewData = {
          studentId: report.studentId,
          resumeId: report.resumeId || '',
          sessionId: report.sessionId || 'vapi-session-' + Date.now(),
          scheduledAt: new Date(),
          startedAt: new Date(), // For analysis, we don't have exact start time
          endedAt: new Date(), // For analysis, we use current time as end time
          duration: report.duration || 0,
          status: 'completed',
          type: report.interviewType || 'general',
          vapiCallId: report.callId || '',
          recordingUrl: report.recordingUrl || '',
          recordingDuration: report.duration || 0,
          transcript: report.transcript || '',
          score: report.successEvaluation?.score || 0,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        const interviewRef = await admin.firestore().collection('interviews').add(interviewData);
        console.log('✅ Saved interview data with ID:', interviewRef.id);
        
        // Save to interview-feedback collection
        if (report.successEvaluation?.score > 0) {
          // Extract categories from structured data
          const categories = [];
          if (report.structuredData?.categories && Array.isArray(report.structuredData.categories)) {
            report.structuredData.categories.forEach(cat => {
              categories.push({
                name: cat.name || 'Unnamed Category',
                score: cat.score || 0,
                weight: cat.weight || 0,
                description: cat.description || ''
              });
            });
          }
          
          const feedbackData = {
            interviewId: interviewRef.id,
            studentId: report.studentId,
            overallScore: report.successEvaluation.score || 0,
            categories: categories,
            strengths: report.structuredData?.strengths || [],
            improvements: report.structuredData?.improvements || [],
            recommendations: report.structuredData?.recommendations || [],
            detailedAnalysis: report.summary || '',
            aiModelVersion: 'vapi-webhook-1.0',
            confidenceScore: 0.85,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          };
          
          const feedbackRef = await admin.firestore().collection('interview-feedback').add(feedbackData);
          console.log('✅ Saved feedback data with ID:', feedbackRef.id);
        }
      } else {
        console.log('ℹ️ No studentId provided, skipping interview and feedback data save (anonymous user)');
      }

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

// Financial Analytics Function - runs daily to calculate and store margin data
exports.calculateDailyMargin = functions.pubsub.schedule('every 24 hours from 00:00').timeZone('America/New_York').onRun(async (context) => {
  try {
    console.log('📊 Starting daily margin calculation');
    
    const db = admin.firestore();
    
    // Get the current pricing settings
    const pricingSettingsDoc = await db.collection('system_config').doc('pricing').get();
    let pricingSettings = {
      vapiCostPerMinute: 0.11,
      markupPercentage: 36.36,
      annualLicenseCost: 19.96
    };
    
    if (pricingSettingsDoc.exists) {
      pricingSettings = pricingSettingsDoc.data();
    }
    
    // Calculate date range for the previous day
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const today = new Date(yesterday);
    today.setDate(today.getDate() + 1);
    
    console.log(`📅 Calculating margin data for ${yesterday.toISOString().split('T')[0]}`);
    
    // Get interviews from the previous day
    const interviewsSnapshot = await db.collection('interviews')
      .where('createdAt', '>=', yesterday)
      .where('createdAt', '<', today)
      .where('status', '==', 'completed')
      .get();
    
    console.log(`📋 Found ${interviewsSnapshot.size} interviews for margin calculation`);
    
    let totalSessions = 0;
    let totalSessionDuration = 0; // in seconds
    let totalSessionRevenue = 0;
    let totalLicenseRevenue = 0;
    
    // Calculate session-based revenue
    const averageSessionLength = interviewsSnapshot.size > 0 
      ? interviewsSnapshot.docs.reduce((sum, doc) => sum + (doc.data().duration || 0), 0) / interviewsSnapshot.size 
      : 0;
    
    // Get institution data for license revenue calculation
    const institutionsSnapshot = await db.collection('institutions').get();
    const activeInstitutions = institutionsSnapshot.docs.filter(doc => doc.data().isActive === true);
    
    console.log(`🏢 Found ${activeInstitutions.length} active institutions`);
    
    // Estimate license revenue (simplified calculation)
    // In a real implementation, this would be based on actual license purchases
    const monthlyLicenseRevenue = activeInstitutions.length * (pricingSettings.annualLicenseCost / 12);
    totalLicenseRevenue = monthlyLicenseRevenue / 30; // Daily portion
    
    // Calculate session revenue
    for (const doc of interviewsSnapshot.docs) {
      const interview = doc.data();
      totalSessions++;
      totalSessionDuration += interview.duration || 0;
      
      // Calculate revenue for this session
      const sessionDurationMinutes = (interview.duration || 0) / 60;
      const sessionRevenue = sessionDurationMinutes * 
        (pricingSettings.vapiCostPerMinute * (1 + pricingSettings.markupPercentage / 100));
      totalSessionRevenue += sessionRevenue;
    }
    
    // Calculate costs and profits
    const totalSessionDurationMinutes = totalSessionDuration / 60;
    const totalCost = totalSessionDurationMinutes * pricingSettings.vapiCostPerMinute;
    const totalRevenue = totalSessionRevenue + totalLicenseRevenue;
    const totalProfit = totalRevenue - totalCost;
    const marginPercentage = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    
    // Create the margin data record
    const marginData = {
      date: yesterday,
      period: 'daily',
      vapiCostPerMinute: pricingSettings.vapiCostPerMinute,
      markupPercentage: pricingSettings.markupPercentage,
      averageSessionLength: averageSessionLength / 60, // Convert to minutes
      totalSessions: totalSessions,
      totalRevenue: totalRevenue,
      totalCost: totalCost,
      totalProfit: totalProfit,
      marginPercentage: marginPercentage,
      licenseRevenue: totalLicenseRevenue,
      sessionRevenue: totalSessionRevenue,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    // Save to financial_analytics collection
    const docRef = await db.collection('financial_analytics').add(marginData);
    console.log(`✅ Saved daily margin data with ID: ${docRef.id}`);
    console.log(`💰 Total Revenue: $${totalRevenue.toFixed(2)}`);
    console.log(`💸 Total Cost: $${totalCost.toFixed(2)}`);
    console.log(`💵 Total Profit: $${totalProfit.toFixed(2)}`);
    console.log(`📊 Margin: ${marginPercentage.toFixed(2)}%`);
    
    // If there's no activity, still save a record with zero values
    if (totalSessions === 0 && activeInstitutions.length === 0) {
      console.log('ℹ️ No activity detected - saving zero-value record for tracking purposes');
    }
    
    return null;
  } catch (error) {
    console.error('💥 Error calculating daily margin:', error);
    return null;
  }
});
