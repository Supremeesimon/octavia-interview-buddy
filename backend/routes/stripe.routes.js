const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripe.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');

// Webhook endpoint (no authentication as it comes from Stripe)
router.post('/webhook', express.raw({type: 'application/json'}), stripeController.handleWebhook);

// Get payment methods for institution
router.get('/payment-methods', authenticateToken, authorizeRole('institution_admin'), stripeController.getPaymentMethods);

// Save payment method for institution
router.post('/payment-methods', authenticateToken, authorizeRole('institution_admin'), stripeController.savePaymentMethod);

// Get invoices for institution
router.get('/invoices', authenticateToken, authorizeRole('institution_admin'), stripeController.getInvoices);

module.exports = router;