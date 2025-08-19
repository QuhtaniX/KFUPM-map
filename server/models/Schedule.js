const mongoose = require('mongoose');

const scheduleItemSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    required: true
  },
  courseName: {
    type: String,
    required: true
  },
  crn: {
    type: String,
    required: true
  },
  sectionNumber: {
    type: String,
    required: true
  },
  instructor: {
    type: String,
    required: true
  },
  building: {
    type: String,
    required: true
  },
  room: {
    type: String,
    required: true
  },
  timeSlots: [{
    day: {
      type: String,
      enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      required: true
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    }
  }],
  credits: {
    type: Number,
    required: true
  }
});

const scheduleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  term: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  courses: [scheduleItemSchema],
  totalCredits: {
    type: Number,
    required: true
  },
  totalWalkingTime: {
    type: Number,
    default: 0 // in minutes
  },
  score: {
    type: Number,
    default: 0 // schedule optimization score
  },
  preferences: {
    preferredProfessors: [String],
    avoidEarlyClasses: Boolean,
    maxWalkingDistance: Number,
    preferredBuildings: [String],
    avoidBuildings: [String]
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
scheduleSchema.index({ userId: 1, term: 1, year: 1 });
scheduleSchema.index({ userId: 1, isFavorite: 1 });

// Virtual for total courses
scheduleSchema.virtual('totalCourses').get(function() {
  return this.courses.length;
});

// Method to calculate total walking time
scheduleSchema.methods.calculateWalkingTime = async function() {
  const Building = mongoose.model('Building');
  let totalTime = 0;
  
  // Group courses by day and sort by time
  const dailySchedules = {};
  
  this.courses.forEach(course => {
    course.timeSlots.forEach(slot => {
      if (!dailySchedules[slot.day]) {
        dailySchedules[slot.day] = [];
      }
      dailySchedules[slot.day].push({
        ...course,
        startTime: slot.startTime,
        endTime: slot.endTime
      });
    });
  });
  
  // Calculate walking time for each day
  for (const [day, courses] of Object.entries(dailySchedules)) {
    courses.sort((a, b) => a.startTime.localeCompare(b.startTime));
    
    for (let i = 0; i < courses.length - 1; i++) {
      const currentCourse = courses[i];
      const nextCourse = courses[i + 1];
      
      // Get building coordinates
      const currentBuilding = await Building.findOne({ buildingNumber: currentCourse.building });
      const nextBuilding = await Building.findOne({ buildingNumber: nextCourse.building });
      
      if (currentBuilding && nextBuilding) {
        const walkingTime = Building.calculateWalkingTime(currentBuilding, nextBuilding);
        totalTime += walkingTime;
      }
    }
  }
  
  this.totalWalkingTime = totalTime;
  return totalTime;
};

// Method to calculate schedule score
scheduleSchema.methods.calculateScore = function() {
  let score = 100; // Base score
  
  // Deduct points for walking time
  score -= this.totalWalkingTime * 0.5;
  
  // Add points for preferred professors
  this.courses.forEach(course => {
    if (this.preferences.preferredProfessors.includes(course.instructor)) {
      score += 10;
    }
  });
  
  // Deduct points for early classes if user wants to avoid them
  if (this.preferences.avoidEarlyClasses) {
    this.courses.forEach(course => {
      course.timeSlots.forEach(slot => {
        const hour = parseInt(slot.startTime.split(':')[0]);
        if (hour < 9) {
          score -= 5;
        }
      });
    });
  }
  
  // Deduct points for avoided buildings
  this.courses.forEach(course => {
    if (this.preferences.avoidBuildings.includes(course.building)) {
      score -= 15;
    }
  });
  
  this.score = Math.max(0, score);
  return this.score;
};

// Method to get CRN list for export
scheduleSchema.methods.getCRNList = function() {
  return this.courses.map(course => course.crn);
};

module.exports = mongoose.model('Schedule', scheduleSchema);