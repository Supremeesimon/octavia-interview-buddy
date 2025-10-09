const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken, authorizeRole } = require('../middleware/auth.middleware');

// Get current user profile
router.get('/profile', authenticateToken, userController.getProfile);

// Get user by ID (admin only)
router.get('/:id', authenticateToken, authorizeRole('institution_admin', 'platform_admin'), userController.getUserById);

// Update user (admin only)
router.put('/:id', authenticateToken, authorizeRole('institution_admin', 'platform_admin'), userController.updateUser);

// Delete user (admin only)
router.delete('/:id', authenticateToken, authorizeRole('institution_admin', 'platform_admin'), userController.deleteUser);

// Get users by institution (institution admin only)
router.get('/institution/:institutionId', authenticateToken, authorizeRole('institution_admin'), userController.getUsersByInstitution);

module.exports = router;