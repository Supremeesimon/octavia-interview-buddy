const db = require('../config/database');

const userController = {
  // Get current user profile
  async getProfile(req, res) {
    try {
      const userId = req.user.id;

      const result = await db.query(
        `SELECT id, email, name, role, institution_id, profile_picture_url, 
                is_email_verified, last_login_at, created_at
         FROM users WHERE id = $1`,
        [userId]
      );

      const user = result.rows[0];
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get user by ID
  async getUserById(req, res) {
    try {
      const { id } = req.params;

      // Check if user has permission to view this user
      if (req.user.role === 'institution_admin' && req.user.institutionId) {
        // Institution admins can only view users from their institution
        const result = await db.query(
          `SELECT id, email, name, role, institution_id, profile_picture_url, 
                  is_email_verified, last_login_at, created_at
           FROM users 
           WHERE id = $1 AND institution_id = $2`,
          [id, req.user.institutionId]
        );

        const user = result.rows[0];
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found or access denied'
          });
        }

        res.json({
          success: true,
          data: user
        });
      } else {
        // Platform admins can view any user
        const result = await db.query(
          `SELECT id, email, name, role, institution_id, profile_picture_url, 
                  is_email_verified, last_login_at, created_at
           FROM users WHERE id = $1`,
          [id]
        );

        const user = result.rows[0];
        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          });
        }

        res.json({
          success: true,
          data: user
        });
      }
    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Update user
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { name, email, role, institutionId } = req.body;

      // Check if user exists
      const existingUser = await db.query('SELECT id FROM users WHERE id = $1', [id]);
      if (existingUser.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
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

      if (email !== undefined) {
        updates.push(`email = $${index}`);
        values.push(email);
        index++;
      }

      if (role !== undefined) {
        updates.push(`role = $${index}`);
        values.push(role);
        index++;
      }

      if (institutionId !== undefined) {
        updates.push(`institution_id = $${index}`);
        values.push(institutionId);
        index++;
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid fields to update'
        });
      }

      values.push(id); // Add user ID for WHERE clause

      // Update user
      const result = await db.query(
        `UPDATE users 
         SET ${updates.join(', ')}, updated_at = NOW() 
         WHERE id = $${index} 
         RETURNING id, email, name, role, institution_id, profile_picture_url, is_email_verified`,
        values
      );

      const updatedUser = result.rows[0];

      res.json({
        success: true,
        message: 'User updated successfully',
        data: updatedUser
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Delete user
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      // Check if user exists
      const existingUser = await db.query('SELECT id FROM users WHERE id = $1', [id]);
      if (existingUser.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Delete user
      await db.query('DELETE FROM users WHERE id = $1', [id]);

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get users by institution
  async getUsersByInstitution(req, res) {
    try {
      const { institutionId } = req.params;

      // Check if user has permission to view users from this institution
      if (req.user.role === 'institution_admin' && req.user.institutionId !== institutionId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const result = await db.query(
        `SELECT id, email, name, role, institution_id, profile_picture_url, 
                is_email_verified, last_login_at, created_at
         FROM users WHERE institution_id = $1 ORDER BY created_at DESC`,
        [institutionId]
      );

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Get users by institution error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

module.exports = userController;