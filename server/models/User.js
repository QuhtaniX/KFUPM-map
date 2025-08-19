const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  studentId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  major: {
    type: String,
    trim: true
  },
  preferences: {
    preferredProfessors: [String],
    avoidEarlyClasses: {
      type: Boolean,
      default: false
    },
    maxWalkingDistance: {
      type: Number,
      default: 15 // minutes
    },
    preferredBuildings: [String],
    avoidBuildings: [String],
    preferredTimeSlots: [{
      day: String,
      startTime: String,
      endTime: String
    }]
  },
  subscription: {
    tier: {
      type: String,
      enum: ['free', 'premium'],
      default: 'free'
    },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    expiresAt: Date
  },
  usage: {
    schedulesGenerated: {
      type: Number,
      default: 0
    },
    lastScheduleGeneration: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if user can generate more schedules
userSchema.methods.canGenerateSchedule = function() {
  if (this.subscription.tier === 'premium') return true;
  
  const currentTerm = this.getCurrentTerm();
  const lastGeneration = this.usage.lastScheduleGeneration;
  
  // Free users get 1 schedule per term
  if (!lastGeneration || this.getTermFromDate(lastGeneration) !== currentTerm) {
    return true;
  }
  
  return false;
};

// Get current academic term
userSchema.methods.getCurrentTerm = function() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  
  if (month >= 8 && month <= 12) {
    return `${year}-Fall`;
  } else if (month >= 1 && month <= 5) {
    return `${year}-Spring`;
  } else {
    return `${year}-Summer`;
  }
};

// Get term from date
userSchema.methods.getTermFromDate = function(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  
  if (month >= 8 && month <= 12) {
    return `${year}-Fall`;
  } else if (month >= 1 && month <= 5) {
    return `${year}-Spring`;
  } else {
    return `${year}-Summer`;
  }
};

module.exports = mongoose.model('User', userSchema);