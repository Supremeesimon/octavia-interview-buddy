const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');

// Get student analytics
router.get('/student', authenticateToken, analyticsController.getStudentAnalytics);

// Get institution analytics (institution admin only)
router.get('/institution', authenticateToken, authorizeRole('institution_admin'), analyticsController.getInstitutionAnalytics);

// Get platform analytics (platform admin only)
router.get('/platform', authenticateToken, authorizeRole('platform_admin'), analyticsController.getPlatformAnalytics);

// Export analytics data
router.get('/export', authenticateToken, analyticsController.exportAnalytics);

module.exports = router;