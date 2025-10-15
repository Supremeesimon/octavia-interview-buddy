const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const firebaseAdmin = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');

dotenv.config();

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      institutionId: user.institution_id
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
};

const authController = {
  // Login user
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      // Find user in database
      const result = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      const user = result.rows[0];
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate JWT token
      const token = generateToken(user);

      // Update last login
      await db.query(
        'UPDATE users SET last_login_at = NOW() WHERE id = $1',
        [user.id]
      );

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            institutionId: user.institution_id,
            isEmailVerified: user.is_email_verified
          },
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Register new user
  async register(req, res) {
    try {
      const { email, password, name, institutionId, role } = req.body;

      // Validate input
      if (!email || !password || !name) {
        return res.status(400).json({
          success: false,
          message: 'Email, password, and name are required'
        });
      }

      // Check if user already exists
      const existingUser = await db.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Generate email verification token
      const emailVerificationToken = uuidv4();

      // Determine user role - default to 'student' if not provided
      const userRole = role && ['student', 'teacher', 'institution_admin'].includes(role) ? role : 'student';

      // Insert new user
      const result = await db.query(
        `INSERT INTO users (email, password_hash, name, role, institution_id, email_verification_token)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, email, name, role, institution_id, is_email_verified`,
        [
          email,
          hashedPassword,
          name,
          userRole,
          institutionId,
          emailVerificationToken
        ]
      );

      const newUser = result.rows[0];

      // Generate JWT token
      const token = generateToken(newUser);

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            institutionId: newUser.institution_id,
            isEmailVerified: newUser.is_email_verified
          },
          token
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Logout user
  async logout(req, res) {
    // In a stateless JWT system, logout is handled client-side
    // We can add token to blacklist if needed
    res.json({
      success: true,
      message: 'Logout successful'
    });
  },

  // Refresh token
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        });
      }

      // In a real implementation, you would verify the refresh token
      // For now, we'll just generate a new access token
      // This is a simplified implementation

      res.json({
        success: true,
        message: 'Token refreshed successfully'
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Request password reset
  async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      // Find user
      const result = await db.query(
        'SELECT id, email, name FROM users WHERE email = $1',
        [email]
      );

      const user = result.rows[0];
      if (!user) {
        // Return success even if user doesn't exist to prevent email enumeration
        return res.json({
          success: true,
          message: 'If an account exists with this email, you will receive a password reset link'
        });
      }

      // Generate password reset token
      const passwordResetToken = uuidv4();
      const passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour

      // Update user with reset token
      await db.query(
        `UPDATE users 
         SET password_reset_token = $1, password_reset_expires = $2 
         WHERE id = $3`,
        [passwordResetToken, passwordResetExpires, user.id]
      );

      // In a real implementation, you would send an email with the reset link
      // For now, we'll just return success

      res.json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link'
      });
    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Reset password
  async resetPassword(req, res) {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({
          success: false,
          message: 'Token and password are required'
        });
      }

      // Find user with valid reset token
      const result = await db.query(
        `SELECT id FROM users 
         WHERE password_reset_token = $1 
         AND password_reset_expires > NOW()`,
        [token]
      );

      const user = result.rows[0];
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
      }

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Update password and clear reset token
      await db.query(
        `UPDATE users 
         SET password_hash = $1, password_reset_token = NULL, password_reset_expires = NULL 
         WHERE id = $2`,
        [hashedPassword, user.id]
      );

      res.json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Verify email
  async verifyEmail(req, res) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Verification token is required'
        });
      }

      // Find user with verification token
      const result = await db.query(
        'SELECT id FROM users WHERE email_verification_token = $1',
        [token]
      );

      const user = result.rows[0];
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid verification token'
        });
      }

      // Update user as verified
      await db.query(
        `UPDATE users 
         SET is_email_verified = TRUE, email_verification_token = NULL 
         WHERE id = $1`,
        [user.id]
      );

      res.json({
        success: true,
        message: 'Email verified successfully'
      });
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Resend email verification
  async resendEmailVerification(req, res) {
    try {
      // In a real implementation, you would get the current user from the token
      // and send a new verification email
      // For now, we'll just return success

      res.json({
        success: true,
        message: 'Verification email sent successfully'
      });
    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Change password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password and new password are required'
        });
      }

      // Get current user
      const result = await db.query(
        'SELECT password_hash FROM users WHERE id = $1',
        [userId]
      );

      const user = result.rows[0];
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await db.query(
        'UPDATE users SET password_hash = $1 WHERE id = $2',
        [hashedPassword, userId]
      );

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Update profile
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { name, profilePictureUrl } = req.body;

      // Build update query dynamically
      const updates = [];
      const values = [];
      let index = 1;

      if (name !== undefined) {
        updates.push(`name = $${index}`);
        values.push(name);
        index++;
      }

      if (profilePictureUrl !== undefined) {
        updates.push(`profile_picture_url = $${index}`);
        values.push(profilePictureUrl);
        index++;
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid fields to update'
        });
      }

      values.push(userId); // Add user ID for WHERE clause

      // Update user
      const result = await db.query(
        `UPDATE users 
         SET ${updates.join(', ')}, updated_at = NOW() 
         WHERE id = $${index} 
         RETURNING id, email, name, role, institution_id, profile_picture_url, is_email_verified`,
        values
      );

      const updatedUser = result.rows[0];
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            name: updatedUser.name,
            role: updatedUser.role,
            institutionId: updatedUser.institution_id,
            profilePictureUrl: updatedUser.profile_picture_url,
            isEmailVerified: updatedUser.is_email_verified
          }
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  // Exchange Firebase ID token for backend JWT token
  async exchangeFirebaseToken(req, res) {
    try {
      const { firebaseToken } = req.body;

      if (!firebaseToken) {
        return res.status(400).json({
          success: false,
          message: 'Firebase token is required'
        });
      }

      // Verify Firebase ID token
      if (!firebaseAdmin) {
        return res.status(500).json({
          success: false,
          message: 'Firebase Admin not initialized'
        });
      }

      let decodedToken;
      try {
        decodedToken = await firebaseAdmin.auth().verifyIdToken(firebaseToken);
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: 'Invalid Firebase token'
        });
      }

      const firebaseUid = decodedToken.uid;
      const firebaseEmail = decodedToken.email;

      // Find user in database by Firebase UID
      const result = await db.query(
        'SELECT * FROM users WHERE firebase_uid = $1',
        [firebaseUid]
      );

      let user = result.rows[0];

      // If user doesn't exist in our database, create them
      if (!user) {
        // Try to find by email as fallback
        const emailResult = await db.query(
          'SELECT * FROM users WHERE email = $1',
          [firebaseEmail]
        );
        
        user = emailResult.rows[0];
        
        if (user) {
          // Update existing user with Firebase UID
          await db.query(
            'UPDATE users SET firebase_uid = $1 WHERE id = $2',
            [firebaseUid, user.id]
          );
        } else {
          // Create new user
          const name = decodedToken.name || firebaseEmail.split('@')[0] || 'Anonymous User';
          
          // Determine role (this is a simplified approach - you might want to implement a more sophisticated role assignment)
          const role = 'student'; // Default role
          
          const insertResult = await db.query(
            `INSERT INTO users (email, name, role, firebase_uid, is_email_verified, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
             RETURNING *`,
            [firebaseEmail, name, role, firebaseUid, true]
          );
          
          user = insertResult.rows[0];
        }
      }

      // Generate backend JWT token
      const token = generateToken(user);

      // Update last login
      await db.query(
        'UPDATE users SET last_login_at = NOW() WHERE id = $1',
        [user.id]
      );

      res.json({
        success: true,
        message: 'Token exchange successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            institutionId: user.institution_id,
            isEmailVerified: user.is_email_verified
          },
          token
        }
      });
    } catch (error) {
      console.error('Token exchange error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
};

module.exports = authController;