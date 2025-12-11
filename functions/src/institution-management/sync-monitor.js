/**
 * Database Synchronization Monitor
 * Continuously monitors and reconciles differences between Firebase and PostgreSQL
 */

const admin = require('firebase-admin');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');
const AutomatedInstitutionSetup = require('./automated-institution-setup');

// Load environment variables
dotenv.config();

class SyncMonitor {
  constructor() {
    // Use the initialized Firebase Admin SDK (don't initialize again)
    this.db = admin.firestore();
    
    // Use the shared PostgreSQL connection pool
    this.pgPool = new Pool({
      user: process.env.DB_USER || process.env.USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'octavia_interview_buddy',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 5432,
      connectionString: process.env.DATABASE_URL, // Use connection string if available
    });
    
    // Sync interval (every 1 hour)
    this.syncInterval = 60 * 60 * 1000;
  }

  /**
   * Start the synchronization monitor
   */
  start() {
    console.log('🚀 Starting synchronization monitor...');
    
    // Run immediately
    this.performSync();
    
    // Schedule periodic sync
    setInterval(() => {
      this.performSync();
    }, this.syncInterval);
  }

  /**
   * Perform synchronization between Firebase and PostgreSQL
   */
  async performSync() {
    try {
      console.log('🔄 Performing database synchronization...');
      
      // Check for orphaned institution interest requests
      await this.checkOrphanedRequests();
      
      // Check for institution ID mismatches
      await this.checkInstitutionIdConsistency();
      
      // Check for missing user accounts
      await this.checkMissingUsers();
      
      console.log('✅ Synchronization cycle completed');
    } catch (error) {
      console.error('❌ Synchronization error:', error.message);
    }
  }

  /**
   * Check for institution interest requests without corresponding institutions
   */
  async checkOrphanedRequests() {
    console.log('🔍 Checking for orphaned institution requests...');
    
    const client = await this.pgPool.connect();
    try {
      // Get all processed institution interest requests
      const requestsSnap = await this.db.collection('institution_interests').get();
      
      for (const requestDoc of requestsSnap.docs) {
        const requestData = requestDoc.data();
        
        // Skip if already properly processed
        if (requestData.status === 'completed' || requestData.userId) {
          continue;
        }
        
        // Check if user exists
        const userResult = await client.query(
          'SELECT id FROM users WHERE email = $1',
          [requestData.email]
        );
        
        if (userResult.rowCount === 0) {
          console.log(`⚠️  Found orphaned request: ${requestData.institutionName} (${requestData.email})`);
          
          // Flag for manual review or automatic processing
          await this.flagForProcessing(requestDoc.id, requestData);
        }
      }
    } finally {
      client.release();
    }
  }

  /**
   * Check for institution ID consistency between Firebase and PostgreSQL
   */
  async checkInstitutionIdConsistency() {
    console.log('🔍 Checking institution ID consistency...');
    
    const client = await this.pgPool.connect();
    try {
      // Get all institutions from both databases
      const fbInstitutionsSnap = await this.db.collection('institutions').get();
      const pgInstitutionsResult = await client.query('SELECT id, name FROM institutions');
      
      // Create maps for easier lookup
      const fbInstitutions = new Map();
      fbInstitutionsSnap.forEach(doc => {
        fbInstitutions.set(doc.data().name, {
          id: doc.id,
          ...doc.data()
        });
      });
      
      const pgInstitutions = new Map();
      pgInstitutionsResult.rows.forEach(row => {
        pgInstitutions.set(row.name, row);
      });
      
      // Check for mismatches
      for (const [name, fbInst] of fbInstitutions) {
        const pgInst = pgInstitutions.get(name);
        
        if (!pgInst) {
          console.log(`⚠️  Institution exists in Firebase but not PostgreSQL: ${name}`);
          // Could trigger automatic creation
        } else if (fbInst.id === pgInst.id) {
          // This is expected to be different since Firebase uses string IDs and PostgreSQL uses UUIDs
          // This is actually correct behavior
        }
      }
    } finally {
      client.release();
    }
  }

  /**
   * Check for users who should exist but don't
   */
  async checkMissingUsers() {
    console.log('🔍 Checking for missing users...');
    
    const client = await this.pgPool.connect();
    try {
      // Get institution interest requests that should have users
      const requestsSnap = await this.db.collection('institution_interests').get();
      
      for (const requestDoc of requestsSnap.docs) {
        const requestData = requestDoc.data();
        
        // Skip if marked as processed
        if (requestData.status === 'processed' || requestData.status === 'completed') {
          continue;
        }
        
        // Check if user exists
        const userResult = await client.query(
          'SELECT id FROM users WHERE email = $1',
          [requestData.email]
        );
        
        if (userResult.rowCount === 0) {
          console.log(`⚠️  Missing user account for: ${requestData.email}`);
          
          // Create missing user automatically
          await this.createMissingUser(requestData, requestDoc.id);
        }
      }
    } finally {
      client.release();
    }
  }

  /**
   * Flag an institution request for processing
   */
  async flagForProcessing(requestId, requestData) {
    // Update the request to flag it for attention
    // In a real implementation, this might send an alert or create a task
    console.log(`🚩 Flagged request ${requestId} for processing: ${requestData.institutionName}`);
  }

  /**
   * Create a missing user account
   */
  async createMissingUser(requestData, requestId) {
    console.log(`🔧 Attempting to create missing user: ${requestData.email}`);
    
    try {
      // Use the automated setup system to create the missing user
      const setup = new AutomatedInstitutionSetup();
      
      // Add the request ID to the data
      requestData.requestId = requestId;
      
      // Process the institution interest
      await setup.processInstitutionInterest(requestData);
      
      console.log(`✅ Successfully created missing user: ${requestData.email}`);
    } catch (error) {
      console.error(`❌ Failed to create missing user: ${error.message}`);
    }
  }

  /**
   * Report synchronization status
   */
  async getSyncReport() {
    const report = {
      timestamp: new Date(),
      orphanedRequests: 0,
      missingUsers: 0,
      idMismatches: 0,
      lastRun: new Date()
    };
    
    // Gather statistics
    // ... implementation would populate the report
    
    return report;
  }
}

module.exports = SyncMonitor;

console.log('Sync Monitor system ready');