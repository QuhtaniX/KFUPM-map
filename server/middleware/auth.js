const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid token or user not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

// Middleware to check if user is premium
const requirePremium = async (req, res, next) => {
  if (req.user.subscription.tier !== 'premium') {
    return res.status(403).json({ 
      error: 'Premium subscription required',
      message: 'This feature requires a premium subscription'
    });
  }
  next();
};

// Middleware to check schedule generation limits
const checkScheduleLimit = async (req, res, next) => {
  if (!req.user.canGenerateSchedule()) {
    return res.status(403).json({
      error: 'Schedule generation limit reached',
      message: 'Free users can generate 1 schedule per term. Upgrade to premium for unlimited schedules.'
    });
  }
  next();
};

module.exports = { auth, requirePremium, checkScheduleLimit };