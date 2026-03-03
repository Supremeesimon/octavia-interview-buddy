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

// Get payment methods for ALL institutions - platform admin only
router.get('/all-payment-methods', authenticateToken, authorizeRole('platform_admin'), stripeController.getAllInstitutionPaymentMethods);

// Get invoices for institution - allow institution admins and teachers
router.get('/invoices', authenticateToken, authorizeRole('institution_admin', 'teacher'), stripeController.getInvoices);

// Create billing portal session - allow any authenticated user (logic handled in controller)
router.post('/create-portal-session', authenticateToken, stripeController.createPortalSession);

module.exports = router;