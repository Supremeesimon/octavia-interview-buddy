const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from both backend directory and parent directory
dotenv.config(); // Load from backend directory first
dotenv.config({ path: path.resolve(__dirname, '../.env.local') }); // Then load from parent directory

// Initialize Express app
const app = express();

// Determine environment
const isProduction = process.env.NODE_ENV === 'production';
const isKoyeb = !!process.env.K_SERVICE; // Koyeb sets this environment variable
const PORT = process.env.PORT || (isKoyeb ? 8080 : 3006); // Koyeb expects port 8080, local uses 3006

console.log('Server configuration - Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  K_SERVICE: process.env.K_SERVICE,
  PORT,
  isProduction,
  isKoyeb
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || (isKoyeb ? 'https://your-domain.com' : 'http://localhost:8080'),
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend server is running',
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      K_SERVICE: process.env.K_SERVICE,
      timestamp: new Date().toISOString()
    }
  });
});

// Debug route to check environment variables
app.get('/api/debug/env', (req, res) => {
  res.json({ 
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      K_SERVICE: process.env.K_SERVICE,
      PORT: process.env.PORT,
      isProduction,
      isKoyeb
    },
    database: {
      KOYEB_DATABASE_URL: process.env.KOYEB_DATABASE_URL ? 'SET' : 'NOT SET',
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET'
    },
    services: {
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'SET' : 'NOT SET',
      VITE_STRIPE_PUBLISHABLE_KEY: process.env.VITE_STRIPE_PUBLISHABLE_KEY ? 'SET' : 'NOT SET',
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ? 'SET' : 'NOT SET'
    }
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

// Export the app for use in Koyeb deployment
module.exports = { app };

// Only start the server if this file is run directly (not imported)
let server;
if (require.main === module) {
  server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Koyeb deployment: ${isKoyeb ? 'YES' : 'NO'}`);
  });
  
  // Add error handling for the server
  server.on('error', (error) => {
    console.error('Server error:', error);
  });
  
  // Log when the server starts listening
  server.on('listening', () => {
    const address = server.address();
    console.log(`Server listening on ${typeof address === 'string' ? address : `http://0.0.0.0:${address.port}`}`);
  });
}