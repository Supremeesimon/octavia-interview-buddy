const db = require('../config/database');
const StripeService = require('../services/stripe.service');

const sessionController = {
  // Get session purchases for institution
  async getSessionPurchases(req, res) {
    try {
      // Check if user has institutionId
      if (!req.user || !req.user.institutionId) {
        return res.status(400).json({
          success: false,
          message: 'User is not associated with an institution. Only institution administrators can access session purchases.'
        });
      }

      const institutionId = req.user.institutionId;

      const result = await db.query(
        `SELECT id, session_count, price_per_session, total_amount, payment_id,
                payment_method_id, status, purchase_metadata, created_at, updated_at
         FROM session_purchases 
         WHERE institution_id = $1 
         ORDER BY created_at DESC`,
        [institutionId]
      );

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Get session purchases error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching session purchases'
      });
    }
  },

  // Create session purchase
  async createSessionPurchase(req, res) {
    try {
      const institutionId = req.user.institutionId;
      const { sessionCount, pricePerSession, paymentMethodId } = req.body;

      // Validate input
      if (!sessionCount || sessionCount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Session count must be a positive number'
        });
      }

      const totalAmount = sessionCount * pricePerSession;
      const totalAmountCents = Math.round(totalAmount * 100); // Convert to cents

      // Get institution details for customer creation
      const institutionResult = await db.query(
        'SELECT name, email, stripe_customer_id FROM institutions WHERE id = $1',
        [institutionId]
      );

      const institution = institutionResult.rows[0];
      if (!institution) {
        return res.status(404).json({
          success: false,
          message: 'Institution not found'
        });
      }

      // Create or retrieve Stripe customer
      let customerId = institution.stripe_customer_id;
      if (!customerId) {
        const customer = await StripeService.createCustomer(
          institutionId,
          institution.email,
          institution.name
        );
        customerId = customer.id;
      }

      // Create payment intent
      const paymentIntent = await StripeService.createPaymentIntent(
        totalAmountCents,
        'usd',
        institutionId,
        {
          sessionCount: sessionCount.toString(),
          pricePerSession: pricePerSession.toString(),
          description: `Purchase of ${sessionCount} interview sessions`
        }
      );

      // Save session purchase record
      const purchaseResult = await db.query(
        `INSERT INTO session_purchases 
         (institution_id, session_count, price_per_session, total_amount, payment_id, payment_method_id, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [institutionId, sessionCount, pricePerSession, totalAmount, paymentIntent.id, paymentMethodId || null, 'pending']
      );

      const purchaseId = purchaseResult.rows[0].id;

      res.json({
        success: true,
        message: 'Session purchase initiated',
        data: {
          sessionId: purchaseId,
          clientSecret: paymentIntent.client_secret
        }
      });
    } catch (error) {
      console.error('Create session purchase error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while creating session purchase'
      });
    }
  }
};

module.exports = sessionController;