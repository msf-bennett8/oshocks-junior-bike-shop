import { useState, useEffect, useCallback } from 'react';
import bookingService from '../services/bookingService';
import { useAuth } from '../context/AuthContext';

export const useBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sellers, setSellers] = useState([]);

  /** Create a new booking */
  const createBooking = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    try {
      // Include guest session for anonymous users
      const guestSessionId = localStorage.getItem('oshocks_guest_session_id');
      const payload = {
        ...formData,
        guest_session_id: guestSessionId,
      };

      const res = await bookingService.createBooking(payload);
      
      // Store guest session if returned
      if (res.data?.data?.guest_session_id) {
        localStorage.setItem('oshocks_guest_session_id', res.data.data.guest_session_id);
      }

      return { success: true, data: res.data.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create booking';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  /** Fetch all bookings (staff view) */
  const fetchBookings = useCallback(async (params = {}) => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await bookingService.getAllBookings(params);
      setBookings(res.data?.data?.data || res.data?.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  }, [user]);

  /** Fetch my bookings (customer view) */
  const fetchMyBookings = useCallback(async (params = {}) => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await bookingService.getMyBookings(params);
      setMyBookings(res.data?.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  }, [user]);

  /** Fetch available sellers */
  const fetchSellers = useCallback(async () => {
    try {
      const res = await bookingService.getAvailableSellers();
      setSellers(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch sellers:', err);
    }
  }, []);

  /** Confirm booking (staff) */
  const confirmBooking = useCallback(async (caseId, data) => {
    setLoading(true);
    try {
      const res = await bookingService.confirmBooking(caseId, data);
      const updated = res.data.data.service_booking || res.data.data;
      setBookings(prev => prev.map(b => b.case_id === caseId ? { ...b, ...updated } : b));
      setMyBookings(prev => prev.map(b => b.case_id === caseId ? { ...b, ...updated } : b));
      return { success: true, data: res.data.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /** Reschedule booking */
  const rescheduleBooking = useCallback(async (caseId, data) => {
    try {
      const res = await bookingService.rescheduleBooking(caseId, data);
      const updated = res.data.data.service_booking || res.data.data;
      setBookings(prev => prev.map(b => b.case_id === caseId ? { ...b, ...updated } : b));
      setMyBookings(prev => prev.map(b => b.case_id === caseId ? { ...b, ...updated } : b));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  }, []);

  /** Complete booking */
  const completeBooking = useCallback(async (caseId) => {
    try {
      const res = await bookingService.completeBooking(caseId);
      const updated = res.data.data.service_booking || res.data.data;
      setBookings(prev => prev.map(b => b.case_id === caseId ? { ...b, ...updated } : b));
      setMyBookings(prev => prev.map(b => b.case_id === caseId ? { ...b, ...updated } : b));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  }, []);

  /** Request cancellation (user) or approve/deny (staff) */
  const cancelBooking = useCallback(async (caseId, reason, action = 'request', denialReason = null) => {
    try {
      const res = await bookingService.cancelBooking(caseId, reason, action, denialReason);
      const updated = res.data.data.service_booking || res.data.data;
      setBookings(prev => prev.map(b => b.case_id === caseId ? { ...b, ...updated } : b));
      setMyBookings(prev => prev.map(b => b.case_id === caseId ? { ...b, ...updated } : b));
      return { success: true, data: res.data.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  }, []);

  return {
    bookings,
    myBookings,
    sellers,
    loading,
    error,
    createBooking,
    fetchBookings,
    fetchMyBookings,
    fetchSellers,
    confirmBooking,
    rescheduleBooking,
    completeBooking,
    cancelBooking,
  };
};

export default useBookings;
