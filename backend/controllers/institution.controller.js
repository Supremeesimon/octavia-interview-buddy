const db = require('../config/database');

const institutionController = {
  // Get all institutions
  async getAllInstitutions(req, res) {
    try {
      const result = await db.query(
        `SELECT id, name, domain, website, logo_url, admin_id, is_active,
                allowed_bookings_per_month, session_length, created_at, updated_at
         FROM institutions ORDER BY name`
      );

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Get all institutions error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get institution by ID
  async getInstitutionById(req, res) {
    try {
      const { id } = req.params;

      // Check if user has permission to view this institution
      if (req.user.role === 'institution_admin' && req.user.institutionId !== id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const result = await db.query(
        `SELECT id, name, domain, website, logo_url, admin_id, is_active,
                allowed_bookings_per_month, session_length, created_at, updated_at
         FROM institutions WHERE id = $1`,
        [id]
      );

      const institution = result.rows[0];
      if (!institution) {
        return res.status(404).json({
          success: false,
          message: 'Institution not found'
        });
      }

      res.json({
        success: true,
        data: institution
      });
    } catch (error) {
      console.error('Get institution by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Create institution
  async createInstitution(req, res) {
    try {
      const { name, domain, website, logoUrl, adminId, isActive, 
              allowedBookingsPerMonth, sessionLength } = req.body;

      // Validate required fields
      if (!name || !domain) {
        return res.status(400).json({
          success: false,
          message: 'Name and domain are required'
        });
      }

      // Insert new institution
      const result = await db.query(
        `INSERT INTO institutions (name, domain, website, logo_url, admin_id, is_active,
                                   allowed_bookings_per_month, session_length)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, name, domain, website, logo_url, admin_id, is_active,
                   allowed_bookings_per_month, session_length, created_at, updated_at`,
        [name, domain, website, logoUrl, adminId, isActive, allowedBookingsPerMonth, sessionLength]
      );

      const newInstitution = result.rows[0];

      res.status(201).json({
        success: true,
        message: 'Institution created successfully',
        data: newInstitution
      });
    } catch (error) {
      console.error('Create institution error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Update institution
  async updateInstitution(req, res) {
    try {
      const { id } = req.params;
      const { name, domain, website, logoUrl, adminId, isActive, 
              allowedBookingsPerMonth, sessionLength } = req.body;

      // Check if institution exists
      const existingInstitution = await db.query('SELECT id FROM institutions WHERE id = $1', [id]);
      if (existingInstitution.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Institution not found'
        });
      }

      // Check if user has permission to update this institution
      if (req.user.role === 'institution_admin' && req.user.institutionId !== id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Build update query dynamically
      const updates = [];
      const values = [];
      let index = 1;

      if (name !== undefined) {
        updates.push(`name = $${index}`);
        values.push(name);
        index++;
      }

      if (domain !== undefined) {
        updates.push(`domain = $${index}`);
        values.push(domain);
        index++;
      }

      if (website !== undefined) {
        updates.push(`website = $${index}`);
        values.push(website);
        index++;
      }

      if (logoUrl !== undefined) {
        updates.push(`logo_url = $${index}`);
        values.push(logoUrl);
        index++;
      }

      if (adminId !== undefined) {
        updates.push(`admin_id = $${index}`);
        values.push(adminId);
        index++;
      }

      if (isActive !== undefined) {
        updates.push(`is_active = $${index}`);
        values.push(isActive);
        index++;
      }

      if (allowedBookingsPerMonth !== undefined) {
        updates.push(`allowed_bookings_per_month = $${index}`);
        values.push(allowedBookingsPerMonth);
        index++;
      }

      if (sessionLength !== undefined) {
        updates.push(`session_length = $${index}`);
        values.push(sessionLength);
        index++;
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid fields to update'
        });
      }

      values.push(id); // Add institution ID for WHERE clause

      // Update institution
      const result = await db.query(
        `UPDATE institutions 
         SET ${updates.join(', ')}, updated_at = NOW() 
         WHERE id = $${index} 
         RETURNING id, name, domain, website, logo_url, admin_id, is_active,
                   allowed_bookings_per_month, session_length, created_at, updated_at`,
        values
      );

      const updatedInstitution = result.rows[0];

      res.json({
        success: true,
        message: 'Institution updated successfully',
        data: updatedInstitution
      });
    } catch (error) {
      console.error('Update institution error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Delete institution
  async deleteInstitution(req, res) {
    try {
      const { id } = req.params;

      // Check if institution exists
      const existingInstitution = await db.query('SELECT id FROM institutions WHERE id = $1', [id]);
      if (existingInstitution.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Institution not found'
        });
      }

      // Delete institution
      await db.query('DELETE FROM institutions WHERE id = $1', [id]);

      res.json({
        success: true,
        message: 'Institution deleted successfully'
      });
    } catch (error) {
      console.error('Delete institution error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get institution stats
  async getInstitutionStats(req, res) {
    try {
      const { id } = req.params;

      // Check if user has permission to view this institution
      if (req.user.role === 'institution_admin' && req.user.institutionId !== id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const result = await db.query(
        `SELECT total_students, active_students, total_interviews, average_score,
                session_utilization, monthly_usage, department_stats, updated_at
         FROM institution_stats WHERE institution_id = $1`,
        [id]
      );

      const stats = result.rows[0] || null;

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get institution stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get institution students
  async getInstitutionStudents(req, res) {
    try {
      const { id } = req.params;

      // Check if user has permission to view this institution
      if (req.user.role === 'institution_admin' && req.user.institutionId !== id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const result = await db.query(
        `SELECT id, email, name, role, profile_picture_url, is_email_verified,
                last_login_at, created_at
         FROM users WHERE institution_id = $1 AND role = 'student'
         ORDER BY created_at DESC`,
        [id]
      );

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Get institution students error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

module.exports = institutionController;