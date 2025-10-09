const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resume.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Get resumes for current user
router.get('/', authenticateToken, resumeController.getUserResumes);

// Get resume by ID
router.get('/:id', authenticateToken, resumeController.getResumeById);

// Upload new resume
router.post('/', authenticateToken, resumeController.uploadResume);

// Update resume
router.put('/:id', authenticateToken, resumeController.updateResume);

// Delete resume
router.delete('/:id', authenticateToken, resumeController.deleteResume);

// Set default resume
router.patch('/:id/default', authenticateToken, resumeController.setDefaultResume);

module.exports = router;