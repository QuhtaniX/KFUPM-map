import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ScheduleContext = createContext();

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (!context) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
};

export const ScheduleProvider = ({ children }) => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const generateSchedules = async (courseCodes, term, year, preferences) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/schedules/generate', {
        courseCodes,
        term,
        year,
        preferences
      });
      
      setSchedules(response.data.schedules);
      toast.success(`Generated ${response.data.count} schedules!`);
      return { success: true, schedules: response.data.schedules };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to generate schedules';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const saveSchedule = async (scheduleData, name) => {
    try {
      const response = await axios.post('/api/schedules/save', {
        scheduleData,
        name
      });
      
      toast.success('Schedule saved successfully!');
      return { success: true, schedule: response.data.schedule };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to save schedule';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const getMySchedules = async (term, year) => {
    setLoading(true);
    try {
      const params = {};
      if (term) params.term = term;
      if (year) params.year = year;
      
      const response = await axios.get('/api/schedules/my-schedules', { params });
      setSchedules(response.data.schedules);
      return { success: true, schedules: response.data.schedules };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to fetch schedules';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const deleteSchedule = async (scheduleId) => {
    try {
      await axios.delete(`/api/schedules/${scheduleId}`);
      setSchedules(prev => prev.filter(s => s._id !== scheduleId));
      toast.success('Schedule deleted successfully!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to delete schedule';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const updateSchedule = async (scheduleId, updates) => {
    try {
      const response = await axios.put(`/api/schedules/${scheduleId}`, updates);
      setSchedules(prev => 
        prev.map(s => s._id === scheduleId ? response.data.schedule : s)
      );
      toast.success('Schedule updated successfully!');
      return { success: true, schedule: response.data.schedule };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update schedule';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const getCRNs = async (scheduleId) => {
    try {
      const response = await axios.get(`/api/schedules/${scheduleId}/crns`);
      return { success: true, crns: response.data.crns };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to get CRNs';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const compareSchedules = async (scheduleIds) => {
    try {
      const response = await axios.post('/api/schedules/compare', { scheduleIds });
      return { success: true, comparison: response.data.comparison };
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to compare schedules';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const exportCRNs = (crns) => {
    try {
      const csvContent = `CRN\n${crns.join('\n')}`;
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'schedule-crns.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('CRNs exported successfully!');
    } catch (error) {
      toast.error('Failed to export CRNs');
    }
  };

  const copyCRNsToClipboard = async (crns) => {
    try {
      await navigator.clipboard.writeText(crns.join(', '));
      toast.success('CRNs copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy CRNs');
    }
  };

  const value = {
    schedules,
    loading,
    selectedSchedule,
    setSelectedSchedule,
    generateSchedules,
    saveSchedule,
    getMySchedules,
    deleteSchedule,
    updateSchedule,
    getCRNs,
    compareSchedules,
    exportCRNs,
    copyCRNsToClipboard
  };

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
};