const db = require('../config/database');

const sessionController = {
  // Get session purchases for institution
  async getSessionPurchases(req, res) {
    try {
      const institutionId = req.user.institutionId;

      const result = await db.query(
        `SELECT id, session_count, price_per_session, total_amount, payment_id,
                payment_method_id, status, purchase_metadata, created_at, updated_at
         FROM session_purchases 
         WHERE institution_id = $1 
         ORDER BY created_at DESC`,
        [institutionId]
      );

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Get session purchases error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Create session purchase
  async createSessionPurchase(req, res) {
    try {
      const institutionId = req.user.institutionId;
      const { sessionCount, pricePerSession } = req.body;

      // Validate input
      if (!sessionCount || sessionCount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Session count must be a positive number'
        });
      }

      const totalAmount = sessionCount * pricePerSession;

      // Insert new session purchase
      const result = await db.query(
        `INSERT INTO session_purchases (institution_id, session_count, price_per_session, total_amount, status)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, session_count, price_per_session, total_amount, status, created_at`,
        [institutionId, sessionCount, pricePerSession, totalAmount, 'pending']
      );

      const newPurchase = result.rows[0];

      res.status(201).json({
        success: true,
        message: 'Session purchase created successfully',
        data: newPurchase
      });
    } catch (error) {
      console.error('Create session purchase error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get session pool for institution
  async getSessionPool(req, res) {
    try {
      const institutionId = req.user.institutionId;

      const result = await db.query(
        `SELECT id, total_sessions, used_sessions, created_at, updated_at
         FROM session_pools 
         WHERE institution_id = $1`,
        [institutionId]
      );

      const sessionPool = result.rows[0] || null;

      res.json({
        success: true,
        data: sessionPool
      });
    } catch (error) {
      console.error('Get session pool error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Get session allocations for institution
  async getSessionAllocations(req, res) {
    try {
      const institutionId = req.user.institutionId;

      // First get the session pool ID
      const poolResult = await db.query(
        'SELECT id FROM session_pools WHERE institution_id = $1',
        [institutionId]
      );

      if (poolResult.rows.length === 0) {
        return res.json({
          success: true,
          data: []
        });
      }

      const sessionPoolId = poolResult.rows[0].id;

      const result = await db.query(
        `SELECT id, name, department_id, group_id, allocated_sessions, used_sessions, created_at, updated_at
         FROM session_allocations 
         WHERE session_pool_id = $1 
         ORDER BY name`,
        [sessionPoolId]
      );

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Get session allocations error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Create session allocation
  async createSessionAllocation(req, res) {
    try {
      const institutionId = req.user.institutionId;
      const { name, departmentId, groupId, allocatedSessions } = req.body;

      // Validate input
      if (!name || !allocatedSessions || allocatedSessions <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Name and allocated sessions are required'
        });
      }

      // First get the session pool ID
      const poolResult = await db.query(
        'SELECT id FROM session_pools WHERE institution_id = $1',
        [institutionId]
      );

      if (poolResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Session pool not found'
        });
      }

      const sessionPoolId = poolResult.rows[0].id;

      // Insert new session allocation
      const result = await db.query(
        `INSERT INTO session_allocations (session_pool_id, name, department_id, group_id, allocated_sessions)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name, department_id, group_id, allocated_sessions, used_sessions, created_at`,
        [sessionPoolId, name, departmentId, groupId, allocatedSessions]
      );

      const newAllocation = result.rows[0];

      res.status(201).json({
        success: true,
        message: 'Session allocation created successfully',
        data: newAllocation
      });
    } catch (error) {
      console.error('Create session allocation error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Update session allocation
  async updateSessionAllocation(req, res) {
    try {
      const { id } = req.params;
      const { name, departmentId, groupId, allocatedSessions } = req.body;

      // Build update query dynamically
      const updates = [];
      const values = [];
      let index = 1;

      if (name !== undefined) {
        updates.push(`name = $${index}`);
        values.push(name);
        index++;
      }

      if (departmentId !== undefined) {
        updates.push(`department_id = $${index}`);
        values.push(departmentId);
        index++;
      }

      if (groupId !== undefined) {
        updates.push(`group_id = $${index}`);
        values.push(groupId);
        index++;
      }

      if (allocatedSessions !== undefined) {
        updates.push(`allocated_sessions = $${index}`);
        values.push(allocatedSessions);
        index++;
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid fields to update'
        });
      }

      values.push(id); // Add allocation ID for WHERE clause

      // Update session allocation
      const result = await db.query(
        `UPDATE session_allocations 
         SET ${updates.join(', ')}, updated_at = NOW() 
         WHERE id = $${index} 
         RETURNING id, name, department_id, group_id, allocated_sessions, used_sessions, updated_at`,
        values
      );

      const updatedAllocation = result.rows[0];
      if (!updatedAllocation) {
        return res.status(404).json({
          success: false,
          message: 'Session allocation not found'
        });
      }

      res.json({
        success: true,
        message: 'Session allocation updated successfully',
        data: updatedAllocation
      });
    } catch (error) {
      console.error('Update session allocation error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Delete session allocation
  async deleteSessionAllocation(req, res) {
    try {
      const { id } = req.params;

      // Delete session allocation
      const result = await db.query(
        'DELETE FROM session_allocations WHERE id = $1 RETURNING id',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Session allocation not found'
        });
      }

      res.json({
        success: true,
        message: 'Session allocation deleted successfully'
      });
    } catch (error) {
      console.error('Delete session allocation error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

module.exports = sessionController;