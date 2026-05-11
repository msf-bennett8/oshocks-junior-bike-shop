import { useState, useCallback } from 'react';
import contactInquiryService from '../services/contactInquiryService';
import { useAuth } from '../context/AuthContext';

export const useContactInquiries = () => {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /** Submit contact form */
  const submitInquiry = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const guestSessionId = localStorage.getItem('oshocks_guest_session_id');
      const payload = {
        ...formData,
        guest_session_id: guestSessionId,
      };

      const res = await contactInquiryService.submitInquiry(payload);

      // Store case ID for reference
      if (res.data?.data?.case_id) {
        localStorage.setItem('oshocks_last_inquiry_id', res.data.data.case_id);
      }

      return { 
        success: true, 
        data: res.data.data,
        message: res.data.message 
      };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send inquiry';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  /** Fetch my inquiries */
  const fetchMyInquiries = useCallback(async (params = {}) => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await contactInquiryService.getMyInquiries(params);
      setInquiries(res.data?.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch inquiries');
    } finally {
      setLoading(false);
    }
  }, [user]);

  /** Fetch inquiry queue (staff) */
  const fetchQueue = useCallback(async (params = {}) => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await contactInquiryService.getQueue(params);
      setInquiries(res.data?.data?.data || res.data?.data || []);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch queue');
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    inquiries,
    loading,
    error,
    submitInquiry,
    fetchMyInquiries,
    fetchQueue,
  };
};

export default useContactInquiries;
