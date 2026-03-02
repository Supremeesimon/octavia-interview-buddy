const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');

// Public route for webhook (no authentication as it comes from Stripe)
router.post('/webhook', express.raw({type: 'application/json'}), subscriptionController.handleWebhook);

// Public route for guest payment intents (no authentication required)
router.post('/guest-payment-intent', subscriptionController.createGuestPaymentIntent);

// Protected routes for authenticated users
// Allow both students (for external users) and platform admins to manage subscriptions
router.post('/', authenticateToken, authorizeRole('student', 'platform_admin'), subscriptionController.createSubscription);
router.post('/process-guest-payment', authenticateToken, authorizeRole('student', 'platform_admin'), subscriptionController.processGuestPayment);
router.get('/', authenticateToken, authorizeRole('student', 'platform_admin'), subscriptionController.getUserSubscription);
router.delete('/', authenticateToken, authorizeRole('student', 'platform_admin'), subscriptionController.cancelSubscription);
router.patch('/plan', authenticateToken, authorizeRole('student', 'platform_admin'), subscriptionController.updateSubscriptionPlan);

module.exports = router;