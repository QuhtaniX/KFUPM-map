const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        studentId: req.user.studentId,
        major: req.user.major,
        subscription: req.user.subscription,
        preferences: req.user.preferences,
        usage: req.user.usage,
        createdAt: req.user.createdAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, studentId, major } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (studentId !== undefined) updateData.studentId = studentId;
    if (major !== undefined) updateData.major = major;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Update user preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const {
      preferredProfessors,
      avoidEarlyClasses,
      maxWalkingDistance,
      preferredBuildings,
      avoidBuildings,
      preferredTimeSlots
    } = req.body;

    req.user.preferences = {
      preferredProfessors: preferredProfessors || [],
      avoidEarlyClasses: avoidEarlyClasses || false,
      maxWalkingDistance: maxWalkingDistance || 15,
      preferredBuildings: preferredBuildings || [],
      avoidBuildings: avoidBuildings || [],
      preferredTimeSlots: preferredTimeSlots || []
    };

    await req.user.save();

    res.json({
      message: 'Preferences updated successfully',
      preferences: req.user.preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Get user usage statistics
router.get('/usage', auth, async (req, res) => {
  try {
    const usage = {
      schedulesGenerated: req.user.usage.schedulesGenerated,
      lastScheduleGeneration: req.user.usage.lastScheduleGeneration,
      canGenerateSchedule: req.user.canGenerateSchedule(),
      currentTerm: req.user.getCurrentTerm(),
      subscriptionTier: req.user.subscription.tier
    };

    res.json({ usage });
  } catch (error) {
    console.error('Get usage error:', error);
    res.status(500).json({ error: 'Failed to get usage statistics' });
  }
});

// Delete user account
router.delete('/account', auth, async (req, res) => {
  try {
    const { password } = req.body;

    // Verify password before deletion
    const isPasswordValid = await req.user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Incorrect password' });
    }

    // Soft delete - mark as inactive
    req.user.isActive = false;
    await req.user.save();

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// Export user data
router.get('/export-data', auth, async (req, res) => {
  try {
    const Schedule = require('../models/Schedule');
    
    // Get user's saved schedules
    const schedules = await Schedule.find({
      userId: req.user._id,
      isActive: true
    }).select('-__v');

    const userData = {
      profile: {
        email: req.user.email,
        name: req.user.name,
        studentId: req.user.studentId,
        major: req.user.major,
        createdAt: req.user.createdAt
      },
      preferences: req.user.preferences,
      subscription: req.user.subscription,
      usage: req.user.usage,
      schedules: schedules,
      exportDate: new Date().toISOString()
    };

    res.json({
      message: 'Data exported successfully',
      data: userData
    });
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

module.exports = router;