const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from both backend directory and parent directory
dotenv.config(); // Load from backend directory first
dotenv.config({ path: path.resolve(__dirname, '../.env.local') }); // Then load from parent directory

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3005; // Changed to 3005

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from React app (only in local development)
if (!process.env.FUNCTIONS_EMULATOR && !process.env.K_SERVICE) {
  app.use(express.static(path.join(__dirname, '../dist')));
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend server is running' });
});

// Debug route to check environment variables
app.get('/api/debug/env', (req, res) => {
  res.json({ 
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'SET' : 'NOT SET',
    STRIPE_SECRET_KEY_LENGTH: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.length : 0,
    VITE_STRIPE_PUBLISHABLE_KEY: process.env.VITE_STRIPE_PUBLISHABLE_KEY ? 'SET' : 'NOT SET',
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ? 'SET' : 'NOT SET',
    NODE_ENV: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/institutions', require('./routes/institution.routes'));
app.use('/api/sessions', require('./routes/session.routes'));
app.use('/api/session-requests', require('./routes/session-request.routes'));
app.use('/api/resumes', require('./routes/resume.routes'));
app.use('/api/interviews', require('./routes/interview.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/stripe', require('./routes/stripe.routes'));
app.use('/api/email', require('./routes/email.routes'));
app.use('/api/brevo', require('./routes/brevo.routes'));

// Serve React app for any non-API routes (only in local development)
if (!process.env.FUNCTIONS_EMULATOR && !process.env.K_SERVICE) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Export the app for use in Firebase Functions
module.exports = { app };

// Only start the server if this file is run directly (not imported)
if (require.main === module && !process.env.FUNCTIONS_EMULATOR && !process.env.K_SERVICE) {
  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
  });
}