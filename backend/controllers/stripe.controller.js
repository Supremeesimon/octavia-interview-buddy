const StripeService = require('../services/stripe.service');
const db = require('../config/database');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const stripeController = {
  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(req, res) {
    const payload = req.body;
    const signature = req.headers['stripe-signature'];

    try {
      await StripeService.handleWebhook(payload, signature);
      res.status(200).send({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).send(`Webhook error: ${error.message}`);
    }
  },

  /**
   * Get payment methods for the institution
   */
  async getPaymentMethods(req, res) {
    try {
      // Check if user has institutionId
      if (!req.user || !req.user.institutionId) {
        return res.status(400).json({
          success: false,
          message: 'User is not associated with an institution. Only institution administrators can access payment methods.'
        });
      }

      const institutionId = req.user.institutionId;

      // Get customer ID from institution
      const result = await db.query(
        'SELECT stripe_customer_id FROM institutions WHERE id = $1',
        [institutionId]
      );

      const institution = result.rows[0];
      if (!institution || !institution.stripe_customer_id) {
        return res.status(200).json({
          success: true,
          data: []
        });
      }

      // Get payment methods from Stripe
      const paymentMethods = await stripe.paymentMethods.list({
        customer: institution.stripe_customer_id,
        type: 'card',
      });

      // Handle case where paymentMethods.data might be undefined
      const paymentData = Array.isArray(paymentMethods.data) ? paymentMethods.data : [];
      
      res.json({
        success: true,
        data: paymentData.map(pm => ({
          id: pm.id,
          brand: pm.card ? pm.card.brand : 'Unknown',
          last4: pm.card ? pm.card.last4 : '0000',
          expMonth: pm.card ? pm.card.exp_month : 1,
          expYear: pm.card ? pm.card.exp_year : 2025,
          isDefault: pm.id === (paymentData.length > 0 ? paymentData[0].id : null) // Assuming first is default
        }))
      });
    } catch (error) {
      console.error('Get payment methods error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching payment methods',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * Save a payment method for the institution
   */
  async savePaymentMethod(req, res) {
    try {
      const institutionId = req.user.institutionId;
      const { paymentMethodId } = req.body;

      // Get customer ID from institution
      const result = await db.query(
        'SELECT stripe_customer_id FROM institutions WHERE id = $1',
        [institutionId]
      );

      const institution = result.rows[0];
      if (!institution || !institution.stripe_customer_id) {
        return res.status(404).json({
          success: false,
          message: 'Stripe customer not found'
        });
      }

      // Save payment method
      const paymentMethod = await StripeService.savePaymentMethod(
        institution.stripe_customer_id,
        paymentMethodId
      );

      res.json({
        success: true,
        message: 'Payment method saved successfully',
        data: {
          id: paymentMethod.id,
          brand: paymentMethod.card.brand,
          last4: paymentMethod.card.last4,
          expMonth: paymentMethod.card.exp_month,
          expYear: paymentMethod.card.exp_year
        }
      });
    } catch (error) {
      console.error('Save payment method error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  /**
   * Get invoices for the institution
   */
  async getInvoices(req, res) {
    try {
      const institutionId = req.user.institutionId;

      // Get customer ID from institution
      const result = await db.query(
        'SELECT stripe_customer_id FROM institutions WHERE id = $1',
        [institutionId]
      );

      const institution = result.rows[0];
      if (!institution || !institution.stripe_customer_id) {
        return res.json({
          success: true,
          data: []
        });
      }

      // Get invoices from Stripe
      const invoices = await stripe.invoices.list({
        customer: institution.stripe_customer_id,
        limit: 10,
      });

      res.json({
        success: true,
        data: invoices.data.map(invoice => ({
          id: invoice.id,
          amount: invoice.amount_due,
          currency: invoice.currency,
          status: invoice.status,
          created: new Date(invoice.created * 1000),
          paid: invoice.paid,
          hostedInvoiceUrl: invoice.hosted_invoice_url,
          invoicePdf: invoice.invoice_pdf
        }))
      });
    } catch (error) {
      console.error('Get invoices error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

module.exports = stripeController;