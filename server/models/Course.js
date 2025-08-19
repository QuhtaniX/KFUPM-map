const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    required: true
  },
  startTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  endTime: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  }
});

const sectionSchema = new mongoose.Schema({
  crn: {
    type: String,
    required: true,
    unique: true
  },
  sectionNumber: {
    type: String,
    required: true
  },
  instructor: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  enrolled: {
    type: Number,
    default: 0
  },
  timeSlots: [timeSlotSchema],
  building: {
    type: String,
    required: true
  },
  room: {
    type: String,
    required: true
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  notes: String
});

const courseSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    required: true,
    trim: true
  },
  courseName: {
    type: String,
    required: true,
    trim: true
  },
  credits: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  term: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true
  },
  sections: [sectionSchema],
  prerequisites: [String],
  corequisites: [String],
  description: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
courseSchema.index({ courseCode: 1, term: 1, year: 1 });
courseSchema.index({ department: 1, term: 1, year: 1 });
courseSchema.index({ 'sections.crn': 1 });

// Virtual for available sections
courseSchema.virtual('availableSections').get(function() {
  return this.sections.filter(section => 
    section.enrolled < section.capacity && section.isActive !== false
  );
});

// Method to check if two sections have time conflicts
courseSchema.methods.hasTimeConflict = function(section1, section2) {
  for (const slot1 of section1.timeSlots) {
    for (const slot2 of section2.timeSlots) {
      if (slot1.day === slot2.day) {
        const start1 = new Date(`2000-01-01 ${slot1.startTime}`);
        const end1 = new Date(`2000-01-01 ${slot1.endTime}`);
        const start2 = new Date(`2000-01-01 ${slot2.startTime}`);
        const end2 = new Date(`2000-01-01 ${slot2.endTime}`);
        
        if (start1 < end2 && start2 < end1) {
          return true;
        }
      }
    }
  }
  return false;
};

module.exports = mongoose.model('Course', courseSchema);