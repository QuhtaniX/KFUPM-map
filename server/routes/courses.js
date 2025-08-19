const express = require('express');
const Course = require('../models/Course');
const Building = require('../models/Building');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all courses for a term and year
router.get('/', async (req, res) => {
  try {
    const { term, year, department, courseCode } = req.query;
    const filter = { isActive: true };

    if (term) filter.term = term;
    if (year) filter.year = parseInt(year);
    if (department) filter.department = department;
    if (courseCode) filter.courseCode = { $regex: courseCode, $options: 'i' };

    const courses = await Course.find(filter)
      .select('courseCode courseName credits department sections')
      .sort({ courseCode: 1 });

    res.json({
      courses,
      count: courses.length
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Failed to get courses' });
  }
});

// Get course details by course code
router.get('/:courseCode', async (req, res) => {
  try {
    const { term, year } = req.query;
    const filter = {
      courseCode: req.params.courseCode,
      isActive: true
    };

    if (term) filter.term = term;
    if (year) filter.year = parseInt(year);

    const course = await Course.findOne(filter);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ course });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ error: 'Failed to get course' });
  }
});

// Get available sections for a course
router.get('/:courseCode/sections', async (req, res) => {
  try {
    const { term, year } = req.query;
    const filter = {
      courseCode: req.params.courseCode,
      isActive: true
    };

    if (term) filter.term = term;
    if (year) filter.year = parseInt(year);

    const course = await Course.findOne(filter);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const availableSections = course.sections.filter(section => 
      section.enrolled < section.capacity
    );

    res.json({
      courseCode: course.courseCode,
      courseName: course.courseName,
      sections: availableSections,
      count: availableSections.length
    });
  } catch (error) {
    console.error('Get sections error:', error);
    res.status(500).json({ error: 'Failed to get sections' });
  }
});

// Get all departments
router.get('/departments/list', async (req, res) => {
  try {
    const { term, year } = req.query;
    const filter = { isActive: true };

    if (term) filter.term = term;
    if (year) filter.year = parseInt(year);

    const departments = await Course.distinct('department', filter);
    
    res.json({
      departments: departments.sort(),
      count: departments.length
    });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ error: 'Failed to get departments' });
  }
});

// Get all buildings
router.get('/buildings/list', async (req, res) => {
  try {
    const buildings = await Building.find({ isActive: true })
      .select('buildingNumber buildingName coordinates departments')
      .sort({ buildingNumber: 1 });

    res.json({
      buildings,
      count: buildings.length
    });
  } catch (error) {
    console.error('Get buildings error:', error);
    res.status(500).json({ error: 'Failed to get buildings' });
  }
});

// Get building details
router.get('/buildings/:buildingNumber', async (req, res) => {
  try {
    const building = await Building.findOne({
      buildingNumber: req.params.buildingNumber,
      isActive: true
    });

    if (!building) {
      return res.status(404).json({ error: 'Building not found' });
    }

    res.json({ building });
  } catch (error) {
    console.error('Get building error:', error);
    res.status(500).json({ error: 'Failed to get building' });
  }
});

// Calculate walking time between two buildings
router.post('/buildings/walking-time', async (req, res) => {
  try {
    const { building1, building2 } = req.body;

    if (!building1 || !building2) {
      return res.status(400).json({ error: 'Both building numbers are required' });
    }

    const building1Data = await Building.findOne({ buildingNumber: building1 });
    const building2Data = await Building.findOne({ buildingNumber: building2 });

    if (!building1Data || !building2Data) {
      return res.status(404).json({ error: 'One or both buildings not found' });
    }

    const distance = Building.calculateDistance(building1Data, building2Data);
    const walkingTime = Building.calculateWalkingTime(building1Data, building2Data);

    res.json({
      building1: building1Data.buildingName,
      building2: building2Data.buildingName,
      distance: distance.toFixed(2), // km
      walkingTime // minutes
    });
  } catch (error) {
    console.error('Calculate walking time error:', error);
    res.status(500).json({ error: 'Failed to calculate walking time' });
  }
});

// Search courses by name or code
router.get('/search/:query', async (req, res) => {
  try {
    const { term, year } = req.query;
    const query = req.params.query;
    const filter = {
      isActive: true,
      $or: [
        { courseCode: { $regex: query, $options: 'i' } },
        { courseName: { $regex: query, $options: 'i' } }
      ]
    };

    if (term) filter.term = term;
    if (year) filter.year = parseInt(year);

    const courses = await Course.find(filter)
      .select('courseCode courseName credits department')
      .sort({ courseCode: 1 })
      .limit(20);

    res.json({
      courses,
      count: courses.length,
      query
    });
  } catch (error) {
    console.error('Search courses error:', error);
    res.status(500).json({ error: 'Failed to search courses' });
  }
});

// Get course statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const { term, year } = req.query;
    const filter = { isActive: true };

    if (term) filter.term = term;
    if (year) filter.year = parseInt(year);

    const totalCourses = await Course.countDocuments(filter);
    const totalSections = await Course.aggregate([
      { $match: filter },
      { $unwind: '$sections' },
      { $count: 'total' }
    ]);

    const departments = await Course.distinct('department', filter);

    res.json({
      totalCourses,
      totalSections: totalSections[0]?.total || 0,
      departments: departments.length,
      term,
      year
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

module.exports = router;