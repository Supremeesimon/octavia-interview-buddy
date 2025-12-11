const { Pool } = require('pg');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('../functions/service-account-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// PostgreSQL connection
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function migrateData() {
  try {
    console.log('Starting data migration from PostgreSQL to Firestore...');
    
    // Migrate users
    await migrateUsers();
    
    // Migrate institutions
    await migrateInstitutions();
    
    // Migrate session data
    await migrateSessionData();
    
    // Migrate resumes
    await migrateResumes();
    
    // Migrate interviews
    await migrateInterviews();
    
    console.log('Data migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await pgPool.end();
    process.exit(0);
  }
}

async function migrateUsers() {
  console.log('Migrating users...');
  const client = await pgPool.connect();
  try {
    const result = await client.query('SELECT * FROM users');
    for (const user of result.rows) {
      // Convert PostgreSQL user to Firestore document
      const userData = {
        email: user.email,
        name: user.name,
        role: user.role,
        isEmailVerified: user.is_email_verified,
        profilePictureUrl: user.profile_picture_url,
        lastLoginAt: user.last_login_at ? admin.firestore.Timestamp.fromDate(new Date(user.last_login_at)) : null,
        createdAt: user.created_at ? admin.firestore.Timestamp.fromDate(new Date(user.created_at)) : null,
        updatedAt: user.updated_at ? admin.firestore.Timestamp.fromDate(new Date(user.updated_at)) : null,
        institutionId: user.institution_id || null,
        firebaseUid: user.firebase_uid || null
      };
      
      // Create or update user document in Firestore
      await db.collection('users').doc(user.id).set(userData, { merge: true });
    }
    console.log(`Migrated ${result.rows.length} users`);
  } finally {
    client.release();
  }
}

async function migrateInstitutions() {
  console.log('Migrating institutions...');
  const client = await pgPool.connect();
  try {
    const result = await client.query('SELECT * FROM institutions');
    for (const institution of result.rows) {
      // Convert PostgreSQL institution to Firestore document
      const institutionData = {
        name: institution.name,
        domain: institution.domain,
        contactEmail: institution.contact_email,
        contactPhone: institution.contact_phone,
        address: institution.address,
        logoUrl: institution.logo_url,
        websiteUrl: institution.website_url,
        approvalStatus: institution.approval_status,
        isActive: institution.is_active,
        platformAdminId: institution.platform_admin_id,
        stripeCustomerId: institution.stripe_customer_id,
        createdAt: institution.created_at ? admin.firestore.Timestamp.fromDate(new Date(institution.created_at)) : null,
        updatedAt: institution.updated_at ? admin.firestore.Timestamp.fromDate(new Date(institution.updated_at)) : null
      };
      
      // Create or update institution document in Firestore
      await db.collection('institutions').doc(institution.id).set(institutionData, { merge: true });
    }
    console.log(`Migrated ${result.rows.length} institutions`);
  } finally {
    client.release();
  }
}

async function migrateSessionData() {
  console.log('Migrating session data...');
  const client = await pgPool.connect();
  
  try {
    // Migrate session purchases
    const purchasesResult = await client.query('SELECT * FROM session_purchases');
    for (const purchase of purchasesResult.rows) {
      const purchaseData = {
        institutionId: purchase.institution_id,
        sessionCount: purchase.session_count,
        pricePerSession: purchase.price_per_session,
        totalAmount: purchase.total_amount,
        paymentId: purchase.payment_id,
        paymentMethodId: purchase.payment_method_id,
        status: purchase.status,
        purchaseMetadata: purchase.purchase_metadata,
        createdAt: purchase.created_at ? admin.firestore.Timestamp.fromDate(new Date(purchase.created_at)) : null,
        updatedAt: purchase.updated_at ? admin.firestore.Timestamp.fromDate(new Date(purchase.updated_at)) : null
      };
      
      await db.collection('sessionPurchases').doc(purchase.id).set(purchaseData, { merge: true });
    }
    console.log(`Migrated ${purchasesResult.rows.length} session purchases`);
    
    // Migrate session pools
    const poolsResult = await client.query('SELECT * FROM session_pools');
    for (const pool of poolsResult.rows) {
      const poolData = {
        institutionId: pool.institution_id,
        totalSessions: pool.total_sessions,
        usedSessions: pool.used_sessions,
        createdAt: pool.created_at ? admin.firestore.Timestamp.fromDate(new Date(pool.created_at)) : null,
        updatedAt: pool.updated_at ? admin.firestore.Timestamp.fromDate(new Date(pool.updated_at)) : null
      };
      
      await db.collection('sessionPools').doc(pool.id).set(poolData, { merge: true });
    }
    console.log(`Migrated ${poolsResult.rows.length} session pools`);
    
    // Migrate session allocations
    const allocationsResult = await client.query('SELECT * FROM session_allocations');
    for (const allocation of allocationsResult.rows) {
      const allocationData = {
        sessionPoolId: allocation.session_pool_id,
        name: allocation.name,
        departmentId: allocation.department_id,
        studentId: allocation.student_id,
        allocatedSessions: allocation.allocated_sessions,
        usedSessions: allocation.used_sessions,
        createdAt: allocation.created_at ? admin.firestore.Timestamp.fromDate(new Date(allocation.created_at)) : null,
        updatedAt: allocation.updated_at ? admin.firestore.Timestamp.fromDate(new Date(allocation.updated_at)) : null
      };
      
      await db.collection('sessionAllocations').doc(allocation.id).set(allocationData, { merge: true });
    }
    console.log(`Migrated ${allocationsResult.rows.length} session allocations`);
    
  } finally {
    client.release();
  }
}

async function migrateResumes() {
  console.log('Migrating resumes...');
  const client = await pgPool.connect();
  try {
    const result = await client.query('SELECT * FROM resumes');
    for (const resume of result.rows) {
      const resumeData = {
        studentId: resume.student_id,
        type: resume.type,
        fileName: resume.file_name,
        fileUrl: resume.file_url,
        fileSize: resume.file_size,
        linkedinUrl: resume.linkedin_url,
        voiceRecordingUrl: resume.voice_recording_url,
        parsedContent: resume.parsed_content,
        skills: resume.skills,
        isDefault: resume.is_default,
        createdAt: resume.created_at ? admin.firestore.Timestamp.fromDate(new Date(resume.created_at)) : null,
        updatedAt: resume.updated_at ? admin.firestore.Timestamp.fromDate(new Date(resume.updated_at)) : null
      };
      
      await db.collection('resumes').doc(resume.id).set(resumeData, { merge: true });
    }
    console.log(`Migrated ${result.rows.length} resumes`);
  } finally {
    client.release();
  }
}

async function migrateInterviews() {
  console.log('Migrating interviews...');
  const client = await pgPool.connect();
  try {
    const result = await client.query('SELECT * FROM interviews');
    for (const interview of result.rows) {
      const interviewData = {
        studentId: interview.student_id,
        resumeId: interview.resume_id,
        sessionAllocationId: interview.session_allocation_id,
        scheduledAt: interview.scheduled_at ? admin.firestore.Timestamp.fromDate(new Date(interview.scheduled_at)) : null,
        startedAt: interview.started_at ? admin.firestore.Timestamp.fromDate(new Date(interview.started_at)) : null,
        endedAt: interview.ended_at ? admin.firestore.Timestamp.fromDate(new Date(interview.ended_at)) : null,
        duration: interview.duration,
        status: interview.status,
        type: interview.type,
        vapiCallId: interview.vapi_call_id,
        callMetadata: interview.call_metadata,
        transcript: interview.transcript,
        recordingUrl: interview.recording_url,
        recordingDuration: interview.recording_duration,
        overallScore: interview.overall_score,
        categoryScores: interview.category_scores,
        createdAt: interview.created_at ? admin.firestore.Timestamp.fromDate(new Date(interview.created_at)) : null,
        updatedAt: interview.updated_at ? admin.firestore.Timestamp.fromDate(new Date(interview.updated_at)) : null
      };
      
      await db.collection('interviews').doc(interview.id).set(interviewData, { merge: true });
    }
    console.log(`Migrated ${result.rows.length} interviews`);
  } finally {
    client.release();
  }
}

// Run migration
migrateData();