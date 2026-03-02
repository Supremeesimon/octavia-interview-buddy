const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../config/database');

class SubscriptionService {
  /**
   * Create a Stripe customer for an external user
   * @param {string} userId - The user ID in our database
   * @param {string} email - The customer's email
   * @param {string} name - The customer's name
   * @returns {Promise<Object>} The created customer
   */
  static async createCustomer(userId, email, name) {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          userId
        }
      });

      // Update the user record with the customer ID
      await db.query(
        `UPDATE users 
         SET stripe_customer_id = $1, updated_at = NOW()
         WHERE id = $2`,
        [customer.id, userId]
      );

      return customer;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw new Error(`Failed to create customer: ${error.message}`);
    }
  }

  /**
   * Create a customer for a guest user (before signup)
   * @param {string} email - The customer's email
   * @param {string} name - The customer's name
   * @returns {Promise<Object>} The created customer
   */
  static async createCustomerForGuest(email, name) {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          isGuest: 'true'
        }
      });

      // Store temporary customer info in database
      const result = await db.query(
        `INSERT INTO temp_customers 
         (stripe_customer_id, email, name, created_at) 
         VALUES ($1, $2, $3, NOW())
         RETURNING id`,
        [customer.id, email, name]
      );

      return customer;
    } catch (error) {
      console.error('Error creating guest customer:', error);
      throw new Error(`Failed to create guest customer: ${error.message}`);
    }
  }

  /**
   * Create a payment intent for a guest user
   * @param {string} customerId - The Stripe customer ID
   * @param {number} amount - The amount in cents
   * @param {string} planType - The plan type ('monthly' or 'quarterly')
   * @param {string} email - The customer's email
   * @param {string} name - The customer's name
   * @returns {Promise<Object>} The created payment intent
   */
  static async createPaymentIntentForGuest(customerId, amount, planType, email, name) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        customer: customerId,
        automatic_payment_methods: {
          enabled: true,
        },
        description: `${planType.charAt(0).toUpperCase() + planType.slice(1)} Subscription - Octavia Interview Buddy`,
        metadata: {
          email,
          name,
          planType,
          isGuest: 'true'
        }
      });

      return paymentIntent;
    } catch (error) {
      console.error('Error creating guest payment intent:', error);
      throw new Error(`Failed to create guest payment intent: ${error.message}`);
    }
  }

  /**
   * Process a completed guest payment after user signup
   * @param {string} tempCustomerId - The temporary customer ID
   * @param {string} userId - The user ID in our database
   * @param {string} planType - The plan type
   * @returns {Promise<Object>} The created subscription
   */
  static async processGuestPaymentAfterSignup(tempCustomerId, userId, planType) {
    try {
      // Get temporary customer info
      const tempCustomerResult = await db.query(
        `SELECT stripe_customer_id, email, name 
         FROM temp_customers 
         WHERE id = $1`,
        [tempCustomerId]
      );

      if (!tempCustomerResult.rows[0]) {
        throw new Error('Temporary customer not found');
      }

      const tempCustomer = tempCustomerResult.rows[0];
      const customerId = tempCustomer.stripe_customer_id;

      // Update the user record with the customer ID
      await db.query(
        `UPDATE users 
         SET stripe_customer_id = $1, updated_at = NOW()
         WHERE id = $2`,
        [customerId, userId]
      );

      // Create subscription record
      const prices = {
        monthly: 2000, // $20.00 in cents
        quarterly: 4500 // $45.00 in cents
      };

      // Create subscription in Stripe
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${planType.charAt(0).toUpperCase() + planType.slice(1)} Subscription - Octavia Interview Buddy`,
              description: 'Access to premium interview features and unlimited practice sessions'
            },
            unit_amount: prices[planType], // Amount in cents
          },
          quantity: 1,
        }],
        payment_settings: {
          payment_method_types: ['card'],
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
      });

      // Save subscription to our database
      const insertResult = await db.query(`
        INSERT INTO subscriptions (
          user_id, 
          stripe_subscription_id, 
          stripe_customer_id, 
          plan_type, 
          status, 
          price_cents,
          period_start,
          period_end
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `, [
        userId,
        subscription.id,
        customerId,
        planType,
        subscription.status,
        prices[planType],
        new Date(subscription.current_period_start * 1000),
        new Date(subscription.current_period_end * 1000)
      ]);

      // Update user subscription status
      await db.query(
        `UPDATE users 
         SET has_active_subscription = true, 
             subscription_expires_at = $1,
             updated_at = NOW()
         WHERE id = $2`,
        [new Date(subscription.current_period_end * 1000), userId]
      );

      // Mark temporary customer as processed
      await db.query(
        `DELETE FROM temp_customers WHERE id = $1`,
        [tempCustomerId]
      );

      return {
        id: insertResult.rows[0].id,
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret
      };
    } catch (error) {
      console.error('Error processing guest payment after signup:', error);
      throw new Error(`Failed to process guest payment: ${error.message}`);
    }
  }

  /**
   * Process a guest payment after signup using the payment method ID
   * @param {string} userId - The user ID in our database
   * @param {string} planType - The plan type
   * @param {string} paymentMethodId - The payment method ID
   * @returns {Promise<Object>} The created subscription
   */
  static async processGuestPaymentAfterSignupWithPaymentMethod(userId, planType, paymentMethodId) {
    try {
      // Attach the payment method to the user's Stripe customer
      const userResult = await db.query(
        'SELECT email, name, stripe_customer_id FROM users WHERE id = $1',
        [userId]
      );

      if (!userResult.rows[0]) {
        throw new Error('User not found');
      }

      const user = userResult.rows[0];

      // Get or create Stripe customer
      let customerId = user.stripe_customer_id;
      if (!customerId) {
        const customer = await this.createCustomer(userId, user.email, user.name);
        customerId = customer.id;
      }

      // Define prices based on plan type
      const prices = {
        monthly: 2000, // $20.00 in cents
        quarterly: 4500 // $45.00 in cents
      };

      if (!prices[planType]) {
        throw new Error('Invalid plan type');
      }

      // Attach payment method to customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Set payment method as default
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${planType.charAt(0).toUpperCase() + planType.slice(1)} Subscription - Octavia Interview Buddy`,
              description: 'Access to premium interview features and unlimited practice sessions'
            },
            unit_amount: prices[planType], // Amount in cents
          },
          quantity: 1,
        }],
        payment_settings: {
          payment_method_types: ['card'],
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
      });

      // Save subscription to our database
      const insertResult = await db.query(`
        INSERT INTO subscriptions (
          user_id, 
          stripe_subscription_id, 
          stripe_customer_id, 
          plan_type, 
          status, 
          price_cents,
          period_start,
          period_end
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `, [
        userId,
        subscription.id,
        customerId,
        planType,
        subscription.status,
        prices[planType],
        new Date(subscription.current_period_start * 1000),
        new Date(subscription.current_period_end * 1000)
      ]);

      // Update user subscription status
      await db.query(
        `UPDATE users 
         SET has_active_subscription = true, 
             subscription_expires_at = $1,
             updated_at = NOW()
         WHERE id = $2`,
        [new Date(subscription.current_period_end * 1000), userId]
      );

      return {
        id: insertResult.rows[0].id,
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret
      };
    } catch (error) {
      console.error('Error processing guest payment after signup with payment method:', error);
      throw new Error(`Failed to process guest payment: ${error.message}`);
    }
  }

  /**
   * Create a subscription for an external user
   * @param {string} userId - The user ID in our database
   * @param {string} planType - The plan type ('monthly' or 'quarterly')
   * @param {string} paymentMethodId - The Stripe payment method ID
   * @returns {Promise<Object>} The created subscription
   */
  static async createSubscription(userId, planType, paymentMethodId) {
    try {
      // Get user details
      const userResult = await db.query(
        'SELECT email, name, stripe_customer_id FROM users WHERE id = $1',
        [userId]
      );

      if (!userResult.rows[0]) {
        throw new Error('User not found');
      }

      const user = userResult.rows[0];

      // Get or create Stripe customer
      let customerId = user.stripe_customer_id;
      if (!customerId) {
        const customer = await this.createCustomer(userId, user.email, user.name);
        customerId = customer.id;
      }

      // Define prices based on plan type
      const prices = {
        monthly: 2000, // $20.00 in cents
        quarterly: 4500 // $45.00 in cents
      };

      if (!prices[planType]) {
        throw new Error('Invalid plan type');
      }

      // Attach payment method to customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Set payment method as default
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${planType.charAt(0).toUpperCase() + planType.slice(1)} Subscription - Octavia Interview Buddy`,
              description: 'Access to premium interview features and unlimited practice sessions'
            },
            unit_amount: prices[planType], // Amount in cents
          },
          quantity: 1,
        }],
        payment_settings: {
          payment_method_types: ['card'],
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
      });

      // Save subscription to our database
      const insertResult = await db.query(`
        INSERT INTO subscriptions (
          user_id, 
          stripe_subscription_id, 
          stripe_customer_id, 
          plan_type, 
          status, 
          price_cents,
          period_start,
          period_end
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `, [
        userId,
        subscription.id,
        customerId,
        planType,
        subscription.status,
        prices[planType],
        new Date(subscription.current_period_start * 1000),
        new Date(subscription.current_period_end * 1000)
      ]);

      // Update user subscription status
      await db.query(
        `UPDATE users 
         SET has_active_subscription = true, 
             subscription_expires_at = $1,
             updated_at = NOW()
         WHERE id = $2`,
        [new Date(subscription.current_period_end * 1000), userId]
      );

      return {
        id: insertResult.rows[0].id,
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  }

  /**
   * Get subscription details for a user
   * @param {string} userId - The user ID in our database
   * @returns {Promise<Object|null>} The subscription details or null if not found
   */
  static async getUserSubscription(userId) {
    try {
      const result = await db.query(
        `SELECT * FROM subscriptions 
         WHERE user_id = $1 
         ORDER BY created_at DESC LIMIT 1`,
        [userId]
      );

      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting user subscription:', error);
      throw new Error(`Failed to get subscription: ${error.message}`);
    }
  }

  /**
   * Cancel a subscription
   * @param {string} userId - The user ID in our database
   * @param {boolean} atPeriodEnd - Whether to cancel at the end of the current period
   * @returns {Promise<Object>} The updated subscription
   */
  static async cancelSubscription(userId, atPeriodEnd = true) {
    try {
      // Get the active subscription
      const subscription = await this.getUserSubscription(userId);
      if (!subscription) {
        throw new Error('No active subscription found');
      }

      if (subscription.status === 'cancelled' || subscription.status === 'expired') {
        throw new Error('Subscription is already cancelled or expired');
      }

      let updatedSubscription;
      if (atPeriodEnd) {
        // Cancel subscription at the end of the current period
        updatedSubscription = await stripe.subscriptions.update(subscription.stripe_subscription_id, {
          cancel_at_period_end: true,
        });

        // Update our database
        await db.query(
          `UPDATE subscriptions 
           SET cancel_at_period_end = true, 
               updated_at = NOW()
           WHERE id = $1`,
          [subscription.id]
        );
      } else {
        // Cancel subscription immediately
        updatedSubscription = await stripe.subscriptions.del(subscription.stripe_subscription_id);

        // Update our database
        await db.query(
          `UPDATE subscriptions 
           SET status = 'cancelled', 
               cancelled_at = NOW(), 
               updated_at = NOW()
           WHERE id = $1`,
          [subscription.id]
        );
      }

      // Update user subscription status if cancelled immediately
      if (!atPeriodEnd) {
        await db.query(
          `UPDATE users 
           SET has_active_subscription = false, 
               subscription_expires_at = NOW(),
               updated_at = NOW()
           WHERE id = $1`,
          [userId]
        );
      }

      return updatedSubscription;
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
    }
  }

  /**
   * Update subscription to a different plan
   * @param {string} userId - The user ID in our database
   * @param {string} newPlanType - The new plan type ('monthly' or 'quarterly')
   * @returns {Promise<Object>} The updated subscription
   */
  static async updateSubscriptionPlan(userId, newPlanType) {
    try {
      // Get the active subscription
      const subscription = await this.getUserSubscription(userId);
      if (!subscription) {
        throw new Error('No active subscription found');
      }

      if (subscription.status !== 'active') {
        throw new Error('Subscription is not active');
      }

      // Define prices based on plan type
      const prices = {
        monthly: 2000, // $20.00 in cents
        quarterly: 4500 // $45.00 in cents
      };

      if (!prices[newPlanType]) {
        throw new Error('Invalid plan type');
      }

      // Update the subscription
      const updatedSubscription = await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        items: [{
          id: subscription.stripe_subscription_item_id, // Assuming we stored this
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${newPlanType.charAt(0).toUpperCase() + newPlanType.slice(1)} Subscription - Octavia Interview Buddy`,
              description: 'Access to premium interview features and unlimited practice sessions'
            },
            unit_amount: prices[newPlanType], // Amount in cents
          },
        }],
        proration_behavior: 'always_invoice', // Bill for the difference immediately
      });

      // Update our database
      await db.query(
        `UPDATE subscriptions 
         SET plan_type = $1, 
             price_cents = $2,
             period_end = $3,
             updated_at = NOW()
         WHERE id = $4`,
        [
          newPlanType,
          prices[newPlanType],
          new Date(updatedSubscription.current_period_end * 1000),
          subscription.id
        ]
      );

      // Update user subscription expiration
      await db.query(
        `UPDATE users 
         SET subscription_expires_at = $1,
             updated_at = NOW()
         WHERE id = $2`,
        [new Date(updatedSubscription.current_period_end * 1000), userId]
      );

      return updatedSubscription;
    } catch (error) {
      console.error('Error updating subscription plan:', error);
      throw new Error(`Failed to update subscription plan: ${error.message}`);
    }
  }

  /**
   * Handle subscription-related webhook events from Stripe
   * @param {Object} event - The Stripe event object
   */
  static async handleSubscriptionWebhook(event) {
    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;
        case 'customer.subscription.deleted':
          await this.handleSubscriptionCancelled(event.data.object);
          break;
        case 'invoice.payment_succeeded':
          await this.handlePaymentSucceeded(event.data.object);
          break;
        case 'invoice.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }
    } catch (error) {
      console.error('Error handling subscription webhook:', error);
      throw error;
    }
  }

  /**
   * Handle subscription updated event
   * @param {Object} subscription - The Stripe subscription object
   */
  static async handleSubscriptionUpdated(subscription) {
    // Find user by Stripe customer ID
    const userResult = await db.query(
      'SELECT id FROM users WHERE stripe_customer_id = $1',
      [subscription.customer]
    );

    if (!userResult.rows[0]) {
      console.error(`User not found for Stripe customer ID: ${subscription.customer}`);
      return;
    }

    const userId = userResult.rows[0].id;

    // Update subscription in our database
    await db.query(`
      UPDATE subscriptions 
      SET status = $1,
          period_start = $2,
          period_end = $3,
          cancel_at_period_end = $4,
          updated_at = NOW()
      WHERE stripe_subscription_id = $5
    `, [
      subscription.status,
      new Date(subscription.current_period_start * 1000),
      new Date(subscription.current_period_end * 1000),
      subscription.cancel_at_period_end,
      subscription.id
    ]);

    // Update user subscription status if active
    if (subscription.status === 'active') {
      await db.query(
        `UPDATE users 
         SET has_active_subscription = true, 
             subscription_expires_at = $1,
             updated_at = NOW()
         WHERE id = $2`,
        [new Date(subscription.current_period_end * 1000), userId]
      );
    }
  }

  /**
   * Handle subscription cancelled event
   * @param {Object} subscription - The Stripe subscription object
   */
  static async handleSubscriptionCancelled(subscription) {
    // Find user by Stripe customer ID
    const userResult = await db.query(
      'SELECT id FROM users WHERE stripe_customer_id = $1',
      [subscription.customer]
    );

    if (!userResult.rows[0]) {
      console.error(`User not found for Stripe customer ID: ${subscription.customer}`);
      return;
    }

    const userId = userResult.rows[0].id;

    // Update subscription in our database
    await db.query(`
      UPDATE subscriptions 
      SET status = 'cancelled',
          cancelled_at = NOW(),
          updated_at = NOW()
      WHERE stripe_subscription_id = $1
    `, [subscription.id]);

    // Update user subscription status
    await db.query(
      `UPDATE users 
       SET has_active_subscription = false, 
           subscription_expires_at = NOW(),
           updated_at = NOW()
       WHERE id = $1`,
      [userId]
    );
  }

  /**
   * Handle payment succeeded event
   * @param {Object} invoice - The Stripe invoice object
   */
  static async handlePaymentSucceeded(invoice) {
    // Update subscription period if needed
    if (invoice.subscription) {
      const subscriptionResult = await db.query(
        'SELECT user_id FROM subscriptions WHERE stripe_subscription_id = $1',
        [invoice.subscription]
      );

      if (subscriptionResult.rows[0]) {
        const userId = subscriptionResult.rows[0].user_id;
        
        // Get the subscription from Stripe to update dates
        const stripeSubscription = await stripe.subscriptions.retrieve(invoice.subscription);
        
        await db.query(
          `UPDATE subscriptions 
           SET period_end = $1,
               updated_at = NOW()
           WHERE stripe_subscription_id = $2`,
          [new Date(stripeSubscription.current_period_end * 1000), invoice.subscription]
        );

        // Update user subscription expiration
        await db.query(
          `UPDATE users 
           SET subscription_expires_at = $1,
               updated_at = NOW()
           WHERE id = $2`,
          [new Date(stripeSubscription.current_period_end * 1000), userId]
        );
      }
    }
  }

  /**
   * Handle payment failed event
   * @param {Object} invoice - The Stripe invoice object
   */
  static async handlePaymentFailed(invoice) {
    // Find subscription by Stripe subscription ID
    if (invoice.subscription) {
      await db.query(
        `UPDATE subscriptions 
         SET status = 'past_due',
             updated_at = NOW()
         WHERE stripe_subscription_id = $1`,
        [invoice.subscription]
      );
    }
  }
}

module.exports = SubscriptionService;