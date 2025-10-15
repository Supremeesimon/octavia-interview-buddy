const db = require('../config/database');

const sessionRequestController = {
  // Create a new session request
  async createSessionRequest(req, res) {
    try {
      const { studentId, institutionId, departmentId, sessionCount, reason } = req.body;
      
      // Validate input
      if (!studentId || !institutionId || !departmentId || !sessionCount || sessionCount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Student ID, Institution ID, Department ID, and valid session count are required'
        });
      }
      
      // Insert new session request
      const result = await db.query(
        `INSERT INTO student_session_requests 
         (student_id, institution_id, department_id, session_count, reason, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, student_id, institution_id, department_id, session_count, reason, status, created_at`,
        [studentId, institutionId, departmentId, sessionCount, reason || '', 'pending']
      );
      
      const newRequest = result.rows[0];
      
      res.status(201).json({
        success: true,
        message: 'Session request created successfully',
        data: newRequest
      });
    } catch (error) {
      console.error('Create session request error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },
  
  // Get session requests for a department
  async getDepartmentSessionRequests(req, res) {
    try {
      const { departmentId } = req.params;
      const { status } = req.query; // Optional filter by status
      
      if (!departmentId) {
        return res.status(400).json({
          success: false,
          message: 'Department ID is required'
        });
      }
      
      let query = `
        SELECT ssr.id, ssr.student_id, ssr.institution_id, ssr.department_id, 
               ssr.session_count, ssr.reason, ssr.status, ssr.reviewed_by, 
               ssr.reviewed_at, ssr.created_at, ssr.updated_at,
               u.name as student_name, i.name as institution_name
        FROM student_session_requests ssr
        JOIN users u ON ssr.student_id = u.id
        JOIN institutions i ON ssr.institution_id = i.id
        WHERE ssr.department_id = $1
      `;
      
      const values = [departmentId];
      
      if (status) {
        query += ` AND ssr.status = $2`;
        values.push(status);
      }
      
      query += ` ORDER BY ssr.created_at DESC`;
      
      const result = await db.query(query, values);
      
      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Get department session requests error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },
  
  // Update session request status (approve/reject)
  async updateSessionRequestStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, reviewedBy } = req.body;
      
      // Validate input
      if (!status || !['approved', 'rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Valid status (approved/rejected) is required'
        });
      }
      
      if (!reviewedBy) {
        return res.status(400).json({
          success: false,
          message: 'Reviewed by user ID is required'
        });
      }
      
      // Update session request status
      const result = await db.query(
        `UPDATE student_session_requests 
         SET status = $1, reviewed_by = $2, reviewed_at = NOW(), updated_at = NOW()
         WHERE id = $3
         RETURNING id, status, reviewed_by, reviewed_at`,
        [status, reviewedBy, id]
      );
      
      const updatedRequest = result.rows[0];
      if (!updatedRequest) {
        return res.status(404).json({
          success: false,
          message: 'Session request not found'
        });
      }
      
      // If approved, allocate sessions to student
      if (status === 'approved') {
        await sessionRequestController.allocateSessionsToStudent(id);
      }
      
      res.json({
        success: true,
        message: `Session request ${status} successfully`,
        data: updatedRequest
      });
    } catch (error) {
      console.error('Update session request status error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },
  
  // Allocate sessions to student when request is approved
  async allocateSessionsToStudent(requestId) {
    try {
      // Get request details
      const requestResult = await db.query(
        `SELECT student_id, institution_id, department_id, session_count 
         FROM student_session_requests 
         WHERE id = $1 AND status = 'approved'`,
        [requestId]
      );
      
      const request = requestResult.rows[0];
      if (!request) {
        throw new Error('Request not found or not approved');
      }
      
      // Get student's institution session pool
      const poolResult = await db.query(
        `SELECT id FROM session_pools WHERE institution_id = $1`,
        [request.institution_id]
      );
      
      const sessionPool = poolResult.rows[0];
      if (!sessionPool) {
        throw new Error('Session pool not found for institution');
      }
      
      // Create or update student session allocation
      const allocationResult = await db.query(
        `INSERT INTO session_allocations 
         (session_pool_id, name, student_id, department_id, allocated_sessions)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (student_id) 
         DO UPDATE SET 
           allocated_sessions = session_allocations.allocated_sessions + $5,
           updated_at = NOW()
         RETURNING id, allocated_sessions, used_sessions`,
        [
          sessionPool.id, 
          `Student: ${request.student_id}`, 
          request.student_id, 
          request.department_id, 
          request.session_count
        ]
      );
      
      return allocationResult.rows[0];
    } catch (error) {
      console.error('Allocate sessions to student error:', error);
      throw error;
    }
  }
};

module.exports = sessionRequestController;