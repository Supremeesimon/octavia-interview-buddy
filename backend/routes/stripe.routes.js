const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripe.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');

// Webhook endpoint (no authentication as it comes from Stripe)
router.post('/webhook', express.raw({type: 'application/json'}), stripeController.handleWebhook);

// Get payment methods for institution - allow institution admins and teachers
router.get('/payment-methods', authenticateToken, authorizeRole('institution_admin', 'teacher'), stripeController.getPaymentMethods);

// Save payment method for institution - only institution admins
router.post('/payment-methods', authenticateToken, authorizeRole('institution_admin'), stripeController.savePaymentMethod);

// Delete payment method for institution - only institution admins
router.delete('/payment-methods', authenticateToken, authorizeRole('institution_admin'), stripeController.deletePaymentMethod);

// Get invoices for institution - allow institution admins and teachers
router.get('/invoices', authenticateToken, authorizeRole('institution_admin', 'teacher'), stripeController.getInvoices);

module.exports = router;