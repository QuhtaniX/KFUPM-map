import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import ScheduleGenerator from './components/schedule/ScheduleGenerator';
import ScheduleViewer from './components/schedule/ScheduleViewer';
import Preferences from './components/preferences/Preferences';
import CampusMap from './components/map/CampusMap';
import Profile from './components/profile/Profile';
import Subscription from './components/subscription/Subscription';
import LoadingSpinner from './components/common/LoadingSpinner';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/generate" element={<ScheduleGenerator />} />
            <Route path="/schedules" element={<ScheduleViewer />} />
            <Route path="/preferences" element={<Preferences />} />
            <Route path="/map" element={<CampusMap />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;