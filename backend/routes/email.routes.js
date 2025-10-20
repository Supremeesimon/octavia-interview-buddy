const express = require('express');
const router = express.Router();
const emailController = require('../controllers/email.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');

// Send a simple email
router.post('/send', authenticateToken, authorizeRole('institution_admin', 'platform_admin'), emailController.sendEmail);

// Send bulk emails
router.post('/send-bulk', authenticateToken, authorizeRole('institution_admin', 'platform_admin'), emailController.sendBulkEmail);

// Send email using template
router.post('/send-template', authenticateToken, authorizeRole('institution_admin', 'platform_admin'), emailController.sendTemplateEmail);

// Send SMS notification
router.post('/send-sms', authenticateToken, authorizeRole('institution_admin', 'platform_admin'), emailController.sendSMS);

module.exports = router;