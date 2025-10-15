const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Public routes
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refreshToken);
router.post('/request-password-reset', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendEmailVerification);
router.post('/exchange-firebase-token', authController.exchangeFirebaseToken); // New route

// Protected routes
router.post('/change-password', authenticateToken, authController.changePassword);
router.put('/profile', authenticateToken, authController.updateProfile);

module.exports = router;