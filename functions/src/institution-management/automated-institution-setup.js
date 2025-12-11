/**
 * Automated Institution Setup Script
 * This script should run when an institution interest request is submitted
 * It automatically creates the institution, user account, and links them together
 */

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const admin = require('firebase-admin');
const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

class AutomatedInstitutionSetup {
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
      // Extract domain from email if not provided
      let domain = data.institutionDomain || '';
      if (!domain && data.email) {
        const emailParts = data.email.split('@');
        if (emailParts.length === 2) {
          domain = emailParts[1];
        }
      }
      
      await client.query(`
        INSERT INTO institutions (
          id, name, domain, contact_email, contact_phone, 
          approval_status, is_active, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      `, [
        institutionId,
        data.institutionName,
        domain,
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
    const requestRef = this.db.collection('institution_interests').doc(requestId);
    await requestRef.update(updateData);
    console.log(`✅ Updated Firebase interest request: ${requestId}`);
  }

  /**
   * Create institution record in Firebase (if separate from interest request)
   */
  async createFirebaseInstitution(institutionId, data) {
    // Extract domain from email if not provided
    let domain = data.institutionDomain || '';
    if (!domain && data.email) {
      const emailParts = data.email.split('@');
      if (emailParts.length === 2) {
        domain = emailParts[1];
      }
    }
    
    const institutionRef = this.db.collection('institutions').doc(institutionId);
    await institutionRef.set({
      name: data.institutionName,
      domain: domain,
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
}

// Export for use in Firebase Functions
module.exports = AutomatedInstitutionSetup;

console.log('Automated Institution Setup system ready');