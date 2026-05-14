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

    /**
   * Request cancellation (user) or approve/deny (staff)
   * action: 'request' | 'approve' | 'deny'
   */
  cancelBooking: (caseId, reason, action = 'request', denialReason = null) =>
    api.post(`/service-bookings/${caseId}/cancel`, {
      reason,
      action,
      denial_reason: denialReason
    }),

  // ─── Appointment Notes ───
  getNotes: (caseId) => api.get(`/service-bookings/${caseId}/notes`),
  addNote: (caseId, content, visibility = 'public') =>
    api.post(`/service-bookings/${caseId}/notes`, { content, visibility }),

  // ─── Appointment History ───
  getHistory: (caseId) => api.get(`/service-bookings/${caseId}/history`),

  // ─── User Appointments (for History tab) ───
  getUserAppointments: (userId) => api.get(`/service-bookings/user/${userId}/all`),

  // ─── Stats ───
  getStats: () => api.get('/service-bookings/stats'),

  // ─── Scheduled Deletion (super admin only) ───
  getScheduled: (params = {}) => api.get('/service-bookings/scheduled', { params }),
  scheduleDelete: (bookingId, reason = '') => api.post(`/service-bookings/${bookingId}/schedule`, { reason }),
  restoreFromScheduled: (bookingId) => api.post(`/service-bookings/${bookingId}/restore`),
  permanentDelete: (bookingId) => api.delete(`/service-bookings/${bookingId}/permanent`),
};

export default bookingService;
