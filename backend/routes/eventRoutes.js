/**
 * Event Routes
 * Handles event CRUD operations and AI features
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const eventController = require('../controllers/eventController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'media/'); // Save to media folder
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'brochure-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  },
  fileFilter: function (req, file, cb) {
    // Accept images and PDFs only
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (JPEG, PNG) and PDFs are allowed'));
    }
  }
});

/**
 * @route   POST /api/events
 * @desc    Create a new event with optional brochure upload
 * @access  Private (Admin only)
 */
router.post('/', authenticate, requireAdmin, upload.single('brochure'), eventController.createEvent);

/**
 * @route   GET /api/events
 * @desc    Get all events with optional filters
 * @access  Private
 */
router.get('/', authenticate, eventController.getEvents);

/**
 * @route   GET /api/events/:id
 * @desc    Get event by ID
 * @access  Private
 */
router.get('/:id', authenticate, eventController.getEventById);

/**
 * @route   PUT /api/events/:id
 * @desc    Update event
 * @access  Private (Admin only)
 */
router.put('/:id', authenticate, requireAdmin, eventController.updateEvent);

/**
 * @route   DELETE /api/events/:id
 * @desc    Delete event
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticate, requireAdmin, eventController.deleteEvent);

/**
 * @route   POST /api/events/:id/parse-brochure
 * @desc    Parse event brochure using AI
 * @access  Private (Admin only)
 */
router.post(
  '/:id/parse-brochure',
  authenticate,
  requireAdmin,
  upload.single('brochure'),
  eventController.parseBrochure
);

/**
 * @route   POST /api/events/:id/ask
 * @desc    Ask chatbot about event
 * @access  Private
 */
router.post('/:id/ask', authenticate, eventController.askChatbot);

/**
 * @route   POST /api/events/:id/summarize-brochure
 * @desc    Get brochure data for AI summarization
 * @access  Private
 */
router.post('/:id/summarize-brochure', authenticate, eventController.summarizeBrochure);

module.exports = router;
