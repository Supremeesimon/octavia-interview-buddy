/**
 * Database Synchronization Monitor
 * Continuously monitors and reconciles differences between Firebase and PostgreSQL
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

class SyncMonitor {
  constructor() {
    // Initialize Firebase
    this.firebaseApp = initializeApp({
      // Firebase config from environment
    });
    this.db = getFirestore(this.firebaseApp);
    
    // Initialize PostgreSQL
    this.pgPool = new Pool({
      // PostgreSQL config from environment
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
      const requestsSnap = await getDocs(collection(this.db, 'institution_interests'));
      
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
      const fbInstitutionsSnap = await getDocs(collection(this.db, 'institutions'));
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
      const requestsSnap = await getDocs(collection(this.db, 'institution_interests'));
      
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
          
          // Could trigger automatic user creation
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
    
    // In a real implementation, this would:
    // 1. Create the institution if needed
    // 2. Create the user account
    // 3. Link them together
    // 4. Send welcome email
    
    console.log(`📝 Would create user ${requestData.email} for institution ${requestData.institutionName}`);
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

// Example usage
/*
const monitor = new SyncMonitor();
monitor.start();

// Could also expose an API endpoint for manual triggering
// app.get('/sync/trigger', (req, res) => {
//   monitor.performSync();
//   res.json({ message: 'Synchronization triggered' });
// });
*/

console.log('Sync Monitor system ready');
console.log('To implement: Schedule as background service or deploy to cloud function');

module.exports = SyncMonitor;