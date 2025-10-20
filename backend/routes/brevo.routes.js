const express = require('express');
const router = express.Router();
const brevoController = require('../controllers/brevo.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');

// Send a simple email
router.post('/send', authenticateToken, authorizeRole('institution_admin', 'platform_admin'), brevoController.sendEmail);

// Send bulk emails
router.post('/send-bulk', authenticateToken, authorizeRole('institution_admin', 'platform_admin'), brevoController.sendBulkEmail);

// Send email using template
router.post('/send-template', authenticateToken, authorizeRole('institution_admin', 'platform_admin'), brevoController.sendTemplateEmail);

// Send SMS notification
router.post('/send-sms', authenticateToken, authorizeRole('institution_admin', 'platform_admin'), brevoController.sendSMS);

module.exports = router;