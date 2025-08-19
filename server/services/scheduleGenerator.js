const Course = require('../models/Course');
const Building = require('../models/Building');
const Schedule = require('../models/Schedule');

class ScheduleGenerator {
  constructor(user, preferences) {
    this.user = user;
    this.preferences = preferences;
    this.bestSchedules = [];
    this.maxSchedules = 10; // Maximum schedules to generate
  }

  // Main method to generate schedules
  async generateSchedules(courseCodes, term, year) {
    try {
      // Get all available courses
      const courses = await Course.find({
        courseCode: { $in: courseCodes },
        term,
        year,
        isActive: true
      }).populate('sections');

      if (courses.length === 0) {
        throw new Error('No courses found for the specified criteria');
      }

      // Get building data for distance calculations
      const buildings = await Building.find({ isActive: true });
      this.buildingMap = new Map(buildings.map(b => [b.buildingNumber, b]));

      // Generate all possible schedule combinations
      const schedules = await this.generateAllSchedules(courses);
      
      // Sort schedules by score
      schedules.sort((a, b) => b.score - a.score);
      
      // Return top schedules
      return schedules.slice(0, this.maxSchedules);
    } catch (error) {
      console.error('Schedule generation error:', error);
      throw error;
    }
  }

  // Generate all possible schedule combinations using backtracking
  async generateAllSchedules(courses) {
    const schedules = [];
    const currentSchedule = [];
    
    await this.backtrack(courses, 0, currentSchedule, schedules);
    
    return schedules;
  }

  // Backtracking algorithm to find all valid schedule combinations
  async backtrack(courses, courseIndex, currentSchedule, allSchedules) {
    // Base case: all courses have been processed
    if (courseIndex >= courses.length) {
      if (currentSchedule.length > 0) {
        const schedule = await this.createScheduleObject(currentSchedule);
        if (schedule) {
          allSchedules.push(schedule);
        }
      }
      return;
    }

    const currentCourse = courses[courseIndex];
    const availableSections = currentCourse.sections.filter(section => 
      section.enrolled < section.capacity && !section.isOnline
    );

    // Try each available section for the current course
    for (const section of availableSections) {
      // Check if this section conflicts with current schedule
      if (!this.hasConflict(currentSchedule, section)) {
        currentSchedule.push({
          courseCode: currentCourse.courseCode,
          courseName: currentCourse.courseName,
          credits: currentCourse.credits,
          ...section.toObject()
        });

        await this.backtrack(courses, courseIndex + 1, currentSchedule, allSchedules);
        
        currentSchedule.pop(); // Backtrack
      }
    }

    // Also try skipping this course (optional courses)
    await this.backtrack(courses, courseIndex + 1, currentSchedule, allSchedules);
  }

  // Check if a section conflicts with existing schedule
  hasConflict(currentSchedule, newSection) {
    for (const scheduledCourse of currentSchedule) {
      for (const scheduledSlot of scheduledCourse.timeSlots) {
        for (const newSlot of newSection.timeSlots) {
          if (scheduledSlot.day === newSlot.day) {
            const scheduledStart = new Date(`2000-01-01 ${scheduledSlot.startTime}`);
            const scheduledEnd = new Date(`2000-01-01 ${scheduledSlot.endTime}`);
            const newStart = new Date(`2000-01-01 ${newSlot.startTime}`);
            const newEnd = new Date(`2000-01-01 ${newSlot.endTime}`);

            if (scheduledStart < newEnd && newStart < scheduledEnd) {
              return true; // Conflict found
            }
          }
        }
      }
    }
    return false;
  }

  // Create a schedule object with calculated metrics
  async createScheduleObject(courses) {
    try {
      const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
      const totalWalkingTime = await this.calculateTotalWalkingTime(courses);
      const score = this.calculateScheduleScore(courses, totalWalkingTime);

      return {
        courses: courses.map(course => ({
          courseCode: course.courseCode,
          courseName: course.courseName,
          crn: course.crn,
          sectionNumber: course.sectionNumber,
          instructor: course.instructor,
          building: course.building,
          room: course.room,
          timeSlots: course.timeSlots,
          credits: course.credits
        })),
        totalCredits,
        totalWalkingTime,
        score,
        preferences: this.preferences
      };
    } catch (error) {
      console.error('Error creating schedule object:', error);
      return null;
    }
  }

  // Calculate total walking time between consecutive classes
  async calculateTotalWalkingTime(courses) {
    let totalTime = 0;
    
    // Group courses by day
    const dailySchedules = {};
    courses.forEach(course => {
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
    for (const [day, dayCourses] of Object.entries(dailySchedules)) {
      dayCourses.sort((a, b) => a.startTime.localeCompare(b.startTime));
      
      for (let i = 0; i < dayCourses.length - 1; i++) {
        const currentCourse = dayCourses[i];
        const nextCourse = dayCourses[i + 1];
        
        const currentBuilding = this.buildingMap.get(currentCourse.building);
        const nextBuilding = this.buildingMap.get(nextCourse.building);
        
        if (currentBuilding && nextBuilding) {
          const walkingTime = Building.calculateWalkingTime(currentBuilding, nextBuilding);
          totalTime += walkingTime;
        }
      }
    }
    
    return totalTime;
  }

  // Calculate schedule score based on preferences
  calculateScheduleScore(courses, totalWalkingTime) {
    let score = 100; // Base score

    // Deduct points for walking time
    score -= totalWalkingTime * 0.5;

    // Add points for preferred professors
    courses.forEach(course => {
      if (this.preferences.preferredProfessors.includes(course.instructor)) {
        score += 10;
      }
    });

    // Deduct points for early classes if user wants to avoid them
    if (this.preferences.avoidEarlyClasses) {
      courses.forEach(course => {
        course.timeSlots.forEach(slot => {
          const hour = parseInt(slot.startTime.split(':')[0]);
          if (hour < 9) {
            score -= 5;
          }
        });
      });
    }

    // Deduct points for avoided buildings
    courses.forEach(course => {
      if (this.preferences.avoidBuildings.includes(course.building)) {
        score -= 15;
      }
    });

    // Add points for preferred buildings
    courses.forEach(course => {
      if (this.preferences.preferredBuildings.includes(course.building)) {
        score += 5;
      }
    });

    // Check walking distance limit
    if (totalWalkingTime > this.preferences.maxWalkingDistance) {
      score -= (totalWalkingTime - this.preferences.maxWalkingDistance) * 2;
    }

    return Math.max(0, score);
  }

  // Save generated schedule to database
  async saveSchedule(scheduleData, name) {
    try {
      const schedule = new Schedule({
        userId: this.user._id,
        name,
        term: scheduleData.term,
        year: scheduleData.year,
        courses: scheduleData.courses,
        totalCredits: scheduleData.totalCredits,
        totalWalkingTime: scheduleData.totalWalkingTime,
        score: scheduleData.score,
        preferences: this.preferences
      });

      await schedule.save();

      // Update user usage
      this.user.usage.schedulesGenerated += 1;
      this.user.usage.lastScheduleGeneration = new Date();
      await this.user.save();

      return schedule;
    } catch (error) {
      console.error('Error saving schedule:', error);
      throw error;
    }
  }
}

module.exports = ScheduleGenerator;