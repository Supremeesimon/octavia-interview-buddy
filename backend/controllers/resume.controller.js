const db = require('../config/database');

const resumeController = {
  // Get resumes for current user
  async getUserResumes(req, res) {
    try {
      const userId = req.user.id;

      const result = await db.query(
        `SELECT id, type, file_name, file_url, file_size, linkedin_url, voice_recording_url,
                skills, is_default, created_at, updated_at
         FROM resumes 
         WHERE student_id = $1 
         ORDER BY is_default DESC, created_at DESC`,
        [userId]
      );

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Get user resumes error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get resume by ID
  async getResumeById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await db.query(
        `SELECT id, type, file_name, file_url, file_size, linkedin_url, voice_recording_url,
                parsed_content, skills, is_default, created_at, updated_at
         FROM resumes 
         WHERE id = $1 AND student_id = $2`,
        [id, userId]
      );

      const resume = result.rows[0];
      if (!resume) {
        return res.status(404).json({
          success: false,
          message: 'Resume not found'
        });
      }

      res.json({
        success: true,
        data: resume
      });
    } catch (error) {
      console.error('Get resume by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Upload new resume
  async uploadResume(req, res) {
    try {
      const userId = req.user.id;
      const { type, fileName, fileUrl, fileSize, linkedinUrl, voiceRecordingUrl, 
              parsedContent, skills, isDefault } = req.body;

      // Validate input
      if (!type) {
        return res.status(400).json({
          success: false,
          message: 'Resume type is required'
        });
      }

      // Check if setting as default
      let setIsDefault = isDefault || false;
      if (setIsDefault) {
        // Unset any existing default resume
        await db.query(
          'UPDATE resumes SET is_default = FALSE WHERE student_id = $1',
          [userId]
        );
      } else {
        // Check if user has any resumes, if not, make this one default
        const existingResumes = await db.query(
          'SELECT id FROM resumes WHERE student_id = $1',
          [userId]
        );

        if (existingResumes.rows.length === 0) {
          setIsDefault = true;
        }
      }

      // Insert new resume
      const result = await db.query(
        `INSERT INTO resumes (student_id, type, file_name, file_url, file_size, linkedin_url,
                             voice_recording_url, parsed_content, skills, is_default)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id, type, file_name, file_url, file_size, linkedin_url, voice_recording_url,
                   skills, is_default, created_at`,
        [userId, type, fileName, fileUrl, fileSize, linkedinUrl, voiceRecordingUrl, 
         parsedContent || {}, skills || [], setIsDefault]
      );

      const newResume = result.rows[0];

      res.status(201).json({
        success: true,
        message: 'Resume uploaded successfully',
        data: newResume
      });
    } catch (error) {
      console.error('Upload resume error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Update resume
  async updateResume(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { fileName, fileUrl, fileSize, linkedinUrl, voiceRecordingUrl, 
              parsedContent, skills, isDefault } = req.body;

      // Check if resume exists and belongs to user
      const existingResume = await db.query(
        'SELECT id, is_default FROM resumes WHERE id = $1 AND student_id = $2',
        [id, userId]
      );

      if (existingResume.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Resume not found'
        });
      }

      const currentResume = existingResume.rows[0];

      // Build update query dynamically
      const updates = [];
      const values = [];
      let index = 1;

      if (fileName !== undefined) {
        updates.push(`file_name = $${index}`);
        values.push(fileName);
        index++;
      }

      if (fileUrl !== undefined) {
        updates.push(`file_url = $${index}`);
        values.push(fileUrl);
        index++;
      }

      if (fileSize !== undefined) {
        updates.push(`file_size = $${index}`);
        values.push(fileSize);
        index++;
      }

      if (linkedinUrl !== undefined) {
        updates.push(`linkedin_url = $${index}`);
        values.push(linkedinUrl);
        index++;
      }

      if (voiceRecordingUrl !== undefined) {
        updates.push(`voice_recording_url = $${index}`);
        values.push(voiceRecordingUrl);
        index++;
      }

      if (parsedContent !== undefined) {
        updates.push(`parsed_content = $${index}`);
        values.push(parsedContent);
        index++;
      }

      if (skills !== undefined) {
        updates.push(`skills = $${index}`);
        values.push(skills);
        index++;
      }

      if (isDefault !== undefined && isDefault !== currentResume.is_default) {
        if (isDefault) {
          // Unset any existing default resume
          await db.query(
            'UPDATE resumes SET is_default = FALSE WHERE student_id = $1',
            [userId]
          );
        }
        updates.push(`is_default = $${index}`);
        values.push(isDefault);
        index++;
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid fields to update'
        });
      }

      values.push(id); // Add resume ID for WHERE clause

      // Update resume
      const result = await db.query(
        `UPDATE resumes 
         SET ${updates.join(', ')}, updated_at = NOW() 
         WHERE id = $${index} 
         RETURNING id, type, file_name, file_url, file_size, linkedin_url, voice_recording_url,
                   parsed_content, skills, is_default, updated_at`,
        values
      );

      const updatedResume = result.rows[0];

      res.json({
        success: true,
        message: 'Resume updated successfully',
        data: updatedResume
      });
    } catch (error) {
      console.error('Update resume error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Delete resume
  async deleteResume(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check if resume exists and belongs to user
      const existingResume = await db.query(
        'SELECT id, is_default FROM resumes WHERE id = $1 AND student_id = $2',
        [id, userId]
      );

      if (existingResume.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Resume not found'
        });
      }

      const resume = existingResume.rows[0];

      // Delete resume
      await db.query('DELETE FROM resumes WHERE id = $1', [id]);

      // If this was the default resume, set another one as default if available
      if (resume.is_default) {
        await db.query(
          `UPDATE resumes 
           SET is_default = TRUE 
           WHERE student_id = $1 
           ORDER BY created_at ASC 
           LIMIT 1`,
          [userId]
        );
      }

      res.json({
        success: true,
        message: 'Resume deleted successfully'
      });
    } catch (error) {
      console.error('Delete resume error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Set default resume
  async setDefaultResume(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check if resume exists and belongs to user
      const existingResume = await db.query(
        'SELECT id FROM resumes WHERE id = $1 AND student_id = $2',
        [id, userId]
      );

      if (existingResume.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Resume not found'
        });
      }

      // Unset any existing default resume
      await db.query(
        'UPDATE resumes SET is_default = FALSE WHERE student_id = $1',
        [userId]
      );

      // Set this resume as default
      const result = await db.query(
        'UPDATE resumes SET is_default = TRUE WHERE id = $1 RETURNING id, is_default',
        [id]
      );

      const updatedResume = result.rows[0];

      res.json({
        success: true,
        message: 'Default resume set successfully',
        data: updatedResume
      });
    } catch (error) {
      console.error('Set default resume error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

module.exports = resumeController;