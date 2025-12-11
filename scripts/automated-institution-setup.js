/**
 * Automated Institution Setup Script
 * This script should run when an institution interest request is submitted
 * It automatically creates the institution, user account, and links them together
 */

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, updateDoc } = require('firebase/firestore');
const { Pool } = require('pg');

class AutomatedInstitutionSetup {
  constructor() {
    // Initialize Firebase
    this.firebaseApp = initializeApp({
      // Firebase config would come from environment variables
    });
    this.db = getFirestore(this.firebaseApp);
    
    // Initialize PostgreSQL connection
    this.pgPool = new Pool({
      // PostgreSQL config would come from environment variables
    });
  }

  /**
   * Main function to process institution interest requests
   * This should be triggered by a Firebase function when a new request is created
   */
  async processInstitutionInterest(institutionInterestData) {
    try {
      console.log(`Processing institution interest for: ${institutionInterestData.institutionName}`);
      
      // Step 1: Generate consistent IDs
      const institutionId = uuidv4(); // Generate a proper UUID for PostgreSQL
      
      // Step 2: Create institution in PostgreSQL
      await this.createInstitutionInPostgreSQL(institutionId, institutionInterestData);
      
      // Step 3: Create user account in PostgreSQL
      const userId = await this.createUserInPostgreSQL(institutionId, institutionInterestData);
      
      // Step 4: Update Firebase institution_interests record
      await this.updateFirebaseInterestRequest(institutionInterestData.requestId, {
        status: 'processed',
        processedAt: new Date(),
        userId: userId,
        institutionId: institutionId,
        notes: 'Automatically processed by institution setup system'
      });
      
      // Step 5: Create institution record in Firebase (if needed)
      await this.createFirebaseInstitution(institutionId, institutionInterestData);
      
      // Step 6: Send welcome email with password reset link
      await this.sendWelcomeEmail(institutionInterestData);
      
      console.log(`✅ Successfully processed institution interest for: ${institutionInterestData.institutionName}`);
      return { success: true, institutionId, userId };
      
    } catch (error) {
      console.error(`❌ Failed to process institution interest: ${error.message}`);
      
      // Update request status to indicate failure
      await this.updateFirebaseInterestRequest(institutionInterestData.requestId, {
        status: 'processing_failed',
        error: error.message,
        failedAt: new Date()
      });
      
      throw error;
    }
  }

  /**
   * Create institution record in PostgreSQL
   */
  async createInstitutionInPostgreSQL(institutionId, data) {
    const client = await this.pgPool.connect();
    try {
      await client.query(`
        INSERT INTO institutions (
          id, name, domain, contact_email, contact_phone, 
          approval_status, is_active, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      `, [
        institutionId,
        data.institutionName,
        data.institutionDomain || '', // Could be extracted from contact email
        data.email,
        data.phone || '',
        'pending', // Default to pending approval
        false // Not active until approved
      ]);
      
      console.log(`✅ Created institution in PostgreSQL: ${data.institutionName} (${institutionId})`);
    } finally {
      client.release();
    }
  }

  /**
   * Create user account in PostgreSQL
   */
  async createUserInPostgreSQL(institutionId, data) {
    const client = await this.pgPool.connect();
    try {
      // Generate temporary password
      const tempPassword = this.generateTemporaryPassword();
      const hashedPassword = await bcrypt.hash(tempPassword, 12);
      
      const result = await client.query(`
        INSERT INTO users (
          email, password_hash, name, role, institution_id, 
          is_email_verified, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING id
      `, [
        data.email,
        hashedPassword,
        data.contactName || data.institutionName,
        'institution_admin',
        institutionId,
        false // Email not yet verified
      ]);
      
      const userId = result.rows[0].id;
      console.log(`✅ Created user in PostgreSQL: ${data.email} (${userId})`);
      console.log(`ℹ️  Temporary password for ${data.email}: ${tempPassword}`);
      
      return userId;
    } finally {
      client.release();
    }
  }

  /**
   * Update Firebase institution_interests record
   */
  async updateFirebaseInterestRequest(requestId, updateData) {
    const requestRef = doc(this.db, 'institution_interests', requestId);
    await updateDoc(requestRef, updateData);
    console.log(`✅ Updated Firebase interest request: ${requestId}`);
  }

  /**
   * Create institution record in Firebase (if separate from interest request)
   */
  async createFirebaseInstitution(institutionId, data) {
    const institutionRef = doc(this.db, 'institutions', institutionId);
    await setDoc(institutionRef, {
      name: data.institutionName,
      domain: data.institutionDomain || '',
      contactEmail: data.email,
      contactPhone: data.phone || '',
      approvalStatus: 'pending',
      isActive: false,
      customSignupToken: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
      // Add other default institution settings
      settings: {
        sessionLength: 30,
        requireResumeUpload: true,
        enableDepartmentAllocations: false,
        enableStudentGroups: false,
        emailNotifications: {
          enableWeeklyReports: false,
          enableFeedbackEmails: true,
          enableInterviewReminders: true,
          reminderHours: 24
        }
      }
    });
    
    console.log(`✅ Created institution in Firebase: ${data.institutionName} (${institutionId})`);
  }

  /**
   * Send welcome email with password reset instructions
   */
  async sendWelcomeEmail(data) {
    // This would integrate with your email service (Brevo, SendGrid, etc.)
    console.log(`📧 Welcome email would be sent to: ${data.email}`);
    console.log(`   Subject: Welcome to Octavia Interview Buddy - ${data.institutionName}`);
    console.log(`   Content: Instructions for setting up your account and resetting password`);
  }

  /**
   * Generate a secure temporary password
   */
  generateTemporaryPassword(length = 12) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }

  /**
   * Firebase Cloud Function Trigger
   * This would be deployed to Firebase Functions
   */
  async firebaseFunctionTrigger(snap, context) {
    try {
      const institutionInterestData = snap.data();
      const requestId = context.params.requestId;
      
      // Add the request ID to the data
      institutionInterestData.requestId = requestId;
      
      // Process the institution interest
      await this.processInstitutionInterest(institutionInterestData);
      
      return null;
    } catch (error) {
      console.error('Error in Firebase function:', error);
      return null;
    }
  }
}

// Export for use in Firebase Functions
module.exports = AutomatedInstitutionSetup;

// Example usage (would be triggered by Firebase Functions)
/*
exports.processInstitutionInterest = functions.firestore
  .document('institution_interests/{requestId}')
  .onCreate(async (snap, context) => {
    const setup = new AutomatedInstitutionSetup();
    return await setup.firebaseFunctionTrigger(snap, context);
  });
*/

console.log('Automated Institution Setup system ready');
console.log('To implement: Deploy as Firebase Function to trigger on new institution_interests');