const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interview.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Get interviews for current user
router.get('/', authenticateToken, interviewController.getUserInterviews);

// Get interview by ID
router.get('/:id', authenticateToken, interviewController.getInterviewById);

// Create new interview
router.post('/', authenticateToken, interviewController.createInterview);

// Update interview
router.put('/:id', authenticateToken, interviewController.updateInterview);

// Delete interview
router.delete('/:id', authenticateToken, interviewController.deleteInterview);

// Get interview feedback
router.get('/:id/feedback', authenticateToken, interviewController.getInterviewFeedback);

// Start interview
router.post('/:id/start', authenticateToken, interviewController.startInterview);

// End interview
router.post('/:id/end', authenticateToken, interviewController.endInterview);

module.exports = router;