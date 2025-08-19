const express = require('express');
const ScheduleGenerator = require('../services/scheduleGenerator');
const Schedule = require('../models/Schedule');
const Course = require('../models/Course');
const { auth, checkScheduleLimit } = require('../middleware/auth');

const router = express.Router();

// Generate new schedules
router.post('/generate', auth, checkScheduleLimit, async (req, res) => {
  try {
    const { courseCodes, term, year, preferences } = req.body;

    if (!courseCodes || courseCodes.length === 0) {
      return res.status(400).json({ error: 'Course codes are required' });
    }

    // Use user preferences or provided preferences
    const userPreferences = preferences || req.user.preferences;

    const generator = new ScheduleGenerator(req.user, userPreferences);
    const schedules = await generator.generateSchedules(courseCodes, term, year);

    if (schedules.length === 0) {
      return res.status(404).json({ error: 'No valid schedules found for the given courses' });
    }

    res.json({
      message: 'Schedules generated successfully',
      schedules,
      count: schedules.length
    });
  } catch (error) {
    console.error('Schedule generation error:', error);
    res.status(500).json({ error: 'Failed to generate schedules' });
  }
});

// Save a generated schedule
router.post('/save', auth, async (req, res) => {
  try {
    const { scheduleData, name } = req.body;

    if (!scheduleData || !name) {
      return res.status(400).json({ error: 'Schedule data and name are required' });
    }

    const generator = new ScheduleGenerator(req.user, req.user.preferences);
    const savedSchedule = await generator.saveSchedule(scheduleData, name);

    res.status(201).json({
      message: 'Schedule saved successfully',
      schedule: savedSchedule
    });
  } catch (error) {
    console.error('Schedule save error:', error);
    res.status(500).json({ error: 'Failed to save schedule' });
  }
});

// Get user's saved schedules
router.get('/my-schedules', auth, async (req, res) => {
  try {
    const { term, year } = req.query;
    const filter = { userId: req.user._id, isActive: true };
    
    if (term && year) {
      filter.term = term;
      filter.year = parseInt(year);
    }

    const schedules = await Schedule.find(filter)
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      schedules,
      count: schedules.length
    });
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({ error: 'Failed to get schedules' });
  }
});

// Get a specific schedule by ID
router.get('/:scheduleId', auth, async (req, res) => {
  try {
    const schedule = await Schedule.findOne({
      _id: req.params.scheduleId,
      userId: req.user._id,
      isActive: true
    });

    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    res.json({ schedule });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ error: 'Failed to get schedule' });
  }
});

// Update schedule (rename, mark as favorite)
router.put('/:scheduleId', auth, async (req, res) => {
  try {
    const { name, isFavorite } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (isFavorite !== undefined) updateData.isFavorite = isFavorite;

    const schedule = await Schedule.findOneAndUpdate(
      {
        _id: req.params.scheduleId,
        userId: req.user._id,
        isActive: true
      },
      updateData,
      { new: true }
    );

    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    res.json({
      message: 'Schedule updated successfully',
      schedule
    });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ error: 'Failed to update schedule' });
  }
});

// Delete a schedule
router.delete('/:scheduleId', auth, async (req, res) => {
  try {
    const schedule = await Schedule.findOneAndUpdate(
      {
        _id: req.params.scheduleId,
        userId: req.user._id,
        isActive: true
      },
      { isActive: false },
      { new: true }
    );

    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({ error: 'Failed to delete schedule' });
  }
});

// Get CRN list for a schedule
router.get('/:scheduleId/crns', auth, async (req, res) => {
  try {
    const schedule = await Schedule.findOne({
      _id: req.params.scheduleId,
      userId: req.user._id,
      isActive: true
    });

    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    const crnList = schedule.getCRNList();

    res.json({
      crns: crnList,
      count: crnList.length,
      scheduleName: schedule.name
    });
  } catch (error) {
    console.error('Get CRNs error:', error);
    res.status(500).json({ error: 'Failed to get CRNs' });
  }
});

// Compare multiple schedules
router.post('/compare', auth, async (req, res) => {
  try {
    const { scheduleIds } = req.body;

    if (!scheduleIds || scheduleIds.length < 2) {
      return res.status(400).json({ error: 'At least 2 schedule IDs are required for comparison' });
    }

    const schedules = await Schedule.find({
      _id: { $in: scheduleIds },
      userId: req.user._id,
      isActive: true
    });

    if (schedules.length !== scheduleIds.length) {
      return res.status(404).json({ error: 'One or more schedules not found' });
    }

    // Calculate comparison metrics
    const comparison = schedules.map(schedule => ({
      id: schedule._id,
      name: schedule.name,
      totalCredits: schedule.totalCredits,
      totalWalkingTime: schedule.totalWalkingTime,
      score: schedule.score,
      totalCourses: schedule.totalCourses,
      courses: schedule.courses.map(course => ({
        courseCode: course.courseCode,
        courseName: course.courseName,
        instructor: course.instructor,
        building: course.building
      }))
    }));

    res.json({
      comparison,
      count: comparison.length
    });
  } catch (error) {
    console.error('Compare schedules error:', error);
    res.status(500).json({ error: 'Failed to compare schedules' });
  }
});

module.exports = router;