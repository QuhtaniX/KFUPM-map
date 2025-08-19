import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  MapPinIcon, 
  ClockIcon, 
  BuildingOfficeIcon,
  UserIcon 
} from '@heroicons/react/24/outline';

// Fix for default markers in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color = '#3B82F6') => {
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

// Map controller component
function MapController({ selectedSchedule, buildings, onBuildingClick }) {
  const map = useMap();

  useEffect(() => {
    if (buildings.length > 0) {
      const bounds = L.latLngBounds(buildings.map(b => [b.coordinates.lat, b.coordinates.lng]));
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [buildings, map]);

  useEffect(() => {
    if (selectedSchedule) {
      const scheduleBuildings = selectedSchedule.courses.map(course => 
        buildings.find(b => b.buildingNumber === course.building)
      ).filter(Boolean);
      
      if (scheduleBuildings.length > 0) {
        const bounds = L.latLngBounds(scheduleBuildings.map(b => [b.coordinates.lat, b.coordinates.lng]));
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [selectedSchedule, buildings, map]);

  return null;
}

const CampusMap = () => {
  const [buildings, setBuildings] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [walkingPaths, setWalkingPaths] = useState([]);

  useEffect(() => {
    fetchBuildings();
    fetchSchedules();
  }, []);

  const fetchBuildings = async () => {
    try {
      const response = await axios.get('/api/courses/buildings/list');
      setBuildings(response.data.buildings);
    } catch (error) {
      console.error('Failed to fetch buildings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await axios.get('/api/schedules/my-schedules');
      setSchedules(response.data.schedules);
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
    }
  };

  const handleBuildingClick = (building) => {
    setSelectedBuilding(building);
  };

  const handleScheduleSelect = (schedule) => {
    setSelectedSchedule(schedule);
    generateWalkingPaths(schedule);
  };

  const generateWalkingPaths = (schedule) => {
    if (!schedule || !buildings.length) return;

    const paths = [];
    const dailySchedules = {};

    // Group courses by day
    schedule.courses.forEach(course => {
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

    // Generate paths for each day
    Object.entries(dailySchedules).forEach(([day, dayCourses]) => {
      dayCourses.sort((a, b) => a.startTime.localeCompare(b.startTime));
      
      for (let i = 0; i < dayCourses.length - 1; i++) {
        const currentCourse = dayCourses[i];
        const nextCourse = dayCourses[i + 1];
        
        const currentBuilding = buildings.find(b => b.buildingNumber === currentCourse.building);
        const nextBuilding = buildings.find(b => b.buildingNumber === nextCourse.building);
        
        if (currentBuilding && nextBuilding) {
          paths.push({
            from: currentBuilding,
            to: nextBuilding,
            day,
            fromTime: currentCourse.endTime,
            toTime: nextCourse.startTime,
            fromCourse: currentCourse.courseCode,
            toCourse: nextCourse.courseCode
          });
        }
      }
    });

    setWalkingPaths(paths);
  };

  const getPathColor = (path) => {
    const timeDiff = getTimeDifference(path.fromTime, path.toTime);
    if (timeDiff < 15) return '#EF4444'; // Red for tight schedule
    if (timeDiff < 30) return '#F59E0B'; // Yellow for moderate
    return '#10B981'; // Green for comfortable
  };

  const getTimeDifference = (time1, time2) => {
    const [h1, m1] = time1.split(':').map(Number);
    const [h2, m2] = time2.split(':').map(Number);
    return (h2 * 60 + m2) - (h1 * 60 + m1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          KFUPM Campus Map
        </h1>
        
        {/* Schedule Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Schedule to Visualize
          </label>
          <select
            value={selectedSchedule?._id || ''}
            onChange={(e) => {
              const schedule = schedules.find(s => s._id === e.target.value);
              handleScheduleSelect(schedule);
            }}
            className="input-field"
          >
            <option value="">Choose a schedule...</option>
            {schedules.map(schedule => (
              <option key={schedule._id} value={schedule._id}>
                {schedule.name} - {schedule.totalCredits} credits
              </option>
            ))}
          </select>
        </div>

        {/* Map Container */}
        <div className="relative">
          <MapContainer
            center={[26.3111, 50.2094]}
            zoom={15}
            style={{ height: '600px', width: '100%' }}
            className="rounded-lg"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            <MapController 
              selectedSchedule={selectedSchedule}
              buildings={buildings}
              onBuildingClick={handleBuildingClick}
            />

            {/* Building Markers */}
            {buildings.map(building => {
              const isInSchedule = selectedSchedule?.courses.some(
                course => course.building === building.buildingNumber
              );
              
              return (
                <Marker
                  key={building.buildingNumber}
                  position={[building.coordinates.lat, building.coordinates.lng]}
                  icon={createCustomIcon(isInSchedule ? '#10B981' : '#3B82F6')}
                  eventHandlers={{
                    click: () => handleBuildingClick(building)
                  }}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold text-gray-900">
                        Building {building.buildingNumber}
                      </h3>
                      <p className="text-sm text-gray-600">{building.buildingName}</p>
                      {building.departments && (
                        <p className="text-xs text-gray-500 mt-1">
                          {building.departments.join(', ')}
                        </p>
                      )}
                      {isInSchedule && (
                        <div className="mt-2 p-2 bg-green-50 rounded">
                          <p className="text-xs text-green-700 font-medium">
                            Classes in this building:
                          </p>
                          {selectedSchedule.courses
                            .filter(course => course.building === building.buildingNumber)
                            .map(course => (
                              <p key={course.crn} className="text-xs text-green-600">
                                {course.courseCode} - {course.instructor}
                              </p>
                            ))}
                        </div>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Walking Paths */}
            {walkingPaths.map((path, index) => (
              <Polyline
                key={index}
                positions={[
                  [path.from.coordinates.lat, path.from.coordinates.lng],
                  [path.to.coordinates.lat, path.to.coordinates.lng]
                ]}
                color={getPathColor(path)}
                weight={3}
                opacity={0.8}
              >
                <Popup>
                  <div className="p-2">
                    <h4 className="font-medium text-gray-900">Walking Path</h4>
                    <p className="text-sm text-gray-600">
                      {path.from.buildingName} → {path.to.buildingName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {path.fromCourse} → {path.toCourse}
                    </p>
                    <p className="text-xs text-gray-500">
                      {path.day}: {path.fromTime} - {path.toTime}
                    </p>
                  </div>
                </Popup>
              </Polyline>
            ))}
          </MapContainer>
        </div>

        {/* Schedule Summary */}
        {selectedSchedule && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-blue-50 rounded-lg"
          >
            <h3 className="font-semibold text-gray-900 mb-3">
              Schedule Summary: {selectedSchedule.name}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center">
                <BuildingOfficeIcon className="h-4 w-4 mr-2 text-blue-600" />
                <span>Total Credits: {selectedSchedule.totalCredits}</span>
              </div>
              <div className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-2 text-blue-600" />
                <span>Walking Time: {selectedSchedule.totalWalkingTime} min</span>
              </div>
              <div className="flex items-center">
                <UserIcon className="h-4 w-4 mr-2 text-blue-600" />
                <span>Score: {selectedSchedule.score.toFixed(1)}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Building Details */}
        {selectedBuilding && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 card"
          >
            <h3 className="font-semibold text-gray-900 mb-3">
              Building {selectedBuilding.buildingNumber} Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">
                  <strong>Name:</strong> {selectedBuilding.buildingName}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Address:</strong> {selectedBuilding.address}
                </p>
                {selectedBuilding.departments && (
                  <p className="text-sm text-gray-600">
                    <strong>Departments:</strong> {selectedBuilding.departments.join(', ')}
                  </p>
                )}
              </div>
              <div>
                {selectedBuilding.facilities && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Facilities:</p>
                    <ul className="text-sm text-gray-600">
                      {selectedBuilding.facilities.map(facility => (
                        <li key={facility}>• {facility}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CampusMap;