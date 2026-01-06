/**
 * User Model
 * Represents students and admins in the system
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Basic information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  
  // Role-based access control
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  
  // Student-specific fields (optional for admins)
  course: {
    type: String,
    trim: true,
    maxlength: [100, 'Course name cannot exceed 100 characters']
  },
  
  branch: {
    type: String,
    trim: true,
    maxlength: [100, 'Branch name cannot exceed 100 characters']
  },
  
  year: {
    type: String,
    trim: true,
    maxlength: [20, 'Year cannot exceed 20 characters']
  },
  
  // Optional phone number for contact
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters'],
    match: [/^[0-9+\-()\s]{7,20}$/, 'Please provide a valid phone number']
  },
  
  // Skills array - used for teammate matching
  skills: {
    type: [String],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 50; // Max 50 skills
      },
      message: 'Cannot have more than 50 skills'
    }
  },
  
  // Achievements array
  achievements: {
    type: [String],
    default: [],
    validate: {
      validator: function(arr) {
        return arr.length <= 50; // Max 50 achievements
      },
      message: 'Cannot have more than 50 achievements'
    }
  },
  
  // Statistics for ranking and display
  stats: {
    eventsParticipated: {
      type: Number,
      default: 0,
      min: 0
    },
    eventsWon: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  
  // Refresh token for JWT authentication
  refreshToken: {
    type: String,
    default: null
  }
}, {
  // Automatically add createdAt and updatedAt timestamps
  timestamps: true
});

// Index for skill-based searching
userSchema.index({ skills: 1 });

// Don't return password and refresh token by default
userSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.passwordHash;
    delete ret.refreshToken;
    delete ret.__v;
    return ret;
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
