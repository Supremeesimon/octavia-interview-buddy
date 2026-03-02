const SubscriptionService = require('../services/subscription.service');
const db = require('../config/database');

const subscriptionController = {
  /**
   * Create a subscription for an external user
   */
  async createSubscription(req, res) {
    try {
      const { planType, paymentMethodId } = req.body;
      const userId = req.user.id;

      // Validate plan type
      if (!['monthly', 'quarterly'].includes(planType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid plan type. Valid options are "monthly" or "quarterly".'
        });
      }

      // Validate payment method ID
      if (!paymentMethodId) {
        return res.status(400).json({
          success: false,
          message: 'Payment method ID is required.'
        });
      }

      // Check if user already has an active subscription
      const existingSubscription = await SubscriptionService.getUserSubscription(userId);
      if (existingSubscription && existingSubscription.status === 'active') {
        return res.status(400).json({
          success: false,
          message: 'User already has an active subscription.'
        });
      }

      // Create the subscription
      const subscription = await SubscriptionService.createSubscription(
        userId,
        planType,
        paymentMethodId
      );
      
      res.json({
        success: true,
        message: 'Subscription created successfully',
        data: {
          id: subscription.id,
          stripeSubscriptionId: subscription.stripeSubscriptionId,
          status: subscription.status,
          clientSecret: subscription.clientSecret
        }
      });
    } catch (error) {
      console.error('Create subscription error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  /**
   * Create a payment intent for a guest user (before signup)
   */
  async createGuestPaymentIntent(req, res) {
    try {
      const { planType, email, name } = req.body;

      // Validate plan type
      if (!['monthly', 'quarterly'].includes(planType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid plan type. Valid options are "monthly" or "quarterly".'
        });
      }

      // Validate email
      if (!email || !email.includes('@')) {
        return res.status(400).json({
          success: false,
          message: 'Valid email is required.'
        });
      }

      // Validate name
      if (!name || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Name is required.'
        });
      }

      // Create a temporary customer record in Stripe (we'll link it to the user after signup)
      const customer = await SubscriptionService.createCustomerForGuest(email, name);

      // Define prices based on plan type
      const prices = {
        monthly: 2000, // $20.00 in cents
        quarterly: 4500 // $45.00 in cents
      };

      // Create a payment intent that can be completed later
      const paymentIntent = await SubscriptionService.createPaymentIntentForGuest(
        customer.id,
        prices[planType],
        planType,
        email,
        name
      );

      res.json({
        success: true,
        message: 'Payment intent created successfully for guest user',
        data: {
          clientSecret: paymentIntent.client_secret,
          customerId: customer.id,
          paymentIntentId: paymentIntent.id
        }
      });
    } catch (error) {
      console.error('Create guest payment intent error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  /**
   * Process a guest payment after signup
   */
  async processGuestPayment(req, res) {
    try {
      const { planType, paymentMethodId } = req.body;
      const userId = req.user.id;

      // Validate plan type
      if (!['monthly', 'quarterly'].includes(planType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid plan type. Valid options are "monthly" or "quarterly".'
        });
      }

      // Validate payment method ID
      if (!paymentMethodId) {
        return res.status(400).json({
          success: false,
          message: 'Payment method ID is required.'
        });
      }

      // Check if user already has an active subscription
      const existingSubscription = await SubscriptionService.getUserSubscription(userId);
      if (existingSubscription && existingSubscription.status === 'active') {
        return res.status(400).json({
          success: false,
          message: 'User already has an active subscription.'
        });
      }

      // Process the guest payment
      const subscription = await SubscriptionService.processGuestPaymentAfterSignupWithPaymentMethod(
        userId,
        planType,
        paymentMethodId
      );
      
      res.json({
        success: true,
        message: 'Guest payment processed successfully',
        data: {
          id: subscription.id,
          stripeSubscriptionId: subscription.stripeSubscriptionId,
          status: subscription.status,
          clientSecret: subscription.clientSecret
        }
      });
    } catch (error) {
      console.error('Process guest payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  /**
   * Get user's subscription details
   */
  async getUserSubscription(req, res) {
    try {
      const userId = req.user.id;

      const subscription = await SubscriptionService.getUserSubscription(userId);

      if (!subscription) {
        return res.json({
          success: true,
          data: null,
          message: 'No subscription found for this user.'
        });
      }

      res.json({
        success: true,
        data: subscription
      });
    } catch (error) {
      console.error('Get user subscription error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  /**
   * Cancel user's subscription
   */
  async cancelSubscription(req, res) {
    try {
      const { atPeriodEnd } = req.body;
      const userId = req.user.id;

      // Cancel the subscription
      const result = await SubscriptionService.cancelSubscription(
        userId,
        atPeriodEnd !== false // Default to true if not specified
      );

      res.json({
        success: true,
        message: atPeriodEnd !== false 
          ? 'Subscription scheduled for cancellation at period end' 
          : 'Subscription cancelled successfully',
        data: result
      });
    } catch (error) {
      console.error('Cancel subscription error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  },

  /**
   * Update subscription plan
   */
  async updateSubscriptionPlan(req, res) {
    try {
      const { newPlanType } = req.body;
      const userId = req.user.id;

      // Validate new plan type
      if (!['monthly', 'quarterly'].includes(newPlanType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid plan type. Valid options are "monthly" or "quarterly".'
        });
      }

      // Update the subscription
      const result = await SubscriptionService.updateSubscriptionPlan(userId, newPlanType);

      res.json({
        success: true,
        message: 'Subscription plan updated successfully',
        data: result
      });
    } catch (error) {
      console.error('Update subscription plan error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Internal server error'
      });
    }
  },

  /**
   * Handle subscription webhook events
   */
  async handleWebhook(req, res) {
    const payload = req.body;
    const signature = req.headers['stripe-signature'];

    try {
      await SubscriptionService.handleSubscriptionWebhook(payload, signature);
      res.status(200).send({ received: true });
    } catch (error) {
      console.error('Subscription webhook error:', error);
      res.status(400).send(`Webhook error: ${error.message}`);
    }
  }
};

module.exports = subscriptionController;