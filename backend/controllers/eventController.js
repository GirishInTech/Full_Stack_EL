/**
 * Event Controller
 * Handles event CRUD operations, brochure parsing, and chatbot
 */

const Event = require('../models/Event');
const { parseEventBrochure } = require('../services/aiParserService');
const { answerEventQuestion } = require('../services/chatbotService');
const fs = require('fs');
const path = require('path');

/**
 * Create a new event (Admin only)
 * POST /api/events
 */
const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      categories,
      rules,
      teamSizeMin,
      teamSizeMax,
      registrationClose,
      eventStart,
      eventEnd
    } = req.body;

    // Validate required fields
    if (!title || !description || !categories) {
      return res.status(400).json({
        error: {
          code: 400,
          message: 'Title, description, and categories are required'
        }
      });
    }

    // Process categories and rules
    const categoriesArray = categories.split(',').map(c => c.trim()).filter(c => c);
    const rulesArray = rules ? rules.split('\n').map(r => r.trim()).filter(r => r) : [];

    // Build deadlines object
    const deadlines = {};
    if (registrationClose) deadlines.registrationClose = new Date(registrationClose);
    if (eventStart) deadlines.eventStart = new Date(eventStart);
    if (eventEnd) deadlines.eventEnd = new Date(eventEnd);

    // Handle brochure file upload
    let brochureUrl = null;
    if (req.file) {
      // Create URL path for the uploaded file
      brochureUrl = `/media/${req.file.filename}`;
    }

    // Create new event
    const event = new Event({
      title,
      description,
      categories: categoriesArray,
      rules: rulesArray,
      deadlines,
      teamSize: {
        min: parseInt(teamSizeMin) || 1,
        max: parseInt(teamSizeMax) || 6
      },
      brochureUrl,
      createdBy: req.user._id
    });

    await event.save();

    // Populate creator info
    await event.populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all events with optional filters
 * GET /api/events?status=upcoming&category=hackathon
 */
const getEvents = async (req, res, next) => {
  try {
    const { status, category, limit = 50, page = 1 } = req.query;

    // Build filter object
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (category) {
      filter.categories = { $in: [new RegExp(category, 'i')] };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get events
    const events = await Event.find(filter)
      .populate('createdBy', 'name email')
      .sort({ 'deadlines.eventStart': 1 }) // Sort by event start date
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Event.countDocuments(filter);

    res.json({
      events,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single event by ID
 * GET /api/events/:id
 */
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!event) {
      return res.status(404).json({
        error: {
          code: 404,
          message: 'Event not found'
        }
      });
    }

    // Update status before returning
    event.updateStatus();
    await event.save();

    res.json({
      event
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update event (Admin only)
 * PUT /api/events/:id
 */
const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        error: {
          code: 404,
          message: 'Event not found'
        }
      });
    }

    // Check if user is the creator or admin
    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: {
          code: 403,
          message: 'Not authorized to update this event'
        }
      });
    }

    // Update fields
    const {
      title,
      description,
      categories,
      rules,
      deadlines,
      teamSize,
      brochureUrl,
      status
    } = req.body;

    if (title) event.title = title;
    if (description) event.description = description;
    if (categories) event.categories = categories;
    if (rules) event.rules = rules;
    if (deadlines) event.deadlines = { ...event.deadlines, ...deadlines };
    if (teamSize) event.teamSize = teamSize;
    if (brochureUrl !== undefined) event.brochureUrl = brochureUrl;
    if (status) event.status = status;

    await event.save();
    await event.populate('createdBy', 'name email');

    res.json({
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete event (Admin only)
 * DELETE /api/events/:id
 */
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        error: {
          code: 404,
          message: 'Event not found'
        }
      });
    }

    // Check if user is the creator
    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: {
          code: 403,
          message: 'Not authorized to delete this event'
        }
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Event deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Parse event brochure using AI (Stub)
 * POST /api/events/:id/parse-brochure
 */
const parseBrochure = async (req, res, next) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        error: {
          code: 400,
          message: 'No file uploaded'
        }
      });
    }

    // Use AI parser stub to extract event details
    const parsedData = await parseEventBrochure(req.file);

    res.json({
      message: 'Brochure parsed successfully (stub)',
      data: parsedData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Ask chatbot about event (Stub)
 * POST /api/events/:id/ask
 */
const askChatbot = async (req, res, next) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        error: {
          code: 400,
          message: 'Question is required'
        }
      });
    }

    // Get event details
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        error: {
          code: 404,
          message: 'Event not found'
        }
      });
    }

    // Use chatbot stub to answer question
    const answer = answerEventQuestion(question, event);

    res.json({
      question,
      answer
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Summarize event brochure using AI
 * POST /api/events/:id/summarize-brochure
 */
const summarizeBrochure = async (req, res, next) => {
  try {
    // Get event details
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        error: {
          code: 404,
          message: 'Event not found'
        }
      });
    }

    if (!event.brochureUrl) {
      return res.status(400).json({
        error: {
          code: 400,
          message: 'No brochure available for this event'
        }
      });
    }

    // Check if brochure file exists for local files
    if (event.brochureUrl.startsWith('/media/')) {
      const filePath = path.join(__dirname, '..', event.brochureUrl.substring(1)); // Remove leading slash
      
      console.log('Brochure URL:', event.brochureUrl);
      console.log('Constructed file path:', filePath);
      console.log('__dirname:', __dirname);
      console.log('File exists:', fs.existsSync(filePath));
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          error: {
            code: 404,
            message: `Brochure file not found on server. Path: ${filePath}`
          }
        });
      }

      // Read the file and convert to base64
      const fileBuffer = fs.readFileSync(filePath);
      const base64Data = fileBuffer.toString('base64');
      
      // Determine file type from extension
      const ext = path.extname(filePath).toLowerCase();
      let mimeType = 'application/octet-stream';
      
      switch(ext) {
        case '.jpg':
        case '.jpeg':
          mimeType = 'image/jpeg';
          break;
        case '.png':
          mimeType = 'image/png';
          break;
        case '.pdf':
          mimeType = 'application/pdf';
          break;
        case '.gif':
          mimeType = 'image/gif';
          break;
      }

      // Return the file data for the frontend to process
      res.json({
        message: 'Brochure data retrieved successfully',
        data: {
          base64: base64Data,
          mimeType: mimeType,
          filename: path.basename(filePath)
        }
      });
    } else {
      // For external URLs (like Google Drive), return the URL for frontend processing
      res.json({
        message: 'External brochure URL retrieved',
        data: {
          url: event.brochureUrl
        }
      });
    }
  } catch (error) {
    console.error('Error retrieving brochure:', error);
    next(error);
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  parseBrochure,
  askChatbot,
  summarizeBrochure
};
