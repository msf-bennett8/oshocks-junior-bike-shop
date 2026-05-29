import { useState, useCallback } from 'react';
import customRideService from '../services/customRideService';
import { useAuth } from '../context/AuthContext';

export const useCustomRides = () => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const [stats, setStats] = useState(null);

  const createRequest = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await customRideService.createRequest(formData);
      return { success: true, data: response.data };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit request';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyRequests = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const response = await customRideService.getMyRequests(params);
      setMyRequests(response.data?.data || []);
      return { success: true, data: response.data };
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await customRideService.getStats();
      setStats(response.data?.data || null);
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    myRequests,
    stats,
    createRequest,
    fetchMyRequests,
    fetchStats,
  };
};

export default useCustomRides;
