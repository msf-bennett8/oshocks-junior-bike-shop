import api from './api';

const bookingService = {
  // ─── Customer-facing ───
  
  /** Create a new service booking (guest + auth) */
  createBooking: (data) => api.post('/service-bookings', data),

  /** Get my bookings */
  getMyBookings: (params = {}) => api.get('/service-bookings/my-bookings', { params }),

  /** Get available sellers/shops */
  getAvailableSellers: () => api.get('/service-bookings/sellers'),

  /** Get single booking */
  getBooking: (caseId) => api.get(`/service-bookings/${caseId}`),

  // ─── Staff-facing ───

  /** Get all bookings (admin/agent/seller) */
  getAllBookings: (params = {}) => api.get('/service-bookings', { params }),

  /** Confirm a booking */
  confirmBooking: (caseId, data) => api.post(`/service-bookings/${caseId}/confirm`, data),

  /** Reschedule a booking */
  rescheduleBooking: (caseId, data) => api.post(`/service-bookings/${caseId}/reschedule`, data),

  /** Mark booking as complete */
  completeBooking: (caseId) => api.post(`/service-bookings/${caseId}/complete`),

  /** Cancel a booking */
  cancelBooking: (caseId, reason) => api.post(`/service-bookings/${caseId}/cancel`, { reason }),
};

export default bookingService;
