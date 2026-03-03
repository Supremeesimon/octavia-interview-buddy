const db = require('../config/database');
const brevoService = require('../services/brevo.service');

const interviewController = {
  // Book interview from Vapi webhook
  async bookInterviewFromVapi(req, res) {
    try {
      const { name, email, datetime, timezone, role, assistant } = req.body;

      // Basic validation
      if (!email || !datetime) {
        return res.status(400).json({
          success: false,
          message: 'Email and datetime are required'
        });
      }

      // Insert into vapi_bookings table
      // We use a separate table for Vapi bookings to avoid strict foreign key constraints
      // of the main interviews table (which requires resume_id and user_id)
      const result = await db.query(
        `INSERT INTO vapi_bookings (name, email, scheduled_at, timezone, role, assistant, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'confirmed')
         RETURNING id, name, email, scheduled_at`,
        [name, email, datetime, timezone, role, assistant]
      );

      const booking = result.rows[0];

      // Format date for email
      const dateOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
        timeZone: timezone 
      };
      const formattedDate = new Date(datetime).toLocaleString('en-US', dateOptions);

      // Send confirmation email
      const emailSubject = `Interview Confirmed: ${role} with ${assistant}`;
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Interview Confirmed</h2>
          <p>Hi ${name},</p>
          <p>Your interview for <strong>${role}</strong> with <strong>${assistant}</strong> has been successfully scheduled.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Date & Time:</strong> ${formattedDate}</p>
            <p style="margin: 10px 0 0;"><strong>Assistant:</strong> ${assistant}</p>
          </div>
          <p>We look forward to speaking with you!</p>
          <p style="font-size: 12px; color: #888; margin-top: 30px;">
            Powered by Octavia Interview Buddy
          </p>
        </div>
      `;

      try {
        await brevoService.sendEmail(email, emailSubject, emailHtml);
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // We don't block the response if email fails, but we log it
      }

      res.json({
        success: true,
        message: 'Interview scheduled successfully',
        bookingId: booking.id
      });

    } catch (error) {
      console.error('Vapi booking error:', error);
      
      // Check if table exists error
      if (error.code === '42P01') { // undefined_table
        return res.status(500).json({
          success: false,
          message: 'Database configuration error: Bookings table not found'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get interviews for current user
  async getUserInterviews(req, res) {
    try {
      const userId = req.user.id;

      const result = await db.query(
        `SELECT id, resume_id, session_allocation_id, scheduled_at, started_at, ended_at,
                duration, status, type, vapi_call_id, recording_url, recording_duration,
                overall_score, created_at, updated_at
         FROM interviews 
         WHERE student_id = $1 
         ORDER BY scheduled_at DESC`,
        [userId]
      );

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Get user interviews error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get interview by ID
  async getInterviewById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await db.query(
        `SELECT id, resume_id, session_allocation_id, scheduled_at, started_at, ended_at,
                duration, status, type, vapi_call_id, recording_url, recording_duration,
                transcript, overall_score, category_scores, created_at, updated_at
         FROM interviews 
         WHERE id = $1 AND student_id = $2`,
        [id, userId]
      );

      const interview = result.rows[0];
      if (!interview) {
        return res.status(404).json({
          success: false,
          message: 'Interview not found'
        });
      }

      res.json({
        success: true,
        data: interview
      });
    } catch (error) {
      console.error('Get interview by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Create new interview
  async createInterview(req, res) {
    try {
      const userId = req.user.id;
      const { resumeId, sessionAllocationId, scheduledAt, type } = req.body;

      // Validate input
      if (!resumeId || !scheduledAt) {
        return res.status(400).json({
          success: false,
          message: 'Resume ID and scheduled time are required'
        });
      }

      // Check if resume exists and belongs to user
      const resumeResult = await db.query(
        'SELECT id FROM resumes WHERE id = $1 AND student_id = $2',
        [resumeId, userId]
      );

      if (resumeResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Resume not found'
        });
      }

      // Insert new interview
      const result = await db.query(
        `INSERT INTO interviews (student_id, resume_id, session_allocation_id, scheduled_at, type)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, resume_id, session_allocation_id, scheduled_at, type, status, created_at`,
        [userId, resumeId, sessionAllocationId, scheduledAt, type || 'general']
      );

      const newInterview = result.rows[0];

      res.status(201).json({
        success: true,
        message: 'Interview scheduled successfully',
        data: newInterview
      });
    } catch (error) {
      console.error('Create interview error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Update interview
  async updateInterview(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { scheduledAt, type } = req.body;

      // Check if interview exists and belongs to user
      const existingInterview = await db.query(
        'SELECT id FROM interviews WHERE id = $1 AND student_id = $2',
        [id, userId]
      );

      if (existingInterview.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Interview not found'
        });
      }

      // Build update query dynamically
      const updates = [];
      const values = [];
      let index = 1;

      if (scheduledAt !== undefined) {
        updates.push(`scheduled_at = $${index}`);
        values.push(scheduledAt);
        index++;
      }

      if (type !== undefined) {
        updates.push(`type = $${index}`);
        values.push(type);
        index++;
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid fields to update'
        });
      }

      values.push(id); // Add interview ID for WHERE clause

      // Update interview
      const result = await db.query(
        `UPDATE interviews 
         SET ${updates.join(', ')}, updated_at = NOW() 
         WHERE id = $${index} 
         RETURNING id, resume_id, session_allocation_id, scheduled_at, started_at, ended_at,
                   duration, status, type, vapi_call_id, recording_url, recording_duration,
                   transcript, overall_score, category_scores, updated_at`,
        values
      );

      const updatedInterview = result.rows[0];

      res.json({
        success: true,
        message: 'Interview updated successfully',
        data: updatedInterview
      });
    } catch (error) {
      console.error('Update interview error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Delete interview
  async deleteInterview(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check if interview exists and belongs to user
      const existingInterview = await db.query(
        'SELECT id FROM interviews WHERE id = $1 AND student_id = $2',
        [id, userId]
      );

      if (existingInterview.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Interview not found'
        });
      }

      // Delete interview
      await db.query('DELETE FROM interviews WHERE id = $1', [id]);

      res.json({
        success: true,
        message: 'Interview deleted successfully'
      });
    } catch (error) {
      console.error('Delete interview error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get interview feedback
  async getInterviewFeedback(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check if interview exists and belongs to user
      const interviewResult = await db.query(
        'SELECT id FROM interviews WHERE id = $1 AND student_id = $2',
        [id, userId]
      );

      if (interviewResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Interview not found'
        });
      }

      const result = await db.query(
        `SELECT id, overall_score, strengths, improvements, recommendations,
                detailed_analysis, category_feedback, ai_model_version, confidence_score, created_at
         FROM interview_feedback 
         WHERE interview_id = $1`,
        [id]
      );

      const feedback = result.rows[0] || null;

      res.json({
        success: true,
        data: feedback
      });
    } catch (error) {
      console.error('Get interview feedback error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Start interview
  async startInterview(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { vapiCallId } = req.body;

      // Check if interview exists and belongs to user
      const existingInterview = await db.query(
        'SELECT id, status FROM interviews WHERE id = $1 AND student_id = $2',
        [id, userId]
      );

      if (existingInterview.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Interview not found'
        });
      }

      const interview = existingInterview.rows[0];
      if (interview.status !== 'scheduled') {
        return res.status(400).json({
          success: false,
          message: 'Interview is not in scheduled status'
        });
      }

      // Update interview status to in_progress
      const result = await db.query(
        `UPDATE interviews 
         SET status = 'in_progress', started_at = NOW(), vapi_call_id = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING id, status, started_at, vapi_call_id`,
        [vapiCallId, id]
      );

      const updatedInterview = result.rows[0];

      res.json({
        success: true,
        message: 'Interview started successfully',
        data: updatedInterview
      });
    } catch (error) {
      console.error('Start interview error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // End interview
  async endInterview(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { transcript, recordingUrl, recordingDuration, overallScore, categoryScores } = req.body;

      // Check if interview exists and belongs to user
      const existingInterview = await db.query(
        'SELECT id, status, started_at FROM interviews WHERE id = $1 AND student_id = $2',
        [id, userId]
      );

      if (existingInterview.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Interview not found'
        });
      }

      const interview = existingInterview.rows[0];
      if (interview.status !== 'in_progress') {
        return res.status(400).json({
          success: false,
          message: 'Interview is not in progress'
        });
      }

      // Calculate duration if started_at exists
      let duration = null;
      if (interview.started_at) {
        const startedAt = new Date(interview.started_at);
        const endedAt = new Date();
        duration = Math.floor((endedAt - startedAt) / 1000); // in seconds
      }

      // Update interview status to completed
      const result = await db.query(
        `UPDATE interviews 
         SET status = 'completed', ended_at = NOW(), duration = $1, transcript = $2,
             recording_url = $3, recording_duration = $4, overall_score = $5, category_scores = $6,
             updated_at = NOW()
         WHERE id = $7
         RETURNING id, status, ended_at, duration, transcript, recording_url, recording_duration,
                   overall_score, category_scores`,
        [duration, transcript, recordingUrl, recordingDuration, overallScore, 
         categoryScores ? JSON.stringify(categoryScores) : null, id]
      );

      const updatedInterview = result.rows[0];

      res.json({
        success: true,
        message: 'Interview ended successfully',
        data: updatedInterview
      });
    } catch (error) {
      console.error('End interview error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

module.exports = interviewController;