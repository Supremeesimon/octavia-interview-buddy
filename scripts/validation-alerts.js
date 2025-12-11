/**
 * Data Validation and Alert System
 * Validates data consistency and sends alerts for issues
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const { Pool } = require('pg');

class ValidationAlertSystem {
  constructor() {
    this.firebaseApp = initializeApp({
      // Firebase config
    });
    this.db = getFirestore(this.firebaseApp);
    
    this.pgPool = new Pool({
      // PostgreSQL config
    });
    
    // Alert thresholds
    this.alertThresholds = {
      orphanedRequests: 0, // Alert on any orphaned requests
      missingUsers: 0,     // Alert on any missing users
      syncDelay: 24 * 60 * 60 * 1000 // 24 hours
    };
  }

  /**
   * Run comprehensive validation
   */
  async runValidation() {
    console.log('🔍 Running data validation...');
    
    const issues = [];
    
    // Check 1: Orphaned institution requests
    const orphanedIssues = await this.checkOrphanedRequests();
    issues.push(...orphanedIssues);
    
    // Check 2: User-institution linking
    const linkingIssues = await this.checkUserInstitutionLinking();
    issues.push(...linkingIssues);
    
    // Check 3: Data consistency
    const consistencyIssues = await this.checkDataConsistency();
    issues.push(...consistencyIssues);
    
    // Check 4: Recent activity
    const activityIssues = await this.checkRecentActivity();
    issues.push(...activityIssues);
    
    if (issues.length > 0) {
      console.log(`⚠️  Found ${issues.length} validation issues`);
      await this.sendAlerts(issues);
    } else {
      console.log('✅ All validations passed');
    }
    
    return issues;
  }

  /**
   * Check for orphaned institution requests
   */
  async checkOrphanedRequests() {
    const issues = [];
    
    try {
      const client = await this.pgPool.connect();
      try {
        const requestsSnap = await getDocs(collection(this.db, 'institution_interests'));
        
        for (const requestDoc of requestsSnap.docs) {
          const requestData = requestDoc.data();
          const requestId = requestDoc.id;
          
          // Skip completed requests
          if (requestData.status === 'completed') {
            continue;
          }
          
          // Check if processing is taking too long
          if (requestData.createdAt) {
            const age = Date.now() - requestData.createdAt.toDate().getTime();
            if (age > this.alertThresholds.syncDelay) {
              issues.push({
                type: 'orphaned_request',
                severity: 'warning',
                message: `Request ${requestId} has been pending for ${Math.floor(age/(1000*60*60))} hours`,
                data: {
                  requestId,
                  institutionName: requestData.institutionName,
                  email: requestData.email,
                  ageHours: Math.floor(age/(1000*60*60))
                }
              });
            }
          }
          
          // Check if user exists
          const userResult = await client.query(
            'SELECT id FROM users WHERE email = $1',
            [requestData.email]
          );
          
          if (userResult.rowCount === 0 && requestData.status !== 'failed') {
            issues.push({
              type: 'missing_user',
              severity: 'critical',
              message: `No user account for institution request: ${requestData.institutionName}`,
              data: {
                requestId,
                institutionName: requestData.institutionName,
                email: requestData.email
              }
            });
          }
        }
      } finally {
        client.release();
      }
    } catch (error) {
      issues.push({
        type: 'validation_error',
        severity: 'critical',
        message: `Error checking orphaned requests: ${error.message}`,
        data: { error: error.message }
      });
    }
    
    return issues;
  }

  /**
   * Check user-institution linking
   */
  async checkUserInstitutionLinking() {
    const issues = [];
    
    try {
      const client = await this.pgPool.connect();
      try {
        // Find users with institution_id that doesn't exist
        const invalidLinksResult = await client.query(`
          SELECT u.id, u.email, u.institution_id 
          FROM users u 
          LEFT JOIN institutions i ON u.institution_id = i.id 
          WHERE u.institution_id IS NOT NULL AND i.id IS NULL
        `);
        
        for (const row of invalidLinksResult.rows) {
          issues.push({
            type: 'invalid_institution_link',
            severity: 'critical',
            message: `User ${row.email} linked to non-existent institution ${row.institution_id}`,
            data: {
              userId: row.id,
              email: row.email,
              institutionId: row.institution_id
            }
          });
        }
        
        // Find institution admins not linked to institutions
        const unlinkedAdminsResult = await client.query(`
          SELECT id, email, name 
          FROM users 
          WHERE role = 'institution_admin' AND institution_id IS NULL
        `);
        
        for (const row of unlinkedAdminsResult.rows) {
          issues.push({
            type: 'unlinked_institution_admin',
            severity: 'warning',
            message: `Institution admin ${row.email} not linked to any institution`,
            data: {
              userId: row.id,
              email: row.email,
              name: row.name
            }
          });
        }
      } finally {
        client.release();
      }
    } catch (error) {
      issues.push({
        type: 'validation_error',
        severity: 'critical',
        message: `Error checking user-institution linking: ${error.message}`,
        data: { error: error.message }
      });
    }
    
    return issues;
  }

  /**
   * Check data consistency between Firebase and PostgreSQL
   */
  async checkDataConsistency() {
    const issues = [];
    
    try {
      const client = await this.pgPool.connect();
      try {
        // Compare institution counts
        const fbInstitutionsSnap = await getDocs(collection(this.db, 'institutions'));
        const pgInstitutionsResult = await client.query('SELECT COUNT(*) as count FROM institutions');
        
        const fbCount = fbInstitutionsSnap.size;
        const pgCount = parseInt(pgInstitutionsResult.rows[0].count);
        
        if (Math.abs(fbCount - pgCount) > 2) { // Allow small differences
          issues.push({
            type: 'institution_count_mismatch',
            severity: 'warning',
            message: `Institution count mismatch: Firebase=${fbCount}, PostgreSQL=${pgCount}`,
            data: {
              firebaseCount: fbCount,
              postgresqlCount: pgCount
            }
          });
        }
        
        // Check for recently processed requests without users
        const recentRequestsSnap = await getDocs(collection(this.db, 'institution_interests'));
        
        for (const requestDoc of recentRequestsSnap.docs) {
          const requestData = requestDoc.data();
          
          // If processed in last 24 hours, check if user exists
          if (requestData.status === 'processed' && requestData.processedAt) {
            const processAge = Date.now() - requestData.processedAt.toDate().getTime();
            if (processAge < (24 * 60 * 60 * 1000)) { // Last 24 hours
              const userResult = await client.query(
                'SELECT id FROM users WHERE email = $1',
                [requestData.email]
              );
              
              if (userResult.rowCount === 0) {
                issues.push({
                  type: 'recent_processing_failure',
                  severity: 'critical',
                  message: `Recently processed request has no user: ${requestData.institutionName}`,
                  data: {
                    requestId: requestDoc.id,
                    institutionName: requestData.institutionName,
                    email: requestData.email,
                    processedAt: requestData.processedAt.toDate()
                  }
                });
              }
            }
          }
        }
      } finally {
        client.release();
      }
    } catch (error) {
      issues.push({
        type: 'validation_error',
        severity: 'critical',
        message: `Error checking data consistency: ${error.message}`,
        data: { error: error.message }
      });
    }
    
    return issues;
  }

  /**
   * Check recent activity for anomalies
   */
  async checkRecentActivity() {
    const issues = [];
    
    try {
      // Check for unusual spikes in requests
      const recentRequestsSnap = await getDocs(collection(this.db, 'institution_interests'));
      
      const now = Date.now();
      const oneHourAgo = now - (60 * 60 * 1000);
      const oneDayAgo = now - (24 * 60 * 60 * 1000);
      
      let recentCount = 0;
      let dailyCount = 0;
      
      recentRequestsSnap.forEach(doc => {
        const requestData = doc.data();
        if (requestData.createdAt) {
          const createdAt = requestData.createdAt.toDate().getTime();
          if (createdAt > oneHourAgo) recentCount++;
          if (createdAt > oneDayAgo) dailyCount++;
        }
      });
      
      // Alert if unusually high activity
      if (recentCount > 10) { // More than 10 requests in an hour
        issues.push({
          type: 'high_activity_spike',
          severity: 'warning',
          message: `Unusual activity spike: ${recentCount} requests in the last hour`,
          data: {
            recentCount,
            dailyCount
          }
        });
      }
    } catch (error) {
      issues.push({
        type: 'validation_error',
        severity: 'warning',
        message: `Error checking recent activity: ${error.message}`,
        data: { error: error.message }
      });
    }
    
    return issues;
  }

  /**
   * Send alerts for validation issues
   */
  async sendAlerts(issues) {
    console.log('🚨 Sending alerts for validation issues...');
    
    // Categorize by severity
    const criticalIssues = issues.filter(issue => issue.severity === 'critical');
    const warningIssues = issues.filter(issue => issue.severity === 'warning');
    
    if (criticalIssues.length > 0) {
      console.log(`🚨 ${criticalIssues.length} CRITICAL issues found:`);
      criticalIssues.forEach(issue => {
        console.log(`  - ${issue.message}`);
      });
      
      // Send critical alert (email, SMS, etc.)
      await this.sendCriticalAlert(criticalIssues);
    }
    
    if (warningIssues.length > 0) {
      console.log(`⚠️  ${warningIssues.length} WARNING issues found:`);
      warningIssues.forEach(issue => {
        console.log(`  - ${issue.message}`);
      });
      
      // Send warning alert
      await this.sendWarningAlert(warningIssues);
    }
  }

  /**
   * Send critical alert
   */
  async sendCriticalAlert(issues) {
    // Implementation would integrate with alerting service
    console.log('📧 Critical alert would be sent to administrators');
    
    // Example: Send to Slack, Email, SMS, etc.
    /*
    await sendSlackAlert({
      text: `🚨 Critical Data Validation Issues (${issues.length})`,
      attachments: issues.map(issue => ({
        color: 'danger',
        fields: [
          {
            title: issue.message,
            value: JSON.stringify(issue.data, null, 2),
            short: false
          }
        ]
      }))
    });
    */
  }

  /**
   * Send warning alert
   */
  async sendWarningAlert(issues) {
    // Implementation would integrate with alerting service
    console.log('📧 Warning alert would be sent to administrators');
  }

  /**
   * Generate validation report
   */
  async generateReport() {
    const issues = await this.runValidation();
    
    return {
      timestamp: new Date(),
      totalIssues: issues.length,
      criticalIssues: issues.filter(i => i.severity === 'critical').length,
      warningIssues: issues.filter(i => i.severity === 'warning').length,
      issues: issues
    };
  }
}

// Example usage as scheduled job
/*
const validator = new ValidationAlertSystem();

// Run validation every hour
setInterval(async () => {
  await validator.runValidation();
}, 60 * 60 * 1000);

// Or expose as API endpoint
// app.get('/validate', async (req, res) => {
//   const report = await validator.generateReport();
//   res.json(report);
// });
*/

console.log('Validation Alert System ready');
console.log('To implement: Schedule as cron job or deploy to cloud function');

module.exports = ValidationAlertSystem;