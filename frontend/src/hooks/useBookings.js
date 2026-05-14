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

      // Store conversation ID from response for standalone bookings
      const responseData = res.data.data;
      if (responseData?.conversation?.id) {
        // Merge conversation into booking data so AppointmentPanel can access it
        responseData.service_booking = {
          ...responseData.service_booking,
          conversation: responseData.conversation,
          metadata: {
            ...(responseData.service_booking?.metadata || {}),
            conversation_id: responseData.conversation.id,
          },
        };
      }
      return { success: true, data: responseData };
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

  /** Fetch available mechanics */
  const fetchMechanics = useCallback(async () => {
    try {
      const res = await bookingService.getMechanics();
      return res.data?.data || [];
    } catch (err) {
      console.error('Failed to fetch mechanics:', err);
      return [];
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

  /** Fetch notes for a booking */
  const fetchNotes = useCallback(async (caseId) => {
    try {
      const res = await bookingService.getNotes(caseId);
      return { success: true, data: res.data?.data || [] };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  }, []);

  /** Add note to a booking */
  const addNote = useCallback(async (caseId, content, visibility = 'public') => {
    try {
      const res = await bookingService.addNote(caseId, content, visibility);
      return { success: true, data: res.data?.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  }, []);

  /** Fetch history for a booking */
  const fetchHistory = useCallback(async (caseId) => {
    try {
      const res = await bookingService.getHistory(caseId);
      // Handle paginated response: res.data.data.data contains the records
      const historyData = res.data?.data?.data || res.data?.data || [];
      return { success: true, data: historyData };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  }, []);

  /** Fetch all appointments for a user */
  const fetchUserAppointments = useCallback(async (userId) => {
    try {
      const res = await bookingService.getUserAppointments(userId);
      return { success: true, data: res.data?.data || [] };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  }, []);

  /** Fetch booking stats for inbox tabs */
  const fetchStats = useCallback(async () => {
    if (!user) return;
    try {
      const res = await bookingService.getStats();
      return { success: true, data: res.data?.data || {} };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  }, [user]);

  // ─── Scheduled Deletion (super admin only) ───

  /** Fetch bookings scheduled for deletion */
  const fetchScheduled = useCallback(async (params = {}) => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await bookingService.getScheduled(params);
      const data = res.data?.data?.data || res.data?.data || [];
      setBookings(Array.isArray(data) ? data : []);
      setError(null);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch scheduled bookings');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  /** Schedule booking for deletion (super admin) */
  const scheduleDelete = useCallback(async (bookingId, reason = '') => {
    try {
      const res = await bookingService.scheduleDelete(bookingId, reason);
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, ...res.data.data } : b));
      return res.data;
    } catch (err) {
      throw err;
    }
  }, []);

  /** Restore booking from scheduled deletion (super admin) */
  const restoreFromScheduled = useCallback(async (bookingId) => {
    try {
      const res = await bookingService.restoreFromScheduled(bookingId);
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, scheduled_for_deletion_at: null, deleted_by: null, deletion_reason: null } : b));
      return res.data;
    } catch (err) {
      throw err;
    }
  }, []);

  /** Permanently delete scheduled booking (super admin) */
  const permanentDelete = useCallback(async (bookingId) => {
    try {
      await bookingService.permanentDelete(bookingId);
      setBookings(prev => prev.filter(b => b.id !== bookingId));
    } catch (err) {
      throw err;
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
    fetchNotes,
    addNote,
    fetchHistory,
    fetchUserAppointments,
    fetchScheduled,
    scheduleDelete,
    restoreFromScheduled,
    permanentDelete,
    fetchStats,
    fetchMechanics,
  };
};

export default useBookings;
