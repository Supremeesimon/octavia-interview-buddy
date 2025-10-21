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

      if (!pricePerSession || pricePerSession <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Price per session must be a positive number'
        });
      }

      const totalAmount = sessionCount * pricePerSession;
      const totalAmountCents = Math.round(totalAmount * 100); // Convert to cents

      // Get institution details for customer creation
      const institutionResult = await db.query(
        'SELECT name, contact_email, stripe_customer_id FROM institutions WHERE id = $1',
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
        try {
          const customer = await StripeService.createCustomer(
            institutionId,
            institution.contact_email,
            institution.name
          );
          customerId = customer.id;
        } catch (stripeError) {
          console.error('Stripe customer creation error:', stripeError);
          return res.status(500).json({
            success: false,
            message: 'Failed to create Stripe customer'
          });
        }
      }

      // Create payment intent
      let paymentIntent;
      try {
        paymentIntent = await StripeService.createPaymentIntent(
          totalAmountCents,
          'usd',
          institutionId,
          {
            sessionCount: sessionCount.toString(),
            pricePerSession: pricePerSession.toString(),
            description: `Purchase of ${sessionCount} interview sessions`
          }
        );
      } catch (stripeError) {
        console.error('Stripe payment intent creation error:', stripeError);
        return res.status(500).json({
          success: false,
          message: 'Failed to create payment intent'
        });
      }

      // Validate payment intent
      if (!paymentIntent || !paymentIntent.id || !paymentIntent.client_secret) {
        console.error('Invalid payment intent received from Stripe:', paymentIntent);
        return res.status(500).json({
          success: false,
          message: 'Invalid payment intent received from payment processor'
        });
      }

      // Save session purchase record
      const purchaseResult = await db.query(
        `INSERT INTO session_purchases 
         (institution_id, session_count, price_per_session, total_amount, payment_id, payment_method_id, status, purchase_metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [
          institutionId, 
          sessionCount, 
          pricePerSession, 
          totalAmount, 
          paymentIntent.id, 
          paymentMethodId || null, 
          'pending',
          JSON.stringify({
            sessionCount: sessionCount.toString(),
            pricePerSession: pricePerSession.toString(),
            description: `Purchase of ${sessionCount} interview sessions`
          })
        ]
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
      // Send a proper JSON response even in case of unexpected errors
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Internal server error while creating session purchase'
        });
      }
    }
  },

  // Get session pool for institution
  async getSessionPool(req, res) {
    try {
      if (!req.user || !req.user.institutionId) {
        return res.status(400).json({
          success: false,
          message: 'User is not associated with an institution.'
        });
      }

      const institutionId = req.user.institutionId;

      const result = await db.query(
        `SELECT id, institution_id, total_sessions as session_count, used_sessions as used_count, created_at, updated_at
         FROM session_pools 
         WHERE institution_id = $1`,
        [institutionId]
      );

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Get session pool error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching session pool'
      });
    }
  },

  // Get session allocations for institution
  async getSessionAllocations(req, res) {
    try {
      if (!req.user || !req.user.institutionId) {
        return res.status(400).json({
          success: false,
          message: 'User is not associated with an institution.'
        });
      }

      const institutionId = req.user.institutionId;

      const result = await db.query(
        `SELECT id, institution_id, department_id, teacher_id, student_id, 
                allocated_count, used_count, allocation_type, status, created_at, updated_at
         FROM session_allocations 
         WHERE institution_id = $1
         ORDER BY created_at DESC`,
        [institutionId]
      );

      res.json({
        success: true,
        data: result.rows
      });
    } catch (error) {
      console.error('Get session allocations error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while fetching session allocations'
      });
    }
  },

  // Create session allocation
  async createSessionAllocation(req, res) {
    try {
      if (!req.user || !req.user.institutionId) {
        return res.status(400).json({
          success: false,
          message: 'User is not associated with an institution.'
        });
      }

      const institutionId = req.user.institutionId;
      const { departmentId, teacherId, studentId, allocatedCount, allocationType } = req.body;

      // Validate input
      if (!allocatedCount || allocatedCount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Allocated count must be a positive number'
        });
      }

      // Check if institution has enough sessions in pool
      const poolResult = await db.query(
        `SELECT total_sessions as session_count, used_sessions as used_count 
         FROM session_pools 
         WHERE institution_id = $1`,
        [institutionId]
      );

      const pool = poolResult.rows[0];
      if (!pool) {
        return res.status(400).json({
          success: false,
          message: 'No session pool found for this institution'
        });
      }

      const availableSessions = pool.session_count - pool.used_count;
      if (availableSessions < allocatedCount) {
        return res.status(400).json({
          success: false,
          message: `Not enough sessions available. Requested: ${allocatedCount}, Available: ${availableSessions}`
        });
      }

      // Create session allocation
      const result = await db.query(
        `INSERT INTO session_allocations 
         (institution_id, department_id, teacher_id, student_id, allocated_count, allocation_type, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, institution_id, department_id, teacher_id, student_id, allocated_count, allocation_type, status, created_at, updated_at`,
        [institutionId, departmentId || null, teacherId || null, studentId || null, allocatedCount, allocationType || 'general', 'active']
      );

      // Update pool used count
      await db.query(
        `UPDATE session_pools 
         SET used_count = used_count + $1, updated_at = NOW()
         WHERE institution_id = $2`,
        [allocatedCount, institutionId]
      );

      res.json({
        success: true,
        message: 'Session allocation created successfully',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Create session allocation error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while creating session allocation'
      });
    }
  },

  // Update session allocation
  async updateSessionAllocation(req, res) {
    try {
      if (!req.user || !req.user.institutionId) {
        return res.status(400).json({
          success: false,
          message: 'User is not associated with an institution.'
        });
      }

      const institutionId = req.user.institutionId;
      const allocationId = req.params.id;
      const { allocatedCount } = req.body;

      // Validate input
      if (allocatedCount !== undefined && allocatedCount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Allocated count must be a positive number'
        });
      }

      // Get current allocation
      const currentResult = await db.query(
        `SELECT allocated_count, used_count
         FROM session_allocations 
         WHERE id = $1 AND institution_id = $2`,
        [allocationId, institutionId]
      );

      const currentAllocation = currentResult.rows[0];
      if (!currentAllocation) {
        return res.status(404).json({
          success: false,
          message: 'Session allocation not found'
        });
      }

      // If changing allocated count, check if institution has enough sessions
      if (allocatedCount !== undefined && allocatedCount !== currentAllocation.allocated_count) {
        const poolResult = await db.query(
          `SELECT total_sessions as session_count, used_sessions as used_count 
           FROM session_pools 
           WHERE institution_id = $1`,
          [institutionId]
        );

        const pool = poolResult.rows[0];
        if (!pool) {
          return res.status(400).json({
            success: false,
            message: 'No session pool found for this institution'
          });
        }

        // Calculate the difference
        const difference = allocatedCount - currentAllocation.allocated_count;
        const availableSessions = (pool.session_count - pool.used_count) - (currentAllocation.allocated_count - currentAllocation.used_count);
        
        if (difference > 0 && availableSessions < difference) {
          return res.status(400).json({
            success: false,
            message: `Not enough sessions available. Requested: ${difference}, Available: ${availableSessions}`
          });
        }

        // Update allocation
        const result = await db.query(
          `UPDATE session_allocations 
           SET allocated_count = $1, updated_at = NOW()
           WHERE id = $2 AND institution_id = $3
           RETURNING id, institution_id, department_id, teacher_id, student_id, allocated_count, allocation_type, status, created_at, updated_at`,
          [allocatedCount, allocationId, institutionId]
        );

        // Update pool used count
        await db.query(
          `UPDATE session_pools 
           SET used_count = used_count + $1, updated_at = NOW()
           WHERE institution_id = $2`,
          [difference, institutionId]
        );

        res.json({
          success: true,
          message: 'Session allocation updated successfully',
          data: result.rows[0]
        });
      } else {
        // Just return the current allocation if no changes
        res.json({
          success: true,
          message: 'No changes to session allocation',
          data: currentAllocation
        });
      }
    } catch (error) {
      console.error('Update session allocation error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while updating session allocation'
      });
    }
  },

  // Delete session allocation
  async deleteSessionAllocation(req, res) {
    try {
      if (!req.user || !req.user.institutionId) {
        return res.status(400).json({
          success: false,
          message: 'User is not associated with an institution.'
        });
      }

      const institutionId = req.user.institutionId;
      const allocationId = req.params.id;

      // Get current allocation
      const currentResult = await db.query(
        `SELECT allocated_count
         FROM session_allocations 
         WHERE id = $1 AND institution_id = $2`,
        [allocationId, institutionId]
      );

      const currentAllocation = currentResult.rows[0];
      if (!currentAllocation) {
        return res.status(404).json({
          success: false,
          message: 'Session allocation not found'
        });
      }

      // Delete allocation
      await db.query(
        `DELETE FROM session_allocations 
         WHERE id = $1 AND institution_id = $2`,
        [allocationId, institutionId]
      );

      // Update pool used count
      await db.query(
        `UPDATE session_pools 
         SET used_count = used_count - $1, updated_at = NOW()
         WHERE institution_id = $2`,
        [currentAllocation.allocated_count, institutionId]
      );

      res.json({
        success: true,
        message: 'Session allocation deleted successfully'
      });
    } catch (error) {
      console.error('Delete session allocation error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error while deleting session allocation'
      });
    }
  }
};

module.exports = sessionController;