const mongoose = require('mongoose');

const buildingSchema = new mongoose.Schema({
  buildingNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  buildingName: {
    type: String,
    required: true,
    trim: true
  },
  coordinates: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  address: {
    type: String,
    trim: true
  },
  description: String,
  departments: [String],
  facilities: [String], // e.g., ['Computer Labs', 'Library', 'Cafeteria']
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for geospatial queries
buildingSchema.index({ coordinates: '2dsphere' });

// Method to calculate distance between two buildings
buildingSchema.statics.calculateDistance = function(building1, building2) {
  const R = 6371; // Earth's radius in kilometers
  const lat1 = building1.coordinates.lat * Math.PI / 180;
  const lat2 = building2.coordinates.lat * Math.PI / 180;
  const deltaLat = (building2.coordinates.lat - building1.coordinates.lat) * Math.PI / 180;
  const deltaLng = (building2.coordinates.lng - building1.coordinates.lng) * Math.PI / 180;

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in kilometers
};

// Method to calculate walking time between buildings
buildingSchema.statics.calculateWalkingTime = function(building1, building2) {
  const distance = this.calculateDistance(building1, building2);
  const walkingSpeed = 5; // km/h (average walking speed)
  const walkingTimeMinutes = (distance / walkingSpeed) * 60;
  
  // Add buffer time for finding rooms, etc.
  return Math.ceil(walkingTimeMinutes + 2);
};

module.exports = mongoose.model('Building', buildingSchema);