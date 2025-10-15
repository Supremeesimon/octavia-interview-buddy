const express = require('express');
const router = express.Router();
const sessionRequestController = require('../controllers/session-request.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');

// Create a new session request (students)
router.post('/', authenticateToken, sessionRequestController.createSessionRequest);

// Get session requests for a department (teachers)
router.get('/department/:departmentId', authenticateToken, authorizeRole('institution_admin'), sessionRequestController.getDepartmentSessionRequests);

// Update session request status (teachers)
router.put('/:id/status', authenticateToken, authorizeRole('institution_admin'), sessionRequestController.updateSessionRequestStatus);

module.exports = router;