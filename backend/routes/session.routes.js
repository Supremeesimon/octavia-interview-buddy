const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/session.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');

// Get session purchases for institution
router.get('/purchases', authenticateToken, authorizeRole('institution_admin'), sessionController.getSessionPurchases);

// Create session purchase
router.post('/purchases', authenticateToken, authorizeRole('institution_admin'), sessionController.createSessionPurchase);

// Get session pool for institution
router.get('/pool', authenticateToken, sessionController.getSessionPool);

// Get session allocations for institution
router.get('/allocations', authenticateToken, sessionController.getSessionAllocations);

// Create session allocation
router.post('/allocations', authenticateToken, authorizeRole('institution_admin'), sessionController.createSessionAllocation);

// Update session allocation
router.put('/allocations/:id', authenticateToken, authorizeRole('institution_admin'), sessionController.updateSessionAllocation);

// Delete session allocation
router.delete('/allocations/:id', authenticateToken, authorizeRole('institution_admin'), sessionController.deleteSessionAllocation);

module.exports = router;