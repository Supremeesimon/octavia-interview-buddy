/**
 * Institution Management Functions
 * Firebase Functions for automated institution setup, synchronization, and validation
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Firebase Admin SDK (moved to main index.js)
// admin.initializeApp(); // Removed this line

// Initialize PostgreSQL connection pool
const pgPool = new Pool({
  user: process.env.DB_USER || process.env.USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'octavia_interview_buddy',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
  connectionString: process.env.DATABASE_URL, // Use connection string if available
});

// Import our automation classes
const AutomatedInstitutionSetup = require('./automated-institution-setup');
const SyncMonitor = require('./sync-monitor');
const ValidationAlertSystem = require('./validation-alerts');

/**
 * Firebase Function: Automatically process new institution interest requests
 * Triggered when a new document is created in the institution_interests collection
 */
exports.processInstitutionInterest = functions.firestore
  .document('institution_interests/{requestId}')
  .onCreate(async (snap, context) => {
    try {
      const setup = new AutomatedInstitutionSetup();
      const institutionInterestData = snap.data();
      const requestId = context.params.requestId;
      
      // Add the request ID to the data
      institutionInterestData.requestId = requestId;
      
      // Process the institution interest
      const result = await setup.processInstitutionInterest(institutionInterestData);
      
      console.log(`✅ Successfully processed institution interest request: ${requestId}`);
      return result;
    } catch (error) {
      console.error('❌ Error processing institution interest:', error);
      return { success: false, error: error.message };
    }
  });

/**
 * Firebase Function: Scheduled synchronization monitor
 * Runs every hour to check for data consistency between Firebase and PostgreSQL
 */
exports.scheduledSyncMonitor = functions.pubsub
  .schedule('0 * * * *') // Every hour
  .timeZone('America/New_York')
  .onRun(async (context) => {
    try {
      console.log('🔄 Running scheduled synchronization monitor...');
      
      const monitor = new SyncMonitor();
      await monitor.performSync();
      
      console.log('✅ Scheduled synchronization completed');
      return null;
    } catch (error) {
      console.error('❌ Error in scheduled synchronization:', error);
      return null;
    }
  });

/**
 * Firebase Function: Daily validation and alert system
 * Runs daily to validate data consistency and send alerts for issues
 */
exports.dailyValidationAlerts = functions.pubsub
  .schedule('0 0 * * *') // Daily at midnight
  .timeZone('America/New_York')
  .onRun(async (context) => {
    try {
      console.log('🔍 Running daily validation and alert system...');
      
      const validator = new ValidationAlertSystem();
      const issues = await validator.runValidation();
      
      console.log(`✅ Daily validation completed with ${issues.length} issues found`);
      return { issuesCount: issues.length };
    } catch (error) {
      console.error('❌ Error in daily validation:', error);
      return null;
    }
  });

/**
 * HTTP Function: Manual trigger for synchronization
 * Can be called manually to force a synchronization cycle
 */
exports.triggerSync = functions.https.onRequest(async (req, res) => {
  try {
    // Check for proper authentication (in production, use proper auth)
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }
    
    console.log('🔄 Manually triggered synchronization...');
    
    const monitor = new SyncMonitor();
    await monitor.performSync();
    
    res.status(200).send({ message: 'Synchronization completed successfully' });
  } catch (error) {
    console.error('❌ Error in manual synchronization:', error);
    res.status(500).send({ error: error.message });
  }
});

/**
 * HTTP Function: Manual trigger for validation
 * Can be called manually to run validation checks
 */
exports.triggerValidation = functions.https.onRequest(async (req, res) => {
  try {
    // Check for proper authentication (in production, use proper auth)
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }
    
    console.log('🔍 Manually triggered validation...');
    
    const validator = new ValidationAlertSystem();
    const issues = await validator.runValidation();
    
    res.status(200).send({ 
      message: 'Validation completed', 
      issuesCount: issues.length,
      issues: issues
    });
  } catch (error) {
    console.error('❌ Error in manual validation:', error);
    res.status(500).send({ error: error.message });
  }
});

console.log('Institution Management Functions loaded');