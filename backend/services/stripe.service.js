const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../config/database');

class StripeService {
  /**
   * Create a Stripe payment intent for session purchases
   * @param {number} amount - The amount in cents
   * @param {string} currency - The currency code (e.g., 'usd')
   * @param {string} institutionId - The institution ID
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} The created payment intent
   */
  static async createPaymentIntent(amount, currency = 'usd', institutionId, metadata = {}) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          institutionId,
          ...metadata
        }
      });
      
      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }
  }

  /**
   * Confirm a payment and update the session purchase record
   * @param {string} paymentIntentId - The Stripe payment intent ID
   * @param {string} sessionId - The session purchase ID in our database
   * @returns {Promise<Object>} The confirmed payment intent
   */
  static async confirmPayment(paymentIntentId, sessionId) {
    try {
      // Retrieve the payment intent to confirm its status
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      // Update our database record
      if (paymentIntent.status === 'succeeded') {
        await db.query(
          `UPDATE session_purchases 
           SET status = 'completed', payment_id = $1, updated_at = NOW()
           WHERE id = $2`,
          [paymentIntentId, sessionId]
        );
      } else if (paymentIntent.status === 'requires_payment_method') {
        await db.query(
          `UPDATE session_purchases 
           SET status = 'failed', updated_at = NOW()
           WHERE id = $1`,
          [sessionId]
        );
      }
      
      return paymentIntent;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw new Error(`Failed to confirm payment: ${error.message}`);
    }
  }

  /**
   * Handle Stripe webhook events
   * @param {string} payload - The webhook payload
   * @param {string} signature - The webhook signature
   * @returns {Promise<Object>} The webhook event
   */
  static async handleWebhook(payload, signature) {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      // Handle the event
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          // Update our database to mark the payment as completed
          const result = await db.query(
            `UPDATE session_purchases 
             SET status = 'completed', updated_at = NOW()
             WHERE payment_id = $1
             RETURNING institution_id, session_count`,
            [paymentIntent.id]
          );
          
          // If we successfully updated a purchase, also update the session pool
          if (result.rows.length > 0) {
            const { institution_id, session_count } = result.rows[0];
            
            // Check if institution already has a session pool
            const poolResult = await db.query(
              `SELECT id FROM session_pools WHERE institution_id = $1`,
              [institution_id]
            );
            
            if (poolResult.rows.length > 0) {
              // Update existing pool
              await db.query(
                `UPDATE session_pools 
                 SET total_sessions = total_sessions + $1, updated_at = NOW()
                 WHERE institution_id = $2`,
                [session_count, institution_id]
              );
            } else {
              // Create new pool
              await db.query(
                `INSERT INTO session_pools (institution_id, total_sessions)
                 VALUES ($1, $2)`,
                [institution_id, session_count]
              );
            }
          }
          break;
        case 'payment_intent.payment_failed':
          const failedPaymentIntent = event.data.object;
          // Update our database to mark the payment as failed
          await db.query(
            `UPDATE session_purchases 
             SET status = 'failed', updated_at = NOW()
             WHERE payment_id = $1`,
            [failedPaymentIntent.id]
          );
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      return event;
    } catch (error) {
      console.error('Webhook error:', error);
      throw new Error(`Webhook error: ${error.message}`);
    }
  }

  /**
   * Create a Stripe customer for an institution
   * @param {string} institutionId - The institution ID
   * @param {string} email - The customer's email
   * @param {string} name - The customer's name
   * @returns {Promise<Object>} The created customer
   */
  static async createCustomer(institutionId, email, name) {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          institutionId
        }
      });
      
      // Save the customer ID to the institution record
      await db.query(
        `UPDATE institutions 
         SET stripe_customer_id = $1, updated_at = NOW()
         WHERE id = $2`,
        [customer.id, institutionId]
      );
      
      return customer;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw new Error(`Failed to create customer: ${error.message}`);
    }
  }

  /**
   * Save a payment method for an institution
   * @param {string} customerId - The Stripe customer ID
   * @param {string} paymentMethodId - The Stripe payment method ID
   * @returns {Promise<Object>} The attached payment method
   */
  static async savePaymentMethod(customerId, paymentMethodId) {
    try {
      // Attach the payment method to the customer
      const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Set as default payment method
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      return paymentMethod;
    } catch (error) {
      console.error('Error saving payment method:', error);
      throw new Error(`Failed to save payment method: ${error.message}`);
    }
  }

  /**
   * Delete a payment method for an institution
   * @param {string} paymentMethodId - The Stripe payment method ID
   * @returns {Promise<Object>} The detached payment method
   */
  static async deletePaymentMethod(paymentMethodId) {
    try {
      // Detach the payment method from the customer
      const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId);
      return paymentMethod;
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw new Error(`Failed to delete payment method: ${error.message}`);
    }
  }
}

module.exports = StripeService;