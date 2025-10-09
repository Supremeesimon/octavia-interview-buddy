const express = require('express');
const router = express.Router();
const institutionController = require('../controllers/institution.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');

// Get all institutions (platform admin only)
router.get('/', authenticateToken, authorizeRole('platform_admin'), institutionController.getAllInstitutions);

// Get institution by ID
router.get('/:id', authenticateToken, institutionController.getInstitutionById);

// Create institution (platform admin only)
router.post('/', authenticateToken, authorizeRole('platform_admin'), institutionController.createInstitution);

// Update institution
router.put('/:id', authenticateToken, institutionController.updateInstitution);

// Delete institution (platform admin only)
router.delete('/:id', authenticateToken, authorizeRole('platform_admin'), institutionController.deleteInstitution);

// Get institution stats
router.get('/:id/stats', authenticateToken, institutionController.getInstitutionStats);

// Get institution students
router.get('/:id/students', authenticateToken, institutionController.getInstitutionStudents);

module.exports = router;