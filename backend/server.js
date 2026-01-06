/**
 * Express Server Configuration
 * Main entry point for the backend application
 */

// Load environment variables first
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Create Express application
const app = express();

// Connect to MongoDB database
connectDB();

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

// Helmet: Adds security headers to HTTP responses
app.use(helmet());

// CORS: Enable Cross-Origin Resource Sharing
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Body parser: Parse JSON request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting: Prevent abuse by limiting requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: { code: 429, message: 'Too many requests, please try again later' } }
});
app.use('/api/', limiter);

// Stricter rate limit for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit to 5 auth attempts
  message: { error: { code: 429, message: 'Too many authentication attempts, please try again later' } }
});

// ============================================
// STATIC FILE SERVING  
// ============================================

// Serve uploaded media files
app.use('/media', express.static('media'));

// ============================================
// ROUTES
// ============================================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'TeamFinder API is running',
    timestamp: new Date().toISOString()
  });
});

// Auth routes
// app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));


// User routes
app.use('/api/users', require('./routes/userRoutes'));

// Event routes
app.use('/api/events', require('./routes/eventRoutes'));

// Team routes
app.use('/api/teams', require('./routes/teamRoutes'));

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 404,
      message: 'Route not found'
    }
  });
});

// ============================================
// ERROR HANDLER (Must be last middleware)
// ============================================
app.use(errorHandler);

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
});
