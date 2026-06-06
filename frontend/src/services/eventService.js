import api, { eventAPI } from './api';

const eventService = {
  // ─── Public ───
  getEvents: (params = {}) => eventAPI.getEvents(params),
  getEvent: (eventCode) => eventAPI.getEvent(eventCode),

  // ─── Admin Moderation ───
  getModerationEvents: (params = {}) => api.get('/admin/cycling-events', { params }),
  getModerationStats: () => api.get('/admin/cycling-events/stats'),
  approveEvent: (eventCode) => api.post(`/admin/cycling-events/${eventCode}/approve`),
  rejectEvent: (eventCode, reason) => api.post(`/admin/cycling-events/${eventCode}/reject`, { reason }),
  updateEventAdmin: (eventCode, data) => api.put(`/admin/cycling-events/${eventCode}/edit`, data),
  archiveEvent: (eventCode) => api.post(`/admin/cycling-events/${eventCode}/archive`),
  restoreArchive: (eventCode) => api.post(`/admin/cycling-events/${eventCode}/restore-archive`),
  scheduleEventDeletion: (eventCode, reason) => api.post(`/admin/cycling-events/${eventCode}/schedule-deletion`, { reason }),
  approveEventDeletion: (eventCode) => api.post(`/admin/cycling-events/${eventCode}/approve-deletion`),
  restoreEvent: (eventCode) => api.post(`/admin/cycling-events/${eventCode}/restore`),
  permanentDeleteEvent: (eventCode) => api.delete(`/admin/cycling-events/${eventCode}/permanent`),

  // ─── Protected (auth required) ───
  /**
   * Create event with FormData (supports file uploads)
   * @param {Object} data - Event data object
   * @param {File[]} images - Array of image File objects
   */
  createEvent: (data, images = []) => {
    const formData = new FormData();

    // Append all scalar fields
    Object.entries(data).forEach(([key, value]) => {
      if (value === null || value === undefined) return;
      
      if (key === 'photos' && Array.isArray(value)) {
        // Base64 photos (fallback) — send as JSON string
        formData.append('photos', JSON.stringify(value));
      } else if (Array.isArray(value)) {
        // Send arrays as Laravel array notation: field[0], field[1], etc.
        value.forEach((item, idx) => {
          formData.append(`${key}[${idx}]`, item);
        });
      } else if (typeof value === 'boolean') {
        formData.append(key, value ? '1' : '0');
      } else {
        formData.append(key, value);
      }
    });

    // Append image files
    images.forEach((image, idx) => {
      formData.append(`images[${idx}]`, image);
    });

    return eventAPI.createEvent(formData);
  },

  /**
   * Update event with FormData
   */
    updateEvent: (eventCode, data, images = [], removePhotos = []) => {
    const formData = new FormData();
    formData.append('_method', 'PUT');

    Object.entries(data).forEach(([key, value]) => {
      if (value === null || value === undefined) return;
      if (Array.isArray(value)) {
        // Send arrays as Laravel array notation
        value.forEach((item, idx) => {
          formData.append(`${key}[${idx}]`, item);
        });
      } else if (typeof value === 'boolean') {
        formData.append(key, value ? '1' : '0');
      } else {
        formData.append(key, value);
      }
    });

    images.forEach((image, idx) => {
      formData.append(`images[${idx}]`, image);
    });

    removePhotos.forEach((publicId, idx) => {
      formData.append(`remove_photos[${idx}]`, publicId);
    });

    return eventAPI.updateEvent(eventCode, formData);
  },

  deleteEvent: (eventCode) => eventAPI.deleteEvent(eventCode),
  getMyEvents: (params = {}) => eventAPI.getMyEvents(params),
  getEventStats: (eventCode) => eventAPI.getEventStats(eventCode),

  // ─── Event Registration ───
  registerForEvent: (eventCode, data) => {
    const idempotencyKey = `${eventCode}:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
    return api.post(`/events/${eventCode}/register`, data, {
      headers: {
        'X-Idempotency-Key': idempotencyKey,
      },
    });
  },
  unregisterFromEvent: (eventCode, reason) => api.post(`/events/${eventCode}/unregister`, { reason }),
  getMyEventRegistrations: (params = {}) => api.get('/events/my/registrations', { params }),
  getEventParticipants: (eventCode, params = {}) => api.get(`/events/${eventCode}/participants`, { params }),

  // ─── Event Payments ───
  initiateEventMpesa: (data) => api.post('/event-payments/mpesa/initiate', data),
  initiateEventCard: (data) => api.post('/event-payments/card/initialize', data),
  eventCod: (data) => api.post('/event-payments/cod', data),
  checkEventPaymentStatus: (paymentId) => api.get(`/event-payments/${paymentId}/status`),
  verifyEventCardPayment: (reference) => api.get(`/event-payments/card/verify/${reference}`),

  // ─── Admin Booking Management ───
  getAllBookings: (params = {}) => api.get('/admin/cycling-events/bookings', { params }),
  getBookingStats: () => api.get('/admin/cycling-events/bookings/stats'),
  getEventBookings: (eventCode, params = {}) => api.get(`/admin/cycling-events/${eventCode}/bookings`, { params }),
  checkInBooking: (registrationCode) => api.post(`/admin/cycling-events/bookings/${registrationCode}/check-in`),
  adminCancelBooking: (registrationCode, data) => api.post(`/admin/cycling-events/bookings/${registrationCode}/cancel`, data),
  processRefund: (registrationCode, data) => api.post(`/admin/cycling-events/bookings/${registrationCode}/refund`, data),
  transferBooking: (registrationCode, data) => api.post(`/admin/cycling-events/bookings/${registrationCode}/transfer`, data),
  bulkCheckIn: (codes) => api.post('/admin/cycling-events/bookings/bulk-check-in', { registration_codes: codes }),
  bulkCancelBookings: (codes, reason) => api.post('/admin/cycling-events/bookings/bulk-cancel', { registration_codes: codes, reason }),
  exportEventBookings: (eventCode) => api.get(`/admin/cycling-events/${eventCode}/export-bookings`, { responseType: 'blob' }),

  // ─── Related Events ───
  getRelatedEvents: (eventCode, limit = 3) =>
    api.get(`/events/${eventCode}/related?limit=${limit}`),

  // ─── User Booking Actions ───
  requestRefund: (registrationCode, reason) => api.post(`/events/registrations/${registrationCode}/refund-request`, { reason }),
  downloadTicket: (registrationCode) => api.get(`/events/registrations/${registrationCode}/ticket`),
  transferMyBooking: (registrationCode, newUserEmail) => api.post(`/events/registrations/${registrationCode}/transfer-request`, { new_user_email: newUserEmail }),
};

export default eventService;
