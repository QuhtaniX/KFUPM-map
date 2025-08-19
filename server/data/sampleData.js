const Course = require('../models/Course');
const Building = require('../models/Building');

// Sample KFUPM building data with coordinates
const sampleBuildings = [
  {
    buildingNumber: '63',
    buildingName: 'College of Computer Sciences and Engineering',
    coordinates: { lat: 26.3111, lng: 50.2094 },
    address: 'KFUPM Campus, Dhahran',
    departments: ['Computer Science', 'Computer Engineering', 'Software Engineering'],
    facilities: ['Computer Labs', 'Research Labs', 'Faculty Offices']
  },
  {
    buildingNumber: '59',
    buildingName: 'College of Engineering Sciences',
    coordinates: { lat: 26.3120, lng: 50.2080 },
    address: 'KFUPM Campus, Dhahran',
    departments: ['Mechanical Engineering', 'Electrical Engineering', 'Chemical Engineering'],
    facilities: ['Engineering Labs', 'Workshops', 'Faculty Offices']
  },
  {
    buildingNumber: '24',
    buildingName: 'College of Sciences',
    coordinates: { lat: 26.3130, lng: 50.2070 },
    address: 'KFUPM Campus, Dhahran',
    departments: ['Mathematics', 'Physics', 'Chemistry'],
    facilities: ['Science Labs', 'Research Centers', 'Faculty Offices']
  },
  {
    buildingNumber: '76',
    buildingName: 'College of Business Administration',
    coordinates: { lat: 26.3140, lng: 50.2060 },
    address: 'KFUPM Campus, Dhahran',
    departments: ['Business Administration', 'Accounting', 'Finance'],
    facilities: ['Business Labs', 'Conference Rooms', 'Faculty Offices']
  },
  {
    buildingNumber: '13',
    buildingName: 'Main Library',
    coordinates: { lat: 26.3150, lng: 50.2050 },
    address: 'KFUPM Campus, Dhahran',
    departments: ['Library Services'],
    facilities: ['Study Rooms', 'Computer Stations', 'Printing Services']
  },
  {
    buildingNumber: '50',
    buildingName: 'Student Center',
    coordinates: { lat: 26.3160, lng: 50.2040 },
    address: 'KFUPM Campus, Dhahran',
    departments: ['Student Affairs'],
    facilities: ['Cafeteria', 'Meeting Rooms', 'Student Services']
  }
];

// Sample course data
const sampleCourses = [
  {
    courseCode: 'ICS 101',
    courseName: 'Introduction to Computer Science',
    credits: 3,
    department: 'Computer Science',
    term: 'Fall',
    year: 2024,
    sections: [
      {
        crn: '10001',
        sectionNumber: '001',
        instructor: 'Dr. Ahmed Al-Shehri',
        capacity: 30,
        enrolled: 25,
        timeSlots: [
          { day: 'Sunday', startTime: '08:00', endTime: '09:15' },
          { day: 'Tuesday', startTime: '08:00', endTime: '09:15' }
        ],
        building: '63',
        room: '101',
        isOnline: false
      },
      {
        crn: '10002',
        sectionNumber: '002',
        instructor: 'Dr. Sarah Al-Zahrani',
        capacity: 30,
        enrolled: 28,
        timeSlots: [
          { day: 'Monday', startTime: '10:00', endTime: '11:15' },
          { day: 'Wednesday', startTime: '10:00', endTime: '11:15' }
        ],
        building: '63',
        room: '102',
        isOnline: false
      }
    ],
    prerequisites: [],
    corequisites: [],
    description: 'Introduction to programming concepts and problem solving'
  },
  {
    courseCode: 'MATH 101',
    courseName: 'Calculus I',
    credits: 4,
    department: 'Mathematics',
    term: 'Fall',
    year: 2024,
    sections: [
      {
        crn: '20001',
        sectionNumber: '001',
        instructor: 'Dr. Mohammed Al-Rashid',
        capacity: 35,
        enrolled: 30,
        timeSlots: [
          { day: 'Sunday', startTime: '09:30', endTime: '10:45' },
          { day: 'Tuesday', startTime: '09:30', endTime: '10:45' },
          { day: 'Thursday', startTime: '09:30', endTime: '10:45' }
        ],
        building: '24',
        room: '201',
        isOnline: false
      }
    ],
    prerequisites: [],
    corequisites: [],
    description: 'Introduction to differential calculus'
  },
  {
    courseCode: 'PHYS 101',
    courseName: 'General Physics I',
    credits: 4,
    department: 'Physics',
    term: 'Fall',
    year: 2024,
    sections: [
      {
        crn: '30001',
        sectionNumber: '001',
        instructor: 'Dr. Fatima Al-Qahtani',
        capacity: 40,
        enrolled: 35,
        timeSlots: [
          { day: 'Monday', startTime: '11:30', endTime: '12:45' },
          { day: 'Wednesday', startTime: '11:30', endTime: '12:45' }
        ],
        building: '24',
        room: '301',
        isOnline: false
      }
    ],
    prerequisites: ['MATH 101'],
    corequisites: [],
    description: 'Mechanics, heat, and waves'
  },
  {
    courseCode: 'ENGL 101',
    courseName: 'English Composition',
    credits: 3,
    department: 'English',
    term: 'Fall',
    year: 2024,
    sections: [
      {
        crn: '40001',
        sectionNumber: '001',
        instructor: 'Dr. John Smith',
        capacity: 25,
        enrolled: 20,
        timeSlots: [
          { day: 'Sunday', startTime: '13:00', endTime: '14:15' },
          { day: 'Tuesday', startTime: '13:00', endTime: '14:15' }
        ],
        building: '76',
        room: '401',
        isOnline: false
      }
    ],
    prerequisites: [],
    corequisites: [],
    description: 'Academic writing and composition'
  },
  {
    courseCode: 'CHEM 101',
    courseName: 'General Chemistry',
    credits: 4,
    department: 'Chemistry',
    term: 'Fall',
    year: 2024,
    sections: [
      {
        crn: '50001',
        sectionNumber: '001',
        instructor: 'Dr. Ali Al-Hamdan',
        capacity: 30,
        enrolled: 25,
        timeSlots: [
          { day: 'Monday', startTime: '14:30', endTime: '15:45' },
          { day: 'Wednesday', startTime: '14:30', endTime: '15:45' }
        ],
        building: '24',
        room: '401',
        isOnline: false
      }
    ],
    prerequisites: [],
    corequisites: [],
    description: 'Fundamental principles of chemistry'
  }
];

// Function to populate database with sample data
async function populateSampleData() {
  try {
    console.log('Starting to populate sample data...');

    // Clear existing data
    await Building.deleteMany({});
    await Course.deleteMany({});

    // Insert buildings
    const buildings = await Building.insertMany(sampleBuildings);
    console.log(`Inserted ${buildings.length} buildings`);

    // Insert courses
    const courses = await Course.insertMany(sampleCourses);
    console.log(`Inserted ${courses.length} courses`);

    console.log('Sample data populated successfully!');
    return { buildings, courses };
  } catch (error) {
    console.error('Error populating sample data:', error);
    throw error;
  }
}

// Function to get sample data for testing
function getSampleData() {
  return {
    buildings: sampleBuildings,
    courses: sampleCourses
  };
}

module.exports = {
  populateSampleData,
  getSampleData,
  sampleBuildings,
  sampleCourses
};