import React, { useState, useEffect } from 'react';
import { useSchedule } from '../../contexts/ScheduleContext';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import Select from 'react-select';
import { motion } from 'framer-motion';
import { 
  AcademicCapIcon, 
  ClockIcon, 
  MapPinIcon,
  UserIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const ScheduleGenerator = () => {
  const { user } = useAuth();
  const { generateSchedules, loading } = useSchedule();
  
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [term, setTerm] = useState('Fall');
  const [year, setYear] = useState(new Date().getFullYear());
  const [preferences, setPreferences] = useState({
    preferredProfessors: [],
    avoidEarlyClasses: false,
    maxWalkingDistance: 15,
    preferredBuildings: [],
    avoidBuildings: []
  });
  const [generatedSchedules, setGeneratedSchedules] = useState([]);

  useEffect(() => {
    fetchCourses();
    fetchDepartments();
    fetchBuildings();
  }, [term, year]);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/api/courses', {
        params: { term, year }
      });
      setCourses(response.data.courses);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get('/api/courses/departments/list', {
        params: { term, year }
      });
      setDepartments(response.data.departments);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const fetchBuildings = async () => {
    try {
      const response = await axios.get('/api/courses/buildings/list');
      setBuildings(response.data.buildings);
    } catch (error) {
      console.error('Failed to fetch buildings:', error);
    }
  };

  const handleCourseSelection = (selectedOptions) => {
    setSelectedCourses(selectedOptions);
  };

  const handlePreferenceChange = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerateSchedules = async () => {
    if (selectedCourses.length === 0) {
      toast.error('Please select at least one course');
      return;
    }

    const courseCodes = selectedCourses.map(course => course.value);
    const result = await generateSchedules(courseCodes, term, year, preferences);
    
    if (result.success) {
      setGeneratedSchedules(result.schedules);
    }
  };

  const courseOptions = courses.map(course => ({
    value: course.courseCode,
    label: `${course.courseCode} - ${course.courseName} (${course.credits} credits)`,
    course
  }));

  const buildingOptions = buildings.map(building => ({
    value: building.buildingNumber,
    label: `${building.buildingNumber} - ${building.buildingName}`
  }));

  const professorOptions = courses
    .flatMap(course => course.sections.map(section => section.instructor))
    .filter((instructor, index, arr) => arr.indexOf(instructor) === index)
    .map(instructor => ({
      value: instructor,
      label: instructor
    }));

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Generate Optimal Schedules
        </h1>
        
        {/* Term and Year Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Term
            </label>
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="input-field"
            >
              <option value="Fall">Fall</option>
              <option value="Spring">Spring</option>
              <option value="Summer">Summer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year
            </label>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="input-field"
            >
              {[2023, 2024, 2025].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Course Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Courses
          </label>
          <Select
            isMulti
            options={courseOptions}
            value={selectedCourses}
            onChange={handleCourseSelection}
            placeholder="Search and select courses..."
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>

        {/* Preferences Section */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Schedule Preferences
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Preferred Professors */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <UserIcon className="inline h-4 w-4 mr-1" />
                Preferred Professors
              </label>
              <Select
                isMulti
                options={professorOptions}
                value={preferences.preferredProfessors.map(p => ({ value: p, label: p }))}
                onChange={(selected) => handlePreferenceChange('preferredProfessors', selected.map(s => s.value))}
                placeholder="Select preferred professors..."
              />
            </div>

            {/* Preferred Buildings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BuildingOfficeIcon className="inline h-4 w-4 mr-1" />
                Preferred Buildings
              </label>
              <Select
                isMulti
                options={buildingOptions}
                value={preferences.preferredBuildings.map(b => ({ value: b, label: b }))}
                onChange={(selected) => handlePreferenceChange('preferredBuildings', selected.map(s => s.value))}
                placeholder="Select preferred buildings..."
              />
            </div>

            {/* Avoid Buildings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <BuildingOfficeIcon className="inline h-4 w-4 mr-1" />
                Avoid Buildings
              </label>
              <Select
                isMulti
                options={buildingOptions}
                value={preferences.avoidBuildings.map(b => ({ value: b, label: b }))}
                onChange={(selected) => handlePreferenceChange('avoidBuildings', selected.map(s => s.value))}
                placeholder="Select buildings to avoid..."
              />
            </div>

            {/* Max Walking Distance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPinIcon className="inline h-4 w-4 mr-1" />
                Max Walking Distance (minutes)
              </label>
              <input
                type="number"
                min="5"
                max="30"
                value={preferences.maxWalkingDistance}
                onChange={(e) => handlePreferenceChange('maxWalkingDistance', parseInt(e.target.value))}
                className="input-field"
              />
            </div>
          </div>

          {/* Avoid Early Classes */}
          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.avoidEarlyClasses}
                onChange={(e) => handlePreferenceChange('avoidEarlyClasses', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                <ClockIcon className="inline h-4 w-4 mr-1" />
                Avoid early classes (before 9:00 AM)
              </span>
            </label>
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerateSchedules}
            disabled={loading || selectedCourses.length === 0}
            className="w-full btn-primary py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="spinner mr-2"></div>
                Generating Schedules...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <AcademicCapIcon className="h-5 w-5 mr-2" />
                Generate Optimal Schedules
              </div>
            )}
          </motion.button>
        </div>
      </div>

      {/* Generated Schedules */}
      {generatedSchedules.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Generated Schedules ({generatedSchedules.length})
          </h2>
          <div className="space-y-4">
            {generatedSchedules.map((schedule, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Schedule {index + 1}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Score: {schedule.score.toFixed(1)} | 
                      Credits: {schedule.totalCredits} | 
                      Walking Time: {schedule.totalWalkingTime} min
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="btn-secondary text-sm">
                      View Details
                    </button>
                    <button className="btn-primary text-sm">
                      Save Schedule
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {schedule.courses.map((course, courseIndex) => (
                    <div key={courseIndex} className="bg-gray-50 p-2 rounded">
                      <div className="font-medium">{course.courseCode}</div>
                      <div className="text-gray-600">{course.instructor}</div>
                      <div className="text-gray-500">{course.building} {course.room}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleGenerator;